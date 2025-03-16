import { Env } from 'hono';
import { Authorizer } from './authenticator';
import { AzureStrategy } from '@euricom/hono-token-handler';

export type ApplicationConfig = {
  domain: string;
  provider: ProviderConfig[] | ProviderConfig;
};

export type ProviderConfig = {
  name: string;
  clientId: string;
  clientSecret: string;
  redirectURI: string;
  scopes: string[];
};

export class ProviderFactory<TEnv extends Env = any> {
  constructor(protected apps: ApplicationConfig[]) {}
  createAuthorizer(domain: string) {
    // console.log('createAuthorizer', domain);
    const app = this.apps.find((app) => app.domain === domain);
    if (!app) {
      throw new Error('Application not found');
    }
    const provider = Array.isArray(app.provider) ? app.provider[0] : app.provider;
    return new Authorizer<TEnv>([this.createProvider(provider)]);
  }

  createProvider(providerConfig: ProviderConfig) {
    if (providerConfig.name === 'azure') {
      return new AzureStrategy({
        tenantId: '0b53d2c1-bc55-4ab3-a161-927d289257f2',
        ...providerConfig,
      });
    }
    throw new Error('Provider not supported');
  }
}
