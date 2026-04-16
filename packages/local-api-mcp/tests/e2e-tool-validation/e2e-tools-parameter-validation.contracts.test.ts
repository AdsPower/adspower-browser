import fs from 'node:fs';
import path from 'node:path';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { runOneCase } from './cases/registry';
import * as registryModule from './cases/registry';
import { caseMetadata } from './cases/caseMetadata';
import { readE2EEnv } from './config/env';
import { getOptionalFieldsFromSchema } from './config/schemaIntrospector';
import { toolMatrix } from './config/toolMatrix';
import { toolValidationStrategy } from './config/toolValidationStrategy.js';
import { compareCookieContains } from './assertions/roundtrip/cookieMatcher';
import { compareInputAgainstReadbackB } from './assertions/roundtrip/compareB';
import {
    extractJsonPayloadAfterPrefix,
    extractJsonPayloadFromToolText,
} from './assertions/roundtrip/jsonExtractors';
import { normalizeForCompare } from './assertions/roundtrip/normalizers';
import { isRoundtripCompareAcceptable } from './cases/browser/browser-roundtrip.case';
import { getParameterCoverage, resetOptionalCoverage } from './fixtures/coverageStore';
import { runCase } from './runner/caseRunner';
import { computeCoverageSummary, runAllCasesAndBuildReport } from './runner/reporter';
import type { ToolReport } from './runner/reporter';
import { createMcpClient } from './runner/mcpClient';
import type { CompareBResult } from './assertions/roundtrip/compareB';
import { __queryCaseInternals } from './cases/query/query-matrix.case';
import { __buildOpenedObservationFromText } from './cases/browser/browser-lifecycle.case';
import { __patchCaseInternals } from './cases/patch/patch.case';
import { __automationChainInternals } from './cases/automation/automation-chain.case';
import { __kernelCaseInternals } from './cases/kernel/kernel.case';

const repoRoot = path.resolve(__dirname, '..', '..', '..', '..');

describe('readE2EEnv', () => {
    it('缺少必填环境变量时抛出可读错误', () => {
        expect(() =>
            readE2EEnv({
                ADSP_LOCAL_API_BASE_URL: '',
                ADSP_MCP_E2E_ENABLED: '1',
            } as NodeJS.ProcessEnv),
        ).toThrow(/ADSP_LOCAL_API_BASE_URL/);
    });
});

describe('mcpClient', () => {
    it('可从 stdio 服务列出工具', async () => {
        const client = await createMcpClient();
        const tools = await client.listTools();
        expect(tools.length).toBeGreaterThan(0);
        await client.close();
    });
});

