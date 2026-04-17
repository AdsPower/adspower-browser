import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { compareInputAgainstReadbackB, type CompareBRow } from '../../assertions/roundtrip/compareB.js';
import { extractJsonPayloadFromToolText } from '../../assertions/roundtrip/jsonExtractors.js';
import { uniqueLabel } from '../../fixtures/resourceFactory.js';
import { runCase } from '../../runner/caseRunner.js';
import { createMcpClient } from '../../runner/mcpClient.js';
import { getToolTextContent } from '../../runner/toolResultText.js';
import type { McpTestClient } from '../../types.js';

type ProxyCtx = {
    client: McpTestClient;
    proxyId: string | null;
    updated?: Record<string, unknown>;
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

function maybeObject(v: unknown): v is Record<string, unknown> {
    return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function findProxyById(payload: unknown, proxyId: string): Record<string, unknown> | null {
    if (Array.isArray(payload)) {
        for (const item of payload) {
            const found = findProxyById(item, proxyId);
            if (found) {
                return found;
            }
        }
        return null;
    }
    if (!maybeObject(payload)) {
        return null;
    }
    if (String(payload.proxy_id ?? payload.id ?? '') === proxyId) {
        return payload;
    }
    for (const child of Object.values(payload)) {
        const found = findProxyById(child, proxyId);
        if (found) {
            return found;
        }
    }
    return null;
}

async function getProxyRecordById(
    client: McpTestClient,
    proxyId: string,
): Promise<{ record: Record<string, unknown> | null; rawText: string }> {
    const listRes = await client.callTool('get-proxy-list', { proxy_id: [proxyId], page: 1, limit: 200 });
    const rawText = getToolTextContent(listRes);
    const payload = extractJsonPayloadFromToolText(rawText);
    return {
        record: findProxyById(payload, proxyId),
        rawText,
    };
}

function formatCompareRows(rows: CompareBRow[]): string[] {
    return rows.map((r) => `${r.inputPath}->${r.actualPath}:${r.status}${r.reason ? `(${r.reason})` : ''}`);
}

function summarizeToolText(text: string, max = 600): string {
    const compact = text.replace(/\s+/g, ' ').trim();
    return compact.length <= max ? compact : `${compact.slice(0, max)}...`;
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
    'proxy.create.roundtrip.full-optional-subset': caseProxyCreateRoundtripFullOptionalSubset,
    'proxy.update.roundtrip.full-optional-subset': caseProxyUpdateRoundtripFullOptionalSubset,
    'proxy.delete.visibility': caseProxyDeleteVisibility,
};

export async function caseProxyCreateRoundtripFullOptionalSubset(): Promise<{
    passed: boolean;
    details: string[];
}> {
    const client = await createMcpClient();
    const host = '127.0.0.1';
    const port = String(64000 + Math.floor(Math.random() * 500));
    const remark = uniqueLabel('proxy-create-remark');
    const created = {
        type: 'http',
        host,
        port,
        user: uniqueLabel('proxy-create-user'),
        password: uniqueLabel('proxy-create-pass'),
        proxy_url: `https://refresh.example.com/${uniqueLabel('proxy-create-refresh')}`,
        remark,
        ipchecker: 'ipapi',
    };
    const ctx: ProxyCtx = { client, proxyId: null, host, port };

    return runCase({
        name: 'proxy.create.roundtrip.full-optional-subset',
        prepare: async () => ctx as unknown as Record<string, unknown>,
        invoke: async (c) => {
            const x = c as unknown as ProxyCtx;
            return x.client.callTool('create-proxy', { proxies: [created] });
        },
        assertState: async (invokeRes, c) => {
            const x = c as unknown as ProxyCtx;
            const createText = getToolTextContent(invokeRes as CallToolResult);
            x.proxyId = extractProxyIdFromCreateText(createText);
            if (!x.proxyId) {
                const listRes = await x.client.callTool('get-proxy-list', { page: 1, limit: 200 });
                x.proxyId = extractProxyIdFromListText(getToolTextContent(listRes), host, port);
            }
            if (!x.proxyId) {
                return { passed: false, details: ['proxy_id_missing_after_create', createText.slice(0, 600)] };
            }
            const list = await getProxyRecordById(x.client, x.proxyId);
            if (!list.record) {
                return {
                    passed: false,
                    details: [`proxy_id=${x.proxyId}`, 'record_missing_after_create', list.rawText.slice(0, 800)],
                };
            }
            const compare = compareInputAgainstReadbackB(created, list.record);
            const requiredRows = ['type', 'host', 'port', 'user', 'password', 'proxy_url', 'remark', 'ipchecker']
                .map((k) => compare.rows.find((r) => r.inputPath === k));
            const passed = compare.failed === 0 && requiredRows.every((r) => r?.status === 'passed');
            return {
                passed,
                details: [
                    `proxy_id=${x.proxyId}`,
                    `compareB: passed=${compare.passed} failed=${compare.failed} skipped=${compare.skipped}`,
                    ...formatCompareRows(compare.rows),
                ],
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

export async function caseProxyUpdateRoundtripFullOptionalSubset(): Promise<{
    passed: boolean;
    details: string[];
}> {
    const client = await createMcpClient();
    const createHost = '127.0.0.1';
    const createPort = String(64500 + Math.floor(Math.random() * 400));
    const ctx: ProxyCtx = { client, proxyId: null, host: createHost, port: createPort };

    return runCase({
        name: 'proxy.update.roundtrip.full-optional-subset',
        prepare: async () => ctx as unknown as Record<string, unknown>,
        invoke: async (c) => {
            const x = c as unknown as ProxyCtx;
            const createText = getToolTextContent(
                (await x.client.callTool('create-proxy', {
                    proxies: [{ type: 'http', host: x.host, port: x.port, remark: uniqueLabel('proxy-before') }],
                })) as CallToolResult,
            );
            x.proxyId = extractProxyIdFromCreateText(createText);
            if (!x.proxyId) {
                const listRes = await x.client.callTool('get-proxy-list', { page: 1, limit: 200 });
                x.proxyId = extractProxyIdFromListText(getToolTextContent(listRes), x.host, x.port);
            }
            if (!x.proxyId) {
                throw new Error(`proxy_id missing for update host=${x.host} port=${x.port}`);
            }
            x.updated = {
                proxy_id: x.proxyId,
                type: 'https',
                host: '127.0.0.2',
                port: String(65000 + Math.floor(Math.random() * 300)),
                user: uniqueLabel('proxy-update-user'),
                password: uniqueLabel('proxy-update-pass'),
                proxy_url: `https://refresh.example.com/${uniqueLabel('proxy-update-refresh')}`,
                remark: uniqueLabel('proxy-after'),
                ipchecker: 'ipfoxy',
            };
            return x.client.callTool('update-proxy', x.updated);
        },
        assertState: async (_res, c) => {
            const x = c as unknown as ProxyCtx;
            const list = await getProxyRecordById(x.client, x.proxyId ?? '');
            if (!list.record) {
                return {
                    passed: false,
                    details: [`proxy_id=${x.proxyId ?? 'unknown'}`, 'record_missing_after_update', list.rawText.slice(0, 800)],
                };
            }
            const expected = Object.fromEntries(
                Object.entries(x.updated ?? {}).filter(([k]) => k !== 'proxy_id'),
            );
            const compare = compareInputAgainstReadbackB(expected, list.record);
            const requiredRows = ['type', 'host', 'port', 'user', 'password', 'proxy_url', 'remark', 'ipchecker']
                .map((k) => compare.rows.find((r) => r.inputPath === k));
            const passed = compare.failed === 0 && requiredRows.every((r) => r?.status === 'passed');
            return {
                passed,
                details: [
                    `proxy_id=${x.proxyId ?? 'unknown'}`,
                    `compareB: passed=${compare.passed} failed=${compare.failed} skipped=${compare.skipped}`,
                    ...formatCompareRows(compare.rows),
                ],
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

export async function caseProxyDeleteVisibility(): Promise<{ passed: boolean; details: string[] }> {
    const client = await createMcpClient();
    const host = '127.0.0.1';
    const port = String(65500 + Math.floor(Math.random() * 30));
    const ctx: ProxyCtx = { client, proxyId: null, host, port };

    return runCase({
        name: 'proxy.delete.visibility',
        prepare: async () => ctx as unknown as Record<string, unknown>,
        invoke: async (c) => {
            const x = c as unknown as ProxyCtx;
            const createText = getToolTextContent(
                (await x.client.callTool('create-proxy', {
                    proxies: [{ type: 'http', host: x.host, port: x.port, remark: uniqueLabel('proxy-delete') }],
                })) as CallToolResult,
            );
            x.proxyId = extractProxyIdFromCreateText(createText);
            if (!x.proxyId) {
                const listRes = await x.client.callTool('get-proxy-list', { page: 1, limit: 200 });
                x.proxyId = extractProxyIdFromListText(getToolTextContent(listRes), x.host, x.port);
            }
            if (!x.proxyId) {
                throw new Error(`proxy_id missing for delete host=${x.host} port=${x.port}`);
            }
            return x.client.callTool('delete-proxy', { proxy_id: [x.proxyId] });
        },
        assertState: async (_res, c) => {
            const x = c as unknown as ProxyCtx;
            const totalTimeoutMs = 8_000;
            const backoffScheduleMs = [250, 400, 700, 1_000, 1_400, 1_800, 2_000];
            const startedAt = Date.now();
            let attempts = 0;
            let list = await getProxyRecordById(x.client, x.proxyId ?? '');
            let invisible = !list.record;
            while (!invisible && Date.now() - startedAt < totalTimeoutMs) {
                const delay = backoffScheduleMs[Math.min(attempts, backoffScheduleMs.length - 1)];
                await new Promise((resolve) => setTimeout(resolve, delay));
                list = await getProxyRecordById(x.client, x.proxyId ?? '');
                invisible = !list.record;
                attempts += 1;
            }
            return {
                passed: invisible,
                details: invisible
                    ? [`proxy_id=${x.proxyId ?? 'unknown'}`, 'not_found_after_delete']
                    : [
                          `proxy_id=${x.proxyId ?? 'unknown'}`,
                          `wait_timeout_ms=${totalTimeoutMs}`,
                          `poll_attempts=${attempts}`,
                          'still_visible_after_delete',
                          `last_response_summary=${summarizeToolText(list.rawText)}`,
                      ],
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
