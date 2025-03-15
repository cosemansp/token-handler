import { z } from 'zod';

export const TokenHandlerConfigSchema = z.object({
  // Server configuration
  port: z.number().default(3000),
  host: z.string().default('localhost'),

  // OAuth configuration
  oauth: z.object({
    clientId: z.string(),
    clientSecret: z.string(),
    redirectUri: z.string(),
    authorizationEndpoint: z.string(),
    tokenEndpoint: z.string(),
    userInfoEndpoint: z.string().optional(),
    scope: z.string().default('openid profile email'),
  }),

  // Session configuration
  session: z.object({
    secret: z.string(),
    cookieName: z.string().default('token-handler.sid'),
    maxAge: z.number().default(24 * 60 * 60 * 1000), // 24 hours
    secure: z.boolean().default(true),
    sameSite: z.enum(['Strict', 'Lax', 'None']).default('Lax'),
  }),

  // CORS configuration
  cors: z
    .object({
      origin: z.union([z.string(), z.array(z.string())]).default('*'),
      credentials: z.boolean().default(true),
    })
    .default({}),
});

export type TokenHandlerConfig = z.infer<typeof TokenHandlerConfigSchema>;

export const DEFAULT_CONFIG: TokenHandlerConfig = {
  port: 3000,
  host: 'localhost',
  oauth: {
    clientId: '',
    clientSecret: '',
    redirectUri: 'http://localhost:3000/callback',
    authorizationEndpoint: '',
    tokenEndpoint: '',
    scope: 'openid profile email',
  },
  session: {
    secret: '',
    cookieName: 'token-handler.sid',
    maxAge: 24 * 60 * 60 * 1000,
    secure: true,
    sameSite: 'Lax',
  },
  cors: {
    origin: '*',
    credentials: true,
  },
};
