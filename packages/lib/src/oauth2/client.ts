import { createS256CodeChallenge } from './generator';
import { OAuth2RequestError, UnexpectedResponseError } from './error';
import { FetchError, ofetch } from 'ofetch';
import createDebug from 'debug';
import { OAuth2Tokens } from './token';
const debug = createDebug('OAuth2Client');

export enum CodeChallengeMethod {
  S256 = 0,
  Plain,
}

export function mapOAuth2Tokens(data: OAuth2TokensResponse): OAuth2Tokens {
  return {
    tokenType: data.token_type,
    expiresIn: data.expires_in,
    scope: data.scope?.split(' ') ?? [],
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    idToken: data.id_token,
  };
}

export type OAuth2TokensResponse = {
  token_type: string;
  access_token: string;
  refresh_token: string;
  id_token: string;
  expires_in: number;
  scope: string;

  // error response
  error?: string;
  error_description?: string;
  error_uri?: string;
  state?: string;
};

export class OAuth2Client {
  constructor(
    protected clientId: string,
    protected clientSecret: string | null,
    protected redirectURI: string | null,
  ) {}

  public createAuthorizationURL(authorizationEndpoint: string, state: string, scopes: string[]) {
    const url = new URL(authorizationEndpoint);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('client_id', this.clientId);
    if (this.redirectURI !== null) {
      url.searchParams.set('redirect_uri', this.redirectURI);
    }
    url.searchParams.set('state', state);
    if (scopes.length > 0) {
      url.searchParams.set('scope', scopes.join(' '));
    }
    return url;
  }

  public createAuthorizationWithPKCEUrl(
    authorizationEndpoint: string,
    state: string,
    codeChallengeMethod: CodeChallengeMethod,
    codeVerifier: string,
    scopes: string[],
  ) {
    // https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow#request-an-authorization-code
    const url = new URL(authorizationEndpoint);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('client_id', this.clientId);
    if (this.redirectURI !== null) {
      url.searchParams.set('redirect_uri', this.redirectURI);
    }
    url.searchParams.set('state', state);
    if (codeChallengeMethod === CodeChallengeMethod.S256) {
      const codeChallenge = createS256CodeChallenge(codeVerifier);
      url.searchParams.set('code_challenge_method', 'S256');
      url.searchParams.set('code_challenge', codeChallenge);
    } else if (codeChallengeMethod === CodeChallengeMethod.Plain) {
      url.searchParams.set('code_challenge_method', 'plain');
      url.searchParams.set('code_challenge', codeVerifier);
    }
    if (scopes.length > 0) {
      url.searchParams.set('scope', scopes.join(' '));
    }
    return url;
  }

  public createEndSessionURL(endSessionEndpoint: string, idToken: string, redirectUri?: string) {
    const url = new URL(endSessionEndpoint);
    if (idToken) {
      url.searchParams.set('id_token_hint', idToken);
    }
    if (redirectUri) {
      url.searchParams.set('post_logout_redirect_uri', redirectUri);
    }
    return url;
  }

  public async validateAuthorizationCode(
    tokenEndpoint: string,
    code: string,
    codeVerifier: string,
  ): Promise<OAuth2Tokens> {
    // https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow#request-an-access-token-with-a-client_secret
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: this.clientId,
      code,
      code_verifier: codeVerifier,
    });

    if (this.redirectURI !== null) {
      params.set('redirect_uri', this.redirectURI);
    }
    if (this.clientSecret !== null) {
      params.set('client_secret', this.clientSecret);
    }

    // send request
    return await sendTokenRequest(tokenEndpoint, params);
  }

  public async refreshAccessToken(
    tokenEndpoint: string,
    refreshToken: string,
    scopes: string[],
  ): Promise<OAuth2Tokens> {
    // https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow#refresh-the-access-token
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: this.clientId,
    });
    if (scopes.length > 0) {
      params.set('scope', scopes.join(' '));
    }

    // send request
    return await sendTokenRequest(tokenEndpoint, params);
  }
}

export async function sendTokenRequest(tokenEndpoint: string, params: URLSearchParams): Promise<OAuth2Tokens> {
  // convert params to object for better debugging
  const paramsObject = Object.fromEntries(params.entries());
  debug('POST %s - %O', tokenEndpoint, paramsObject);
  try {
    const data = await ofetch<OAuth2TokensResponse>(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    // handle error (errors are returned in the body
    if ('error' in data && typeof data.error === 'string') {
      throw createOAuth2RequestError(data);
    }

    // map response to better structure
    return mapOAuth2Tokens(data);
  } catch (err) {
    if (err instanceof FetchError) {
      throw new UnexpectedResponseError(err.response?.status || 500, err.response?._data);
    }
    throw err;
  }
}

// https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow#error-response-1
function createOAuth2RequestError(data: OAuth2TokensResponse): OAuth2RequestError {
  let code: string;
  if ('error' in data && typeof data.error === 'string') {
    code = data.error;
  } else {
    throw new Error('Invalid error response');
  }
  let description: string | null = null;
  let uri: string | null = null;
  let state: string | null = null;
  if ('error_description' in data) {
    if (typeof data.error_description !== 'string') {
      throw new Error('Invalid data');
    }
    description = data.error_description;
  }
  if ('error_uri' in data) {
    if (typeof data.error_uri !== 'string') {
      throw new Error('Invalid data');
    }
    uri = data.error_uri;
  }
  if ('state' in data) {
    if (typeof data.state !== 'string') {
      throw new Error('Invalid data');
    }
    state = data.state;
  }
  debug('OAuth2RequestError: %O', { code, description, uri, state });
  return new OAuth2RequestError(code, description, uri, state);
}
