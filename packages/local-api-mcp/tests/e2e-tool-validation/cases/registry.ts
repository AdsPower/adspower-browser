import { browserCases } from './browser/open-browser.case.js';
import { groupCases } from './group/group-lifecycle.case.js';
import { proxyCases } from './proxy/proxy-lifecycle.case.js';

export type CaseRunResult = { passed: boolean; details: string[] };

const caseRegistry: Record<string, () => Promise<CaseRunResult>> = {
    ...groupCases,
    ...proxyCases,
    ...browserCases,
};

export async function runOneCase(caseId: string): Promise<CaseRunResult> {
    const run = caseRegistry[caseId];
    if (!run) {
        throw new Error(`Unknown case: ${caseId}`);
    }
    return run();
}

export function listRegisteredCaseIds(): string[] {
    return Object.keys(caseRegistry).sort();
}
