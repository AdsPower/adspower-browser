import { beforeEach, describe, expect, it, vi } from 'vitest';
import { runOneCase } from './cases/registry';
import { readE2EEnv } from './config/env';
import { getOptionalFieldsFromSchema } from './config/schemaIntrospector';
import { toolMatrix } from './config/toolMatrix';
import { getParameterCoverage, resetOptionalCoverage } from './fixtures/coverageStore';
import { runCase } from './runner/caseRunner';
import { createMcpClient } from './runner/mcpClient';

describe('readE2EEnv', () => {
    it('missing required env should throw readable error', () => {
        expect(() =>
            readE2EEnv({
                ADSP_LOCAL_API_BASE_URL: '',
                ADSP_MCP_E2E_ENABLED: '1',
            } as NodeJS.ProcessEnv),
        ).toThrow(/ADSP_LOCAL_API_BASE_URL/);
    });
});

describe('mcpClient', () => {
    it('lists tools from stdio server', async () => {
        const client = await createMcpClient();
        const tools = await client.listTools();
        expect(tools.length).toBeGreaterThan(0);
        await client.close();
    });
});

describe('toolMatrix', () => {
    it('has exactly one matrix entry per registered MCP tool', async () => {
        const client = await createMcpClient();
        const tools = await client.listTools();
        const namesFromServer = tools.map((t) => t.name).sort();
        await client.close();

        for (const name of namesFromServer) {
            expect(toolMatrix[name], `missing matrix for ${name}`).toBeDefined();
        }

        const matrixKeys = Object.keys(toolMatrix).sort();
        expect(matrixKeys).toEqual(namesFromServer);
    });

    it('optionalAll matches full optional field set from Zod for each tool', () => {
        for (const [tool, entry] of Object.entries(toolMatrix)) {
            const optionalFromSchema = getOptionalFieldsFromSchema(tool);
            expect(new Set(entry.optionalAll)).toEqual(new Set(optionalFromSchema));
        }
    });
});

describe('runCase cleanup', () => {
    it('always runs cleanup after assert', async () => {
        const cleanup = vi.fn(async () => {});

        await runCase({
            name: 'x',
            prepare: async () => ({}),
            invoke: async () => ({}),
            assertState: async () => ({ passed: true, details: [] }),
            cleanup,
        });

        expect(cleanup).toHaveBeenCalledTimes(1);
    });

    it('runs cleanup when assertState throws', async () => {
        const cleanup = vi.fn(async () => {});

        await expect(
            runCase({
                name: 'fail-assert',
                prepare: async () => ({ marker: 1 }),
                invoke: async () => ({}),
                assertState: async () => {
                    throw new Error('assert boom');
                },
                cleanup,
            }),
        ).rejects.toThrow(/assert boom/);

        expect(cleanup).toHaveBeenCalledTimes(1);
    });
});

function isE2ERealApiEnabled(): boolean {
    return process.env.ADSP_MCP_E2E_ENABLED === '1';
}

describe.skipIf(!isE2ERealApiEnabled())('e2e real Local API (Task 5)', () => {
    beforeEach(() => {
        resetOptionalCoverage();
    });

    it('create-group: group_name discoverable via get-group-list', async () => {
        const result = await runOneCase('group.create.basic');
        expect(result.passed).toBe(true);
        expect(result.details.join('\n')).toMatch(/group_name=/);
    });

    it('create-group: each optionalAll field has a passing case (remark)', async () => {
        await runOneCase('group.create.withRemark');
        const coverage = getParameterCoverage('create-group');
        for (const param of coverage.optionalAll) {
            expect(coverage.passedOptionalParams).toContain(param);
        }
    });

    it('proxy: create → list → delete', async () => {
        const result = await runOneCase('proxy.create.list.delete');
        expect(result.passed).toBe(true);
    });

    it('browser: create → open headless → close → delete', async () => {
        const result = await runOneCase('browser.open.headless');
        expect(result.passed).toBe(true);
    });
});
