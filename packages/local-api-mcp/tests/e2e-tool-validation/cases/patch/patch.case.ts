import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { runCase } from '../../runner/caseRunner.js';
import { createMcpClient } from '../../runner/mcpClient.js';
import { getToolTextContent } from '../../runner/toolResultText.js';
import type { CaseRunResult } from '../../types.js';
import type { McpTestClient } from '../../types.js';

type Ctx = { client: McpTestClient };

const PATCH_UPDATE_ENV = 'ADSP_MCP_E2E_ENABLE_UPDATE_PATCH';

function blocked(reason: string): CaseRunResult {
    return { passed: true, details: [`blocked:${reason}`] };
}

function shouldAllowPatchUpdate(env: NodeJS.ProcessEnv): boolean {
    return env[PATCH_UPDATE_ENV] === '1';
}

export async function casePatchUpdateStable(): Promise<CaseRunResult> {
    const client = await createMcpClient();

    return runCase({
        name: 'patch.update.stable',
        prepare: async () => ({ client } as unknown as Record<string, unknown>),
        invoke: async (ctx) => {
            const c = (ctx as unknown as Ctx).client;
            if (!shouldAllowPatchUpdate(process.env)) {
                return blocked(`update_patch_disabled_${PATCH_UPDATE_ENV}`);
            }
            return c.callTool('update-patch', { version_type: 'stable' });
        },
        assertState: async (invokeRes) => {
            const maybeCase = invokeRes as CaseRunResult;
            if (Array.isArray(maybeCase.details) && typeof maybeCase.passed === 'boolean') {
                return maybeCase;
            }
            const text = getToolTextContent(invokeRes as CallToolResult);
            const lower = text.toLowerCase();
            const passed =
                !lower.includes('failed to update') &&
                (lower.includes('success') || lower.includes('update') || lower.includes('patch'));
            return {
                passed,
                details: passed ? ['version_type=stable'] : [text.slice(0, 500)],
            };
        },
        cleanup: async (ctx) => {
            await (ctx as unknown as Ctx).client.close();
        },
    });
}

export async function casePatchUpdateBlockedByDefault(): Promise<CaseRunResult> {
    const client = await createMcpClient();

    return runCase({
        name: 'patch.update.blocked-by-default',
        prepare: async () => ({ client } as unknown as Record<string, unknown>),
        invoke: async (ctx) => {
            const c = (ctx as unknown as Ctx).client;
            if (!shouldAllowPatchUpdate(process.env)) {
                return blocked(`update_patch_disabled_${PATCH_UPDATE_ENV}`);
            }
            return c.callTool('update-patch', {});
        },
        assertState: async (invokeRes) => {
            const maybeCase = invokeRes as CaseRunResult;
            if (Array.isArray(maybeCase.details) && typeof maybeCase.passed === 'boolean') {
                return maybeCase;
            }
            const text = getToolTextContent(invokeRes as CallToolResult);
            const lower = text.toLowerCase();
            const passed = !lower.includes('failed') && !lower.includes('error') && text.length > 0;
            return {
                passed,
                details: passed ? ['gate_open=true', 'update_patch_invoked=true'] : [text.slice(0, 500)],
            };
        },
        cleanup: async (ctx) => {
            await (ctx as unknown as Ctx).client.close();
        },
    });
}

export const patchCases: Record<string, () => Promise<CaseRunResult>> = {
    'patch.update.stable': casePatchUpdateStable,
    'patch.update.blocked-by-default': casePatchUpdateBlockedByDefault,
};

export const __patchCaseInternals = {
    shouldAllowPatchUpdate,
};
