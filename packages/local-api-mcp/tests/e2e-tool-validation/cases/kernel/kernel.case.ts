import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { runCase } from '../../runner/caseRunner.js';
import { createMcpClient } from '../../runner/mcpClient.js';
import { getToolTextContent } from '../../runner/toolResultText.js';
import type { CaseRunResult } from '../../types.js';
import type { McpTestClient } from '../../types.js';
import { extractJsonPayloadFromToolText } from '../../assertions/roundtrip/jsonExtractors.js';

type Ctx = { client: McpTestClient };

const KERNEL_DOWNLOAD_ENV = 'ADSP_MCP_E2E_ENABLE_DOWNLOAD_KERNEL';
const KERNEL_FAIL_CLOSED_KEYWORDS = ['failed', 'error', 'timeout', 'exception'];

function blocked(reason: string): CaseRunResult {
    return { passed: true, details: [`blocked:${reason}`] };
}

function isKernelFailClosedText(text: string): boolean {
    const lower = text.toLowerCase();
    return KERNEL_FAIL_CLOSED_KEYWORDS.some((kw) => lower.includes(kw));
}

function toKernelRows(payload: unknown): Array<Record<string, unknown>> {
    if (Array.isArray(payload)) {
        return payload.filter(
            (row): row is Record<string, unknown> =>
                typeof row === 'object' && row !== null && !Array.isArray(row),
        );
    }
    if (typeof payload !== 'object' || payload === null) {
        return [];
    }
    const maybeList = (payload as { list?: unknown }).list;
    if (!Array.isArray(maybeList)) {
        return [];
    }
    return maybeList.filter(
        (row): row is Record<string, unknown> =>
            typeof row === 'object' && row !== null && !Array.isArray(row),
    );
}

function evaluateKernelListChrome(text: string): CaseRunResult {
    if (isKernelFailClosedText(text)) {
        return { passed: false, details: ['fail_closed_keyword_detected', text.slice(0, 400)] };
    }
    try {
        const payload = extractJsonPayloadFromToolText(text);
        const rows = toKernelRows(payload);
        const hasChrome = rows.some((row) => String(row.kernel_type ?? '').toLowerCase() === 'chrome');
        if (!hasChrome) {
            return { passed: false, details: ['kernel_type_chrome_not_found', text.slice(0, 400)] };
        }
        return { passed: true, details: ['kernel_type=Chrome'] };
    } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        return {
            passed: false,
            details: [`kernel_payload_parse_failed:${reason}`, text.slice(0, 400)],
        };
    }
}

export async function caseKernelListChrome(): Promise<CaseRunResult> {
    const client = await createMcpClient();

    return runCase({
        name: 'kernel.list.chrome',
        prepare: async () => ({ client } as unknown as Record<string, unknown>),
        invoke: async (ctx) => {
            const c = (ctx as unknown as Ctx).client;
            return c.callTool('get-kernel-list', { kernel_type: 'Chrome' });
        },
        assertState: async (invokeRes) => {
            const text = getToolTextContent(invokeRes as CallToolResult);
            return evaluateKernelListChrome(text);
        },
        cleanup: async (ctx) => {
            await (ctx as unknown as Ctx).client.close();
        },
    });
}

export async function caseKernelDownloadMinimal(): Promise<CaseRunResult> {
    const client = await createMcpClient();

    return runCase({
        name: 'kernel.download.minimal',
        prepare: async () => ({ client } as unknown as Record<string, unknown>),
        invoke: async (ctx) => {
            const c = (ctx as unknown as Ctx).client;
            if (process.env[KERNEL_DOWNLOAD_ENV] !== '1') {
                return blocked(`download_kernel_disabled_${KERNEL_DOWNLOAD_ENV}`);
            }
            return c.callTool('download-kernel', {
                kernel_type: 'Chrome',
                kernel_version: 'latest',
            });
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
                details: passed
                    ? ['kernel_type=Chrome', 'kernel_version=latest']
                    : [text.slice(0, 500)],
            };
        },
        cleanup: async (ctx) => {
            await (ctx as unknown as Ctx).client.close();
        },
    });
}

export const kernelCases: Record<string, () => Promise<CaseRunResult>> = {
    'kernel.list.chrome': caseKernelListChrome,
    'kernel.download.minimal': caseKernelDownloadMinimal,
};

export const __kernelCaseInternals = {
    evaluateKernelListChrome,
};
