import { decodeDocZip } from '../infrastructure/parser/docZipParser.js';
import { detectarTipoDocumento } from '../infrastructure/parser/xmlTipoDetector.js';
import { extrairChaveNfe } from '../infrastructure/parser/chaveExtractor.js';

export class ConsultarDistribuicaoDfeUseCase {
  constructor({ sefazClient, nsuRepository, documentoRepository, logger, retryMax }) {
    this.sefazClient = sefazClient;
    this.nsuRepository = nsuRepository;
    this.documentoRepository = documentoRepository;
    this.logger = logger;
    this.retryMax = retryMax;
  }

  async executar(cnpj) {
    let ultNsu = await this.nsuRepository.getUltNsu(cnpj);
    let totalSalvos = 0;

    this.logger.info('Iniciando sincronização NF-e', { cnpj, ultNsu });

    while (true) {
      const resposta = await this.#withRetry(() => this.sefazClient.consultarPorUltNsu(ultNsu));

      for (const doc of resposta.docs) {
        const xml = decodeDocZip(doc.docZip);
        const tipo = detectarTipoDocumento(xml);
        const chave = extrairChaveNfe(xml);

        if (chave && (await this.documentoRepository.existsByChave(cnpj, chave))) {
          this.logger.info('Documento já existente (deduplicado)', { cnpj, chave, nsu: doc.nsu });
          continue;
        }

        const path = await this.documentoRepository.save({
          cnpj,
          chave,
          tipo,
          nsu: doc.nsu,
          xml
        });

        totalSalvos += 1;
        this.logger.info('Documento salvo', { cnpj, chave, tipo, nsu: doc.nsu, path });
      }

      await this.nsuRepository.saveUltNsu(cnpj, resposta.ultNSU);
      ultNsu = resposta.ultNSU;

      this.logger.info('Lote processado', {
        cnpj,
        ultNSU: resposta.ultNSU,
        maxNSU: resposta.maxNSU,
        docs: resposta.docs.length
      });

      if (resposta.ultNSU === resposta.maxNSU) break;
    }

    this.logger.info('Sincronização finalizada', { cnpj, totalSalvos, ultNsu });
    return { totalSalvos, ultNsu };
  }

  async #withRetry(fn) {
    let lastError;

    for (let attempt = 1; attempt <= this.retryMax; attempt += 1) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        this.logger.warn('Falha na consulta SEFAZ, tentando novamente', {
          attempt,
          max: this.retryMax,
          error: error.message
        });

        const waitMs = attempt * 1000;
        await new Promise((resolve) => setTimeout(resolve, waitMs));
      }
    }

    throw lastError;
  }
}
