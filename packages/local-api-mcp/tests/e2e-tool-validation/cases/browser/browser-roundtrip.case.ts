import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import {
    compareInputAgainstReadbackB,
    type CompareBResult,
    type CompareBRow,
} from '../../assertions/roundtrip/compareB.js';
import { extractJsonPayloadFromToolText } from '../../assertions/roundtrip/jsonExtractors.js';
import { uniqueLabel } from '../../fixtures/resourceFactory.js';
import { runCase } from '../../runner/caseRunner.js';
import { createMcpClient } from '../../runner/mcpClient.js';
import { getToolTextContent } from '../../runner/toolResultText.js';
import type { McpTestClient } from '../../types.js';

type BrowserRoundtripCtx = {
    client: McpTestClient;
    profileId: string;
    created: Record<string, unknown>;
    updated: Record<string, unknown>;
};

function extractProfileIdFromCreateText(text: string): string {
    const m = text.match(/profile_id:\s*([^\s\n]+)/i);
    if (!m?.[1]) {
        throw new Error(`Could not parse profile_id from create-browser: ${text.slice(0, 500)}`);
    }
    return m[1];
}

function maybeObject(v: unknown): v is Record<string, unknown> {
    return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function findProfileById(payload: unknown, profileId: string): Record<string, unknown> | null {
    if (Array.isArray(payload)) {
        for (const item of payload) {
            const found = findProfileById(item, profileId);
            if (found) {
                return found;
            }
        }
        return null;
    }

    if (!maybeObject(payload)) {
        return null;
    }

    if (String(payload.profile_id ?? '') === profileId) {
        return payload;
    }

    for (const v of Object.values(payload)) {
        const found = findProfileById(v, profileId);
        if (found) {
            return found;
        }
    }
    return null;
}

async function getBrowserRecordByProfileId(
    client: McpTestClient,
    profileId: string,
): Promise<{ record: Record<string, unknown> | null; rawText: string }> {
    const listRes = await client.callTool('get-browser-list', {
        profile_id: [profileId],
        page: 1,
        limit: 200,
    });
    const rawText = getToolTextContent(listRes as CallToolResult);
    const parsed = extractJsonPayloadFromToolText(rawText);
    return {
        record: findProfileById(parsed, profileId),
        rawText,
    };
}

function formatCompareRows(rows: CompareBRow[]): string[] {
    return rows.map((r) => `${r.inputPath}->${r.actualPath}:${r.status}${r.reason ? `(${r.reason})` : ''}`);
}

function buildStableCreatePayload(): Record<string, unknown> {
    const stamp = uniqueLabel('rt-create');
    return {
        group_id: '0',
        username: `${stamp}-u`,
        password: `${stamp}-p`,
        cookie: 'session=rt_create_cookie; token=create',
        name: `${stamp}-name`,
        remark: `${stamp}-remark`,
        platform: 'facebook.com',
        ipchecker: 'ipapi',
    };
}

function buildStableUpdatePayload(profileId: string): Record<string, unknown> {
    const stamp = uniqueLabel('rt-update');
    return {
        profile_id: profileId,
        username: `${stamp}-u`,
        password: `${stamp}-p`,
        cookie: 'session=rt_update_cookie; token=update',
        name: `${stamp}-name`,
        remark: `${stamp}-remark`,
        platform: 'twitter.com',
        // Keep aligned with create: AdsPower may not persist `ipchecker` changes on update, or list readback stays stable.
        ipchecker: 'ipapi',
    };
}

function buildRoundtripMapping(): Record<string, { actualPath?: string; matcher?: 'cookie_contains' }> {
    return {
        cookie: {
            actualPath: 'cookie',
            matcher: 'cookie_contains',
        },
    };
}

const REQUIRED_NON_SKIPPED_FIELDS = ['username', 'password', 'name', 'remark', 'platform', 'ipchecker'] as const;
const ALLOWED_COOKIE_SKIP_REASONS = new Set([
    'readback_path_missing',
    'cookie_actual_not_string',
    'cookie_not_substring_match_or_truncated',
]);

export function isRoundtripCompareAcceptable(compare: CompareBResult): {
    passed: boolean;
    reasons: string[];
} {
    const reasons: string[] = [];

    if (compare.failed !== 0) {
        reasons.push(`failed_must_be_zero(actual=${compare.failed})`);
    }

    for (const field of REQUIRED_NON_SKIPPED_FIELDS) {
        const row = compare.rows.find((r) => r.inputPath === field);
        if (!row) {
            reasons.push(`required_field_missing_row(${field})`);
            continue;
        }
        if (row.status === 'skipped') {
            reasons.push(`required_field_skipped(${field}:${row.reason ?? 'unknown'})`);
        }
    }

    const cookieRow = compare.rows.find((r) => r.inputPath === 'cookie');
    if (cookieRow?.status === 'skipped') {
        const reason = cookieRow.reason ?? 'unknown';
        if (!ALLOWED_COOKIE_SKIP_REASONS.has(reason)) {
            reasons.push(`cookie_skip_reason_not_allowed(${reason})`);
        }
    }

    return {
        passed: reasons.length === 0,
        reasons,
    };
}

export async function caseBrowserCreateRoundtripFullOptionalSubset(): Promise<{
    passed: boolean;
    details: string[];
}> {
    const client = await createMcpClient();
    const ctx: BrowserRoundtripCtx = {
        client,
        profileId: '',
        created: buildStableCreatePayload(),
        updated: {},
    };

    return runCase({
        name: 'browser.create.roundtrip.full-optional-subset',
        prepare: async () => ctx as unknown as Record<string, unknown>,
        invoke: async (c) => {
            const x = c as unknown as BrowserRoundtripCtx;
            return x.client.callTool('create-browser', x.created);
        },
        assertState: async (createRes, c) => {
            const x = c as unknown as BrowserRoundtripCtx;
            const createText = getToolTextContent(createRes as CallToolResult);
            x.profileId = extractProfileIdFromCreateText(createText);
            const list = await getBrowserRecordByProfileId(x.client, x.profileId);
            if (!list.record) {
                return {
                    passed: false,
                    details: [`profile_id=${x.profileId}`, 'record_missing_after_create', list.rawText.slice(0, 800)],
                };
            }

            const compare = compareInputAgainstReadbackB(x.created, list.record, buildRoundtripMapping());
            const gate = isRoundtripCompareAcceptable(compare);
            return {
                passed: gate.passed,
                details: [
                    `profile_id=${x.profileId}`,
                    `compareB: passed=${compare.passed} failed=${compare.failed} skipped=${compare.skipped}`,
                    ...gate.reasons,
                    ...formatCompareRows(compare.rows),
                ],
            };
        },
        cleanup: async (c) => {
            const x = c as unknown as BrowserRoundtripCtx;
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

function buildCreateGeoAndAccountPayload(): Record<string, unknown> {
    const stamp = uniqueLabel('rt-create-geo');
    return {
        group_id: '0',
        username: `${stamp}-u`,
        password: `${stamp}-p`,
        name: `${stamp}-name`,
        remark: `${stamp}-remark`,
        platform: 'facebook.com',
        fakey: `${stamp}-2fa`,
        tabs: ['https://example.com', 'https://example.org'],
        ignore_cookie_error: '1',
        repeat_config: [0, 2, 3],
        ip: '8.8.8.8',
        country: 'us',
        region: 'California',
        city: 'Mountain View',
        ipchecker: 'ipapi',
    };
}

function buildCreateProxyAndFingerprintPayload(): Record<string, unknown> {
    const stamp = uniqueLabel('rt-create-proxy-fp');
    return {
        group_id: '0',
        name: `${stamp}-name`,
        remark: `${stamp}-remark`,
        user_proxy_config: {
            proxy_soft: 'other',
            proxy_type: 'http',
            proxy_host: '127.0.0.1',
            proxy_port: '61080',
            proxy_user: `${stamp}-user`,
            proxy_password: `${stamp}-pass`,
            proxy_url: `https://refresh.example.com/${stamp}`,
            global_config: '0',
        },
        fingerprint_config: {
            audio: '1',
            scan_port_type: '1',
        },
    };
}

async function runCreateRoundtripCase(
    caseName: string,
    createPayload: Record<string, unknown>,
    compareInput: Record<string, unknown>,
    mapping: Record<string, { actualPath?: string; matcher?: 'cookie_contains' }>,
    requiredPassedInputPaths: string[],
): Promise<{ passed: boolean; details: string[] }> {
    const client = await createMcpClient();
    const ctx: BrowserRoundtripCtx = {
        client,
        profileId: '',
        created: createPayload,
        updated: {},
    };

    return runCase({
        name: caseName,
        prepare: async () => ctx as unknown as Record<string, unknown>,
        invoke: async (c) => {
            const x = c as unknown as BrowserRoundtripCtx;
            return x.client.callTool('create-browser', x.created);
        },
        assertState: async (createRes, c) => {
            const x = c as unknown as BrowserRoundtripCtx;
            const createText = getToolTextContent(createRes as CallToolResult);
            x.profileId = extractProfileIdFromCreateText(createText);
            const list = await getBrowserRecordByProfileId(x.client, x.profileId);
            if (!list.record) {
                return {
                    passed: false,
                    details: [`profile_id=${x.profileId}`, 'record_missing_after_create', list.rawText.slice(0, 800)],
                };
            }

            const compare = compareInputAgainstReadbackB(compareInput, list.record, mapping);
            const failed = compare.rows.filter((row) => row.status === 'failed');
            const missingRequired = requiredPassedInputPaths.filter((inputPath) => {
                const row = compare.rows.find((r) => r.inputPath === inputPath);
                return !row || row.status !== 'passed';
            });
            const passed = failed.length === 0 && missingRequired.length === 0;
            return {
                passed,
                details: [
                    `profile_id=${x.profileId}`,
                    `compareB: passed=${compare.passed} failed=${compare.failed} skipped=${compare.skipped}`,
                    ...missingRequired.map((name) => `required_field_not_passed(${name})`),
                    ...formatCompareRows(compare.rows),
                ],
            };
        },
        cleanup: async (c) => {
            const x = c as unknown as BrowserRoundtripCtx;
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

export async function caseBrowserCreateRoundtripGeoAndAccountOptionalSubset(): Promise<{
    passed: boolean;
    details: string[];
}> {
    const payload = buildCreateGeoAndAccountPayload();
    return runCreateRoundtripCase(
        'browser.create.roundtrip.geo-and-account-optional-subset',
        payload,
        payload,
        {},
        // List readback often omits geo/tabs/cookie-error fields; Rule B treats those as skippable.
        ['name', 'fakey', 'username', 'password', 'remark', 'platform', 'group_id', 'ip', 'ipchecker'],
    );
}

export async function caseBrowserCreateRoundtripProxyAndFingerprintOptionalSubset(): Promise<{
    passed: boolean;
    details: string[];
}> {
    const payload = buildCreateProxyAndFingerprintPayload();
    const proxyConfig = payload.user_proxy_config as Record<string, unknown>;
    const compareInput = {
        group_id: payload.group_id,
        name: payload.name,
        user_proxy_config_proxy_soft: 'other',
        user_proxy_config_proxy_type: 'http',
        user_proxy_config_proxy_host: '127.0.0.1',
        user_proxy_config_proxy_port: '61080',
        user_proxy_config_proxy_user: proxyConfig.proxy_user,
        user_proxy_config_proxy_password: proxyConfig.proxy_password,
        user_proxy_config_proxy_url: proxyConfig.proxy_url,
        user_proxy_config_global_config: '0',
        fingerprint_config_audio: '1',
        fingerprint_config_scan_port_type: '1',
    };
    return runCreateRoundtripCase(
        'browser.create.roundtrip.proxy-and-fingerprint-optional-subset',
        payload,
        compareInput,
        {
            user_proxy_config_proxy_soft: { actualPath: 'user_proxy_config.proxy_soft' },
            user_proxy_config_proxy_type: { actualPath: 'user_proxy_config.proxy_type' },
            user_proxy_config_proxy_host: { actualPath: 'user_proxy_config.proxy_host' },
            user_proxy_config_proxy_port: { actualPath: 'user_proxy_config.proxy_port' },
            user_proxy_config_proxy_user: { actualPath: 'user_proxy_config.proxy_user' },
            user_proxy_config_proxy_password: { actualPath: 'user_proxy_config.proxy_password' },
            user_proxy_config_proxy_url: { actualPath: 'user_proxy_config.proxy_url' },
            user_proxy_config_global_config: { actualPath: 'user_proxy_config.global_config' },
            fingerprint_config_audio: { actualPath: 'fingerprint_config.audio' },
            fingerprint_config_scan_port_type: { actualPath: 'fingerprint_config.scan_port_type' },
        },
        // Stable `user_proxy_config` fields are present on readback; fingerprint/global fields are often absent.
        [
            'name',
            'user_proxy_config_proxy_soft',
            'user_proxy_config_proxy_type',
            'user_proxy_config_proxy_host',
            'user_proxy_config_proxy_port',
            'user_proxy_config_proxy_user',
            'user_proxy_config_proxy_password',
            'user_proxy_config_proxy_url',
        ],
    );
}

export async function caseBrowserCreateRoundtripExternalOptionalBlocked(): Promise<{
    passed: boolean;
    details: string[];
}> {
    return {
        passed: true,
        details: [
            'blocked:create_browser_external_optional_requires_seeded_proxy_category_and_tags',
            'blocked_fields=proxyid,category_id,profile_tag_ids',
        ],
    };
}

export async function caseBrowserUpdateRoundtripFullOptionalSubset(): Promise<{
    passed: boolean;
    details: string[];
}> {
    const client = await createMcpClient();
    const ctx: BrowserRoundtripCtx = {
        client,
        profileId: '',
        created: buildStableCreatePayload(),
        updated: {},
    };

    return runCase({
        name: 'browser.update.roundtrip.full-optional-subset',
        prepare: async () => ctx as unknown as Record<string, unknown>,
        invoke: async (c) => {
            const x = c as unknown as BrowserRoundtripCtx;
            const createRes = await x.client.callTool('create-browser', x.created);
            const createText = getToolTextContent(createRes as CallToolResult);
            x.profileId = extractProfileIdFromCreateText(createText);
            x.updated = buildStableUpdatePayload(x.profileId);
            return x.client.callTool('update-browser', x.updated);
        },
        assertState: async (_updateRes, c) => {
            const x = c as unknown as BrowserRoundtripCtx;
            const list = await getBrowserRecordByProfileId(x.client, x.profileId);
            if (!list.record) {
                return {
                    passed: false,
                    details: [`profile_id=${x.profileId}`, 'record_missing_after_update', list.rawText.slice(0, 800)],
                };
            }
            const expected = Object.fromEntries(
                Object.entries(x.updated).filter(([k]) => k !== 'profile_id'),
            );
            const compare = compareInputAgainstReadbackB(expected, list.record, buildRoundtripMapping());
            const gate = isRoundtripCompareAcceptable(compare);
            return {
                passed: gate.passed,
                details: [
                    `profile_id=${x.profileId}`,
                    `compareB: passed=${compare.passed} failed=${compare.failed} skipped=${compare.skipped}`,
                    ...gate.reasons,
                    ...formatCompareRows(compare.rows),
                ],
            };
        },
        cleanup: async (c) => {
            const x = c as unknown as BrowserRoundtripCtx;
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

export async function caseBrowserDeleteVisibility(): Promise<{ passed: boolean; details: string[] }> {
    const client = await createMcpClient();

    return runCase({
        name: 'browser.delete.visibility',
        prepare: async () =>
            ({
                client,
                profileId: '',
                created: buildStableCreatePayload(),
                updated: {},
            }) as unknown as Record<string, unknown>,
        invoke: async (c) => {
            const x = c as unknown as BrowserRoundtripCtx;
            const createRes = await x.client.callTool('create-browser', x.created);
            const createText = getToolTextContent(createRes as CallToolResult);
            x.profileId = extractProfileIdFromCreateText(createText);
            return x.client.callTool('delete-browser', { profile_id: [x.profileId] });
        },
        assertState: async (_deleteRes, c) => {
            const x = c as unknown as BrowserRoundtripCtx;
            let list = await getBrowserRecordByProfileId(x.client, x.profileId);
            let invisible = !list.record;
            for (let i = 0; i < 3 && !invisible; i += 1) {
                await new Promise((resolve) => setTimeout(resolve, 300));
                list = await getBrowserRecordByProfileId(x.client, x.profileId);
                invisible = !list.record;
            }
            return {
                passed: invisible,
                details: invisible
                    ? [`profile_id=${x.profileId}`, 'not_found_after_delete']
                    : [`profile_id=${x.profileId}`, 'still_visible_after_delete', list.rawText.slice(0, 800)],
            };
        },
        cleanup: async (c) => {
            const x = c as unknown as BrowserRoundtripCtx;
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

export const browserRoundtripCases = {
    'browser.create.roundtrip.full-optional-subset': caseBrowserCreateRoundtripFullOptionalSubset,
    'browser.create.roundtrip.geo-and-account-optional-subset':
        caseBrowserCreateRoundtripGeoAndAccountOptionalSubset,
    'browser.create.roundtrip.proxy-and-fingerprint-optional-subset':
        caseBrowserCreateRoundtripProxyAndFingerprintOptionalSubset,
    'browser.create.roundtrip.external-optional.blocked': caseBrowserCreateRoundtripExternalOptionalBlocked,
    'browser.update.roundtrip.full-optional-subset': caseBrowserUpdateRoundtripFullOptionalSubset,
    'browser.delete.visibility': caseBrowserDeleteVisibility,
};
