import { proxy, SessionData } from '@euricom/hono-token-handler';
import { Hono } from 'hono';
import { Session } from 'hono-sessions';

type AuthSession = Session<SessionData>;

const router = new Hono<{
  Variables: {
    session: AuthSession;
  };
}>();

router.use('/', (ctx, next) => {
  const host = ctx.req.header('host');
  console.log('host >>>>>', host);
  const proxyFn = proxy({
    target: 'https://sample.com/api',
  });
  return proxyFn(ctx, next);
});

export default router;
