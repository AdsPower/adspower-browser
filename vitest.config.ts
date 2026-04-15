import { defineConfig } from 'vitest/config';

/**
 * Contract tests live under each package in `packages/<name>/tests/`.
 * Run from repo root: pnpm test:contracts
 */
export default defineConfig({
    test: {
        environment: 'node',
        include: [
            'packages/*/tests/*contracts.test.ts',
            'packages/local-api-mcp/tests/e2e-tool-validation/*.contracts.test.ts',
        ],
        passWithNoTests: false,
        pool: 'threads',
    },
});