describe('toolMatrix', () => {
    it('与已注册 MCP 工具一一对应', async () => {
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

    it('每个工具的 optionalAll 与 Zod 可选字段集合一致', () => {
        for (const [tool, entry] of Object.entries(toolMatrix)) {
            const optionalFromSchema = getOptionalFieldsFromSchema(tool);
            expect(new Set(entry.optionalAll)).toEqual(new Set(optionalFromSchema));
        }
    });
});

describe('toolValidationStrategy', () => {
    it('与已注册 MCP 工具的策略映射一一对应', async () => {
        const client = await createMcpClient();
        const tools = await client.listTools();
        const namesFromServer = tools.map((t) => t.name).sort();
        await client.close();

        for (const name of namesFromServer) {
            expect(
                toolValidationStrategy[name],
                `missing validation strategy for ${name}`,
            ).toBeDefined();
        }

        const strategyKeys = Object.keys(toolValidationStrategy).sort();
        expect(strategyKeys).toEqual(namesFromServer);
    });
});

describe('computeCoverageSummary', () => {
    it('当工具全部覆盖且参数均通过时，各比率为 1', () => {
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
        expect(s.skippedParameterSlots).toBe(0);
        expect(s.skippedReasonCounts).toEqual({});
    });

    it('optionalAllCoverage 能反映部分工具缺失可选参数', () => {
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

    it('工具列表为空时各比率按完全满足处理', () => {
        const s = computeCoverageSummary([], 0, 0);
        expect(s.casePassRate).toBe(1);
        expect(s.toolCoverage).toBe(1);
        expect(s.parameterPassRate).toBe(1);
        expect(s.optionalAllCoverage).toBe(1);
    });

    it('casePassRate 能反映失败用例比例', () => {
        const tools: ToolReport[] = [];
        const s = computeCoverageSummary(tools, 1, 3);
        expect(s.casePassRate).toBeCloseTo(0.25, 10);
    });

    it('可聚合 skipped 槽位与 skipped 原因', () => {
        const tools: ToolReport[] = [
            {
                name: 'create-group',
                cases: [
                    {
                        id: 'group.create.roundtrip.full-optional-subset',
                        parameters: [
                            { name: 'group_name', status: 'passed' },
                            { name: 'remark', status: 'skipped', reason: 'readback_path_missing' },
                            { name: 'cookie', status: 'skipped', reason: 'cookie_actual_not_string' },
                            { name: 'other', status: 'skipped' },
                        ],
                    },
                ],
                missingOptionalParameters: [],
            },
        ];
        const s = computeCoverageSummary(tools, 1, 0);
        expect(s.totalParameterSlots).toBe(4);
        expect(s.skippedParameterSlots).toBe(3);
        expect(s.skippedReasonCounts).toEqual({
            readback_path_missing: 1,
            cookie_actual_not_string: 1,
            unknown: 1,
        });
        expect(s.parameterPassRate).toBe(1);
    });
});

describe('runAllCasesAndBuildReport roundtrip 解析保护', () => {
    const caseId = 'group.create.roundtrip.full-optional-subset';
    let originalMeta: (typeof caseMetadata)[string];

    beforeEach(() => {
        originalMeta = structuredClone(caseMetadata[caseId]);
    });

    it('可解析 roundtrip 行并聚合 skippedReasonCounts', async () => {
        vi.spyOn(registryModule, 'listRegisteredCaseIds').mockReturnValue([caseId]);
        vi.spyOn(registryModule, 'runOneCase').mockResolvedValue({
            passed: true,
            details: [
                'compareB: passed=1 failed=0 skipped=1',
                'group_name -> group_name:passed',
                'remark -> remark:skipped(readback_path_missing)',
            ],
        });

        const report = await runAllCasesAndBuildReport();
        const toolName = caseMetadata[caseId].tool;
        const tool = report.tools.find((t) => t.name === toolName);
        const row = tool?.cases.find((c) => c.id === caseId);

        expect(row?.parameters).toEqual([
            { name: 'group_name', status: 'passed', reason: undefined },
            { name: 'remark', status: 'skipped', reason: 'readback_path_missing' },
        ]);
        expect(report.summary.casesPassed).toBe(1);
        expect(report.summary.casesFailed).toBe(0);
        expect(report.summary.skippedReasonCounts).toEqual({
            readback_path_missing: 1,
        });
    });

    it('声明为 roundtrip 的用例在行不可解析时标记失败', async () => {
        vi.spyOn(registryModule, 'listRegisteredCaseIds').mockReturnValue([caseId]);
        vi.spyOn(registryModule, 'runOneCase').mockResolvedValue({
            passed: true,
            details: ['compareB: passed=2 failed=0 skipped=0'],
        });

        const report = await runAllCasesAndBuildReport();
        const toolName = caseMetadata[caseId].tool;
        const tool = report.tools.find((t) => t.name === toolName);
        const row = tool?.cases.find((c) => c.id === caseId);

        expect(row?.parameters).toEqual([
            {
                name: '__invoke__',
                status: 'failed',
                reason: 'roundtrip_parse_failed_no_rows',
            },
        ]);
        expect(report.summary.casesPassed).toBe(0);
        expect(report.summary.casesFailed).toBe(1);
        expect(report.summary.casePassRate).toBe(0);
    });

    afterEach(() => {
        caseMetadata[caseId] = originalMeta;
        vi.restoreAllMocks();
    });
});

describe('runAllCasesAndBuildReport blocked 语义', () => {
    const caseId = 'query.get-browser-list.by-profile-id';

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('blocked 用例会标记为 blocked 且不计入 optional 覆盖', async () => {
        vi.spyOn(registryModule, 'listRegisteredCaseIds').mockReturnValue([caseId]);
        vi.spyOn(registryModule, 'runOneCase').mockResolvedValue({
            passed: true,
            details: ['blocked:no_profile_for_profile_id_filter'],
        });

        const report = await runAllCasesAndBuildReport();
        const tool = report.tools.find((t) => t.name === 'get-browser-list');
        const row = tool?.cases.find((c) => c.id === caseId);

        expect(row?.parameters).toEqual([
            {
                name: '__invoke__',
                status: 'blocked',
                reason: 'no_profile_for_profile_id_filter',
            },
        ]);
        expect(tool?.missingOptionalParameters).toContain('profile_id');
    });

    it('成功且非 blocked 的用例仍计入 optional 覆盖', async () => {
        vi.spyOn(registryModule, 'listRegisteredCaseIds').mockReturnValue([caseId]);
        vi.spyOn(registryModule, 'runOneCase').mockResolvedValue({
            passed: true,
            details: ['profile_id_matched=abc-profile'],
        });

        const report = await runAllCasesAndBuildReport();
        const tool = report.tools.find((t) => t.name === 'get-browser-list');
        expect(tool?.missingOptionalParameters).not.toContain('profile_id');
    });
});

describe('roundtrip 辅助函数', () => {
    it('extractJsonPayloadFromToolText 可解析 JSON 数组负载', () => {
        const parsed = extractJsonPayloadFromToolText(
            'Browser list: [{"profile_id":"p1","name":"n"}]',
        );
        expect(parsed).toEqual([{ profile_id: 'p1', name: 'n' }]);
    });

    it('extractJsonPayloadAfterPrefix 可解析前缀后的负载', () => {
        const parsed = extractJsonPayloadAfterPrefix(
            'Group list: {"list":[{"group_id":"1"}]}',
            'Group list:',
        );
        expect(parsed).toEqual({ list: [{ group_id: '1' }] });
    });

    it('extractJsonPayloadFromToolText 可容忍尾部非 JSON 文本', () => {
        const parsed = extractJsonPayloadFromToolText(
            'Browser list: {"list":[{"profile_id":"p1"}]}\ntrace_id=abc123',
        );
        expect(parsed).toEqual({ list: [{ profile_id: 'p1' }] });
    });

    it('normalizeForCompare 可规范化基础与嵌套值', () => {
        const got = normalizeForCompare({
            b: 1,
            a: ' x ',
            c: { d: true },
        });
        expect(got).toEqual({
            a: 'x',
            b: '1',
            c: { d: 'true' },
        });
    });

    it('compareCookieContains 使用包含匹配并支持截断跳过', () => {
        expect(compareCookieContains('a=1; b=2', 'x=a=1;b=2;y').status).toBe('passed');
        expect(compareCookieContains('a=1;b=2;c=3', 'a=1;b=2;...').status).toBe('skipped');
    });

    it('compareInputAgainstReadbackB 支持 pass/fail/skipped 与 cookie 匹配器', () => {
        const result = compareInputAgainstReadbackB(
            { name: 'my-profile', cookie: 'a=1;b=2', missing_key: 'x' },
            { profile: { name: ' my-profile ' }, cookie_text: 'cookie=a=1;b=2;' },
            {
                name: { actualPath: 'profile.name' },
                cookie: { actualPath: 'cookie_text', matcher: 'cookie_contains' },
            },
        );
        expect(result.passed).toBe(2);
        expect(result.failed).toBe(0);
        expect(result.skipped).toBe(1);
        expect(result.rows.find((r) => r.inputPath === 'missing_key')?.reason).toBe(
            'readback_path_missing',
        );
    });

    it('isRoundtripCompareAcceptable 会拒绝必填字段被 skipped', () => {
        const compare: CompareBResult = {
            rows: [
                { inputPath: 'username', actualPath: 'username', status: 'passed' },
                { inputPath: 'password', actualPath: 'password', status: 'passed' },
                {
                    inputPath: 'name',
                    actualPath: 'name',
                    status: 'skipped',
                    reason: 'readback_path_missing',
                },
                { inputPath: 'remark', actualPath: 'remark', status: 'passed' },
                { inputPath: 'platform', actualPath: 'platform', status: 'passed' },
                {
                    inputPath: 'cookie',
                    actualPath: 'cookie',
                    status: 'skipped',
                    reason: 'cookie_not_substring_match_or_truncated',
                },
            ],
            passed: 4,
            failed: 0,
            skipped: 2,
        };
        const gate = isRoundtripCompareAcceptable(compare);
        expect(gate.passed).toBe(false);
        expect(gate.reasons.join('\n')).toMatch(/required_field_skipped\(name:/);
    });

    it('isRoundtripCompareAcceptable 允许指定 cookie skip 原因', () => {
        const compare: CompareBResult = {
            rows: [
                { inputPath: 'username', actualPath: 'username', status: 'passed' },
                { inputPath: 'password', actualPath: 'password', status: 'passed' },
                { inputPath: 'name', actualPath: 'name', status: 'passed' },
                { inputPath: 'remark', actualPath: 'remark', status: 'passed' },
                { inputPath: 'platform', actualPath: 'platform', status: 'passed' },
                {
                    inputPath: 'cookie',
                    actualPath: 'cookie',
                    status: 'skipped',
                    reason: 'cookie_actual_not_string',
                },
            ],
            passed: 5,
            failed: 0,
            skipped: 1,
        };
        const gate = isRoundtripCompareAcceptable(compare);
        expect(gate.passed).toBe(true);
        expect(gate.reasons).toEqual([]);
    });
});

describe('query matrix 断言', () => {
    it('basePass 要求可解析结构化负载并拒绝明显错误文本', () => {
        expect(__queryCaseInternals.basePass('Group list: {"list":[{"group_id":"1"}]}')).toBe(true);
        expect(__queryCaseInternals.basePass('failed to fetch group list')).toBe(false);
        expect(__queryCaseInternals.basePass('Group list: ok but no json payload')).toBe(false);
    });

    it('payloadHasMatchingValue 可验证过滤值命中', () => {
        const payload = {
            list: [
                { group_name: 'alpha', group_id: '1' },
                { group_name: 'beta', group_id: '2' },
            ],
        };
        expect(__queryCaseInternals.payloadHasMatchingValue(payload, 'group_name', 'beta')).toBe(true);
        expect(__queryCaseInternals.payloadHasMatchingValue(payload, 'group_name', 'gamma')).toBe(false);
    });
});

describe('browser lifecycle 解析保护', () => {
    it('get-opened-browser 负载不可解析时按失败处理', () => {
        const observation = __buildOpenedObservationFromText(
            'opened browsers: profile_id=abc-123, status=running',
            'abc-123',
        );
        expect(observation.parseOk).toBe(false);
        expect(observation.containsProfile).toBe(false);
        expect(observation.parseErrorSummary).toBeTruthy();
    });

    it('仅接受结构化负载来判断 profile 可见性', () => {
        const observation = __buildOpenedObservationFromText(
            'Browser list: [{"profile_id":"abc-123","status":"running"}]',
            'abc-123',
        );
        expect(observation.parseOk).toBe(true);
        expect(observation.containsProfile).toBe(true);
    });

    it('在 get-opened-browser 风格负载中将 user_id 视为 profile 标识', () => {
        const observation = __buildOpenedObservationFromText(
            'Opened browser list: [ { "user_id": "k1bitq6l", "ws": { "puppeteer": "ws://127.0.0.1:1/devtools/browser/x" } } ]',
            'k1bitq6l',
        );
        expect(observation.parseOk).toBe(true);
        expect(observation.containsProfile).toBe(true);
    });
});

describe('高风险门控保护', () => {
    it('patch.update.stable 仅在显式开启门控环境变量时执行', () => {
        expect(__patchCaseInternals.shouldAllowPatchUpdate({} as NodeJS.ProcessEnv)).toBe(false);
        expect(
            __patchCaseInternals.shouldAllowPatchUpdate({
                ADSP_MCP_E2E_ENABLE_UPDATE_PATCH: '0',
            } as NodeJS.ProcessEnv),
        ).toBe(false);
        expect(
            __patchCaseInternals.shouldAllowPatchUpdate({
                ADSP_MCP_E2E_ENABLE_UPDATE_PATCH: '1',
            } as NodeJS.ProcessEnv),
        ).toBe(true);
    });

    it('automation.chain.basic 遇错误关键字时失败并拒绝宽松文本长度兜底', () => {
        expect(
            __automationChainInternals.isStrictAutomationVisibleTextPass(
                'random long text without target signal but length larger than twenty chars',
            ),
        ).toBe(false);
        expect(
            __automationChainInternals.isStrictAutomationVisibleTextPass(
                'failed to navigate to https://example.com',
            ),
        ).toBe(false);
        expect(
            __automationChainInternals.isStrictAutomationVisibleTextPass(
                'Example Domain This domain is for use in illustrative examples in documents.',
            ),
        ).toBe(true);
        expect(
            __automationChainInternals.isStrictAutomationVisibleTextPass(
                'Example Domain This domain is for use in documentation examples without needing permission.',
            ),
        ).toBe(true);
    });

    it('kernel.list.chrome 失败闭合且要求可解析的结构化 chrome 负载', () => {
        expect(
            __kernelCaseInternals.evaluateKernelListChrome(
                'failed to get kernel list: timeout while calling upstream',
            ).passed,
        ).toBe(false);
        expect(
            __kernelCaseInternals.evaluateKernelListChrome(
                'kernel query ok but no parseable payload here',
            ).passed,
        ).toBe(false);
        expect(
            __kernelCaseInternals.evaluateKernelListChrome(
                'Kernel list: [{"kernel_type":"Chrome","kernel_version":"123"}]',
            ).passed,
        ).toBe(true);
    });
});

describe('runCase cleanup', () => {
    it('assert 后始终执行 cleanup', async () => {
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

    it('assertState 抛错时仍执行 cleanup', async () => {
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

describe('case cleanup 一致性', () => {
    function collectCaseFiles(dir: string): string[] {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        const files: string[] = [];
        for (const entry of entries) {
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                files.push(...collectCaseFiles(full));
                continue;
            }
            if (entry.isFile() && full.endsWith('.case.ts')) {
                files.push(full);
            }
        }
        return files;
    }

    it('所有 case 文件中的 runCase 调用都包含 cleanup 处理器', () => {
        const casesDir = path.join(__dirname, 'cases');
        const caseFiles = collectCaseFiles(casesDir);
        expect(caseFiles.length).toBeGreaterThan(0);

        for (const file of caseFiles) {
            const source = fs.readFileSync(file, 'utf8');
            const runCaseCount = (source.match(/runCase\s*\(\s*\{/g) ?? []).length;
            const cleanupCount = (source.match(/\bcleanup\s*:/g) ?? []).length;
            expect(
                cleanupCount,
                `runCase count and cleanup count mismatch in ${path.relative(repoRoot, file)}`,
            ).toBeGreaterThanOrEqual(runCaseCount);
        }
    });
});

function isE2ERealApiEnabled(): boolean {
    return process.env.ADSP_MCP_E2E_ENABLED === '1';
}

function isHighImpactE2EEnabled(): boolean {
    return process.env.ADSP_MCP_E2E_HIGH_IMPACT === '1';
}

function hasShareProfileReceiverEnv(): boolean {
    return (process.env.ADSP_MCP_E2E_SHARE_PROFILE_RECEIVER?.trim().length ?? 0) > 0;
}

/** `ADSP_LOCAL_API_MIN_INTERVAL_MS` 开启时，两次 Local API 请求至少间隔该毫秒数，全量 case 会显著变长。 */
function realApiPerCaseTimeoutMs(): number {
    const n = Number(process.env.ADSP_LOCAL_API_MIN_INTERVAL_MS ?? '0');
    return n > 0 ? 120_000 : 30_000;
}

function realApiBrowserTimeoutMs(): number {
    const n = Number(process.env.ADSP_LOCAL_API_MIN_INTERVAL_MS ?? '0');
    return n > 0 ? 360_000 : 180_000;
}

function realApiRunAllTimeoutMs(): number {
    const n = Number(process.env.ADSP_LOCAL_API_MIN_INTERVAL_MS ?? '0');
    return n > 0 ? 900_000 : 180_000;
}

describe('ADSP_LOCAL_API_MIN_INTERVAL_MS 动态超时缩放', () => {
    const originalMinInterval = process.env.ADSP_LOCAL_API_MIN_INTERVAL_MS;

    afterEach(() => {
        if (originalMinInterval === undefined) {
            delete process.env.ADSP_LOCAL_API_MIN_INTERVAL_MS;
            return;
        }
        process.env.ADSP_LOCAL_API_MIN_INTERVAL_MS = originalMinInterval;
    });

    it('最小间隔缺失或为 0 时使用默认超时', () => {
        delete process.env.ADSP_LOCAL_API_MIN_INTERVAL_MS;
        expect(realApiPerCaseTimeoutMs()).toBe(30_000);
        expect(realApiBrowserTimeoutMs()).toBe(180_000);
        expect(realApiRunAllTimeoutMs()).toBe(180_000);

        process.env.ADSP_LOCAL_API_MIN_INTERVAL_MS = '0';
        expect(realApiPerCaseTimeoutMs()).toBe(30_000);
        expect(realApiBrowserTimeoutMs()).toBe(180_000);
        expect(realApiRunAllTimeoutMs()).toBe(180_000);
    });

    it('启用最小间隔时扩大超时', () => {
        process.env.ADSP_LOCAL_API_MIN_INTERVAL_MS = '5000';
        expect(realApiPerCaseTimeoutMs()).toBe(120_000);
        expect(realApiBrowserTimeoutMs()).toBe(360_000);
        expect(realApiRunAllTimeoutMs()).toBe(900_000);
    });
});

type ParsedRoundtripRow = {
    inputPath: string;
    status: 'passed' | 'failed' | 'skipped';
    reason?: string;
};

function parseRoundtripRowsFromDetails(details: string[]): ParsedRoundtripRow[] {
    const rows: ParsedRoundtripRow[] = [];
    const rowPattern = /^([^->]+)->([^:]+):(passed|failed|skipped)(?:\(([^)]+)\))?$/;
    for (const line of details) {
        const m = line.match(rowPattern);
        if (!m) {
            continue;
        }
        rows.push({
            inputPath: m[1].trim(),
            status: m[3] as ParsedRoundtripRow['status'],
            reason: m[4],
        });
    }
    return rows;
}

function assertRoundtripSkipGate(
    details: string[],
    options: {
        requiredNonSkippedFields: string[];
        allowedSkippedByField?: Record<string, Set<string>>;
        maxAllowedSkipped: number;
    },
): void {
    const rows = parseRoundtripRowsFromDetails(details);
    expect(rows.length).toBeGreaterThan(0);

    for (const field of options.requiredNonSkippedFields) {
        const row = rows.find((r) => r.inputPath === field);
        expect(row, `missing compare row for ${field}`).toBeDefined();
        expect(row?.status, `required field ${field} must not be skipped`).toBe('passed');
    }

    const skipped = rows.filter((r) => r.status === 'skipped');
    expect(skipped.length).toBeLessThanOrEqual(options.maxAllowedSkipped);
    for (const row of skipped) {
        const allowedReasons = options.allowedSkippedByField?.[row.inputPath];
        expect(allowedReasons, `skipped field not whitelisted: ${row.inputPath}`).toBeDefined();
        expect(
            allowedReasons?.has(row.reason ?? ''),
            `skip reason not whitelisted: ${row.inputPath}:${row.reason ?? 'unknown'}`,
        ).toBe(true);
    }
}

describe.skipIf(!isE2ERealApiEnabled())('E2E 真实 Local API', () => {
    beforeEach(() => {
        resetOptionalCoverage();
    });

    it(
        'create-group：group_name 可通过 get-group-list 查询到',
        async () => {
            const result = await runOneCase('group.create.basic');
            expect(result.passed).toBe(true);
            expect(result.details.join('\n')).toMatch(/group_name=/);
        },
        realApiPerCaseTimeoutMs(),
    );

    it(
        'create-group：optionalAll 字段均有通过用例（remark）',
        async () => {
            await runOneCase('group.create.withRemark');
            const coverage = getParameterCoverage('create-group');
            for (const param of coverage.optionalAll) {
                expect(coverage.passedOptionalParams).toContain(param);
            }
        },
        realApiPerCaseTimeoutMs(),
    );

    it(
        'proxy：create → list → delete',
        async () => {
            const result = await runOneCase('proxy.create.list.delete');
            expect(result.passed).toBe(true);
        },
        realApiPerCaseTimeoutMs(),
    );

    it(
        'group：create roundtrip（compareB）',
        async () => {
            const result = await runOneCase('group.create.roundtrip.full-optional-subset');
            expect(result.passed).toBe(true);
            expect(result.details.join('\n')).toMatch(/compareB:\s+passed=\d+\s+failed=0/);
            assertRoundtripSkipGate(result.details, {
                requiredNonSkippedFields: ['group_name', 'remark'],
                maxAllowedSkipped: 0,
            });
        },
        realApiPerCaseTimeoutMs(),
    );

    it(
        'group：update roundtrip（compareB）',
        async () => {
            const result = await runOneCase('group.update.roundtrip.full-optional-subset');
            expect(result.passed).toBe(true);
            expect(result.details.join('\n')).toMatch(/compareB:\s+passed=\d+\s+failed=0/);
            assertRoundtripSkipGate(result.details, {
                requiredNonSkippedFields: ['group_name', 'remark'],
                maxAllowedSkipped: 0,
            });
        },
        realApiPerCaseTimeoutMs(),
    );

    it(
        'group：cleanup 可见性',
        async () => {
            const result = await runOneCase('group.cleanup.visibility');
            expect(result.passed).toBe(true);
            expect(result.details.join('\n')).toContain('old_name_not_found_after_cleanup');
        },
        realApiPerCaseTimeoutMs(),
    );

    it(
        'proxy：create roundtrip（compareB）',
        async () => {
            const result = await runOneCase('proxy.create.roundtrip.full-optional-subset');
            expect(result.passed).toBe(true);
            expect(result.details.join('\n')).toMatch(/compareB:\s+passed=\d+\s+failed=0/);
            assertRoundtripSkipGate(result.details, {
                requiredNonSkippedFields: ['type', 'host', 'port'],
                allowedSkippedByField: {
                    remark: new Set(['readback_path_missing']),
                },
                maxAllowedSkipped: 1,
            });
        },
        realApiPerCaseTimeoutMs(),
    );

    it(
        'proxy：update roundtrip（compareB）',
        async () => {
            const result = await runOneCase('proxy.update.roundtrip.full-optional-subset');
            expect(result.passed).toBe(true);
            expect(result.details.join('\n')).toMatch(/compareB:\s+passed=\d+\s+failed=0/);
            assertRoundtripSkipGate(result.details, {
                requiredNonSkippedFields: ['type', 'host', 'port'],
                allowedSkippedByField: {
                    remark: new Set(['readback_path_missing']),
                },
                maxAllowedSkipped: 1,
            });
        },
        realApiPerCaseTimeoutMs(),
    );

    it(
        'proxy：delete 可见性',
        async () => {
            const result = await runOneCase('proxy.delete.visibility');
            expect(result.passed).toBe(true);
            expect(result.details.join('\n')).toContain('not_found_after_delete');
        },
        realApiPerCaseTimeoutMs(),
    );

    it(
        'browser：create → open headless → close → delete',
        async () => {
            const result = await runOneCase('browser.open.headless');
            expect(result.passed).toBe(true);
        },
        realApiBrowserTimeoutMs(),
    );

    it(
        'lifecycle：open-browser 与 get-opened-browser 交叉校验',
        async () => {
            const result = await runOneCase('lifecycle.open-browser.headless');
            expect(result.passed).toBe(true);
            expect(result.details.join('\n')).toContain('opened_visible_in_get-opened-browser');
        },
        realApiBrowserTimeoutMs(),
    );

    it(
        'lifecycle：close-browser 清理 opened 状态',
        async () => {
            const result = await runOneCase('lifecycle.close-browser.visibility');
            expect(result.passed).toBe(true);
            expect(result.details.join('\n')).toContain('closed_not_present_in_get-opened-browser');
        },
        realApiBrowserTimeoutMs(),
    );

    it(
        'lifecycle：close-all-profiles 清理 opened 状态',
        async () => {
            const result = await runOneCase('lifecycle.close-all-profiles.global');
            expect(result.passed).toBe(true);
            expect(result.details.join('\n')).toContain('close_all_cleared_profile_from_get-opened-browser');
        },
        realApiBrowserTimeoutMs(),
    );

    it(
        'browser：create roundtrip（compareB）',
        async () => {
            const result = await runOneCase('browser.create.roundtrip.full-optional-subset');
            expect(result.passed).toBe(true);
            expect(result.details.join('\n')).toMatch(/compareB:\s+passed=\d+\s+failed=0/);
            assertRoundtripSkipGate(result.details, {
                requiredNonSkippedFields: ['username', 'password', 'name', 'remark', 'platform'],
                allowedSkippedByField: {
                    cookie: new Set([
                        'readback_path_missing',
                        'cookie_actual_not_string',
                        'cookie_not_substring_match_or_truncated',
                    ]),
                },
                maxAllowedSkipped: 1,
            });
        },
        realApiBrowserTimeoutMs(),
    );

    it(
        'browser：create roundtrip 地理/账号可选子集（compareB）',
        async () => {
            const result = await runOneCase('browser.create.roundtrip.geo-and-account-optional-subset');
            expect(result.passed).toBe(true);
            expect(result.details.join('\n')).toMatch(/compareB:\s+passed=\d+\s+failed=0/);
        },
        realApiBrowserTimeoutMs(),
    );

    it(
        'browser：create roundtrip 代理/指纹可选子集（compareB）',
        async () => {
            const result = await runOneCase(
                'browser.create.roundtrip.proxy-and-fingerprint-optional-subset',
            );
            expect(result.passed).toBe(true);
            expect(result.details.join('\n')).toMatch(/compareB:\s+passed=\d+\s+failed=0/);
        },
        realApiBrowserTimeoutMs(),
    );

    it(
        'browser：外部依赖可选子集按预期阻断并给出原因',
        async () => {
            const result = await runOneCase('browser.create.roundtrip.external-optional.blocked');
            expect(result.passed).toBe(true);
            expect(result.details.join('\n')).toContain(
                'blocked:create_browser_external_optional_requires_seeded_proxy_category_and_tags',
            );
        },
        realApiPerCaseTimeoutMs(),
    );

    it(
        'browser：update roundtrip（compareB）',
        async () => {
            const result = await runOneCase('browser.update.roundtrip.full-optional-subset');
            expect(result.passed).toBe(true);
            expect(result.details.join('\n')).toMatch(/compareB:\s+passed=\d+\s+failed=0/);
            assertRoundtripSkipGate(result.details, {
                requiredNonSkippedFields: ['username', 'password', 'name', 'remark', 'platform'],
                allowedSkippedByField: {
                    cookie: new Set([
                        'readback_path_missing',
                        'cookie_actual_not_string',
                        'cookie_not_substring_match_or_truncated',
                    ]),
                },
                maxAllowedSkipped: 1,
            });
        },
        realApiBrowserTimeoutMs(),
    );

    it(
        'browser：delete 可见性',
        async () => {
            const result = await runOneCase('browser.delete.visibility');
            expect(result.passed).toBe(true);
            expect(result.details.join('\n')).toContain('not_found_after_delete');
        },
        realApiBrowserTimeoutMs(),
    );

    it(
        'automation 链路：connect ws -> page -> navigate -> visible text',
        async () => {
            const result = await runOneCase('automation.chain.basic');
            expect(result.passed).toBe(true);
            expect(result.details.join('\n')).toContain(
                'chain=connect-browser-with-ws>open-new-page>navigate>get-page-visible-text',
            );
        },
        realApiBrowserTimeoutMs(),
    );

    it(
        'kernel：download minimal 遵循门控并在禁用时返回 blocked',
        async () => {
            const result = await runOneCase('kernel.download.minimal');
            expect(result.passed).toBe(true);
            const joined = result.details.join('\n');
            if (process.env.ADSP_MCP_E2E_ENABLE_DOWNLOAD_KERNEL === '1') {
                expect(joined).toContain('kernel_type=Chrome');
            } else {
                expect(joined).toContain(
                    'blocked:download_kernel_disabled_ADSP_MCP_E2E_ENABLE_DOWNLOAD_KERNEL',
                );
            }
        },
        realApiPerCaseTimeoutMs(),
    );

    it(
        'patch：update 默认阻断，显式开启门控后执行',
        async () => {
            const result = await runOneCase('patch.update.blocked-by-default');
            expect(result.passed).toBe(true);
            const joined = result.details.join('\n');
            if (process.env.ADSP_MCP_E2E_ENABLE_UPDATE_PATCH === '1') {
                expect(joined).toContain('update_patch_invoked=true');
            } else {
                expect(joined).toContain(
                    'blocked:update_patch_disabled_ADSP_MCP_E2E_ENABLE_UPDATE_PATCH',
                );
            }
        },
        realApiPerCaseTimeoutMs(),
    );

    it(
        'highimpact：new-fingerprint 遵循环境门控',
        async () => {
            const result = await runOneCase('highimpact.new-fingerprint.by-profile-id');
            expect(result.passed).toBe(true);
            const joined = result.details.join('\n');
            if (isHighImpactE2EEnabled()) {
                expect(joined).not.toContain('blocked:high_impact_disabled_ADSP_MCP_E2E_HIGH_IMPACT');
            } else {
                expect(joined).toContain('blocked:high_impact_disabled_ADSP_MCP_E2E_HIGH_IMPACT');
            }
        },
        realApiPerCaseTimeoutMs(),
    );

    it(
        'highimpact：delete-cache-v2 执行前要求无 opened 浏览器',
        async () => {
            const result = await runOneCase('highimpact.delete-cache-v2.cookie-only');
            expect(result.passed).toBe(true);
            const joined = result.details.join('\n');
            if (!isHighImpactE2EEnabled()) {
                expect(joined).toContain('blocked:high_impact_disabled_ADSP_MCP_E2E_HIGH_IMPACT');
                return;
            }
            const blockedByOpened = joined.includes(
                'blocked:delete_cache_requires_no_opened_browser',
            );
            const blockedByParse = joined.includes(
                'blocked:delete_cache_precheck_parse_failed_get_opened_browser',
            );
            if (blockedByOpened || blockedByParse) {
                expect(joined).toMatch(/blocked:/);
                return;
            }
            expect(joined).toContain('precheck_no_opened_browser');
        },
        realApiPerCaseTimeoutMs(),
    );

    it(
        'highimpact：share-profile 仅在 receiver 环境变量与 high-impact 门控满足时执行',
        async () => {
            const result = await runOneCase('highimpact.share-profile.with-receiver');
            expect(result.passed).toBe(true);
            const joined = result.details.join('\n');
            if (!isHighImpactE2EEnabled()) {
                expect(joined).toContain('blocked:high_impact_disabled_ADSP_MCP_E2E_HIGH_IMPACT');
                return;
            }
            if (!hasShareProfileReceiverEnv()) {
                expect(joined).toContain(
                    'blocked:missing_share_receiver_env_ADSP_MCP_E2E_SHARE_PROFILE_RECEIVER',
                );
                return;
            }
            expect(joined).toContain('receiver_from_env=true');
        },
        realApiPerCaseTimeoutMs(),
    );

    const queryCaseIds = [
        'query.get-browser-list.basic',
        'query.get-browser-list.by-profile-id',
        'query.get-group-list.basic',
        'query.get-group-list.by-group-name',
        'query.get-proxy-list.basic',
        'query.get-proxy-list.by-proxy-id',
        'query.get-tag-list.basic',
        'query.get-tag-list.by-ids',
        'query.get-application-list.basic',
        'query.get-application-list.by-category-id',
        'query.get-kernel-list.basic',
        'query.get-kernel-list.by-kernel-type',
        'query.get-browser-active.basic',
        'query.get-browser-active.by-profile-no',
        'query.get-cloud-active.basic',
        'query.get-cloud-active.filter-blocked',
        'query.check-status.basic',
        'query.check-status.filter-blocked',
        'query.get-opened-browser.basic',
        'query.get-opened-browser.filter-blocked',
    ] as const;

    it.each(queryCaseIds)(
        'query 矩阵用例 %s 可执行且返回非空 details',
        async (caseId) => {
            const result = await runOneCase(caseId);
            expect(result.passed, `${caseId} should pass or report blocked`).toBe(true);
            expect(Array.isArray(result.details), `${caseId} should expose details array`).toBe(true);
            expect(result.details.length, `${caseId} should include at least one detail row`).toBeGreaterThan(0);
            if (process.env.ADSP_MCP_E2E_PROGRESS === '1') {
                console.info(`[query-matrix] completed ${caseId}`);
            }
        },
        realApiPerCaseTimeoutMs(),
    );

    it(
        'tag：create roundtrip（compareB）',
        async () => {
            const result = await runOneCase('tag.create.roundtrip.full-optional-subset');
            expect(result.passed).toBe(true);
            expect(result.details.join('\n')).toMatch(/compareB:\s+passed=\d+\s+failed=0/);
            assertRoundtripSkipGate(result.details, {
                requiredNonSkippedFields: ['name', 'color'],
                maxAllowedSkipped: 0,
            });
        },
        realApiPerCaseTimeoutMs(),
    );

    it(
        'tag：update roundtrip（compareB）',
        async () => {
            const result = await runOneCase('tag.update.roundtrip.full-optional-subset');
            expect(result.passed).toBe(true);
            expect(result.details.join('\n')).toMatch(/compareB:\s+passed=\d+\s+failed=0/);
            assertRoundtripSkipGate(result.details, {
                requiredNonSkippedFields: ['name', 'color'],
                maxAllowedSkipped: 0,
            });
        },
        realApiPerCaseTimeoutMs(),
    );

    it(
        'tag：delete 可见性',
        async () => {
            const result = await runOneCase('tag.delete.visibility');
            expect(result.passed).toBe(true);
            expect(result.details.join('\n')).toContain('not_found_after_delete');
        },
        realApiPerCaseTimeoutMs(),
    );
});

describe.skipIf(!isE2ERealApiEnabled())('E2E 参数报告', () => {
    let cachedReport: Awaited<ReturnType<typeof runAllCasesAndBuildReport>>;

    beforeAll(async () => {
        cachedReport = await runAllCasesAndBuildReport();
    }, realApiRunAllTimeoutMs());

    it(
        '报告包含 tool → case → parameter 结构',
        async () => {
            const report = cachedReport;
            expect(report.tools.length).toBeGreaterThan(0);

            const withCases = report.tools.filter((t) => t.cases.length > 0);
            expect(withCases.length).toBeGreaterThan(0);

            const first = withCases[0].cases[0];
            expect(first.parameters[0]).toMatchObject({
                name: expect.any(String),
                status: expect.any(String),
            });
        },
        realApiRunAllTimeoutMs(),
    );

    it(
        '全量用例后 create-group 不应缺失可选参数',
        async () => {
            const report = cachedReport;
            const row = report.tools.find((t) => t.name === 'create-group');
            expect(row?.missingOptionalParameters).toEqual([]);
        },
        realApiPerCaseTimeoutMs(),
    );

    it(
        'create-browser 缺失可选参数显著减少',
        async () => {
            const report = cachedReport;
            const row = report.tools.find((t) => t.name === 'create-browser');
            expect(row).toBeDefined();
            const missing = row?.missingOptionalParameters ?? [];
            if (missing.length === 0) {
                expect(missing).toEqual([]);
                return;
            }

            const mustNotBeMissing = [
                'username',
                'password',
                'name',
                'platform',
                'remark',
                'fakey',
                'ip',
                'ipchecker',
                'user_proxy_config',
            ] as const;
            for (const p of mustNotBeMissing) {
                expect(missing).not.toContain(p);
            }

            // List API / Rule B: these may stay uncovered when readback omits paths or cookie is non-string.
            const allowedMissingWhenReadbackIncomplete = new Set([
                'cookie',
                'tabs',
                'ignore_cookie_error',
                'repeat_config',
                'country',
                'region',
                'city',
                'fingerprint_config',
                'category_id',
                'profile_tag_ids',
                'proxyid',
                'platform_account',
            ]);
            for (const m of missing) {
                expect(allowedMissingWhenReadbackIncomplete.has(m)).toBe(true);
            }
        },
        realApiPerCaseTimeoutMs(),
    );
});

describe.skipIf(!isE2ERealApiEnabled())('E2E 覆盖率汇总门槛', () => {
    let cachedReport: Awaited<ReturnType<typeof runAllCasesAndBuildReport>>;

    beforeAll(async () => {
        resetOptionalCoverage();
        cachedReport = await runAllCasesAndBuildReport();
    }, realApiRunAllTimeoutMs());

    it(
        'case 与 parameter 通过率满足最低门槛（0.95）',
        async () => {
            const report = cachedReport;
            expect(report.summary.casePassRate).toBeGreaterThanOrEqual(0.95);
            expect(report.summary.parameterPassRate).toBeGreaterThanOrEqual(0.95);
        },
        realApiPerCaseTimeoutMs(),
    );

    it(
        '汇总计数与覆盖率区间一致且有界',
        async () => {
            const report = cachedReport;
            expect(report.summary.caseIdsRun).toBe(
                report.summary.casesPassed + report.summary.casesFailed,
            );
            expect(report.summary.toolCoverage).toBeGreaterThanOrEqual(0);
            expect(report.summary.toolCoverage).toBeLessThanOrEqual(1);
            expect(report.summary.optionalAllCoverage).toBeGreaterThanOrEqual(0);
            expect(report.summary.optionalAllCoverage).toBeLessThanOrEqual(1);
            expect(report.summary.totalTools).toBe(report.tools.length);
        },
        realApiPerCaseTimeoutMs(),
    );
});
