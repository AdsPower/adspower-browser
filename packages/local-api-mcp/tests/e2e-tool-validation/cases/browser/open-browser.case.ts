import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { uniqueLabel } from '../../fixtures/resourceFactory.js';
import { runCase } from '../../runner/caseRunner.js';
import { createMcpClient } from '../../runner/mcpClient.js';
import { getToolTextContent } from '../../runner/toolResultText.js';
import type { McpTestClient } from '../../types.js';

type BrowserCtx = {
    client: McpTestClient;
    profileId: string;
};

/** Create profile (Ungrouped), open headless, then close + delete. */
export async function caseBrowserOpenHeadless(): Promise<{ passed: boolean; details: string[] }> {
    const client = await createMcpClient();

    return runCase({
        name: 'browser.open.headless',
        prepare: async () =>
            ({
                client,
                profileId: '',
            }) as unknown as Record<string, unknown>,
        invoke: async (ctx) => {
            const c = ctx as unknown as BrowserCtx;
            const createRes = await c.client.callTool('create-browser', {
                group_id: '0',
                name: uniqueLabel('profile'),
            });
            const createText = getToolTextContent(createRes as CallToolResult);
            const m = createText.match(/profile_id:\s*([^\s\n]+)/i);
            if (!m?.[1]) {
                throw new Error(`Could not parse profile_id from create-browser: ${createText.slice(0, 500)}`);
            }
            c.profileId = m[1];
            return c.client.callTool('open-browser', {
                profile_id: c.profileId,
                headless: '1',
            });
        },
        assertState: async (openRes, ctx) => {
            const c = ctx as unknown as BrowserCtx;
            const t = getToolTextContent(openRes as CallToolResult);
            const ok =
                /open(ed)?/i.test(t) ||
                /ws/i.test(t) ||
                t.toLowerCase().includes('success');
            return {
                passed: ok,
                details: [`profile_id=${c.profileId}`, t.slice(0, 400)],
            };
        },
        cleanup: async (ctx) => {
            const c = ctx as unknown as BrowserCtx;
            try {
                if (c.profileId) {
                    await c.client.callTool('close-browser', { profile_id: c.profileId });
                    await c.client.callTool('delete-browser', { profile_id: [c.profileId] });
                }
            } finally {
                await c.client.close();
            }
        },
    });
}

export const browserCases = {
    'browser.open.headless': caseBrowserOpenHeadless,
};
