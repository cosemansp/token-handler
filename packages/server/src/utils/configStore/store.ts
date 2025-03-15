import { getLogger } from '@/logger';
import { env } from '@/env';
import { StorageAdaptor } from './storageAdaptor';
import { AppConfigAdaptor } from './adaptors/appConfigAdaptor';
import { FileAdaptor } from './adaptors/fileAdaptor';
import { MemoryAdaptor } from './adaptors/memoryAdaptor';

const log = getLogger('store');

export class ConfigStore<T extends Record<string, unknown> = {}> {
  private adaptor: StorageAdaptor;
  public nameSpace: string;
  public ttl: number;

  constructor(url: URL, nameSpace: string, ttl: number);
  constructor(adaptor: StorageAdaptor, nameSpace: string, ttl: number);
  constructor(adaptorOrUrl: StorageAdaptor | URL, nameSpace: string, ttl: number) {
    this.ttl = ttl ?? 5 * 60 * 1000;
    this.nameSpace = nameSpace;
    if (adaptorOrUrl instanceof URL) {
      const url = new URL(adaptorOrUrl);
      if (url.hostname.includes('azconfig.io')) {
        this.adaptor = new AppConfigAdaptor(url.origin);
        log.info(`Using Azure App Configuration store: ${url.toString()}`);
      } else if (url.hostname.includes('file')) {
        this.adaptor = new FileAdaptor(url.origin);
        log.info(`Using File store: ${url.toString()}`);
      } else {
        // fallback to simple memory store
        console.log('Falling back to MemoryAdaptor');
        this.adaptor = new MemoryAdaptor();
      }
    } else {
      this.adaptor = adaptorOrUrl;
      return;
    }
  }

  getAdaptor(): StorageAdaptor {
    return this.adaptor;
  }

  async save(data: T): Promise<void> {
    await this.adaptor.save(data, this.nameSpace);
  }

  async load(): Promise<T | null> {
    return this.adaptor.load<T>(this.nameSpace);
  }

  async clear(): Promise<void> {
    await this.adaptor.clear(this.nameSpace);
  }
}
