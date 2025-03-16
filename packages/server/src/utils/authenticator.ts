import { OAuth2Strategy } from '@euricom/hono-token-handler';
import { Context, type Env } from 'hono';

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
