import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/cli.ts'],
  clean: true,
  format: 'cjs',
  noExternal: ['@euricom/hono-token-handler'],
});
