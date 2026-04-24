import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { extractJsonPayloadFromToolText } from '../../assertions/roundtrip/jsonExtractors.js';
import { runCase } from '../../runner/caseRunner.js';
import { createMcpClient } from '../../runner/mcpClient.js';
import { getToolTextContent } from '../../runner/toolResultText.js';
import type { CaseRunResult, McpTestClient } from '../../types.js';

type HighImpactCtx = { client: McpTestClient };

const HIGH_IMPACT_ENV = 'ADSP_MCP_E2E_HIGH_IMPACT';
const SHARE_RECEIVER_ENV = 'ADSP_MCP_E2E_SHARE_PROFILE_RECEIVER';

function blocked(reason: string): CaseRunResult {
    return { passed: true, details: [`blocked:${reason}`] };
}

function isHighImpactEnabled(): boolean {
    return process.env[HIGH_IMPACT_ENV] === '1';
}

function getShareReceiver(): string {
    return process.env[SHARE_RECEIVER_ENV]?.trim() ?? '';
}

function maybeObject(v: unknown): v is Record<string, unknown> {
    return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function collectObjects(payload: unknown): Record<string, unknown>[] {
    const out: Record<string, unknown>[] = [];
    const walk = (node: unknown): void => {
        if (Array.isArray(node)) {
            for (const child of node) walk(child);
            return;
        }
        if (!maybeObject(node)) {
            return;
        }
        out.push(node);
        for (const child of Object.values(node)) walk(child);
    };
    walk(payload);
    return out;
}

function parsePayloadFromToolText(text: string): unknown | null {
    try {
        return extractJsonPayloadFromToolText(text);
    } catch {
        return null;
    }
}

function hasFailureToken(text: string): boolean {
    const normalized = text.toLowerCase();
    return (
        normalized.includes('failed')
        || normalized.includes('error')
        || normalized.includes('exception')
        || normalized.includes('invalid')
    );
}

function assertToolTextSuccess(text: string): { passed: boolean; summary: string } {
    const summary = text.replace(/\s+/g, ' ').trim().slice(0, 220);
    if (!summary) {
        return { passed: false, summary: 'empty_response' };
    }
    return { passed: !hasFailureToken(summary), summary };
}

async function pickOneProfileId(client: McpTestClient): Promise<string | null> {
    const listRes = await client.callTool('get-browser-list', { page: 1, limit: 50 });
    const text = getToolTextContent(listRes as CallToolResult);
    const payload = parsePayloadFromToolText(text);
    if (!payload) {
        return null;
    }
    const hit = collectObjects(payload).find((row) => row.profile_id != null);
    if (!hit) {
        return null;
    }
    return String(hit.profile_id);
}

async function hasOpenedBrowsers(client: McpTestClient): Promise<{
    parseOk: boolean;
    openedCount: number;
    summary: string;
}> {
    const openedRes = await client.callTool('get-opened-browser', {});
    const text = getToolTextContent(openedRes as CallToolResult);
    const payload = parsePayloadFromToolText(text);
    if (!payload) {
        return {
            parseOk: false,
            openedCount: 0,
            summary: text.slice(0, 220),
        };
    }
    const rows = collectObjects(payload).filter((row) => row.profile_id != null);
    return {
        parseOk: true,
        openedCount: rows.length,
        summary: text.slice(0, 220),
    };
}

async function runHighImpactCase(
    name: string,
    invokeFn: (client: McpTestClient) => Promise<CaseRunResult | CallToolResult>,
): Promise<CaseRunResult> {
    const client = await createMcpClient();
    return runCase({
        name,
        prepare: async () => ({ client } as unknown as Record<string, unknown>),
        invoke: async (ctx) => invokeFn((ctx as unknown as HighImpactCtx).client),
        assertState: async (invokeRes) => {
            const maybeCase = invokeRes as CaseRunResult;
            if (Array.isArray(maybeCase.details) && typeof maybeCase.passed === 'boolean') {
                return maybeCase;
            }
            const text = getToolTextContent(invokeRes as CallToolResult);
            const verdict = assertToolTextSuccess(text);
            return {
                passed: verdict.passed,
                details: [`tool_text=${verdict.summary}`],
            };
        },
        cleanup: async (ctx) => {
            await (ctx as unknown as HighImpactCtx).client.close();
        },
    });
}

export async function caseHighImpactNewFingerprintByProfileId(): Promise<CaseRunResult> {
    return runHighImpactCase('highimpact.new-fingerprint.by-profile-id', async (client) => {
        if (!isHighImpactEnabled()) {
            return blocked(`high_impact_disabled_${HIGH_IMPACT_ENV}`);
        }
        const profileId = await pickOneProfileId(client);
        if (!profileId) {
            return blocked('no_profile_for_new_fingerprint');
        }
        const res = await client.callTool('new-fingerprint', { profile_id: [profileId] });
        const text = getToolTextContent(res as CallToolResult);
        const verdict = assertToolTextSuccess(text);
        return {
            passed: verdict.passed,
            details: [`profile_id=${profileId}`, `tool_text=${verdict.summary}`],
        };
    });
}

export async function caseHighImpactDeleteCacheV2CookieOnly(): Promise<CaseRunResult> {
    return runHighImpactCase('highimpact.delete-cache-v2.cookie-only', async (client) => {
        if (!isHighImpactEnabled()) {
            return blocked(`high_impact_disabled_${HIGH_IMPACT_ENV}`);
        }
        const opened = await hasOpenedBrowsers(client);
        if (!opened.parseOk) {
            return blocked('delete_cache_precheck_parse_failed_get_opened_browser');
        }
        if (opened.openedCount > 0) {
            return {
                passed: true,
                details: [
                    'blocked:delete_cache_requires_no_opened_browser',
                    `opened_count=${opened.openedCount}`,
                    `opened_summary=${opened.summary}`,
                ],
            };
        }
        const profileId = await pickOneProfileId(client);
        if (!profileId) {
            return blocked('no_profile_for_delete_cache_v2');
        }
        const res = await client.callTool('delete-cache-v2', {
            profile_id: [profileId],
            type: ['cookie'],
        });
        const text = getToolTextContent(res as CallToolResult);
        const verdict = assertToolTextSuccess(text);
        return {
            passed: verdict.passed,
            details: [
                'precheck_no_opened_browser',
                `profile_id=${profileId}`,
                `tool_text=${verdict.summary}`,
            ],
        };
    });
}

export async function caseHighImpactShareProfileWithReceiver(): Promise<CaseRunResult> {
    return runHighImpactCase('highimpact.share-profile.with-receiver', async (client) => {
        if (!isHighImpactEnabled()) {
            return blocked(`high_impact_disabled_${HIGH_IMPACT_ENV}`);
        }
        const receiver = getShareReceiver();
        if (!receiver) {
            return blocked(`missing_share_receiver_env_${SHARE_RECEIVER_ENV}`);
        }
        const profileId = await pickOneProfileId(client);
        if (!profileId) {
            return blocked('no_profile_for_share_profile');
        }
        const res = await client.callTool('share-profile', {
            profile_id: [profileId],
            receiver,
        });
        const text = getToolTextContent(res as CallToolResult);
        const verdict = assertToolTextSuccess(text);
        return {
            passed: verdict.passed,
            details: [
                `profile_id=${profileId}`,
                'receiver_from_env=true',
                `tool_text=${verdict.summary}`,
            ],
        };
    });
}

export const highImpactCases: Record<string, () => Promise<CaseRunResult>> = {
    'highimpact.new-fingerprint.by-profile-id': caseHighImpactNewFingerprintByProfileId,
    'highimpact.delete-cache-v2.cookie-only': caseHighImpactDeleteCacheV2CookieOnly,
    'highimpact.share-profile.with-receiver': caseHighImpactShareProfileWithReceiver,
};
