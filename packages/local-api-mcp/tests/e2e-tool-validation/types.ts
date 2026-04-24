import type { CallToolResult, Tool } from '@modelcontextprotocol/sdk/types.js';

export type ToolCaseResultStatus = 'passed' | 'failed' | 'blocked';

/** Result of a registered e2e case (`runOneCase`). */
export type CaseRunResult = { passed: boolean; details: string[] };

/** Stdio MCP client used by e2e contract tests (see `runner/mcpClient.ts`). */
export interface McpTestClient {
    listTools(): Promise<Tool[]>;
    callTool(name: string, args?: Record<string, unknown>): Promise<CallToolResult>;
    close(): Promise<void>;
}

export interface E2EEnv {
    enabled: boolean;
    localApiBaseUrl: string;
    timeoutMs: number;
    retryCount: number;
}

/** Per-tool parameter coverage: minimal positive-case keys + full optional key set from Zod. */
export interface ToolMatrixEntry {
    requiredMin: string[];
    optionalAll: string[];
}
