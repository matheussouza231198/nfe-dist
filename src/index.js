import { env, validateEnv } from './config/env.js';
import { logger } from './infrastructure/logging/logger.js';
import { createHttpsAgent } from './infrastructure/sefaz/certificadoManager.js';
import { SefazSoapClient } from './infrastructure/sefaz/sefazSoapClient.js';
import { FileSystemDocumentoRepository } from './infrastructure/storage/fileSystemDocumentoRepository.js';
import { FileSystemNsuRepository } from './infrastructure/storage/fileSystemNsuRepository.js';
import { ConsultarDistribuicaoDfeUseCase } from './application/consultarDistribuicaoDfeUseCase.js';
import { startScheduler } from './interfaces/scheduler.js';

async function bootstrap() {
  validateEnv();

  const httpsAgent = env.mock
    ? undefined
    : createHttpsAgent({
        certPfxPath: env.certPfxPath,
        certPassphrase: env.certPassphrase
      });

  const sefazClient = new SefazSoapClient({
    endpoint: env.endpoint,
    ambiente: env.ambiente,
    ufAutora: env.ufAutora,
    cnpj: env.cnpj,
    timeoutMs: env.timeoutMs,
    httpsAgent,
    mock: env.mock
  });

  const documentoRepository = new FileSystemDocumentoRepository(env.storageDir);
  const nsuRepository = new FileSystemNsuRepository(env.storageDir);

  const useCase = new ConsultarDistribuicaoDfeUseCase({
    sefazClient,
    nsuRepository,
    documentoRepository,
    logger,
    retryMax: env.retryMax
  });

  startScheduler({
    intervalMinutes: env.scheduleMinutes,
    logger,
    onTick: async () => {
      await useCase.executar(env.cnpj);
    }
  });
}

bootstrap().catch((error) => {
  logger.error('Falha fatal ao iniciar aplicação', { error: error.message });
  process.exit(1);
});
