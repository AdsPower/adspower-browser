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
    status: 'passed' | 'failed' | 'blocked';
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
    /** Share of `parameters[]` rows with `status === "passed"`. */
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
    let totalParameterSlots = 0;
    for (const t of tools) {
        for (const c of t.cases) {
            for (const p of c.parameters) {
                totalParameterSlots += 1;
                if (p.status === 'passed') {
                    passedParameterSlots += 1;
                }
            }
        }
    }
    const parameterPassRate =
        totalParameterSlots === 0 ? 1 : passedParameterSlots / totalParameterSlots;

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
        parameterPassRate,
        totalOptionalSlots,
        coveredOptionalSlots,
        optionalAllCoverage,
    };
}

function buildCaseParameters(caseId: string, passed: boolean): ParameterStatusRow[] {
    const meta = caseMetadata[caseId];
    if (!passed) {
        return [{ name: '__invoke__', status: 'failed' }];
    }
    if (!meta) {
        return [{ name: '__invoke__', status: 'passed' }];
    }
    if (meta.optionalParamsOnSuccess.length === 0) {
        return [{ name: '__invoke__', status: 'passed' }];
    }
    return meta.optionalParamsOnSuccess.map((name) => ({
        name,
        status: 'passed' as const,
    }));
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

    for (const caseId of caseIds) {
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

        if (result.passed) {
            passedN += 1;
            for (const p of meta.optionalParamsOnSuccess) {
                markOptionalParamCovered(meta.tool, p);
            }
        } else {
            failedN += 1;
        }

        const tool = meta.tool;
        if (!casesByTool.has(tool)) {
            casesByTool.set(tool, []);
        }
        casesByTool.get(tool)!.push({
            id: caseId,
            parameters: buildCaseParameters(caseId, result.passed),
        });
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
