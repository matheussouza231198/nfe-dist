import fs from 'fs';

function get(key, fallback = undefined) {
  return process.env[key] ?? fallback;
}

function getInt(key, fallback) {
  const value = get(key, fallback);
  return Number.parseInt(String(value), 10);
}

export const env = {
  nodeEnv: get('NODE_ENV', 'development'),
  cnpj: get('SEFAZ_CNPJ', ''),
  ufAutora: get('SEFAZ_UF', 'AN'),
  ambiente: get('SEFAZ_AMBIENTE', '2'),
  endpoint: get('SEFAZ_ENDPOINT', ''),
  certPfxPath: get('SEFAZ_CERT_PFX_PATH', ''),
  certPassphrase: get('SEFAZ_CERT_PFX_PASSPHRASE', ''),
  timeoutMs: getInt('SEFAZ_TIMEOUT_MS', 30000),
  retryMax: getInt('SEFAZ_RETRY_MAX', 3),
  scheduleMinutes: getInt('SEFAZ_SCHEDULE_MINUTES', 10),
  storageDir: get('SEFAZ_STORAGE_DIR', './data'),
  mock: get('SEFAZ_MOCK', 'false') === 'true'
};

export function validateEnv() {
  if (!env.cnpj || env.cnpj.length !== 14) {
    throw new Error('SEFAZ_CNPJ deve ter 14 dígitos.');
  }

  if (!env.mock) {
    if (!env.endpoint) throw new Error('SEFAZ_ENDPOINT é obrigatório.');
    if (!env.certPfxPath) throw new Error('SEFAZ_CERT_PFX_PATH é obrigatório.');
    if (!fs.existsSync(env.certPfxPath)) {
      throw new Error(`Certificado não encontrado em ${env.certPfxPath}`);
    }
  }
}
