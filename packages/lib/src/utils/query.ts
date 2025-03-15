import { z } from 'zod';
import { type HonoRequest } from 'hono';

export const getQueryValue = (req: HonoRequest, scheme: z.ZodSchema) => {
  const query = Object.fromEntries(
    Object.entries(req.queries()).map(([k, v]) => {
      return v.length === 1 ? [k, v[0]] : [k, v];
    }),
  );
  return scheme.parse(query);
};
