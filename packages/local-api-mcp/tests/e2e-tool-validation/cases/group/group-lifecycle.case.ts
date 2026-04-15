import { markOptionalParamCovered } from '../../fixtures/coverageStore.js';
import { uniqueLabel } from '../../fixtures/resourceFactory.js';
import { runCase } from '../../runner/caseRunner.js';
import { createMcpClient } from '../../runner/mcpClient.js';
import { getToolTextContent } from '../../runner/toolResultText.js';
import type { McpTestClient } from '../../types.js';

type GroupCtx = {
    client: McpTestClient;
    groupName: string;
    remark?: string;
};

async function runCreateGroupCase(
    caseId: string,
    payload: { group_name: string; remark?: string },
    trackRemark: boolean,
): Promise<{ passed: boolean; details: string[] }> {
    const client = await createMcpClient();
    const ctx: GroupCtx = {
        client,
        groupName: payload.group_name,
        remark: payload.remark,
    };

    return runCase({
        name: caseId,
        prepare: async () => ctx as unknown as Record<string, unknown>,
        invoke: async (c) => {
            const x = c as unknown as GroupCtx;
            return x.client.callTool('create-group', payload);
        },
        assertState: async (_invoke, c) => {
            const x = c as unknown as GroupCtx;
            const list = await x.client.callTool('get-group-list', {
                group_name: x.groupName,
                page_size: 100,
            });
            const text = getToolTextContent(list);
            const ok = text.includes(x.groupName);
            if (ok && trackRemark && payload.remark !== undefined) {
                markOptionalParamCovered('create-group', 'remark');
            }
            return {
                passed: ok,
                details: ok
                    ? [`group_name=${x.groupName}`, payload.remark ? `remark=${payload.remark}` : '']
                          .filter(Boolean)
                    : [`group_name=${x.groupName}`, text.slice(0, 800)],
            };
        },
        cleanup: async (c) => {
            const x = c as unknown as GroupCtx;
            await x.client.close();
        },
    });
}

export async function caseGroupCreateBasic(): Promise<{ passed: boolean; details: string[] }> {
    const groupName = uniqueLabel('group');
    return runCreateGroupCase('group.create.basic', { group_name: groupName }, false);
}

export async function caseGroupCreateWithRemark(): Promise<{ passed: boolean; details: string[] }> {
    const groupName = uniqueLabel('group');
    return runCreateGroupCase(
        'group.create.withRemark',
        { group_name: groupName, remark: 'e2e-remark' },
        true,
    );
}

export const groupCases = {
    'group.create.basic': caseGroupCreateBasic,
    'group.create.withRemark': caseGroupCreateWithRemark,
};
