import { Hono } from 'hono';
import { decodeToken } from '../oauth2';
import { ApplicationConfig, ProviderFactory } from '../oauth2/authenticator';
import { HonoOptions } from '../context';
import { errorHandler } from '../middleware/errorHandler';

export type TokenHandlerMiddlewareOptions = {
  applications: ApplicationConfig[];
};

export const tokenHandler = (options: TokenHandlerMiddlewareOptions) => {
  const router = new Hono<HonoOptions>();
  const factory = new ProviderFactory(options.applications);

  router.get('/login', (ctx) => {
    const idp = ctx.req.query('idp');
    const authorizer = factory.createAuthorizer(ctx.req.header('host')!);
    return authorizer.authenticate(ctx, idp);
  });

  router.get('/logout', (ctx) => {
    const authorizer = factory.createAuthorizer(ctx.req.header('host')!);
    return authorizer.endSession(ctx);
  });

  router.get('/user', (ctx) => {
    const user = ctx.var.session.get('user');
    return ctx.json(user);
  });

  if (process.env.NODE_ENV === 'development') {
    router.get('/diag', (ctx) => {
      const tokens = ctx.var.session.get('tokens');
      const user = ctx.var.session.get('user');
      return ctx.json({
        tokens,
        user,
        accessToken: decodeToken(tokens?.accessToken || ''),
        idToken: decodeToken(tokens?.idToken || ''),
      });
    });
  }

  router.onError(errorHandler);
  return router;
};
