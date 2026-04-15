import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { uniqueLabel } from '../../fixtures/resourceFactory.js';
import { runCase } from '../../runner/caseRunner.js';
import { createMcpClient } from '../../runner/mcpClient.js';
import { getToolTextContent } from '../../runner/toolResultText.js';
import type { McpTestClient } from '../../types.js';

type ProxyCtx = {
    client: McpTestClient;
    proxyId: string | null;
    host: string;
    port: string;
};

function extractProxyIdFromCreateText(text: string): string | null {
    const m = text.match(/proxy_id:\s*([^\s\n]+)/i);
    return m?.[1] ?? null;
}

function extractProxyIdFromListText(listText: string, host: string, port: string): string | null {
    if (!listText.includes(host) || !listText.includes(port)) {
        return null;
    }
    const bracket = listText.indexOf('[');
    const lastBracket = listText.lastIndexOf(']');
    if (bracket === -1 || lastBracket <= bracket) {
        return null;
    }
    try {
        const arr = JSON.parse(listText.slice(bracket, lastBracket + 1)) as Array<Record<string, unknown>>;
        const hit = arr.find((p) => String(p.host) === host && String(p.port) === port);
        if (hit?.proxy_id != null) {
            return String(hit.proxy_id);
        }
        if (hit?.id != null) {
            return String(hit.id);
        }
        return null;
    } catch {
        return null;
    }
}

/** Create one HTTP proxy, assert it appears in list, delete in cleanup. */
export async function caseProxyCreateListDelete(): Promise<{ passed: boolean; details: string[] }> {
    const client = await createMcpClient();
    const host = '127.0.0.1';
    const port = String(63000 + Math.floor(Math.random() * 500));
    const remark = uniqueLabel('proxy-remark');

    const ctx: ProxyCtx = { client, proxyId: null, host, port };

    return runCase({
        name: 'proxy.create.list.delete',
        prepare: async () => ctx as unknown as Record<string, unknown>,
        invoke: async (c) => {
            const x = c as unknown as ProxyCtx;
            return x.client.callTool('create-proxy', {
                proxies: [
                    {
                        type: 'http',
                        host: x.host,
                        port: x.port,
                        remark,
                    },
                ],
            });
        },
        assertState: async (invokeRes, c) => {
            const x = c as unknown as ProxyCtx;
            const createText = getToolTextContent(invokeRes as CallToolResult);
            x.proxyId = extractProxyIdFromCreateText(createText);

            const listRes = await x.client.callTool('get-proxy-list', { page: 1, limit: 200 });
            const listText = getToolTextContent(listRes);
            if (!x.proxyId) {
                x.proxyId = extractProxyIdFromListText(listText, x.host, x.port);
            }

            const seen = listText.includes(x.host) && listText.includes(x.port);
            const ok = seen && !!x.proxyId;
            return {
                passed: ok,
                details: ok
                    ? [`proxy_id=${x.proxyId}`, `host=${x.host}`, `port=${x.port}`]
                    : [createText.slice(0, 400), listText.slice(0, 600)],
            };
        },
        cleanup: async (c) => {
            const x = c as unknown as ProxyCtx;
            try {
                if (x.proxyId) {
                    await x.client.callTool('delete-proxy', { proxy_id: [x.proxyId] });
                }
            } finally {
                await x.client.close();
            }
        },
    });
}

export const proxyCases = {
    'proxy.create.list.delete': caseProxyCreateListDelete,
};
