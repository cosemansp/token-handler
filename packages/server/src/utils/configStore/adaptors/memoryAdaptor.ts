import { Adaptor } from './adaptor';

export class MemoryAdaptor implements Adaptor {
  private storage: unknown = null;

  constructor(data: unknown) {
    this.storage = data;
  }

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
