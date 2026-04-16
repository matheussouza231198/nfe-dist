import https from 'https';
import { logger } from '../logging/logger.js';
import { buildDistDFeEnvelope } from './soapEnvelopeBuilder.js';

export interface DistDoc {
  nsu: string;
  docZip: string;
}

export interface DistResponse {
  ultNSU: string;
  maxNSU: string;
  docs: DistDoc[];
  rawRetDistXml: string;
}

interface SefazSoapClientParams {
  endpoint: string;
  ambiente: string;
  ufAutora: string;
  cnpj: string;
  timeoutMs: number;
  httpsAgent?: any;
  mock?: boolean;
}

export class SefazSoapClient {
  private endpoint: string;
  private ambiente: string;
  private ufAutora: string;
  private cnpj: string;
  private timeoutMs: number;
  private httpsAgent?: any;
  private mock: boolean;

  constructor({ endpoint, ambiente, ufAutora, cnpj, timeoutMs, httpsAgent, mock = false }: SefazSoapClientParams) {
    this.endpoint = endpoint;
    this.ambiente = ambiente;
    this.ufAutora = ufAutora;
    this.cnpj = cnpj;
    this.timeoutMs = timeoutMs;
    this.httpsAgent = httpsAgent;
    this.mock = mock;
  }

  async consultarPorUltNsu(ultNsu: string): Promise<DistResponse> {
    if (this.mock) return mockResponse(ultNsu);

    const envelope = buildDistDFeEnvelope({
      cnpj: this.cnpj,
      ufAutora: this.ufAutora,
      ambiente: this.ambiente,
      dist: { type: 'distNSU', value: ultNsu }
    });

    logger.info('Enviando requisição SOAP', { ultNsu });

    const body = await doSoapPost({
      endpoint: this.endpoint,
      xml: envelope,
      timeoutMs: this.timeoutMs,
      agent: this.httpsAgent
    });

    return parseRetDist(body);
  }
}

interface SoapPostParams {
  endpoint: string;
  xml: string;
  timeoutMs: number;
  agent?: any;
}

function doSoapPost({ endpoint, xml, timeoutMs, agent }: SoapPostParams): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint);

    const req = https.request(
      {
        hostname: url.hostname,
        path: url.pathname + (url.search || ''),
        method: 'POST',
        port: Number(url.port) || 443,
        headers: {
          'Content-Type': 'application/soap+xml; charset=utf-8',
          'Content-Length': Buffer.byteLength(xml)
        },
        timeout: timeoutMs,
        agent
      },
      (res: any) => {
        let data = '';
        res.on('data', (chunk: any) => {
          data += String(chunk);
        });
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve(data);
            return;
          }
          reject(new Error(`HTTP ${res.statusCode}: ${data.slice(0, 500)}`));
        });
      }
    );

    req.on('timeout', () => req.destroy(new Error('Timeout na requisição SOAP')));
    req.on('error', reject);
    req.write(xml);
    req.end();
  });
}

function parseRetDist(soapXml: string): DistResponse {
  const retDistMatch = soapXml.match(/<retDistDFeInt[\s\S]*?<\/retDistDFeInt>/);
  if (!retDistMatch) {
    throw new Error('retDistDFeInt não encontrado no SOAP response.');
  }

  const ret = retDistMatch[0];
  const ultNSU = extractTag(ret, 'ultNSU') || '0';
  const maxNSU = extractTag(ret, 'maxNSU') || ultNSU;

  const docs: DistDoc[] = [];
  const docZipRegex = /<docZip[^>]*NSU="(\d+)"[^>]*>([\s\S]*?)<\/docZip>/g;
  let match: RegExpExecArray | null;
  while ((match = docZipRegex.exec(ret)) !== null) {
    docs.push({ nsu: match[1], docZip: match[2].trim() });
  }

  return { ultNSU, maxNSU, docs, rawRetDistXml: ret };
}

function extractTag(xml: string, tag: string): string | null {
  const match = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`));
  return match ? match[1].trim() : null;
}

function mockResponse(ultNsu: string): DistResponse {
  const n = Number.parseInt(ultNsu, 10) || 0;
  const next = String(n + 1).padStart(15, '0');
  const max = String(Math.max(n + 1, 3)).padStart(15, '0');

  const fakeXml =
    '<?xml version="1.0" encoding="UTF-8"?><resNFe><chNFe>35240100000000000000550010000000011000000010</chNFe></resNFe>';
  const zlib = Buffer.from(fakeXml, 'utf-8');
  const docZip = zlib.toString('base64');

  return {
    ultNSU: next,
    maxNSU: max,
    docs: [{ nsu: next, docZip }],
    rawRetDistXml: '<retDistDFeInt />'
  };
}
