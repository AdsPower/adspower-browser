import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { runCase } from '../../runner/caseRunner.js';
import { createMcpClient } from '../../runner/mcpClient.js';
import { getToolTextContent } from '../../runner/toolResultText.js';
import type { CaseRunResult } from '../../types.js';
import type { McpTestClient } from '../../types.js';

type Ctx = { client: McpTestClient };

export async function casePatchUpdateStable(): Promise<CaseRunResult> {
    const client = await createMcpClient();

    return runCase({
        name: 'patch.update.stable',
        prepare: async () => ({ client } as unknown as Record<string, unknown>),
        invoke: async (ctx) => {
            const c = (ctx as unknown as Ctx).client;
            return c.callTool('update-patch', { version_type: 'stable' });
        },
        assertState: async (invokeRes) => {
            const text = getToolTextContent(invokeRes as CallToolResult);
            const lower = text.toLowerCase();
            const passed =
                !lower.includes('failed to update') &&
                (lower.includes('success') || lower.includes('update') || lower.includes('patch'));
            return {
                passed,
                details: passed ? ['version_type=stable'] : [text.slice(0, 500)],
            };
        },
        cleanup: async (ctx) => {
            await (ctx as unknown as Ctx).client.close();
        },
    });
}

export const patchCases: Record<string, () => Promise<CaseRunResult>> = {
    'patch.update.stable': casePatchUpdateStable,
};
