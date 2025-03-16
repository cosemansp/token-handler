import { ProviderFactory } from '@/utils/providerFactory';
import { authErrorHandler, decodeToken, SessionData } from '@euricom/hono-token-handler';
import { Hono } from 'hono';
import { Session } from 'hono-sessions';
import { ApplicationConfig } from '@/models/config';
import { ConfigStore } from '@/utils/configStore/store';

type AuthSession = Session<SessionData>;

const router = new Hono<{
  Variables: {
    session: AuthSession;
    config: ConfigStore<ApplicationConfig[]>;
  };
}>();

router.get('/login', async (ctx) => {
  const config = await ctx.var.config.load();
  const factory = new ProviderFactory(config);
  const authorizer = factory.createAuthorizer(ctx);
  return authorizer.authenticate(ctx);
});

router.get('/logout', async (ctx) => {
  const config = await ctx.var.config.load();
  const factory = new ProviderFactory(config);
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
