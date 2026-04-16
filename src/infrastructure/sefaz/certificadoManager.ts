import fs from 'fs';
import https from 'https';

interface CreateHttpsAgentParams {
  certPfxPath: string;
  certPassphrase: string;
}

export function createHttpsAgent({ certPfxPath, certPassphrase }: CreateHttpsAgentParams): any {
  return new https.Agent({
    pfx: fs.readFileSync(certPfxPath),
    passphrase: certPassphrase,
    rejectUnauthorized: true
  });
}
