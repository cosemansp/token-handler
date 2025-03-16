import { ApplicationConfig, ProviderFactory } from '@/utils/providerFactory';
import { authErrorHandler, decodeToken, SessionData } from '@euricom/hono-token-handler';
import { Hono } from 'hono';
import { Session } from 'hono-sessions';
import { env } from '../env';

type AuthSession = Session<SessionData>;

const appsConfig = env.CONFIG_STORE as ApplicationConfig[];
console.log('appsConfig >>>>>', appsConfig);

const router = new Hono<{
  Variables: {
    session: AuthSession;
  };
}>();

router.get('/login', (ctx) => {
  const factory = new ProviderFactory(appsConfig);
  const authorizer = factory.createAuthorizer(ctx);
  return authorizer.authenticate(ctx);
});

router.get('/logout', (ctx) => {
  const factory = new ProviderFactory(appsConfig);
  const authorizer = factory.createAuthorizer(ctx);
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

export default router;
