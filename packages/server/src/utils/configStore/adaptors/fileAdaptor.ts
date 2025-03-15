import fs from 'fs/promises';
import { StorageAdaptor } from '../storageAdaptor';

export class FileAdaptor implements StorageAdaptor {
  private readonly filePath: string;

  constructor(storeUrl: string) {
    this.filePath = storeUrl.split('://')[1];
  }

  public async save(data: unknown, nameSpace: string) {
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2));
  }

  public async load<T>(nameSpace: string): Promise<T | null> {
    try {
      await fs.access(this.filePath);
      const data = await fs.readFile(this.filePath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  public async clear(nameSpace: string) {
    try {
      await fs.access(this.filePath, fs.constants.F_OK);
      await fs.unlink(this.filePath);
      return;
    } catch {
      return;
    }
  }
}
