import fs from 'fs/promises';
import path from 'path';

export class FileSystemNsuRepository {
  private path: string;

  constructor(storageDir: string) {
    this.path = path.join(storageDir, 'nsu-state.json');
  }

  async getUltNsu(cnpj: string): Promise<string> {
    const state = await this.#read();
    return state[cnpj] ?? '000000000000000';
  }

  async saveUltNsu(cnpj: string, ultNsu: string): Promise<void> {
    const state = await this.#read();
    state[cnpj] = ultNsu;
    await fs.mkdir(path.dirname(this.path), { recursive: true });
    await fs.writeFile(this.path, JSON.stringify(state, null, 2), 'utf-8');
  }

  async #read(): Promise<Record<string, string>> {
    try {
      return JSON.parse(await fs.readFile(this.path, 'utf-8')) as Record<string, string>;
    } catch {
      return {};
    }
  }
}
