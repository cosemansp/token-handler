export interface StorageAdaptor {
  save(data: unknown, nameSpace?: string): Promise<void>;
  load<T>(nameSpace?: string): Promise<T | null>;
  clear(nameSpace?: string): Promise<void>;
}
