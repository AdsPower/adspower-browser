import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { runCase } from '../../runner/caseRunner.js';
import { createMcpClient } from '../../runner/mcpClient.js';
import { getToolTextContent } from '../../runner/toolResultText.js';
import type { CaseRunResult } from '../../types.js';
import type { McpTestClient } from '../../types.js';

type Ctx = { client: McpTestClient };

function okStatusText(text: string): boolean {
    const lower = text.toLowerCase();
    return !lower.includes('failed') && text.length > 0;
}

export async function caseGetOpenedBrowser(): Promise<CaseRunResult> {
    const client = await createMcpClient();

    return runCase({
        name: 'automation.getOpened',
        prepare: async () => ({ client } as unknown as Record<string, unknown>),
        invoke: async (ctx) => {
            const c = (ctx as unknown as Ctx).client;
            return c.callTool('get-opened-browser', {});
        },
        assertState: async (invokeRes) => {
            const text = getToolTextContent(invokeRes as CallToolResult);
            return {
                passed: okStatusText(text),
                details: [text.slice(0, 300)],
            };
        },
        cleanup: async (ctx) => {
            await (ctx as unknown as Ctx).client.close();
        },
    });
}

export async function caseCheckStatus(): Promise<CaseRunResult> {
    const client = await createMcpClient();

    return runCase({
        name: 'automation.checkStatus',
        prepare: async () => ({ client } as unknown as Record<string, unknown>),
        invoke: async (ctx) => {
            const c = (ctx as unknown as Ctx).client;
            return c.callTool('check-status', {});
        },
        assertState: async (invokeRes) => {
            const text = getToolTextContent(invokeRes as CallToolResult);
            return {
                passed: okStatusText(text),
                details: [text.slice(0, 300)],
            };
        },
        cleanup: async (ctx) => {
            await (ctx as unknown as Ctx).client.close();
        },
    });
}

export const automationCases: Record<string, () => Promise<CaseRunResult>> = {
    'automation.getOpened': caseGetOpenedBrowser,
    'automation.checkStatus': caseCheckStatus,
};
