import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { runCase } from '../../runner/caseRunner.js';
import { createMcpClient } from '../../runner/mcpClient.js';
import { getToolTextContent } from '../../runner/toolResultText.js';
import type { CaseRunResult } from '../../types.js';
import type { McpTestClient } from '../../types.js';

type Ctx = { client: McpTestClient };

function looksSuccessfulTagList(text: string): boolean {
    const lower = text.toLowerCase();
    return !lower.includes('failed to get') && text.length > 0;
}

export async function caseTagListQuery(): Promise<CaseRunResult> {
    const client = await createMcpClient();

    return runCase({
        name: 'tag.list.query',
        prepare: async () => ({ client } as unknown as Record<string, unknown>),
        invoke: async (ctx) => {
            const c = (ctx as unknown as Ctx).client;
            return c.callTool('get-tag-list', {
                ids: [],
                page: 1,
                limit: 30,
            });
        },
        assertState: async (invokeRes) => {
            const text = getToolTextContent(invokeRes as CallToolResult);
            const passed = looksSuccessfulTagList(text);
            return {
                passed,
                details: passed ? ['ids,page,limit'] : [text.slice(0, 500)],
            };
        },
        cleanup: async (ctx) => {
            await (ctx as unknown as Ctx).client.close();
        },
    });
}

export const tagCases: Record<string, () => Promise<CaseRunResult>> = {
    'tag.list.query': caseTagListQuery,
};
