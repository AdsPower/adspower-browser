import { caseMetadata } from '../cases/caseMetadata.js';
import { listRegisteredCaseIds, runOneCase } from '../cases/registry.js';
import { toolMatrix } from '../config/toolMatrix.js';
import {
    getMissingOptionalForTool,
    markOptionalParamCovered,
    resetOptionalCoverage,
} from '../fixtures/coverageStore.js';
import type { CaseRunResult } from '../types.js';

export type ParameterStatusRow = {
    name: string;
    status: 'passed' | 'failed' | 'skipped' | 'blocked';
    reason?: string;
};

export type CaseReport = {
    id: string;
    parameters: ParameterStatusRow[];
};

export type ToolReport = {
    name: string;
    cases: CaseReport[];
    missingOptionalParameters: string[];
};

export type CoverageSummary = {
    caseIdsRun: number;
    casesPassed: number;
    casesFailed: number;
    /** Registered cases that completed without throwing: passed / (passed + failed). */
    casePassRate: number;
    totalTools: number;
    /** Tools whose Zod `optionalAll` set is fully covered (no missing optional keys). */
    toolsFullyOptionalComplete: number;
    /** `toolsFullyOptionalComplete / totalTools` (global; reaches 1 only when every tool’s optionals are covered). */
    toolCoverage: number;
    totalParameterSlots: number;
    passedParameterSlots: number;
    skippedParameterSlots: number;
    skippedReasonCounts: Record<string, number>;
    /**
     * Share of decisive parameter rows that passed: `passed / (passed + failed)`.
     * Skipped/blocked rows are excluded (Rule B: skip is not a failure signal for this gate).
     */
    parameterPassRate: number;
    totalOptionalSlots: number;
    coveredOptionalSlots: number;
    /** `coveredOptionalSlots / totalOptionalSlots` (0 if no optional fields exist across tools). */
    optionalAllCoverage: number;
};

export type E2EParameterReport = {
    tools: ToolReport[];
    summary: CoverageSummary;
};

function shouldLogE2EProgress(): boolean {
    return process.env.ADSP_MCP_E2E_PROGRESS === '1' || process.env.ADSP_MCP_E2E_ENABLED === '1';
}

/**
 * Aggregates gate metrics from a built `tools` array plus case run counters.
 * See `E2EParameterReport.summary` field meanings.
 */
export function computeCoverageSummary(
    tools: ToolReport[],
    casesPassed: number,
    casesFailed: number,
): CoverageSummary {
    const caseIdsRun = casesPassed + casesFailed;
    const casePassRate = caseIdsRun === 0 ? 1 : casesPassed / caseIdsRun;

    const totalTools = tools.length;
    const toolsFullyOptionalComplete = tools.filter((t) => t.missingOptionalParameters.length === 0).length;
    const toolCoverage = totalTools === 0 ? 1 : toolsFullyOptionalComplete / totalTools;

    let passedParameterSlots = 0;
    let skippedParameterSlots = 0;
    let totalParameterSlots = 0;
    let decisiveParameterSlots = 0;
    const skippedReasonCounts: Record<string, number> = {};
    for (const t of tools) {
        for (const c of t.cases) {
            for (const p of c.parameters) {
                totalParameterSlots += 1;
                if (p.status === 'passed') {
                    passedParameterSlots += 1;
                }
                if (p.status === 'skipped') {
                    skippedParameterSlots += 1;
                    const reason = p.reason ?? 'unknown';
                    skippedReasonCounts[reason] = (skippedReasonCounts[reason] ?? 0) + 1;
                }
                if (p.status === 'passed' || p.status === 'failed') {
                    decisiveParameterSlots += 1;
                }
            }
        }
    }
    const parameterPassRate =
        decisiveParameterSlots === 0 ? 1 : passedParameterSlots / decisiveParameterSlots;

    let coveredOptionalSlots = 0;
    let totalOptionalSlots = 0;
    for (const t of tools) {
        const entry = toolMatrix[t.name];
        const n = entry.optionalAll.length;
        totalOptionalSlots += n;
        coveredOptionalSlots += n - t.missingOptionalParameters.length;
    }
    const optionalAllCoverage =
        totalOptionalSlots === 0 ? 1 : coveredOptionalSlots / totalOptionalSlots;

    return {
        caseIdsRun,
        casesPassed,
        casesFailed,
        casePassRate,
        totalTools,
        toolsFullyOptionalComplete,
        toolCoverage,
        totalParameterSlots,
        passedParameterSlots,
        skippedParameterSlots,
        skippedReasonCounts,
        parameterPassRate,
        totalOptionalSlots,
        coveredOptionalSlots,
        optionalAllCoverage,
    };
}

type ParsedRoundtripRow = {
    inputPath: string;
    status: 'passed' | 'failed' | 'skipped';
    reason?: string;
};

const ROUNDTRIP_PARSE_FAILED_REASON = 'roundtrip_parse_failed_no_rows';
const BLOCKED_PREFIX = 'blocked:';

