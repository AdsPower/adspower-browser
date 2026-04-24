import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { runCase } from '../../runner/caseRunner.js';
import { createMcpClient } from '../../runner/mcpClient.js';
import { getToolTextContent } from '../../runner/toolResultText.js';
import type { CaseRunResult } from '../../types.js';
import type { McpTestClient } from '../../types.js';
import { extractJsonPayloadFromToolText } from '../../assertions/roundtrip/jsonExtractors.js';

type QueryCtx = { client: McpTestClient };

function toFailureToken(text: string): boolean {
    const normalized = text.toLowerCase();
    return (
        normalized.includes('failed')
        || normalized.includes('error')
        || normalized.includes('exception')
        || normalized.includes('invalid')
    );
}

function isStructuredPayload(payload: unknown): boolean {
    return Array.isArray(payload) || maybeObject(payload);
}

function basePass(text: string): boolean {
    if (text.length === 0 || toFailureToken(text)) {
        return false;
    }
    try {
        const payload = extractJsonPayloadFromToolText(text);
        return isStructuredPayload(payload);
    } catch {
        return false;
    }
}

function maybeObject(v: unknown): v is Record<string, unknown> {
    return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function collectObjects(payload: unknown): Record<string, unknown>[] {
    const out: Record<string, unknown>[] = [];
    const visit = (node: unknown): void => {
        if (Array.isArray(node)) {
            for (const child of node) {
                visit(child);
            }
            return;
        }
        if (!maybeObject(node)) {
            return;
        }
        out.push(node);
        for (const child of Object.values(node)) {
            visit(child);
        }
    };
    visit(payload);
    return out;
}

function findFirstByKeys(
    payload: unknown,
    requiredKeys: string[],
): Record<string, unknown> | null {
    return collectObjects(payload).find((row) =>
        requiredKeys.every((k) => row[k] != null && String(row[k]).length > 0),
    ) ?? null;
}

function blocked(reason: string): CaseRunResult {
    return {
        passed: true,
        details: [`blocked:${reason}`],
    };
}

function payloadHasMatchingValue(
    payload: unknown,
    field: string,
    expectedValue: string,
): boolean {
    const normalizedExpected = expectedValue.trim();
    if (normalizedExpected.length === 0) {
        return false;
    }
    const rows = collectObjects(payload);
    return rows.some((row) => {
        const v = row[field];
        if (v == null) {
            return false;
        }
        return String(v).trim() === normalizedExpected;
    });
}

async function runSimpleCase(
    caseId: string,
    invoke: (client: McpTestClient) => Promise<CallToolResult>,
    assertFn?: (text: string) => CaseRunResult,
): Promise<CaseRunResult> {
    const client = await createMcpClient();
    return runCase({
        name: caseId,
        prepare: async () => ({ client } as unknown as Record<string, unknown>),
        invoke: async (ctx) => invoke((ctx as unknown as QueryCtx).client),
        assertState: async (invokeRes) => {
            const text = getToolTextContent(invokeRes as CallToolResult);
            if (assertFn) {
                return assertFn(text);
            }
            return {
                passed: basePass(text),
                details: [text.slice(0, 400)],
            };
        },
        cleanup: async (ctx) => {
            await (ctx as unknown as QueryCtx).client.close();
        },
    });
}

async function pickOneBrowser(client: McpTestClient): Promise<Record<string, unknown> | null> {
    const res = await client.callTool('get-browser-list', { page: 1, limit: 50 });
    const payload = extractJsonPayloadFromToolText(getToolTextContent(res as CallToolResult));
    return findFirstByKeys(payload, ['profile_id']);
}

async function pickOneGroup(client: McpTestClient): Promise<Record<string, unknown> | null> {
    const res = await client.callTool('get-group-list', { page: 1, page_size: 100 });
    const payload = extractJsonPayloadFromToolText(getToolTextContent(res as CallToolResult));
    return findFirstByKeys(payload, ['group_id', 'group_name']);
}

async function pickOneProxy(client: McpTestClient): Promise<Record<string, unknown> | null> {
    const res = await client.callTool('get-proxy-list', { page: 1, limit: 200 });
    const payload = extractJsonPayloadFromToolText(getToolTextContent(res as CallToolResult));
    return findFirstByKeys(payload, ['proxy_id']);
}

async function pickOneTag(client: McpTestClient): Promise<Record<string, unknown> | null> {
    const res = await client.callTool('get-tag-list', { page: 1, limit: 200 });
    const payload = extractJsonPayloadFromToolText(getToolTextContent(res as CallToolResult));
    return findFirstByKeys(payload, ['id']);
}

async function pickOneApplicationCategory(client: McpTestClient): Promise<string | null> {
    const res = await client.callTool('get-application-list', { page: 1, limit: 50 });
    const payload = extractJsonPayloadFromToolText(getToolTextContent(res as CallToolResult));
    const hit =
        findFirstByKeys(payload, ['category_id']) ??
        findFirstByKeys(payload, ['id']);
    if (!hit) {
        return null;
    }
    return String(hit.category_id ?? hit.id ?? '');
}

export async function caseQueryGetBrowserListBasic(): Promise<CaseRunResult> {
    return runSimpleCase('query.get-browser-list.basic', (client) =>
        client.callTool('get-browser-list', { page: 1, limit: 20 }),
    );
}

export async function caseQueryGetBrowserListByProfileId(): Promise<CaseRunResult> {
    let requestedProfileId: string | null = null;
    return runSimpleCase(
        'query.get-browser-list.by-profile-id',
        async (client) => {
            const browser = await pickOneBrowser(client);
            if (!browser?.profile_id) {
                return {
                    content: [{ type: 'text', text: 'blocked:no_profile_for_profile_id_filter' }],
                } as CallToolResult;
            }
            requestedProfileId = String(browser.profile_id);
            return client.callTool('get-browser-list', { profile_id: [requestedProfileId] });
        },
        (text) => {
            if (text.startsWith('blocked:')) {
                return blocked(text.replace('blocked:', '').trim());
            }
            if (!requestedProfileId) {
                return { passed: false, details: ['missing_requested_profile_id_context'] };
            }
            const payload = extractJsonPayloadFromToolText(text);
            const matched = payloadHasMatchingValue(payload, 'profile_id', requestedProfileId);
            return {
                passed: matched,
                details: matched
                    ? [`profile_id_matched=${requestedProfileId}`]
                    : [`expected_profile_id=${requestedProfileId}`, text.slice(0, 400)],
            };
        },
    );
}

export async function caseQueryGetGroupListBasic(): Promise<CaseRunResult> {
    return runSimpleCase('query.get-group-list.basic', (client) =>
        client.callTool('get-group-list', { page: 1, page_size: 20 }),
    );
}

export async function caseQueryGetGroupListByGroupName(): Promise<CaseRunResult> {
    let requestedGroupName: string | null = null;
    return runSimpleCase(
        'query.get-group-list.by-group-name',
        async (client) => {
            const group = await pickOneGroup(client);
            if (!group?.group_name || !group?.group_id) {
                return {
                    content: [{ type: 'text', text: 'blocked:no_group_for_group_name_filter' }],
                } as CallToolResult;
            }
            requestedGroupName = String(group.group_name);
            return client.callTool('get-group-list', {
                group_name: requestedGroupName,
                page: 1,
                page_size: 20,
            });
        },
        (text) => {
            if (text.startsWith('blocked:')) {
                return blocked(text.replace('blocked:', '').trim());
            }
            if (!requestedGroupName) {
                return { passed: false, details: ['missing_requested_group_name_context'] };
            }
            const payload = extractJsonPayloadFromToolText(text);
            const matched = payloadHasMatchingValue(payload, 'group_name', requestedGroupName);
            return {
                passed: matched,
                details: matched
                    ? [`group_name_matched=${requestedGroupName}`]
                    : [`expected_group_name=${requestedGroupName}`, text.slice(0, 400)],
            };
        },
    );
}

export async function caseQueryGetProxyListBasic(): Promise<CaseRunResult> {
    return runSimpleCase('query.get-proxy-list.basic', (client) =>
        client.callTool('get-proxy-list', { page: 1, limit: 20 }),
    );
}

export async function caseQueryGetProxyListByProxyId(): Promise<CaseRunResult> {
    let requestedProxyId: string | null = null;
    return runSimpleCase(
        'query.get-proxy-list.by-proxy-id',
        async (client) => {
            const proxy = await pickOneProxy(client);
            if (!proxy?.proxy_id) {
                return {
                    content: [{ type: 'text', text: 'blocked:no_proxy_for_proxy_id_filter' }],
                } as CallToolResult;
            }
            requestedProxyId = String(proxy.proxy_id);
            return client.callTool('get-proxy-list', {
                proxy_id: [requestedProxyId],
                page: 1,
                limit: 20,
            });
        },
        (text) => {
            if (text.startsWith('blocked:')) {
                return blocked(text.replace('blocked:', '').trim());
            }
            if (!requestedProxyId) {
                return { passed: false, details: ['missing_requested_proxy_id_context'] };
            }
            const payload = extractJsonPayloadFromToolText(text);
            const matched = payloadHasMatchingValue(payload, 'proxy_id', requestedProxyId);
            return {
                passed: matched,
                details: matched
                    ? [`proxy_id_matched=${requestedProxyId}`]
                    : [`expected_proxy_id=${requestedProxyId}`, text.slice(0, 400)],
            };
        },
    );
}

export async function caseQueryGetTagListBasic(): Promise<CaseRunResult> {
    return runSimpleCase('query.get-tag-list.basic', (client) =>
        client.callTool('get-tag-list', { page: 1, limit: 20 }),
    );
}

export async function caseQueryGetTagListByIds(): Promise<CaseRunResult> {
    let requestedTagId: string | null = null;
    return runSimpleCase(
        'query.get-tag-list.by-ids',
        async (client) => {
            const tag = await pickOneTag(client);
            if (!tag?.id) {
                return {
                    content: [{ type: 'text', text: 'blocked:no_tag_for_ids_filter' }],
                } as CallToolResult;
            }
            requestedTagId = String(tag.id);
            return client.callTool('get-tag-list', {
                ids: [requestedTagId],
                page: 1,
                limit: 20,
            });
        },
        (text) => {
            if (text.startsWith('blocked:')) {
                return blocked(text.replace('blocked:', '').trim());
            }
            if (!requestedTagId) {
                return { passed: false, details: ['missing_requested_tag_id_context'] };
            }
            const payload = extractJsonPayloadFromToolText(text);
            const matched = payloadHasMatchingValue(payload, 'id', requestedTagId);
            return {
                passed: matched,
                details: matched
                    ? [`tag_id_matched=${requestedTagId}`]
                    : [`expected_tag_id=${requestedTagId}`, text.slice(0, 400)],
            };
        },
    );
}

export async function caseQueryGetApplicationListBasic(): Promise<CaseRunResult> {
    return runSimpleCase('query.get-application-list.basic', (client) =>
        client.callTool('get-application-list', { page: 1, limit: 20 }),
    );
}

export async function caseQueryGetApplicationListByCategoryId(): Promise<CaseRunResult> {
    let requestedCategoryId: string | null = null;
    return runSimpleCase(
        'query.get-application-list.by-category-id',
        async (client) => {
            const categoryId = await pickOneApplicationCategory(client);
            if (!categoryId) {
                return {
                    content: [{ type: 'text', text: 'blocked:no_category_id_for_filter' }],
                } as CallToolResult;
            }
            requestedCategoryId = categoryId;
            return client.callTool('get-application-list', {
                category_id: requestedCategoryId,
                page: 1,
                limit: 20,
            });
        },
        (text) => {
            if (text.startsWith('blocked:')) {
                return blocked(text.replace('blocked:', '').trim());
            }
            if (!requestedCategoryId) {
                return { passed: false, details: ['missing_requested_category_id_context'] };
            }
            const payload = extractJsonPayloadFromToolText(text);
            const matchedCategoryId = payloadHasMatchingValue(payload, 'category_id', requestedCategoryId);
            const matchedFallbackId = payloadHasMatchingValue(payload, 'id', requestedCategoryId);
            const matched = matchedCategoryId || matchedFallbackId;
            return {
                passed: matched,
                details: matched
                    ? [`category_id_matched=${requestedCategoryId}`]
                    : [`expected_category_id=${requestedCategoryId}`, text.slice(0, 400)],
            };
        },
    );
}

export async function caseQueryGetKernelListBasic(): Promise<CaseRunResult> {
    return runSimpleCase('query.get-kernel-list.basic', (client) =>
        client.callTool('get-kernel-list', {}),
    );
}

export async function caseQueryGetKernelListByKernelType(): Promise<CaseRunResult> {
    return runSimpleCase(
        'query.get-kernel-list.by-kernel-type',
        (client) => client.callTool('get-kernel-list', { kernel_type: 'Chrome' }),
        (text) => {
            if (!basePass(text)) {
                return { passed: false, details: [text.slice(0, 400)] };
            }
            const payload = extractJsonPayloadFromToolText(text);
            const rows = collectObjects(payload).filter((x) => x.kernel_type != null);
            if (rows.length === 0) {
                return blocked('kernel_type_field_not_exposed_in_response');
            }
            const allChrome = rows.every((r) => String(r.kernel_type).toLowerCase() === 'chrome');
            return {
                passed: allChrome,
                details: [`kernel_type_rows=${rows.length}`, `all_chrome=${String(allChrome)}`],
            };
        },
    );
}

export async function caseQueryGetBrowserActiveBasic(): Promise<CaseRunResult> {
    return runSimpleCase(
        'query.get-browser-active.basic',
        async (client) => {
            const browser = await pickOneBrowser(client);
            if (!browser?.profile_id) {
                return {
                    content: [{ type: 'text', text: 'blocked:no_profile_for_browser_active' }],
                } as CallToolResult;
            }
            return client.callTool('get-browser-active', { profile_id: String(browser.profile_id) });
        },
        (text) => (text.startsWith('blocked:') ? blocked(text.replace('blocked:', '').trim()) : {
            passed: basePass(text),
            details: [text.slice(0, 400)],
        }),
    );
}

export async function caseQueryGetBrowserActiveByProfileNo(): Promise<CaseRunResult> {
    return runSimpleCase(
        'query.get-browser-active.by-profile-no',
        async (client) => {
            const browser = await pickOneBrowser(client);
            if (!browser?.profile_no) {
                return {
                    content: [{ type: 'text', text: 'blocked:no_profile_no_for_filter' }],
                } as CallToolResult;
            }
            return client.callTool('get-browser-active', { profile_no: String(browser.profile_no) });
        },
        (text) => (text.startsWith('blocked:') ? blocked(text.replace('blocked:', '').trim()) : {
            passed: basePass(text),
            details: [text.slice(0, 400)],
        }),
    );
}

export async function caseQueryGetCloudActiveBasic(): Promise<CaseRunResult> {
    return runSimpleCase(
        'query.get-cloud-active.basic',
        async (client) => {
            const browser = await pickOneBrowser(client);
            if (!browser?.profile_id) {
                return {
                    content: [{ type: 'text', text: 'blocked:no_profile_for_cloud_active' }],
                } as CallToolResult;
            }
            return client.callTool('get-cloud-active', { user_ids: String(browser.profile_id) });
        },
        (text) => (text.startsWith('blocked:') ? blocked(text.replace('blocked:', '').trim()) : {
            passed: basePass(text),
            details: [text.slice(0, 400)],
        }),
    );
}

export async function caseQueryGetCloudActiveFilterBlocked(): Promise<CaseRunResult> {
    return blocked('no_optional_filter_params_declared');
}

export async function caseQueryCheckStatusBasic(): Promise<CaseRunResult> {
    return runSimpleCase('query.check-status.basic', (client) => client.callTool('check-status', {}));
}

export async function caseQueryCheckStatusFilterBlocked(): Promise<CaseRunResult> {
    return blocked('no_optional_filter_params_declared');
}

export async function caseQueryGetOpenedBrowserBasic(): Promise<CaseRunResult> {
    return runSimpleCase('query.get-opened-browser.basic', (client) =>
        client.callTool('get-opened-browser', {}),
    );
}

export async function caseQueryGetOpenedBrowserFilterBlocked(): Promise<CaseRunResult> {
    return blocked('no_optional_filter_params_declared');
}

export const queryCases: Record<string, () => Promise<CaseRunResult>> = {
    'query.get-browser-list.basic': caseQueryGetBrowserListBasic,
    'query.get-browser-list.by-profile-id': caseQueryGetBrowserListByProfileId,
    'query.get-group-list.basic': caseQueryGetGroupListBasic,
    'query.get-group-list.by-group-name': caseQueryGetGroupListByGroupName,
    'query.get-proxy-list.basic': caseQueryGetProxyListBasic,
    'query.get-proxy-list.by-proxy-id': caseQueryGetProxyListByProxyId,
    'query.get-tag-list.basic': caseQueryGetTagListBasic,
    'query.get-tag-list.by-ids': caseQueryGetTagListByIds,
    'query.get-application-list.basic': caseQueryGetApplicationListBasic,
    'query.get-application-list.by-category-id': caseQueryGetApplicationListByCategoryId,
    'query.get-kernel-list.basic': caseQueryGetKernelListBasic,
    'query.get-kernel-list.by-kernel-type': caseQueryGetKernelListByKernelType,
    'query.get-browser-active.basic': caseQueryGetBrowserActiveBasic,
    'query.get-browser-active.by-profile-no': caseQueryGetBrowserActiveByProfileNo,
    'query.get-cloud-active.basic': caseQueryGetCloudActiveBasic,
    'query.get-cloud-active.filter-blocked': caseQueryGetCloudActiveFilterBlocked,
    'query.check-status.basic': caseQueryCheckStatusBasic,
    'query.check-status.filter-blocked': caseQueryCheckStatusFilterBlocked,
    'query.get-opened-browser.basic': caseQueryGetOpenedBrowserBasic,
    'query.get-opened-browser.filter-blocked': caseQueryGetOpenedBrowserFilterBlocked,
};

export const __queryCaseInternals = {
    basePass,
    payloadHasMatchingValue,
};
