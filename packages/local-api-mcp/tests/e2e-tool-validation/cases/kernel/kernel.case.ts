import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { runCase } from '../../runner/caseRunner.js';
import { createMcpClient } from '../../runner/mcpClient.js';
import { getToolTextContent } from '../../runner/toolResultText.js';
import type { CaseRunResult } from '../../types.js';
import type { McpTestClient } from '../../types.js';

type Ctx = { client: McpTestClient };

export async function caseKernelListChrome(): Promise<CaseRunResult> {
    const client = await createMcpClient();

    return runCase({
        name: 'kernel.list.chrome',
        prepare: async () => ({ client } as unknown as Record<string, unknown>),
        invoke: async (ctx) => {
            const c = (ctx as unknown as Ctx).client;
            return c.callTool('get-kernel-list', { kernel_type: 'Chrome' });
        },
        assertState: async (invokeRes) => {
            const text = getToolTextContent(invokeRes as CallToolResult);
            const passed =
                !text.toLowerCase().includes('failed to get') && text.length > 0;
            return {
                passed,
                details: passed ? ['kernel_type=Chrome'] : [text.slice(0, 400)],
            };
        },
        cleanup: async (ctx) => {
            await (ctx as unknown as Ctx).client.close();
        },
    });
}

export const kernelCases: Record<string, () => Promise<CaseRunResult>> = {
    'kernel.list.chrome': caseKernelListChrome,
};
