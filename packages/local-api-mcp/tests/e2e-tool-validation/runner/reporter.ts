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

export type E2EParameterReport = {
    tools: ToolReport[];
    summary: {
        caseIdsRun: number;
        casesPassed: number;
        casesFailed: number;
    };
};

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

    return {
        tools,
        summary: {
            caseIdsRun: caseIds.length,
            casesPassed: passedN,
            casesFailed: failedN,
        },
    };
}
