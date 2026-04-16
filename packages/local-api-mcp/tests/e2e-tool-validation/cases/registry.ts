import { applicationCases } from './application/application-list.case.js';
import { automationCases } from './automation/automation.case.js';
import { automationChainCases } from './automation/automation-chain.case.js';
import { browserCases } from './browser/open-browser.case.js';
import { browserLifecycleCases } from './browser/browser-lifecycle.case.js';
import { browserRoundtripCases } from './browser/browser-roundtrip.case.js';
import { groupCases } from './group/group-lifecycle.case.js';
import { highImpactCases } from './highimpact/highimpact-tools.case.js';
import { kernelCases } from './kernel/kernel.case.js';
import { patchCases } from './patch/patch.case.js';
import { proxyCases } from './proxy/proxy-lifecycle.case.js';
import { queryCases } from './query/query-matrix.case.js';
import { tagCases } from './tag/tag-lifecycle.case.js';
import type { CaseRunResult } from '../types.js';

export type { CaseRunResult };

const caseRegistry: Record<string, () => Promise<CaseRunResult>> = {
    ...groupCases,
    ...proxyCases,
    ...browserCases,
    ...browserLifecycleCases,
    ...browserRoundtripCases,
    ...applicationCases,
    ...tagCases,
    ...kernelCases,
    ...highImpactCases,
    ...patchCases,
    ...automationCases,
    ...automationChainCases,
    ...queryCases,
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
