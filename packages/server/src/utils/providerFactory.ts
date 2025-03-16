import { Context, Env } from 'hono';
import { Authorizer } from './authenticator';
import { AzureStrategy } from '@euricom/hono-token-handler';
import { ApplicationConfig, ProviderConfig } from '@/models/config';

export class ProviderFactory<TEnv extends Env = any> {
  constructor(protected apps: ApplicationConfig[]) {}
  createAuthorizer(ctx: Context) {
    const host = ctx.req.header('host')!;
    const app = this.apps.find((app) => app.domain === host);
    if (!app) {
      throw new Error('Application not found');
    }
    const provider = Array.isArray(app.provider) ? app.provider[0] : app.provider;
    return new Authorizer<TEnv>([this.createProvider(ctx, provider)]);
  }

  createProvider(ctx: Context, providerConfig: ProviderConfig) {
    if (providerConfig.name === 'azure') {
      return new AzureStrategy({
        tenantId: '0b53d2c1-bc55-4ab3-a161-927d289257f2',
        ...providerConfig,
        scopes: ['openid', 'email', 'profile', ...providerConfig.scopes],
        redirectURI: `${new URL(ctx.req.url).origin}/auth/login`,
      });
    }
    throw new Error(`Unsupported provider: ${providerConfig.name}`);
  }
}
