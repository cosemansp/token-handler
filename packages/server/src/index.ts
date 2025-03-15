import { env } from './env';
import app from './server';

export default {
  port: Number(env.PORT),
  fetch: app.fetch,
};
