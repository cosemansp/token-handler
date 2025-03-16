import { AppConfigurationClient } from '@azure/app-configuration';
import { type Adaptor } from './adaptor';
import { TokenCredential } from '@azure/identity';

export class AppConfigAdaptor implements Adaptor {
  private readonly client: AppConfigurationClient;

  constructor(connectionString: string);
  constructor(endpoint: string, credential: TokenCredential);
  constructor(connectionStringOrEndpoint: string, credential?: TokenCredential) {
    if (connectionStringOrEndpoint.includes('Endpoint=')) {
      // using connection string
      // console.log('connection string', connectionStringOrEndpoint, credential);
      this.client = new AppConfigurationClient(connectionStringOrEndpoint);
    } else {
      // using endpoint and token credential
      // console.log('endpoint', connectionStringOrEndpoint, credential);
      this.client = new AppConfigurationClient(connectionStringOrEndpoint, credential!);
    }
  }

  public async save<TData>(data: TData, nameSpace: string): Promise<void> {
    const serializedData = JSON.stringify(data);
    await this.client.setConfigurationSetting({
      key: nameSpace,
      value: serializedData,
    });
  }

  public async load<TData>(nameSpace: string): Promise<TData | null> {
    try {
      const setting = await this.client.getConfigurationSetting({
        key: nameSpace,
      });
      if (setting.value) {
        return JSON.parse(setting.value || '') as TData;
      }
      return null; // no content
    } catch (err) {
      // throws error when the key doesn't exist
      if (err instanceof Error && err.name === 'RestError') {
        const restError = err as any;
        if (restError.statusCode === 404) {
          return null; // no content
        }
      }
      throw err;
    }
  }

  public async clear(nameSpace: string): Promise<void> {
    await this.client.deleteConfigurationSetting({
      key: nameSpace,
    });
  }
}
