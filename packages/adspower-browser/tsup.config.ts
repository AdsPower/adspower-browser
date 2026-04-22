import { copyFileSync } from 'node:fs';
import { join } from 'node:path';
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs'],
  outDir: 'cli',
  sourcemap: false,
  clean: true,
  // Bundle @adspower/local-api-core from workspace (source); keep runtime deps external
  external: ['axios', 'playwright-core', 'zod'],
  async onSuccess() {
    copyFileSync(
      join(__dirname, 'src/core/win-child-glue.cjs'),
      join(__dirname, 'cli/win-child-glue.cjs'),
    );
  },
});
