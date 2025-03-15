import 'dotenv/config';
import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

export const env = createEnv({
  isServer: true,
  skipValidation: process.env.NODE_ENV === 'test',
  server: {
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
    PORT: z.string().default('3000'),
    // Azure Entra ID
    AZURE_TENANT_ID: z.string(),
    AZURE_CLIENT_ID: z.string(),
    AZURE_CLIENT_SECRET: z.string(),
    // Session
    SESSION_SECRET: z.string(),
    SESSION_STORE: z.string().default('memory'), // redis:redis://localhost:6379, sqlite://session.sqlite
    // Config Store
    //   https://kv-euri-tokens.vault.azure.net/keyname
    //   https://ac-euri-tokens-we.azconfig.io/keyname
    //   file://.storage.json
    CONFIG_STORE: z.string().default('memory'),
  },
  runtimeEnv: process.env,
});
