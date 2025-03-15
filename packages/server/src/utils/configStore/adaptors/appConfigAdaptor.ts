import { AppConfigurationClient } from '@azure/app-configuration';
import { env } from '@/env';
import { CachedClientSecretCredential } from '../../cachedClientSecretCredential';
import { StorageAdaptor } from '../storageAdaptor';
import { TokenCredential } from '@azure/identity';
import { RestError } from '@azure/core-rest-pipeline';

export class AppConfigAdaptor implements StorageAdaptor {
  private readonly client: AppConfigurationClient;

  constructor(connectionString: string);
  constructor(endpoint: string, tokenCredential: TokenCredential);
  constructor(connectionStringOrEndpoint: string, tokenCredential?: TokenCredential) {
    if (connectionStringOrEndpoint.includes('Endpoint=')) {
      // using connection string
      this.client = new AppConfigurationClient(connectionStringOrEndpoint);
    } else {
      // using endpoint and token credential
      const credentials =
        tokenCredential ??
        new CachedClientSecretCredential(env.AZURE_TENANT_ID, env.AZURE_CLIENT_ID, env.AZURE_CLIENT_SECRET);
      this.client = new AppConfigurationClient(connectionStringOrEndpoint, credentials);
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
      if (err instanceof RestError) {
        if (err.statusCode === 404) {
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
