import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { ZodError } from 'zod';

export default function errorHandler(err: Error, c: Context) {
  console.error('REQUEST ERROR', err);

  if (err instanceof ZodError) {
    return c.json({ message: 'Bad Request', errors: err.flatten() }, 400);
  }

  if (err instanceof HTTPException) {
    return err.getResponse();
  }

  return c.json({ message: err.message }, 500);
}
