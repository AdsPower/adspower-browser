import fs from 'node:fs';
import path from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { runOneCase } from './cases/registry';
import { readE2EEnv } from './config/env';
import { getOptionalFieldsFromSchema } from './config/schemaIntrospector';
import { toolMatrix } from './config/toolMatrix';
import { getParameterCoverage, resetOptionalCoverage } from './fixtures/coverageStore';
import { runCase } from './runner/caseRunner';
import { computeCoverageSummary, runAllCasesAndBuildReport } from './runner/reporter';
import type { ToolReport } from './runner/reporter';
import { createMcpClient } from './runner/mcpClient';

const repoRoot = path.resolve(__dirname, '..', '..', '..', '..');

describe('scripts wiring', () => {
    it('root package.json exposes test:e2e:local-api-mcp', () => {
        const pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8')) as {
            scripts?: Record<string, string>;
        };
        expect(pkg.scripts?.['test:e2e:local-api-mcp']).toBeTruthy();
    });

    it('local-api-mcp package.json exposes test:e2e:local-api-mcp', () => {
        const pkg = JSON.parse(
            fs.readFileSync(path.join(repoRoot, 'packages', 'local-api-mcp', 'package.json'), 'utf8'),
        ) as { scripts?: Record<string, string> };
        expect(pkg.scripts?.['test:e2e:local-api-mcp']).toBeTruthy();
    });
});

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

describe('computeCoverageSummary (Task 8)', () => {
    it('returns 1 for all rates when every tool has full optional coverage and passed parameter rows', () => {
        const tools: ToolReport[] = Object.keys(toolMatrix)
            .sort()
            .map((name) => ({
                name,
                cases: [
                    {
                        id: 'synthetic',
                        parameters: [{ name: '__invoke__', status: 'passed' as const }],
                    },
                ],
                missingOptionalParameters: [],
            }));
        const s = computeCoverageSummary(tools, 9, 0);
        expect(s.casePassRate).toBe(1);
        expect(s.toolCoverage).toBe(1);
        expect(s.parameterPassRate).toBe(1);
        expect(s.optionalAllCoverage).toBe(1);
        expect(s.caseIdsRun).toBe(9);
    });

    it('optionalAllCoverage reflects missing optional keys for a subset of tools', () => {
        const tools: ToolReport[] = [
            {
                name: 'create-group',
                cases: [],
                missingOptionalParameters: ['remark'],
            },
        ];
        const n = toolMatrix['create-group'].optionalAll.length;
        expect(n).toBeGreaterThan(0);
        const s = computeCoverageSummary(tools, 1, 0);
        expect(s.optionalAllCoverage).toBeCloseTo((n - 1) / n, 10);
        expect(s.toolCoverage).toBe(0);
    });

    it('treats empty tool list as fully satisfied for case/tool/parameter rates', () => {
        const s = computeCoverageSummary([], 0, 0);
        expect(s.casePassRate).toBe(1);
        expect(s.toolCoverage).toBe(1);
        expect(s.parameterPassRate).toBe(1);
        expect(s.optionalAllCoverage).toBe(1);
    });

    it('casePassRate reflects failed runs', () => {
        const tools: ToolReport[] = [];
        const s = computeCoverageSummary(tools, 1, 3);
        expect(s.casePassRate).toBeCloseTo(0.25, 10);
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

describe.skipIf(!isE2ERealApiEnabled())('e2e parameter report (Task 6)', () => {
    it('report has tool → case → parameter structure', async () => {
        const report = await runAllCasesAndBuildReport();
        expect(report.tools.length).toBeGreaterThan(0);

        const withCases = report.tools.filter((t) => t.cases.length > 0);
        expect(withCases.length).toBeGreaterThan(0);

        const first = withCases[0].cases[0];
        expect(first.parameters[0]).toMatchObject({
            name: expect.any(String),
            status: expect.any(String),
        });
    });

    it('create-group has no missing optional parameters after full case run', async () => {
        const report = await runAllCasesAndBuildReport();
        const row = report.tools.find((t) => t.name === 'create-group');
        expect(row?.missingOptionalParameters).toEqual([]);
    });
});

describe.skipIf(!isE2ERealApiEnabled())('e2e coverage summary gates (Task 8)', () => {
    beforeEach(() => {
        resetOptionalCoverage();
    });

    it('case and parameter pass rates meet minimum gate (0.95)', async () => {
        const report = await runAllCasesAndBuildReport();
        expect(report.summary.casePassRate).toBeGreaterThanOrEqual(0.95);
        expect(report.summary.parameterPassRate).toBeGreaterThanOrEqual(0.95);
    });

    it('summary counters and coverage ratios are consistent and bounded', async () => {
        const report = await runAllCasesAndBuildReport();
        expect(report.summary.caseIdsRun).toBe(
            report.summary.casesPassed + report.summary.casesFailed,
        );
        expect(report.summary.toolCoverage).toBeGreaterThanOrEqual(0);
        expect(report.summary.toolCoverage).toBeLessThanOrEqual(1);
        expect(report.summary.optionalAllCoverage).toBeGreaterThanOrEqual(0);
        expect(report.summary.optionalAllCoverage).toBeLessThanOrEqual(1);
        expect(report.summary.totalTools).toBe(report.tools.length);
    });
});
