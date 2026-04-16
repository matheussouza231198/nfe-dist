import fs from 'fs';
import https from 'https';

export function createHttpsAgent({ certPfxPath, certPassphrase }) {
  return new https.Agent({
    pfx: fs.readFileSync(certPfxPath),
    passphrase: certPassphrase,
    rejectUnauthorized: true
  });
}
