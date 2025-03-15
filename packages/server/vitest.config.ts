import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['./src/**/*.spec.ts'],
    // setupFiles: ['./tests/test-setup.ts'],
  },
  plugins: [tsconfigPaths()],
});
