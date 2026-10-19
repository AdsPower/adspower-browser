import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTools } from '../src/utils/toolRegister.js';

const MEMBER_TOOLS = [
    'create-member',
    'update-member',
    'reset-member-password',
    'delete-member',
    'get-member-list',
    'get-member-group-list',
] as const;

function textOf(result: { content?: Array<{ type: string; text?: string }> }): string {
    return (result.content ?? [])
        .filter((item) => item.type === 'text' && typeof item.text === 'string')
        .map((item) => item.text as string)
        .join('\n');
}

function parseJson(text: string): any {
    return JSON.parse(text);
}

describe.skipIf(process.env.ADSP_MCP_E2E_ENABLED !== '1')('live MCP member tools against Local API', () => {
    let handlers: Map<string, Function>;
    let createdUserId: string | undefined;
    const stamp = Date.now();
    const testEmail = `mcp${stamp}@d20qb5a.adspower.com`;

    async function callTool(name: string, args: Record<string, unknown> = {}) {
        const result = await handlers.get('tools/call')?.(
            { method: 'tools/call', params: { name, arguments: args } },
            {},
        );
        return { result, text: textOf(result) };
    }

    beforeAll(async () => {
        const status = await fetch('http://127.0.0.1:50325/status');
        const body = await status.json();
        expect(body.code, `Local API /status failed: ${JSON.stringify(body)}`).toBe(0);

        const server = new McpServer({ name: 'member-live', version: '0.0.0' });
        registerTools(server);
        handlers = (server.server as any)._requestHandlers as Map<string, Function>;
    });

    afterAll(async () => {
        if (!createdUserId || !handlers) {
            return;
        }
        await callTool('delete-member', { user_id: createdUserId }).catch(() => undefined);
    });

    it('lists all six member tools on tools/list', async () => {
        const listed = await handlers.get('tools/list')?.({ method: 'tools/list' }, {});
        const names = listed.tools.map((tool: { name: string }) => tool.name);
        expect(names).toEqual(expect.arrayContaining([...MEMBER_TOOLS]));
    });

    it('check-status succeeds through MCP', async () => {
        const { text } = await callTool('check-status');
        expect(text.toLowerCase()).not.toMatch(/not found|econnrefused|failed to/);
    });

    it('get-member-group-list returns groups', async () => {
        const { text } = await callTool('get-member-group-list', { page: 1, limit: 5 });
        const data = parseJson(text);
        expect(Array.isArray(data.list), text).toBe(true);
        expect(data.list.length).toBeGreaterThan(0);
        expect(data.list[0]).toHaveProperty('user_group_id');
    });

    it('get-member-list returns members', async () => {
        const { text } = await callTool('get-member-list', { page: 1, limit: 5 });
        const data = parseJson(text);
        expect(Array.isArray(data.list), text).toBe(true);
        expect(data.list.length).toBeGreaterThan(0);
        expect(data.list[0]).toHaveProperty('user_id');
        expect(data.list[0]).toHaveProperty('identity');
        expect(data.list[0]).toHaveProperty('email_editable');
    });

    it('create / update / reset_password / delete roundtrip', async () => {
        const groups = parseJson((await callTool('get-member-group-list', { page: 1, limit: 5 })).text);
        const userGroupId = groups.list[0].user_group_id;

        const created = await callTool('create-member', {
            user_group_id: String(userGroupId),
            email: testEmail,
            password: 'McpTest12',
            identity: 4,
            name: `mcp-live-${stamp}`,
        });

        let payload: any;
        try {
            payload = parseJson(created.text);
        } catch {
            throw new Error(`create-member did not return JSON: ${created.text}`);
        }

        createdUserId = payload.user_id || payload.id || payload.userId;
        expect(createdUserId, `create-member missing user_id: ${created.text}`).toBeTruthy();

        const updated = await callTool('update-member', {
            user_id: createdUserId,
            remark: `mcp-updated-${stamp}`,
        });
        expect(updated.text.toLowerCase()).not.toMatch(/not found|is required|failed/);

        const listed = parseJson(
            (await callTool('get-member-list', { user_id: [createdUserId], page: 1, limit: 5 })).text,
        );
        const row = listed.list.find((item: { user_id: string }) => item.user_id === createdUserId);
        expect(row, `created member not in list: ${JSON.stringify(listed)}`).toBeTruthy();
        expect(row.remark).toBe(`mcp-updated-${stamp}`);

        const reset = await callTool('reset-member-password', { user_id: createdUserId });
        let resetPayload: any;
        try {
            resetPayload = parseJson(reset.text);
        } catch {
            throw new Error(`reset-member-password did not return JSON: ${reset.text}`);
        }
        expect(resetPayload.new_password, reset.text).toBeTruthy();

        const deleted = await callTool('delete-member', { user_id: createdUserId });
        expect(deleted.text.toLowerCase()).not.toMatch(/not found|failed/);
        createdUserId = undefined;
    });
});
