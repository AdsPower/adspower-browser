import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import type { McpTestClient } from '../types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Repo root (`local-api-mcp-typescript`): five levels up from `runner/`. */
const REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..', '..');

/** MCP SDK 默认只继承 PATH/HOME 等白名单，不含 `PORT`/`API_KEY`，会导致子进程仍走默认 50326。 */
function mcpChildEnv(): Record<string, string> {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(process.env)) {
        if (v !== undefined) {
            out[k] = v;
        }
    }
    return out;
}

export async function createMcpClient(): Promise<McpTestClient> {
    const transport = new StdioClientTransport({
        command: 'node',
        args: ['packages/local-api-mcp/build/index.js'],
        cwd: REPO_ROOT,
        env: mcpChildEnv(),
    });
    const client = new Client({ name: 'e2e-contract-tests', version: '1.0.0' });
    await client.connect(transport);

    return {
        async listTools() {
            const result = await client.listTools();
            return result.tools;
        },
        callTool(name, args) {
            return client.callTool({ name, arguments: args ?? {} });
        },
        async close() {
            await client.close();
        },
    };
}
