import fs from 'fs/promises';
import path from 'path';

export class FileSystemDocumentoRepository {
  constructor(storageDir) {
    this.storageDir = storageDir;
    this.indexPath = path.join(storageDir, 'index.json');
  }

  async existsByChave(cnpj, chave) {
    const index = await this.#readIndex();
    return Boolean(index[`${cnpj}:${chave}`]);
  }

  async save({ cnpj, chave, tipo, nsu, xml, data = new Date() }) {
    const yyyy = String(data.getUTCFullYear());
    const mm = String(data.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(data.getUTCDate()).padStart(2, '0');

    const dir = path.join(this.storageDir, cnpj, yyyy, mm, dd);
    await fs.mkdir(dir, { recursive: true });

    const fileName = `${chave || 'sem-chave'}-${tipo}-${nsu}.xml`;
    const fullPath = path.join(dir, fileName);
    await fs.writeFile(fullPath, xml, 'utf-8');

    const index = await this.#readIndex();
    if (chave) index[`${cnpj}:${chave}`] = fullPath;
    await fs.mkdir(this.storageDir, { recursive: true });
    await fs.writeFile(this.indexPath, JSON.stringify(index, null, 2), 'utf-8');

    return fullPath;
  }

  async #readIndex() {
    try {
      const text = await fs.readFile(this.indexPath, 'utf-8');
      return JSON.parse(text);
    } catch {
      return {};
    }
  }
}
