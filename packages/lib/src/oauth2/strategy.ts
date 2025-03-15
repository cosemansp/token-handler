import createDebug from 'debug';
import { Context, HonoRequest } from 'hono';
import { HonoOptions, User } from '../context';
import jwt from 'jsonwebtoken';
import { generateState, generateCodeVerifier } from './generator';
import { CodeChallengeMethod, OAuth2Client } from './client';
import { OAuth2Tokens } from './token';
export type OAuth2StrategyPrompt = 'login' | 'none' | 'consent' | 'select_account';

export type OAuth2StrategyOptions = {
  /**
   * This is the Client ID of your application, provided to you by the Identity
   * Provider you're using to authenticate users.
   */
  clientId: string;
  /**
   * This is the Client Secret of your application, provided to you by the
   * Identity Provider you're using to authenticate users.
   */
  clientSecret: string;

  /**
   * The URL of your application where the Identity Provider will redirect the
   * user after they've logged in or authorized your application.
   */
  redirectURI: string;

  /**
   * The scopes you want to request from the Identity Provider, this is a list
   * of strings that represent the permissions you want to request from the
   * user.
   */
  scopes?: string[];

  /**
   * The prompt to use when requesting the authorization code.
   * @default "none"
   */
  prompt?: OAuth2StrategyPrompt;

  /**
   * The endpoint the Identity Provider asks you to send users to log in, or
   * authorize your application.
   */
  authorizationEndpoint: string;
  /**
   * The endpoint the Identity Provider uses to let's you exchange an access
   * code for an access and refresh token.
   */
  tokenEndpoint: string;

  /**
   * The endpoint the Identity Provider uses to let's you exchange an access
   * code for an access and refresh token.
   */
  userinfoEndpoint: string;

  /**
   * The endpoint the Identity Provider uses to let's you end a session.
   */
  endSessionEndpoint: string;
};

const debug = createDebug('OAuth2Strategy');

export class OAuth2Strategy {
  protected client: OAuth2Client;
  protected name: string = 'oauth2';

  constructor(protected options: OAuth2StrategyOptions) {
    this.client = new OAuth2Client(options.clientId, options.clientSecret, options.redirectURI?.toString() ?? null);
  }

  public async authenticate(ctx: Context<HonoOptions>) {
    let url = new URL(ctx.req.url);
    const session = ctx.var.session;

    // is this a callback or initial request?
    let stateUrl = url.searchParams.get('state');
    if (!stateUrl) {
      debug('No state found in the URL, redirecting to authorization endpoint');
      let { state, codeVerifier, url } = this.createAuthorizationURL();

      // Store the state and codeVerifier in the session
      session.set('state', state);
      session.set('codeVerifier', codeVerifier);

      // allow override for customer providers
      url.search = this.addAuthorizationParams(url.searchParams, ctx.req).toString();
      debug('Authorization URL', url.toString());
      return ctx.redirect(url.toString());
    }

    // get code, mandatory
    let code = url.searchParams.get('code');
    if (!code) throw new ReferenceError('Missing code in the URL');

    // verify state
    if (stateUrl !== session.get('state')) {
      throw new ReferenceError('Invalid state in the URL');
    }

    // verify codeVerifier
    let codeVerifier = session.get('codeVerifier');
    if (!codeVerifier) throw new ReferenceError('Missing codeVerifier in the session');

    debug('validating authorization code...');
    let tokens = await this.validateAuthorizationCode(code, codeVerifier);

    session.forget('codeVerifier');
    session.forget('state');
    session.set('tokens', tokens);

    let user = await this.getUser(ctx, tokens);
    session.set('user', user);
    session.set('providerName', this.name);
    return ctx.redirect('/');
  }

  public async refreshAccessToken(ctx: Context<HonoOptions>): Promise<OAuth2Tokens> {
    // https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow#refresh-the-access-token
    const session = ctx.var.session;
    const tokens = await this.client.refreshAccessToken(
      this.options.tokenEndpoint,
      session.get('tokens')?.refreshToken ?? '',
      this.options.scopes ?? [],
    );
    debug('refreshAccessToken', tokens);
    session.set('tokens', tokens);
    return tokens;
  }

  public async endSession(ctx: Context<HonoOptions>) {
    let requestUrl = new URL(ctx.req.url);
    let returnUrl = requestUrl.searchParams.get('returnUrl') ?? '/';
    let clientOnly = Boolean(requestUrl.searchParams.get('clientOnly'));
    debug('endSession %s', requestUrl.searchParams.toString());
    const session = ctx.var.session;
    if (!session.get('tokens')) {
      return ctx.redirect(returnUrl);
    }

    // clear our session
    session.forget('tokens');
    session.forget('user');

    if (clientOnly) {
      return ctx.redirect(returnUrl);
    }

    // redirect to STS to end session
    let endpoint = this.options.endSessionEndpoint;
    if (!endpoint) throw new Error('The endSession endpoint is not set.');
    const redirectUri = `${requestUrl.origin}${returnUrl}`;
    let logoutUrl = this.createEndSessionURL(session.get('tokens')?.idToken || '', redirectUri);
    debug('endSession URL: %s', logoutUrl.toString());
    return ctx.redirect(logoutUrl.toString());
  }

  protected async getUser(ctx: Context<HonoOptions>, tokens: OAuth2Tokens): Promise<User> {
    const payload = jwt.decode(tokens.idToken) as { oid: string; name: string; email: string; roles_euri: string };
    return {
      oid: payload.oid,
      name: payload.name,
      email: payload.email,
      roles: (payload.roles_euri || '').split(',').map((role) => role.trim()),
    };
  }

  protected createAuthorizationURL() {
    let state = generateState();
    let codeVerifier = generateCodeVerifier();
    let url = this.client.createAuthorizationWithPKCEUrl(
      this.options.authorizationEndpoint,
      state,
      CodeChallengeMethod.S256,
      codeVerifier,
      this.options.scopes ?? [],
    );
    return { state, codeVerifier, url };
  }

  protected createEndSessionURL(idToken: string, redirectUri?: string) {
    const url = this.client.createEndSessionURL(this.options.endSessionEndpoint, idToken, redirectUri);
    return url.toString();
  }

  protected validateAuthorizationCode(code: string, codeVerifier: string): Promise<OAuth2Tokens> {
    return this.client.validateAuthorizationCode(this.options.tokenEndpoint, code, codeVerifier);
  }

  protected addAuthorizationParams(params: URLSearchParams, _req: HonoRequest): URLSearchParams {
    return new URLSearchParams(params);
  }
}
