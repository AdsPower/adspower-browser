import { defineConfig } from 'vitest/config';

/**
 * Contract tests live under each package in `packages/<name>/tests/`.
 * Run from repo root: pnpm test:contracts
 */
export default defineConfig({
    test: {
        environment: 'node',
        include: ['packages/*/tests/*contracts.test.ts'],
        passWithNoTests: false,
        pool: 'threads',
    },
});