function getBlockedReason(details: string[]): string | null {
    const line = details.find((d) => d.startsWith(BLOCKED_PREFIX));
    if (!line) {
        return null;
    }
    return line.slice(BLOCKED_PREFIX.length).trim() || 'unknown_blocked_reason';
}

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

type BuiltCaseParameters = {
    parameters: ParameterStatusRow[];
    reportPassed: boolean;
};

function buildCaseParameters(caseId: string, result: CaseRunResult): BuiltCaseParameters {
    const blockedReason = getBlockedReason(result.details);
    if (blockedReason) {
        return {
            parameters: [{ name: '__invoke__', status: 'blocked', reason: blockedReason }],
            reportPassed: true,
        };
    }

    const meta = caseMetadata[caseId];
    if (!result.passed) {
        return {
            parameters: [{ name: '__invoke__', status: 'failed' }],
            reportPassed: false,
        };
    }

    if (!meta) {
        return {
            parameters: [{ name: '__invoke__', status: 'passed' }],
            reportPassed: true,
        };
    }

    const roundtripCoverageMap = (
        meta as {
            roundtrip?: { optionalCoverageByInputPath?: Record<string, string> };
        }
    ).roundtrip?.optionalCoverageByInputPath;
    if (roundtripCoverageMap) {
        const rows = parseRoundtripRowsFromDetails(result.details);
        if (rows.length > 0) {
            const parameters = rows.map((row) => ({
                name: row.inputPath,
                status: row.status,
                reason: row.reason,
            }));
            const reportPassed = parameters.every((row) => row.status !== 'failed');
            return { parameters, reportPassed };
        }
        return {
            parameters: [
                {
                    name: '__invoke__',
                    status: 'failed',
                    reason: ROUNDTRIP_PARSE_FAILED_REASON,
                },
            ],
            reportPassed: false,
        };
    }

    if (meta.optionalParamsOnSuccess.length === 0) {
        return {
            parameters: [{ name: '__invoke__', status: 'passed' }],
            reportPassed: true,
        };
    }
    return {
        parameters: meta.optionalParamsOnSuccess.map((name) => ({
            name,
            status: 'passed' as const,
        })),
        reportPassed: true,
    };
}

/**
 * Runs every registered case, applies optional coverage from `caseMetadata` on success,
 * then builds one `ToolReport` per tool in `toolMatrix` (including tools with no cases yet).
 */
export async function runAllCasesAndBuildReport(): Promise<E2EParameterReport> {
    resetOptionalCoverage();

    const casesByTool = new Map<string, CaseReport[]>();
    let passedN = 0;
    let failedN = 0;

    const caseIds = listRegisteredCaseIds();

    for (let i = 0; i < caseIds.length; i += 1) {
        const caseId = caseIds[i];
        if (shouldLogE2EProgress()) {
            console.info(`[e2e-report] running case ${i + 1}/${caseIds.length}: ${caseId}`);
        }
        if (!caseMetadata[caseId]) {
            throw new Error(`Missing caseMetadata entry for case "${caseId}"`);
        }

        let result: CaseRunResult;
        try {
            result = await runOneCase(caseId);
        } catch {
            failedN += 1;
            const meta = caseMetadata[caseId];
            const tool = meta.tool;
            if (!casesByTool.has(tool)) {
                casesByTool.set(tool, []);
            }
            casesByTool.get(tool)!.push({
                id: caseId,
                parameters: [{ name: '__invoke__', status: 'failed' }],
            });
            continue;
        }

        const meta = caseMetadata[caseId];

        const built = buildCaseParameters(caseId, result);
        if (built.reportPassed) {
            passedN += 1;
        } else {
            failedN += 1;
        }

        if (result.passed && !getBlockedReason(result.details)) {
            for (const p of meta.optionalParamsOnSuccess) {
                markOptionalParamCovered(meta.tool, p);
            }
            const roundtripCoverageMap = (
                meta as {
                    roundtrip?: { optionalCoverageByInputPath?: Record<string, string> };
                }
            ).roundtrip?.optionalCoverageByInputPath;
            if (roundtripCoverageMap) {
                const rows = parseRoundtripRowsFromDetails(result.details);
                for (const row of rows) {
                    if (row.status !== 'passed') {
                        continue;
                    }
                    const optionalParam = roundtripCoverageMap[row.inputPath];
                    if (optionalParam) {
                        markOptionalParamCovered(meta.tool, optionalParam);
                    }
                }
            }
        }

        const tool = meta.tool;
        if (!casesByTool.has(tool)) {
            casesByTool.set(tool, []);
        }
        casesByTool.get(tool)!.push({
            id: caseId,
            parameters: built.parameters,
        });
        if (shouldLogE2EProgress()) {
            console.info(
                `[e2e-report] completed ${caseId}: ${built.reportPassed ? 'passed' : 'failed'}`,
            );
        }
    }

    const tools: ToolReport[] = Object.keys(toolMatrix)
        .sort()
        .map((name) => ({
            name,
            cases: casesByTool.get(name) ?? [],
            missingOptionalParameters: getMissingOptionalForTool(name),
        }));

    const summary = computeCoverageSummary(tools, passedN, failedN);

    return {
        tools,
        summary,
    };
}
