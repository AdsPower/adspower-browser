import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { compareInputAgainstReadbackB, type CompareBRow } from '../../assertions/roundtrip/compareB.js';
import { extractJsonPayloadFromToolText } from '../../assertions/roundtrip/jsonExtractors.js';
import { uniqueLabel } from '../../fixtures/resourceFactory.js';
import { runCase } from '../../runner/caseRunner.js';
import { createMcpClient } from '../../runner/mcpClient.js';
import { getToolTextContent } from '../../runner/toolResultText.js';
import type { CaseRunResult } from '../../types.js';
import type { McpTestClient } from '../../types.js';

type Ctx = {
    client: McpTestClient;
    tagId?: string;
    created?: Record<string, unknown>;
    updated?: Record<string, unknown>;
};

function looksSuccessfulTagList(text: string): boolean {
    const lower = text.toLowerCase();
    return !lower.includes('failed to get') && text.length > 0;
}

export async function caseTagListQuery(): Promise<CaseRunResult> {
    const client = await createMcpClient();

    return runCase({
        name: 'tag.list.query',
        prepare: async () => ({ client } as unknown as Record<string, unknown>),
        invoke: async (ctx) => {
            const c = (ctx as unknown as Ctx).client;
            return c.callTool('get-tag-list', {
                ids: [],
                page: 1,
                limit: 30,
            });
        },
        assertState: async (invokeRes) => {
            const text = getToolTextContent(invokeRes as CallToolResult);
            const passed = looksSuccessfulTagList(text);
            return {
                passed,
                details: passed ? ['ids,page,limit'] : [text.slice(0, 500)],
            };
        },
        cleanup: async (ctx) => {
            await (ctx as unknown as Ctx).client.close();
        },
    });
}

