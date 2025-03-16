import { MemoryStore, sessionMiddleware } from 'hono-sessions';
import { env } from '@/env';
// import SessionStore from '@/utils/sessionStore';

const sessionStore = new MemoryStore();

export default sessionMiddleware({
  store: sessionStore,
  encryptionKey: env.SESSION_SECRET,
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    sameSite: 'lax',
  },
});
