import { OAuth2Strategy, OAuth2StrategyOptions } from '../strategy';

type GoogleStrategyOptions = Omit<
  OAuth2StrategyOptions,
  'authorizationEndpoint' | 'tokenEndpoint' | 'userinfoEndpoint' | 'refreshTokenEndpoint' | 'endSessionEndpoint'
> & {};

export class GoogleStrategy extends OAuth2Strategy {
  protected name: string = 'google';

  constructor(options: GoogleStrategyOptions) {
    // https://accounts.google.com/.well-known/openid-configuration
    super({
      ...options,
      authorizationEndpoint: `https://accounts.google.com/o/oauth2/v2/auth`,
      tokenEndpoint: `https://oauth2.googleapis.com/token`,
      userinfoEndpoint: `https://openidconnect.googleapis.com/v1/userinfo`,
      endSessionEndpoint: `https://oauth2.googleapis.com/logout`,
    });
  }
}
