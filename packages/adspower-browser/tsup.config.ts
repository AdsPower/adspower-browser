import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs'],
  outDir: 'cli',
  sourcemap: false,
  clean: true,
  // Bundle @adspower/local-api-core from workspace (source); keep runtime deps external
  external: ['axios', 'playwright-core', 'zod'],
});
