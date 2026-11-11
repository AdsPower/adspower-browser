import { afterEach, expect, it, vi } from 'vitest';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { DEFAULT_RPA_SETTINGS, rpaRemoteTools, rpaLocalTools } from '@adspower/local-api-core';
import { registerTools } from '../src/utils/toolRegister';
import { remoteCases } from '../../core/tests/fixtures/rpa-remote';
import { CONFIG, updateConfig } from '../../core/src/constants/config';

const client = vi.hoisted(() => ({
    get: vi.fn(), post: vi.fn(), defaults: { timeout: 0 }, interceptors: { request: { use: vi.fn() } },
}));
vi.mock('axios', () => ({ default: { create: vi.fn(() => client), get: vi.fn(), post: vi.fn() } }));
const initial = { ...CONFIG };
afterEach(() => { vi.clearAllMocks(); Object.assign(CONFIG, initial); });

function setup() {
    const server = new McpServer({ name: 'rpa-test', version: '1' });
    registerTools(server);
    const handlers = (server.server as any)._requestHandlers as Map<string, Function>;
    return {
        list: () => handlers.get('tools/list')!({ method: 'tools/list' }, {}),
        call: (name: string, args: unknown) => handlers.get('tools/call')!({
            method: 'tools/call', params: { name, arguments: args },
        }, {}),
    };
}

it('registers exactly the 26 supplied remote mappings alongside all 26 local tools', async () => {
    const listed = (await setup().list()).tools;
    const remote = listed.filter((tool: any) => rpaRemoteTools.some(definition => tool.name === `rpa-${definition.name}`));
    expect(remote.map((tool: any) => tool.name)).toEqual(rpaRemoteTools.map(tool => `rpa-${tool.name}`));
    expect(remote).toHaveLength(26);
    expect(listed.filter((tool: any) => rpaLocalTools.some(definition => tool.name === `rpa-${definition.name}`))).toHaveLength(26);
    expect(new Set(listed.map((tool: any) => tool.name)).size).toBe(listed.length);
    for (const tool of remote) {
        expect(tool.inputSchema.type).toBe('object');
        expect(tool.description).toBe(rpaRemoteTools.find(definition => tool.name === `rpa-${definition.name}`)?.description);
    }
});

it.each(remoteCases)('calls $name with the same runtime transport as browser tools', async (testCase) => {
    updateConfig('key', '50327', '20509');
    const request = testCase.method === 'GET' ? client.get : client.post;
    request.mockResolvedValue({ data: { code: 0, data: { id: '1' } } });
    const { call } = setup();
    const result = await call(testCase.name, testCase.params);
    expect(JSON.parse(result.content[0].text)).toEqual({ id: '1' });
    const url = `http://127.0.0.1:50327${testCase.path}`;
    const params = testCase.handler === 'createProcess'
        ? { ...testCase.params, allow_random_name: 1, remark: '', setting: JSON.stringify(DEFAULT_RPA_SETTINGS) } : testCase.params;
    expect(request).toHaveBeenCalledWith(url, testCase.method === 'GET' ? { params } : params);
});

it('reports backend errors and rejects invalid arguments before calling the runtime', async () => {
    const { call } = setup();
    await expect(call('rpa-delete-task', { task_id: '1' })).rejects.toThrow('Invalid arguments');
    expect(client.post).not.toHaveBeenCalled();
    client.post.mockResolvedValue({ data: { code: -1, msg: 'Task not found' } });
    const result = await call('rpa-delete-task', { ids: '1' });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe('Task not found');
});

it('advertises task defaults and applies them to minimal creation input', async () => {
    const { list, call } = setup();
    const tool = (await list()).tools.find((item: any) => item.name === 'rpa-create-task');
    expect(tool.inputSchema.required).toContain('fbcc_user_ids');
    for (const field of ['name', 'exec_type', 'exec_sort', 'exec_priority', 'schedule_rule']) {
        expect(tool.inputSchema.required).not.toContain(field);
    }
    await expect(call('rpa-create-task', { process_id: 1 })).rejects.toThrow('Invalid arguments');
    expect(client.post).not.toHaveBeenCalled();
    client.post.mockResolvedValue({ data: { code: 0, data: { id: '123' } } });
    const result = await call('rpa-create-task', { process_id: 1, fbcc_user_ids: '11,12' });
    expect(JSON.parse(result.content[0].text)).toEqual({ id: '123' });
    expect(client.post).toHaveBeenCalledTimes(1);
    expect(client.post.mock.calls[0][1]).toEqual({
        process_id: 1, fbcc_user_ids: '11,12', name: expect.stringMatching(/^RPA_TASK_\d+$/),
        exec_type: 1, exec_sort: 1, exec_priority: 0, schedule_rule: '{}',
    });
});

it('exposes remote tools through a real MCP client/server transport', async () => {
    const { Client } = await import('@modelcontextprotocol/sdk/client/index.js');
    const { InMemoryTransport } = await import('@modelcontextprotocol/sdk/inMemory.js');
    const server = new McpServer({ name: 'transport-test', version: '1' });
    registerTools(server);
    const mcpClient = new Client({ name: 'test-client', version: '1' });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    try {
        await Promise.all([server.connect(serverTransport), mcpClient.connect(clientTransport)]);
        const listed = await mcpClient.listTools();
        expect(listed.tools.filter(tool => rpaRemoteTools.some(definition => tool.name === `rpa-${definition.name}`))).toHaveLength(26);
        client.get.mockResolvedValue({ data: { code: 0, data: { list: [] } } });
        const result = await mcpClient.callTool({ name: 'rpa-get-process-list', arguments: {} });
        const content = result.content as Array<{ type: string; text: string }>;
        expect(JSON.parse(content[0].text)).toEqual({ list: [] });
    } finally {
        await mcpClient.close();
        await server.close();
    }
});
