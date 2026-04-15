import type { CallToolResult, Tool } from '@modelcontextprotocol/sdk/types.js';

export type ToolCaseResultStatus = 'passed' | 'failed' | 'blocked';

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
