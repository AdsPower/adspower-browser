import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import type { McpTestClient } from '../types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Repo root (`local-api-mcp-typescript`): five levels up from `runner/`. */
const REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..', '..');

export async function createMcpClient(): Promise<McpTestClient> {
    const transport = new StdioClientTransport({
        command: 'node',
        args: ['packages/local-api-mcp/build/index.js'],
        cwd: REPO_ROOT,
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
