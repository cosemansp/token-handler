import { ClientSecretCredential } from '@azure/identity';
import { Adaptor } from './adaptors/adaptor';
import { AppConfigAdaptor } from './adaptors/appConfigAdaptor';
import { FileAdaptor } from './adaptors/fileAdaptor';
import { MemoryAdaptor } from './adaptors/memoryAdaptor';
import { env } from '../../env';
import { getLogger } from '../../logger';

const log = getLogger('configStore');

export class ConfigStore<TData> {
  private _adaptor: Adaptor;
  private _nameSpace: string;
  private _data: TData | null = null;

  constructor(configStore: string, nameSpace: string) {
    this._nameSpace = nameSpace;
    if (configStore.startsWith('file:')) {
      log.info('using file adaptor');
      const url = new URL(configStore);
      this._adaptor = new FileAdaptor(url.host);
    } else if (configStore.startsWith('https')) {
      log.info('using app config adaptor');
      const url = new URL(configStore);
      this._adaptor = new AppConfigAdaptor(
        url.origin,
        new ClientSecretCredential(env.AZURE_TENANT_ID, env.AZURE_CLIENT_ID, env.AZURE_CLIENT_SECRET),
      );
    } else {
      log.info('using memory');
      const appConfig = JSON.parse(configStore) as [];
      this._adaptor = new MemoryAdaptor(appConfig);
    }
  }

  async save(data: TData): Promise<void> {
    await this._adaptor.save(data, this._nameSpace);
    this._data = data;
  }

  async load(): Promise<TData> {
    this._data = await this._adaptor.load<TData>(this._nameSpace);
    return (this._data || []) as TData;
  }

  async clear(): Promise<void> {
    await this._adaptor.clear(this._nameSpace);
  }

  get data(): TData {
    return (this._data || []) as TData;
  }

  // for unit testing
  get nameSpace(): string {
    return this._nameSpace;
  }
  get adaptor(): Adaptor {
    return this._adaptor;
  }
}
