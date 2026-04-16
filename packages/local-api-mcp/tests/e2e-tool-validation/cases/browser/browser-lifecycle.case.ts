import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { uniqueLabel } from '../../fixtures/resourceFactory.js';
import { runCase } from '../../runner/caseRunner.js';
import { createMcpClient } from '../../runner/mcpClient.js';
import { getToolTextContent } from '../../runner/toolResultText.js';
import type { CaseRunResult, McpTestClient } from '../../types.js';
import { extractJsonPayloadFromToolText } from '../../assertions/roundtrip/jsonExtractors.js';

type LifecycleCtx = {
    client: McpTestClient;
    profileId: string;
};

type OpenedObservation = {
    parseOk: boolean;
    containsProfile: boolean;
    parseErrorSummary?: string;
    observedSummary: string;
};

type PollOutcome = {
    reachedExpectedState: boolean;
    attempts: number;
    lastObservation: OpenedObservation;
};

function parseProfileIdFromCreateText(text: string): string | null {
    const m = text.match(/profile_id:\s*([^\s\n]+)/i);
    return m?.[1] ?? null;
}

function maybeObject(v: unknown): v is Record<string, unknown> {
    return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function payloadContainsProfileId(payload: unknown, profileId: string): boolean {
    if (Array.isArray(payload)) {
        return payload.some((item) => payloadContainsProfileId(item, profileId));
    }
    if (!maybeObject(payload)) {
        return false;
    }
    if (String(payload.profile_id ?? '') === profileId || String(payload.user_id ?? '') === profileId) {
        return true;
    }
    return Object.values(payload).some((child) => payloadContainsProfileId(child, profileId));
}

function summarizeOneLine(value: string, max = 220): string {
    const compact = value.replace(/\s+/g, ' ').trim();
    return compact.length <= max ? compact : `${compact.slice(0, max)}...`;
}

function summarizeParseError(err: unknown): string {
    const message = err instanceof Error ? err.message : String(err);
    return summarizeOneLine(message, 160);
}

export function __buildOpenedObservationFromText(text: string, profileId: string): OpenedObservation {
    try {
        const payload = extractJsonPayloadFromToolText(text);
        return {
            parseOk: true,
            containsProfile: payloadContainsProfileId(payload, profileId),
            observedSummary: summarizeOneLine(text),
        };
    } catch (err) {
        return {
            parseOk: false,
            containsProfile: false,
            parseErrorSummary: summarizeParseError(err),
            observedSummary: summarizeOneLine(text),
        };
    }
}

async function getOpenedObservation(client: McpTestClient, profileId: string): Promise<OpenedObservation> {
    const openedRes = await client.callTool('get-opened-browser', {});
    const openedText = getToolTextContent(openedRes as CallToolResult);
    return __buildOpenedObservationFromText(openedText, profileId);
}

async function sleep(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
}

async function pollOpenedState(
    client: McpTestClient,
    profileId: string,
    expectedOpen: boolean,
    attempts = 4,
    intervalMs = 500,
): Promise<PollOutcome> {
    let lastObservation: OpenedObservation = {
        parseOk: false,
        containsProfile: false,
        parseErrorSummary: 'no_observation',
        observedSummary: '',
    };

    for (let i = 1; i <= attempts; i += 1) {
        const observation = await getOpenedObservation(client, profileId);
        lastObservation = observation;
        const matched = observation.parseOk && observation.containsProfile === expectedOpen;
        if (matched) {
            return {
                reachedExpectedState: true,
                attempts: i,
                lastObservation: observation,
            };
        }
        if (i < attempts) {
            await sleep(intervalMs);
        }
    }

    return {
        reachedExpectedState: false,
        attempts,
        lastObservation,
    };
}

async function createProfileForLifecycle(client: McpTestClient): Promise<string> {
    const createRes = await client.callTool('create-browser', {
        group_id: '0',
        name: uniqueLabel('lifecycle-profile'),
    });
    const createText = getToolTextContent(createRes as CallToolResult);
    const profileId = parseProfileIdFromCreateText(createText);
    if (!profileId) {
        throw new Error(`Could not parse profile_id from create-browser: ${createText.slice(0, 500)}`);
    }
    return profileId;
}

export async function caseLifecycleOpenBrowserHeadless(): Promise<CaseRunResult> {
    const client = await createMcpClient();
    const ctx: LifecycleCtx = { client, profileId: '' };
    return runCase({
        name: 'lifecycle.open-browser.headless',
        prepare: async () => ctx as unknown as Record<string, unknown>,
        invoke: async (c) => {
            const x = c as unknown as LifecycleCtx;
            x.profileId = await createProfileForLifecycle(x.client);
            return x.client.callTool('open-browser', {
                profile_id: x.profileId,
                headless: '1',
            });
        },
        assertState: async (_res, c) => {
            const x = c as unknown as LifecycleCtx;
            const polled = await pollOpenedState(x.client, x.profileId, true);
            const opened = polled.reachedExpectedState;
            const parseDiag = polled.lastObservation.parseOk
                ? 'parse_ok'
                : `parse_error=${polled.lastObservation.parseErrorSummary ?? 'unknown'}`;
            return {
                passed: opened,
                details: opened
                    ? [
                          `profile_id=${x.profileId}`,
                          `poll_attempts=${polled.attempts}`,
                          'opened_visible_in_get-opened-browser',
                          parseDiag,
                          `last_observation=${polled.lastObservation.observedSummary}`,
                      ]
                    : [
                          `profile_id=${x.profileId}`,
                          `poll_attempts=${polled.attempts}`,
                          'opened_not_visible_in_get-opened-browser',
                          parseDiag,
                          `last_observation=${polled.lastObservation.observedSummary}`,
                      ],
            };
        },
        cleanup: async (c) => {
            const x = c as unknown as LifecycleCtx;
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

export async function caseLifecycleCloseBrowserVisibility(): Promise<CaseRunResult> {
    const client = await createMcpClient();
    const ctx: LifecycleCtx = { client, profileId: '' };
    return runCase({
        name: 'lifecycle.close-browser.visibility',
        prepare: async () => ctx as unknown as Record<string, unknown>,
        invoke: async (c) => {
            const x = c as unknown as LifecycleCtx;
            x.profileId = await createProfileForLifecycle(x.client);
            await x.client.callTool('open-browser', {
                profile_id: x.profileId,
                headless: '1',
            });
            return x.client.callTool('close-browser', { profile_id: x.profileId });
        },
        assertState: async (_res, c) => {
            const x = c as unknown as LifecycleCtx;
            const polled = await pollOpenedState(x.client, x.profileId, false);
            const closed = polled.reachedExpectedState;
            const parseDiag = polled.lastObservation.parseOk
                ? 'parse_ok'
                : `parse_error=${polled.lastObservation.parseErrorSummary ?? 'unknown'}`;
            return {
                passed: closed,
                details: closed
                    ? [
                          `profile_id=${x.profileId}`,
                          `poll_attempts=${polled.attempts}`,
                          'closed_not_present_in_get-opened-browser',
                          parseDiag,
                          `last_observation=${polled.lastObservation.observedSummary}`,
                      ]
                    : [
                          `profile_id=${x.profileId}`,
                          `poll_attempts=${polled.attempts}`,
                          'close_expected_but_still_present_in_get-opened-browser',
                          parseDiag,
                          `last_observation=${polled.lastObservation.observedSummary}`,
                      ],
            };
        },
        cleanup: async (c) => {
            const x = c as unknown as LifecycleCtx;
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

export async function caseLifecycleCloseAllProfilesGlobal(): Promise<CaseRunResult> {
    const client = await createMcpClient();
    const ctx: LifecycleCtx = { client, profileId: '' };
    return runCase({
        name: 'lifecycle.close-all-profiles.global',
        prepare: async () => ctx as unknown as Record<string, unknown>,
        invoke: async (c) => {
            const x = c as unknown as LifecycleCtx;
            x.profileId = await createProfileForLifecycle(x.client);
            await x.client.callTool('open-browser', {
                profile_id: x.profileId,
                headless: '1',
            });
            return x.client.callTool('close-all-profiles', {});
        },
        assertState: async (_res, c) => {
            const x = c as unknown as LifecycleCtx;
            const polled = await pollOpenedState(x.client, x.profileId, false);
            const closed = polled.reachedExpectedState;
            const parseDiag = polled.lastObservation.parseOk
                ? 'parse_ok'
                : `parse_error=${polled.lastObservation.parseErrorSummary ?? 'unknown'}`;
            return {
                passed: closed,
                details: closed
                    ? [
                          `profile_id=${x.profileId}`,
                          `poll_attempts=${polled.attempts}`,
                          'close_all_cleared_profile_from_get-opened-browser',
                          parseDiag,
                          `last_observation=${polled.lastObservation.observedSummary}`,
                      ]
                    : [
                          `profile_id=${x.profileId}`,
                          `poll_attempts=${polled.attempts}`,
                          'close_all_expected_but_profile_still_opened',
                          parseDiag,
                          `last_observation=${polled.lastObservation.observedSummary}`,
                      ],
            };
        },
        cleanup: async (c) => {
            const x = c as unknown as LifecycleCtx;
            try {
                await x.client.callTool('close-all-profiles', {});
                if (x.profileId) {
                    await x.client.callTool('delete-browser', { profile_id: [x.profileId] });
                }
            } finally {
                await x.client.close();
            }
        },
    });
}

export const browserLifecycleCases: Record<string, () => Promise<CaseRunResult>> = {
    'lifecycle.open-browser.headless': caseLifecycleOpenBrowserHeadless,
    'lifecycle.close-browser.visibility': caseLifecycleCloseBrowserVisibility,
    'lifecycle.close-all-profiles.global': caseLifecycleCloseAllProfilesGlobal,
};
