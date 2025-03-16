import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { serveStatic } from 'hono/serve-static';
import { Session, sessionMiddleware } from 'hono-sessions';
import { AzureStrategy, decodeToken, CookieStoreEx, proxyRouter } from '@euricom/hono-token-handler';

export type ServerOptions = {
  tenantId: string;
  clientSecret: string;
  clientId: string;
  scopes: string[];
  port: number;
  proxy?: string;
};

export interface SessionData {
  state?: string;
  codeVerifier?: string;
  user?: any;
  tokens?: any;
  providerName?: string;
}

export interface HonoOptions {
  Variables: {
    session: Session<SessionData>;
  };
}

const createServer = (options: ServerOptions) => {
  const app = new Hono<HonoOptions>();
  const sessionStore = new CookieStoreEx();
  const oauthConfig = {
    tenantId: options.tenantId,
    clientId: options.clientId,
    clientSecret: options.clientSecret,
    redirectURI: `http://localhost:${options.port}/auth/login`,
    scopes: ['openid', 'email', 'profile', 'offline_access', ...options.scopes],
  };
  console.log('OAuth2:', oauthConfig);
  console.log('Proxy:', options.proxy);
  console.log('Port:', options.port);
  const authorizer = new AzureStrategy(oauthConfig);

  app.use(logger());

  app.use(
    '/',
    serveStatic({
      root: join(process.cwd(), 'public'),
      getContent: async (path) => {
        return readFileSync(path, 'utf-8');
      },
    }),
  );

  app.use(
    sessionMiddleware({
      store: sessionStore,
      encryptionKey: '315f5bdb76d078c43b8ac0064e4a0164612b1fce77c869345bfc94c75894edd3',
      cookieOptions: {
        secure: false,
      },
    }),
  );

  if (options.proxy) {
    app.route(
      '/api/*',
      proxyRouter({
        target: options.proxy,
        middleware(orgUrl, req, next) {
          console.log(`Proxy ${orgUrl} > ${req.url}`);
          return next();
        },
      }),
    );
  }

  app.get('/auth/user', (ctx) => {
    const user = ctx.var.session.get('user');
    return ctx.json(user);
  });

  app.get('/auth/diagnostics', (ctx) => {
    const tokens = ctx.var.session.get('tokens');
    const user = ctx.var.session.get('user');
    return ctx.json({
      tokens,
      user,
      accessToken: decodeToken(tokens?.accessToken || ''),
      idToken: decodeToken(tokens?.idToken || ''),
    });
  });

  app.get('/auth/login', (ctx) => {
    return authorizer.authenticate(ctx);
  });

  app.get('/auth/logout', (ctx) => {
    return authorizer.endSession(ctx);
  });

  return app;
};

export default createServer;
