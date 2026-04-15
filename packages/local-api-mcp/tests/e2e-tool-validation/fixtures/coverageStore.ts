import { toolMatrix } from '../config/toolMatrix.js';

const optionalCoveredByTool = new Map<string, Set<string>>();

export function resetOptionalCoverage(): void {
    optionalCoveredByTool.clear();
}

export function markOptionalParamCovered(tool: string, param: string): void {
    if (!optionalCoveredByTool.has(tool)) {
        optionalCoveredByTool.set(tool, new Set());
    }
    optionalCoveredByTool.get(tool)!.add(param);
}

export function getParameterCoverage(tool: string): {
    optionalAll: string[];
    passedOptionalParams: string[];
} {
    const entry = toolMatrix[tool];
    if (!entry) {
        throw new Error(`Unknown tool in matrix: ${tool}`);
    }
    return {
        optionalAll: [...entry.optionalAll],
        passedOptionalParams: [...(optionalCoveredByTool.get(tool) ?? [])],
    };
}
