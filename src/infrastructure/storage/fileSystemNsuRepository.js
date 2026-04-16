import fs from 'fs/promises';
import path from 'path';

export class FileSystemNsuRepository {
  constructor(storageDir) {
    this.path = path.join(storageDir, 'nsu-state.json');
  }

  async getUltNsu(cnpj) {
    const state = await this.#read();
    return state[cnpj] ?? '000000000000000';
  }

  async saveUltNsu(cnpj, ultNsu) {
    const state = await this.#read();
    state[cnpj] = ultNsu;
    await fs.mkdir(path.dirname(this.path), { recursive: true });
    await fs.writeFile(this.path, JSON.stringify(state, null, 2), 'utf-8');
  }

  async #read() {
    try {
      return JSON.parse(await fs.readFile(this.path, 'utf-8'));
    } catch {
      return {};
    }
  }
}
