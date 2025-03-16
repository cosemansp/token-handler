import fs from 'fs/promises';
import { Adaptor } from './adaptor';
import { join } from 'path';
export class FileAdaptor implements Adaptor {
  private readonly filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  public async save(data: unknown, _nameSpace: string) {
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2));
  }

  public async load<T>(_nameSpace: string): Promise<T | null> {
    try {
      const filePath = join(process.cwd(), this.filePath);
      await fs.access(this.filePath);
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  public async clear(_nameSpace: string) {
    try {
      await fs.access(this.filePath, fs.constants.F_OK);
      await fs.unlink(this.filePath);
      return;
    } catch {
      return;
    }
  }
}
