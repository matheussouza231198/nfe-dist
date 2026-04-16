interface DistParam {
  type: 'consNSU' | 'distNSU';
  value: string;
}

interface BuildDistDFeEnvelopeParams {
  cnpj: string;
  ufAutora: string;
  ambiente: string;
  dist: DistParam;
}

export function buildDistDFeEnvelope({ cnpj, ufAutora, ambiente, dist }: BuildDistDFeEnvelopeParams): string {
  const distNode =
    dist.type === 'consNSU'
      ? `<consNSU><NSU>${dist.value}</NSU></consNSU>`
      : `<distNSU><ultNSU>${dist.value}</ultNSU></distNSU>`;

  const nfeDadosMsg =
    `<distDFeInt xmlns="http://www.portalfiscal.inf.br/nfe" versao="1.01">` +
    `<tpAmb>${ambiente}</tpAmb>` +
    `<cUFAutor>${ufAutora}</cUFAutor>` +
    `<CNPJ>${cnpj}</CNPJ>` +
    `${distNode}` +
    `</distDFeInt>`;

  return (
    `<?xml version="1.0" encoding="utf-8"?>` +
    `<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ` +
    `xmlns:xsd="http://www.w3.org/2001/XMLSchema" ` +
    `xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">` +
    `<soap12:Body>` +
    `<nfeDistDFeInteresse xmlns="http://www.portalfiscal.inf.br/nfe/wsdl/NFeDistribuicaoDFe">` +
    `<nfeDadosMsg>${escapeXml(nfeDadosMsg)}</nfeDadosMsg>` +
    `</nfeDistDFeInteresse>` +
    `</soap12:Body>` +
    `</soap12:Envelope>`
  );
}

function escapeXml(xml: string): string {
  return xml.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
