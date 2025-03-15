import { StorageAdaptor } from '../storageAdaptor';

export class MemoryAdaptor implements StorageAdaptor {
  private storage: unknown = null;

  public async save<TData>(data: TData): Promise<void> {
    this.storage = data;
  }

  public async load<TData>(): Promise<TData | null> {
    return this.storage as TData | null;
  }

  public async clear(): Promise<void> {
    this.storage = null;
  }
}
