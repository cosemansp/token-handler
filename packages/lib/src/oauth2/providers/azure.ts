import { OAuth2Strategy, OAuth2StrategyOptions } from '../strategy';

export type AzureStrategyOptions = Omit<
  OAuth2StrategyOptions,
  | 'authorizationEndpoint'
  | 'tokenEndpoint'
  | 'userinfoEndpoint'
  | 'refreshTokenEndpoint'
  | 'endSessionEndpoint'
  | 'revocationEndpoint'
> & {
  tenantId: string;
};

export class AzureStrategy extends OAuth2Strategy {
  protected name: string = 'azure';

  // https://login.microsoftonline.com/0b53d2c1-bc55-4ab3-a161-927d289257f2/v2.0/.well-known/openid-configuration
  constructor(options: AzureStrategyOptions) {
    const baseUrl = `https://login.microsoftonline.com/${options.tenantId}`;
    super({
      ...options,
      authorizationEndpoint: `${baseUrl}/oauth2/v2.0/authorize`,
      tokenEndpoint: `${baseUrl}/oauth2/v2.0/token`,
      userinfoEndpoint: `https://graph.microsoft.com/oidc/userinfo`,
      endSessionEndpoint: `${baseUrl}/oauth2/v2.0/logout`,
    });
  }
}
