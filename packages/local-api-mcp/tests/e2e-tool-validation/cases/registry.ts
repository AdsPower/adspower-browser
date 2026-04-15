import { applicationCases } from './application/application-list.case.js';
import { automationCases } from './automation/automation.case.js';
import { browserCases } from './browser/open-browser.case.js';
import { groupCases } from './group/group-lifecycle.case.js';
import { kernelCases } from './kernel/kernel.case.js';
import { patchCases } from './patch/patch.case.js';
import { proxyCases } from './proxy/proxy-lifecycle.case.js';
import { tagCases } from './tag/tag-lifecycle.case.js';
import type { CaseRunResult } from '../types.js';

export type { CaseRunResult };

const caseRegistry: Record<string, () => Promise<CaseRunResult>> = {
    ...groupCases,
    ...proxyCases,
    ...browserCases,
    ...applicationCases,
    ...tagCases,
    ...kernelCases,
    ...patchCases,
    ...automationCases,
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
