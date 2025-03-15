import { SecretClient } from '@azure/keyvault-secrets';
import { env } from '@/env';
import { CachedClientSecretCredential } from '../../cachedClientSecretCredential';
import { StorageAdaptor } from '../storageAdaptor';
import { TokenCredential } from '@azure/identity';

export class SecretAdaptor implements StorageAdaptor {
  private readonly secretName: string;
  private readonly client: SecretClient;

  constructor(endpoint: string, secretName: string, tokenCredential: TokenCredential) {
    const credentials =
      tokenCredential ??
      new CachedClientSecretCredential(env.AZURE_TENANT_ID, env.AZURE_CLIENT_ID, env.AZURE_CLIENT_SECRET);
    this.client = new SecretClient(endpoint, credentials);
    this.secretName = secretName;
  }

  public async save<TData>(data: TData): Promise<void> {
    const serializedData = JSON.stringify(data);
    await this.client.setSecret(this.secretName, serializedData);
  }

  public async load<TData>(): Promise<TData | null> {
    const secret = await this.client.getSecret(this.secretName);
    if (!secret.value) {
      return null;
    }
    return JSON.parse(secret.value) as TData;
  }

  public async clear(): Promise<void> {
    await this.client.purgeDeletedSecret(this.secretName);
  }
}