function maybeObject(v: unknown): v is Record<string, unknown> {
    return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function findTagById(payload: unknown, tagId: string): Record<string, unknown> | null {
    if (Array.isArray(payload)) {
        for (const item of payload) {
            const found = findTagById(item, tagId);
            if (found) {
                return found;
            }
        }
        return null;
    }
    if (!maybeObject(payload)) {
        return null;
    }
    if (String(payload.id ?? '') === tagId) {
        return payload;
    }
    for (const child of Object.values(payload)) {
        const found = findTagById(child, tagId);
        if (found) {
            return found;
        }
    }
    return null;
}

function findTagByName(payload: unknown, name: string): Record<string, unknown> | null {
    if (Array.isArray(payload)) {
        for (const item of payload) {
            const found = findTagByName(item, name);
            if (found) {
                return found;
            }
        }
        return null;
    }
    if (!maybeObject(payload)) {
        return null;
    }
    if (String(payload.name ?? '') === name) {
        return payload;
    }
    for (const child of Object.values(payload)) {
        const found = findTagByName(child, name);
        if (found) {
            return found;
        }
    }
    return null;
}

function formatCompareRows(rows: CompareBRow[]): string[] {
    return rows.map((r) => `${r.inputPath}->${r.actualPath}:${r.status}${r.reason ? `(${r.reason})` : ''}`);
}

function summarizeToolText(text: string, max = 600): string {
    const compact = text.replace(/\s+/g, ' ').trim();
    return compact.length <= max ? compact : `${compact.slice(0, max)}...`;
}

async function getTagRecordById(
    client: McpTestClient,
    tagId: string,
): Promise<{ record: Record<string, unknown> | null; rawText: string }> {
    const list = await client.callTool('get-tag-list', { ids: [tagId], page: 1, limit: 30 });
    const rawText = getToolTextContent(list as CallToolResult);
    const payload = extractJsonPayloadFromToolText(rawText);
    return {
        record: findTagById(payload, tagId),
        rawText,
    };
}

async function createTagAndResolveId(client: McpTestClient, name: string, color: string): Promise<string> {
    const createdText = getToolTextContent(
        (await client.callTool('create-tag', {
            tags: [{ name, color }],
        })) as CallToolResult,
    );
    const createdPayload = extractJsonPayloadFromToolText(createdText);
    const byName = findTagByName(createdPayload, name);
    if (byName?.id != null) {
        return String(byName.id);
    }
    const list = await client.callTool('get-tag-list', { page: 1, limit: 200 });
    const listPayload = extractJsonPayloadFromToolText(getToolTextContent(list as CallToolResult));
    const listed = findTagByName(listPayload, name);
    if (listed?.id != null) {
        return String(listed.id);
    }
    throw new Error(`tag id missing after create for name=${name}`);
}

export async function caseTagCreateRoundtripFullOptionalSubset(): Promise<CaseRunResult> {
    const client = await createMcpClient();
    const ctx: Ctx = {
        client,
        created: { name: uniqueLabel('tag-create'), color: 'blue' },
    };

    return runCase({
        name: 'tag.create.roundtrip.full-optional-subset',
        prepare: async () => ctx as unknown as Record<string, unknown>,
        invoke: async (c) => {
            const x = c as unknown as Ctx;
            x.tagId = await createTagAndResolveId(
                x.client,
                String(x.created?.name ?? ''),
                String(x.created?.color ?? 'darkBlue'),
            );
            return {
                content: [{ type: 'text', text: `tag_id=${x.tagId}` }],
            } as CallToolResult;
        },
        assertState: async (_invokeRes, c) => {
            const x = c as unknown as Ctx;
            const list = await getTagRecordById(x.client, x.tagId ?? '');
            if (!list.record) {
                return {
                    passed: false,
                    details: [`tag_id=${x.tagId ?? 'unknown'}`, 'record_missing_after_create', list.rawText.slice(0, 800)],
                };
            }
            const compare = compareInputAgainstReadbackB(x.created ?? {}, list.record);
            const requiredRows = ['name', 'color'].map((k) => compare.rows.find((r) => r.inputPath === k));
            const passed = compare.failed === 0 && requiredRows.every((r) => r?.status === 'passed');
            return {
                passed,
                details: [
                    `tag_id=${x.tagId ?? 'unknown'}`,
                    `compareB: passed=${compare.passed} failed=${compare.failed} skipped=${compare.skipped}`,
                    ...formatCompareRows(compare.rows),
                ],
            };
        },
        cleanup: async (c) => {
            const x = c as unknown as Ctx;
            try {
                if (x.tagId) {
                    await x.client.callTool('delete-tag', { ids: [x.tagId] });
                }
            } finally {
                await x.client.close();
            }
        },
    });
}

export async function caseTagUpdateRoundtripFullOptionalSubset(): Promise<CaseRunResult> {
    const client = await createMcpClient();
    const ctx: Ctx = {
        client,
        created: { name: uniqueLabel('tag-before'), color: 'green' },
    };

    return runCase({
        name: 'tag.update.roundtrip.full-optional-subset',
        prepare: async () => ctx as unknown as Record<string, unknown>,
        invoke: async (c) => {
            const x = c as unknown as Ctx;
            x.tagId = await createTagAndResolveId(
                x.client,
                String(x.created?.name ?? ''),
                String(x.created?.color ?? 'darkBlue'),
            );
            x.updated = { name: uniqueLabel('tag-after'), color: 'red' };
            return x.client.callTool('update-tag', {
                tags: [{ id: x.tagId, ...x.updated }],
            });
        },
        assertState: async (_invokeRes, c) => {
            const x = c as unknown as Ctx;
            const list = await getTagRecordById(x.client, x.tagId ?? '');
            if (!list.record) {
                return {
                    passed: false,
                    details: [`tag_id=${x.tagId ?? 'unknown'}`, 'record_missing_after_update', list.rawText.slice(0, 800)],
                };
            }
            const compare = compareInputAgainstReadbackB(x.updated ?? {}, list.record);
            const requiredRows = ['name', 'color'].map((k) => compare.rows.find((r) => r.inputPath === k));
            const passed = compare.failed === 0 && requiredRows.every((r) => r?.status === 'passed');
            return {
                passed,
                details: [
                    `tag_id=${x.tagId ?? 'unknown'}`,
                    `compareB: passed=${compare.passed} failed=${compare.failed} skipped=${compare.skipped}`,
                    ...formatCompareRows(compare.rows),
                ],
            };
        },
        cleanup: async (c) => {
            const x = c as unknown as Ctx;
            try {
                if (x.tagId) {
                    await x.client.callTool('delete-tag', { ids: [x.tagId] });
                }
            } finally {
                await x.client.close();
            }
        },
    });
}

export async function caseTagDeleteVisibility(): Promise<CaseRunResult> {
    const client = await createMcpClient();
    const ctx: Ctx = {
        client,
        created: { name: uniqueLabel('tag-delete'), color: 'purple' },
    };

    return runCase({
        name: 'tag.delete.visibility',
        prepare: async () => ctx as unknown as Record<string, unknown>,
        invoke: async (c) => {
            const x = c as unknown as Ctx;
            x.tagId = await createTagAndResolveId(
                x.client,
                String(x.created?.name ?? ''),
                String(x.created?.color ?? 'darkBlue'),
            );
            return x.client.callTool('delete-tag', { ids: [x.tagId] });
        },
        assertState: async (_invokeRes, c) => {
            const x = c as unknown as Ctx;
            const totalTimeoutMs = 8_000;
            const backoffScheduleMs = [250, 400, 700, 1_000, 1_400, 1_800, 2_000];
            const startedAt = Date.now();
            let attempts = 0;
            let list = await getTagRecordById(x.client, x.tagId ?? '');
            let invisible = !list.record;
            while (!invisible && Date.now() - startedAt < totalTimeoutMs) {
                const delay = backoffScheduleMs[Math.min(attempts, backoffScheduleMs.length - 1)];
                await new Promise((resolve) => setTimeout(resolve, delay));
                list = await getTagRecordById(x.client, x.tagId ?? '');
                invisible = !list.record;
                attempts += 1;
            }
            return {
                passed: invisible,
                details: invisible
                    ? [`tag_id=${x.tagId ?? 'unknown'}`, 'not_found_after_delete']
                    : [
                          `tag_id=${x.tagId ?? 'unknown'}`,
                          `wait_timeout_ms=${totalTimeoutMs}`,
                          `poll_attempts=${attempts}`,
                          'still_visible_after_delete',
                          `last_response_summary=${summarizeToolText(list.rawText)}`,
                      ],
            };
        },
        cleanup: async (c) => {
            const x = c as unknown as Ctx;
            try {
                if (x.tagId) {
                    await x.client.callTool('delete-tag', { ids: [x.tagId] });
                }
            } finally {
                await x.client.close();
            }
        },
    });
}

export const tagCases: Record<string, () => Promise<CaseRunResult>> = {
    'tag.list.query': caseTagListQuery,
    'tag.create.roundtrip.full-optional-subset': caseTagCreateRoundtripFullOptionalSubset,
    'tag.update.roundtrip.full-optional-subset': caseTagUpdateRoundtripFullOptionalSubset,
    'tag.delete.visibility': caseTagDeleteVisibility,
};
