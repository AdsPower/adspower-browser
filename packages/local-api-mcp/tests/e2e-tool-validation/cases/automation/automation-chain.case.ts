import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { uniqueLabel } from '../../fixtures/resourceFactory.js';
import { runCase } from '../../runner/caseRunner.js';
import { createMcpClient } from '../../runner/mcpClient.js';
import { getToolTextContent } from '../../runner/toolResultText.js';
import type { CaseRunResult, McpTestClient } from '../../types.js';

type AutomationChainCtx = {
    client: McpTestClient;
    profileId: string;
    wsUrl: string;
};

const FAIL_CLOSED_KEYWORDS = [
    'failed',
    'error',
    'timeout',
    'exception',
    'not found',
    'cannot',
    'denied',
];

function parseProfileIdFromCreateText(text: string): string | null {
    const m = text.match(/profile_id:\s*([^\s\n]+)/i);
    return m?.[1] ?? null;
}

function extractWsUrl(text: string): string | null {
    const wsField = text.match(/ws\.puppeteer["']?\s*[:=]\s*["'](wss?:\/\/[^"'\s]+)["']/i);
    if (wsField?.[1]) {
        return wsField[1];
    }
    const generic = text.match(/wss?:\/\/[^\s"'\\]+/i);
    return generic?.[0] ?? null;
}

function summarize(text: string, max = 240): string {
    const compact = text.replace(/\s+/g, ' ').trim();
    return compact.length <= max ? compact : `${compact.slice(0, max)}...`;
}

function hasFailClosedKeyword(text: string): boolean {
    const lower = text.toLowerCase();
    return FAIL_CLOSED_KEYWORDS.some((kw) => lower.includes(kw));
}

function isBrowserNotConnectedText(text: string): boolean {
    return text.toLowerCase().includes('browser not connected');
}

async function sleep(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
}

async function runAutomationChainWithRetry(client: McpTestClient, wsUrl: string): Promise<CallToolResult> {
    const maxAttempts = 3;
    let lastVisibleRes: CallToolResult | null = null;
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        await client.callTool('connect-browser-with-ws', { wsUrl });
        // WS connection can be accepted before internal page context is fully ready.
        await sleep(250);
        await client.callTool('open-new-page', {});
        await client.callTool('navigate', { url: 'https://example.com' });
        const visibleRes = (await client.callTool('get-page-visible-text', {})) as CallToolResult;
        lastVisibleRes = visibleRes;
        const visibleText = getToolTextContent(visibleRes);
        if (!isBrowserNotConnectedText(visibleText)) {
            return visibleRes;
        }
        if (attempt < maxAttempts) {
            await sleep(400);
        }
    }
    return lastVisibleRes as CallToolResult;
}

function isStrictAutomationVisibleTextPass(visibleText: string): boolean {
    if (hasFailClosedKeyword(visibleText)) {
        return false;
    }
    const lower = visibleText.toLowerCase();
    const exampleDomainNarrative =
        lower.includes('example domain') &&
        (lower.includes('illustrative examples') || lower.includes('documentation examples'));
    const urlAndTitleSignal =
        /(https?:\/\/(www\.)?example\.com)/i.test(visibleText) &&
        /(title["']?\s*[:=]\s*["']?example domain|example domain)/i.test(visibleText);
    return exampleDomainNarrative || urlAndTitleSignal;
}

export async function caseAutomationChainBasic(): Promise<CaseRunResult> {
    const client = await createMcpClient();
    const ctx: AutomationChainCtx = {
        client,
        profileId: '',
        wsUrl: '',
    };

    return runCase({
        name: 'automation.chain.basic',
        prepare: async () => ctx as unknown as Record<string, unknown>,
        invoke: async (c) => {
            const x = c as unknown as AutomationChainCtx;
            const createRes = await x.client.callTool('create-browser', {
                group_id: '0',
                name: uniqueLabel('automation-chain'),
            });
            const createText = getToolTextContent(createRes as CallToolResult);
            const profileId = parseProfileIdFromCreateText(createText);
            if (!profileId) {
                throw new Error(`profile_id missing after create-browser: ${createText.slice(0, 500)}`);
            }
            x.profileId = profileId;

            const openRes = await x.client.callTool('open-browser', {
                profile_id: x.profileId,
                headless: '1',
            });
            const openText = getToolTextContent(openRes as CallToolResult);
            const wsUrl = extractWsUrl(openText);
            if (!wsUrl) {
                throw new Error(`ws url missing after open-browser: ${openText.slice(0, 500)}`);
            }
            x.wsUrl = wsUrl;

            return runAutomationChainWithRetry(x.client, x.wsUrl);
        },
        assertState: async (invokeRes, c) => {
            const x = c as unknown as AutomationChainCtx;
            const visibleText = getToolTextContent(invokeRes as CallToolResult);
            const passed = isStrictAutomationVisibleTextPass(visibleText);
            return {
                passed,
                details: passed
                    ? [
                          `profile_id=${x.profileId}`,
                          'chain=connect-browser-with-ws>open-new-page>navigate>get-page-visible-text',
                          `ws_url=${x.wsUrl}`,
                          `visible_text=${summarize(visibleText)}`,
                      ]
                    : [
                          `profile_id=${x.profileId}`,
                          `ws_url=${x.wsUrl || 'missing'}`,
                          'visible_text_assertion_failed',
                          summarize(visibleText, 600),
                      ],
            };
        },
        cleanup: async (c) => {
            const x = c as unknown as AutomationChainCtx;
            try {
                if (x.profileId) {
                    await x.client.callTool('close-browser', { profile_id: x.profileId });
                    await x.client.callTool('delete-browser', { profile_id: [x.profileId] });
                }
            } finally {
                await x.client.close();
            }
        },
    });
}

export const automationChainCases: Record<string, () => Promise<CaseRunResult>> = {
    'automation.chain.basic': caseAutomationChainBasic,
};

export const __automationChainInternals = {
    isStrictAutomationVisibleTextPass,
};
