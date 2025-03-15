import { AzureStrategy } from './providers/azure';
import { OAuth2Strategy } from './strategy';
import { Context, type Env } from 'hono';

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

export class Authorizer<TEnv extends Env = any> {
  constructor(protected providers: OAuth2Strategy[]) {
    // currently only one provider is supported
  }

  public async authenticate(ctx: Context<TEnv>, _providerName?: string) {
    const provider = this.providers[0];
    return provider.authenticate(ctx as any);
  }

  public async endSession(ctx: Context<TEnv>, _providerName?: string) {
    const provider = this.providers[0];
    return provider.endSession(ctx as any);
  }
}
