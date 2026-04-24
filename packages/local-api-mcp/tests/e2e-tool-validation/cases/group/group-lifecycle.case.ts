import { markOptionalParamCovered } from '../../fixtures/coverageStore.js';
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

type GroupCtx = {
    client: McpTestClient;
    groupName: string;
    updatedGroupName?: string;
    groupId?: string;
    remark?: string;
};

const GROUP_CLEANUP_TOMBSTONE_NAME = '__e2e_group_cleanup_tombstone__';

function maybeObject(v: unknown): v is Record<string, unknown> {
    return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function findGroupByName(payload: unknown, groupName: string): Record<string, unknown> | null {
    if (Array.isArray(payload)) {
        for (const item of payload) {
            const found = findGroupByName(item, groupName);
            if (found) {
                return found;
            }
        }
        return null;
    }
    if (!maybeObject(payload)) {
        return null;
    }
    if (String(payload.group_name ?? '') === groupName) {
        return payload;
    }
    for (const child of Object.values(payload)) {
        const found = findGroupByName(child, groupName);
        if (found) {
            return found;
        }
    }
    return null;
}

async function getGroupRecordByName(
    client: McpTestClient,
    groupName: string,
): Promise<{ record: Record<string, unknown> | null; rawText: string }> {
    const list = await client.callTool('get-group-list', {
        group_name: groupName,
        page_size: 100,
        page: 1,
    });
    const rawText = getToolTextContent(list);
    const payload = extractJsonPayloadFromToolText(rawText);
    return {
        record: findGroupByName(payload, groupName),
        rawText,
    };
}

function formatCompareRows(rows: CompareBRow[]): string[] {
    return rows.map((r) => `${r.inputPath}->${r.actualPath}:${r.status}${r.reason ? `(${r.reason})` : ''}`);
}

function isGroupRoundtripCompareAcceptable(
    compare: CompareBResult,
    options: { requireRemark: boolean },
): { passed: boolean; reasons: string[] } {
    const reasons: string[] = [];

    if (compare.failed !== 0) {
        reasons.push(`failed_must_be_zero(actual=${compare.failed})`);
    }

    const requiredFields = options.requireRemark ? ['group_name', 'remark'] : ['group_name'];
    for (const field of requiredFields) {
        const row = compare.rows.find((r) => r.inputPath === field);
        if (!row) {
            reasons.push(`required_field_missing_row(${field})`);
            continue;
        }
        if (row.status !== 'passed') {
            reasons.push(`required_field_not_passed(${field}:${row.status}${row.reason ? `:${row.reason}` : ''})`);
        }
    }

    return {
        passed: reasons.length === 0,
        reasons,
    };
}

async function ensureReusableCleanupGroupId(client: McpTestClient, tombstoneName: string): Promise<string> {
    const existing = await getGroupRecordByName(client, tombstoneName);
    const existingId = existing.record?.group_id;
    if (existingId != null) {
        return String(existingId);
    }

    await client.callTool('create-group', {
        group_name: tombstoneName,
        remark: 'e2e-cleanup-tombstone',
    });
    const created = await getGroupRecordByName(client, tombstoneName);
    const createdId = created.record?.group_id;
    if (createdId == null) {
        throw new Error(`group_id missing for tombstone group_name=${tombstoneName}`);
    }
    return String(createdId);
}

async function runCreateGroupCase(
    caseId: string,
    payload: { group_name: string; remark?: string },
    trackRemark: boolean,
): Promise<{ passed: boolean; details: string[] }> {
    const client = await createMcpClient();
    const ctx: GroupCtx = {
        client,
        groupName: payload.group_name,
        remark: payload.remark,
    };

    return runCase({
        name: caseId,
        prepare: async () => ctx as unknown as Record<string, unknown>,
        invoke: async (c) => {
            const x = c as unknown as GroupCtx;
            return x.client.callTool('create-group', payload);
        },
        assertState: async (_invoke, c) => {
            const x = c as unknown as GroupCtx;
            const list = await x.client.callTool('get-group-list', {
                group_name: x.groupName,
                page_size: 100,
            });
            const text = getToolTextContent(list);
            const ok = text.includes(x.groupName);
            if (ok && trackRemark && payload.remark !== undefined) {
                markOptionalParamCovered('create-group', 'remark');
            }
            return {
                passed: ok,
                details: ok
                    ? [`group_name=${x.groupName}`, payload.remark ? `remark=${payload.remark}` : '']
                          .filter(Boolean)
                    : [`group_name=${x.groupName}`, text.slice(0, 800)],
            };
        },
        cleanup: async (c) => {
            const x = c as unknown as GroupCtx;
            await x.client.close();
        },
    });
}

export async function caseGroupCreateBasic(): Promise<{ passed: boolean; details: string[] }> {
    const groupName = uniqueLabel('group');
    return runCreateGroupCase('group.create.basic', { group_name: groupName }, false);
}

export async function caseGroupCreateWithRemark(): Promise<{ passed: boolean; details: string[] }> {
    const groupName = uniqueLabel('group');
    return runCreateGroupCase(
        'group.create.withRemark',
        { group_name: groupName, remark: 'e2e-remark' },
        true,
    );
}

export async function caseGroupCreateRoundtripFullOptionalSubset(): Promise<{
    passed: boolean;
    details: string[];
}> {
    const client = await createMcpClient();
    const groupName = uniqueLabel('group-create');
    const remark = uniqueLabel('group-create-remark');
    const created = { group_name: groupName, remark };
    const ctx: GroupCtx = { client, groupName, remark };

    return runCase({
        name: 'group.create.roundtrip.full-optional-subset',
        prepare: async () => ctx as unknown as Record<string, unknown>,
        invoke: async (c) => {
            const x = c as unknown as GroupCtx;
            return x.client.callTool('create-group', created);
        },
        assertState: async (_res, c) => {
            const x = c as unknown as GroupCtx;
            const list = await getGroupRecordByName(x.client, x.groupName);
            if (!list.record) {
                return {
                    passed: false,
                    details: [`group_name=${x.groupName}`, 'record_missing_after_create', list.rawText.slice(0, 800)],
                };
            }
            x.groupId = String(list.record.group_id ?? '');
            const compare = compareInputAgainstReadbackB(created, list.record);
            const gate = isGroupRoundtripCompareAcceptable(compare, { requireRemark: true });
            return {
                passed: gate.passed,
                details: [
                    `group_id=${x.groupId ?? 'unknown'}`,
                    `compareB: passed=${compare.passed} failed=${compare.failed} skipped=${compare.skipped}`,
                    ...gate.reasons,
                    ...formatCompareRows(compare.rows),
                ],
            };
        },
        cleanup: async (c) => {
            await (c as unknown as GroupCtx).client.close();
        },
    });
}

export async function caseGroupUpdateRoundtripFullOptionalSubset(): Promise<{
    passed: boolean;
    details: string[];
}> {
    const client = await createMcpClient();
    const createdName = uniqueLabel('group-before-update');
    const updatedName = uniqueLabel('group-after-update');
    const createdRemark = uniqueLabel('group-before-remark');
    const updatedRemark = uniqueLabel('group-after-remark');
    const ctx: GroupCtx = {
        client,
        groupName: createdName,
        updatedGroupName: updatedName,
        remark: updatedRemark,
    };

    return runCase({
        name: 'group.update.roundtrip.full-optional-subset',
        prepare: async () => ctx as unknown as Record<string, unknown>,
        invoke: async (c) => {
            const x = c as unknown as GroupCtx;
            await x.client.callTool('create-group', { group_name: x.groupName, remark: createdRemark });
            const listAfterCreate = await getGroupRecordByName(x.client, x.groupName);
            const groupId = listAfterCreate.record?.group_id;
            if (groupId == null) {
                throw new Error(`group_id missing for group_name=${x.groupName}`);
            }
            x.groupId = String(groupId);
            return x.client.callTool('update-group', {
                group_id: x.groupId,
                group_name: x.updatedGroupName,
                remark: x.remark,
            });
        },
        assertState: async (_res, c) => {
            const x = c as unknown as GroupCtx;
            const list = await getGroupRecordByName(x.client, x.updatedGroupName ?? '');
            if (!list.record) {
                return {
                    passed: false,
                    details: [
                        `group_id=${x.groupId ?? 'unknown'}`,
                        `group_name=${x.updatedGroupName ?? ''}`,
                        'record_missing_after_update',
                        list.rawText.slice(0, 800),
                    ],
                };
            }
            const compare = compareInputAgainstReadbackB(
                { group_name: x.updatedGroupName, remark: x.remark },
                list.record,
            );
            const gate = isGroupRoundtripCompareAcceptable(compare, { requireRemark: true });
            return {
                passed: gate.passed,
                details: [
                    `group_id=${x.groupId ?? 'unknown'}`,
                    `compareB: passed=${compare.passed} failed=${compare.failed} skipped=${compare.skipped}`,
                    ...gate.reasons,
                    ...formatCompareRows(compare.rows),
                ],
            };
        },
        cleanup: async (c) => {
            await (c as unknown as GroupCtx).client.close();
        },
    });
}

export async function caseGroupCleanupVisibility(): Promise<{ passed: boolean; details: string[] }> {
    const client = await createMcpClient();
    const originalName = uniqueLabel('group-cleanup-origin');
    const cleanupName = GROUP_CLEANUP_TOMBSTONE_NAME;
    const ctx: GroupCtx = {
        client,
        groupName: originalName,
        updatedGroupName: cleanupName,
    };

    return runCase({
        name: 'group.cleanup.visibility',
        prepare: async () => ctx as unknown as Record<string, unknown>,
        invoke: async (c) => {
            const x = c as unknown as GroupCtx;
            x.groupId = await ensureReusableCleanupGroupId(x.client, x.updatedGroupName ?? cleanupName);
            await x.client.callTool('update-group', {
                group_id: x.groupId,
                group_name: x.groupName,
                remark: uniqueLabel('to-clean'),
            });
            return x.client.callTool('update-group', {
                group_id: x.groupId,
                group_name: x.updatedGroupName,
                remark: null,
            });
        },
        assertState: async (_res, c) => {
            const x = c as unknown as GroupCtx;
            const oldList = await getGroupRecordByName(x.client, x.groupName);
            const invisible = !oldList.record;
            const newList = await getGroupRecordByName(x.client, x.updatedGroupName ?? '');
            const cleanupVisible = !!newList.record;
            return {
                passed: invisible && cleanupVisible,
                details: invisible && cleanupVisible
                    ? [
                          `group_id=${x.groupId ?? 'unknown'}`,
                          `cleanup_group_name=${x.updatedGroupName ?? cleanupName}`,
                          'old_name_not_found_after_cleanup',
                      ]
                    : [
                          `group_id=${x.groupId ?? 'unknown'}`,
                          `old_name_visible=${String(!invisible)}`,
                          `cleanup_name_visible=${String(cleanupVisible)}`,
                          oldList.rawText.slice(0, 500),
                      ],
            };
        },
        cleanup: async (c) => {
            const x = c as unknown as GroupCtx;
            try {
                if (x.groupId && x.updatedGroupName) {
                    await x.client.callTool('update-group', {
                        group_id: x.groupId,
                        group_name: x.updatedGroupName,
                        remark: null,
                    });
                }
            } finally {
                await x.client.close();
            }
        },
    });
}

export const groupCases = {
    'group.create.basic': caseGroupCreateBasic,
    'group.create.withRemark': caseGroupCreateWithRemark,
    'group.create.roundtrip.full-optional-subset': caseGroupCreateRoundtripFullOptionalSubset,
    'group.update.roundtrip.full-optional-subset': caseGroupUpdateRoundtripFullOptionalSubset,
    'group.cleanup.visibility': caseGroupCleanupVisibility,
};
