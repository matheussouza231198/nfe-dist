import { gunzipSync } from 'zlib';

export function decodeDocZip(docZipBase64: string): string {
  const buff = Buffer.from(docZipBase64, 'base64');

  try {
    return gunzipSync(buff).toString('utf-8');
  } catch {
    return buff.toString('utf-8');
  }
}
