import { ProviderFactory } from '@/utils/providerFactory';
import { authErrorHandler, decodeToken, SessionData } from '@euricom/hono-token-handler';
import { Hono } from 'hono';
import { Session } from 'hono-sessions';

type AuthSession = Session<SessionData>;

const router = new Hono<{
  Variables: {
    session: AuthSession;
  };
}>();

const factory = new ProviderFactory();

router.get('/login', (ctx) => {
  const authorizer = factory.createAuthorizer(ctx.req.header('host')!);
  return authorizer.authenticate(ctx);
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

router.onError(authErrorHandler);
