import { afterEach, describe, expect, it, vi } from 'vitest';
import axios from 'axios';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { rpaLocalTools, updateConfig } from '@adspower/local-api-core';
import { CONFIG } from '../../core/src/constants/config';
import { registerTools } from '../src/utils/toolRegister';

vi.mock('axios', () => ({ default: {
    post: vi.fn(), get: vi.fn(),
    create: () => ({ interceptors: { request: { use: vi.fn() } } }),
} }));

const initialRpaPort = CONFIG.rpaPort;
afterEach(() => {
    vi.clearAllMocks();
    updateConfig(undefined, undefined, initialRpaPort);
});

function setup() {
    const server = new McpServer({ name: 'rpa-test', version: '1.0.0' });
    registerTools(server);
    const handlers = (server.server as any)._requestHandlers as Map<string, Function>;
    return {
        list: () => handlers.get('tools/list')!({ method: 'tools/list' }, {}),
        call: (name: string, args: unknown) => handlers.get('tools/call')!({
            method: 'tools/call', params: { name, arguments: args },
        }, {}),
    };
}

describe('RPA local MCP registration', () => {
    it('lists all 26 local tools with unique names and excludes unrequested endpoints', async () => {
        const { list } = setup();
        const result = await list();
        const local = result.tools.filter((tool: any) => rpaLocalTools.some(definition => tool.name === `rpa-${definition.name}`));
        expect(local).toHaveLength(26);
        expect(new Set(result.tools.map((tool: any) => tool.name)).size).toBe(result.tools.length);
        expect(local.map((tool: any) => tool.name)).toEqual(rpaLocalTools.map(tool => `rpa-${tool.name}`));
        for (const tool of local) {
            expect(tool.inputSchema.type).toBe('object');
            expect(tool.description).toBe(rpaLocalTools.find(definition => tool.name === `rpa-${definition.name}`)?.description);
        }
        expect(local.some((tool: any) => /status|download|callback/.test(tool.name))).toBe(false);
        expect(local.find((tool: any) => tool.name === 'rpa-get-task-log').annotations.readOnlyHint).toBe(true);
        expect(local.find((tool: any) => tool.name === 'rpa-delete-record').annotations.destructiveHint).toBe(true);
    });

    it('preserves full schema refinements when validating MCP calls', async () => {
        const { call } = setup();
        await expect(call('rpa-get-task-execute-items-count', {})).rejects.toThrow('task_id/process_id');
        await expect(call('rpa-update-rpa-config', { thread: '101' })).rejects.toThrow('Invalid arguments');
        await expect(call('rpa-google-sheets', { sheetId: 'id', sheetName: 'Sheet1', type: 'write' })).rejects.toThrow('template');
        await expect(call('rpa-cancel-task-items', { task_id: '1' })).rejects.toThrow('Invalid arguments');
        expect(axios.post).not.toHaveBeenCalled();
    });

    it('uses configured RPA port and returns text content through tools/call', async () => {
        updateConfig(undefined, undefined, '20508');
        vi.mocked(axios.get).mockResolvedValue({ data: { code: 0, data: { thread: '3' } } });
        const result = await setup().call('rpa-get-rpa-config', {});
        expect(JSON.parse(result.content[0].text)).toEqual({ thread: '3' });
        expect(axios.get).toHaveBeenCalledWith('http://127.0.0.1:20508/api/rpav2/getConfig',
            { params: { keys: 'thread' }, timeout: 30000, proxy: false });
    });

    it('marks service failures as MCP errors', async () => {
        vi.mocked(axios.post).mockResolvedValue({ data: { code: -1, msg: 'TASK_NOT_FOUND' } });
        const result = await setup().call('rpa-delete-record', { id: '42' });
        expect(result.isError).toBe(true);
        expect(result.content[0].text).toBe('TASK_NOT_FOUND');
    });
});

it('returns the submitted execution ID and supports cancelling only that execution', async () => {
    updateConfig(undefined, undefined, '20508');
    const { call } = setup();
    vi.mocked(axios.post).mockResolvedValue({ data: { code: 0, data: { record_id: '42' } } });
    const submission = await call('rpa-add-task', { task_id: '123' });
    expect(JSON.parse(submission.content[0].text)).toEqual({ record_id: '42' });
    expect(axios.post).toHaveBeenCalledWith('http://127.0.0.1:20508/api/rpav2/task/add',
        { task_id: '123' }, { timeout: 30000, proxy: false });
    vi.mocked(axios.post).mockResolvedValue({ data: { code: 0, data: {} } });
    await call('rpa-cancel-task', { record_id: '42' });
    expect(axios.post).toHaveBeenCalledWith('http://127.0.0.1:20508/api/rpav2/task/cancel',
        { record_id: '42' }, { timeout: 30000, proxy: false });
    await expect(call('rpa-cancel-task', { task_id: '123', record_id: '42' })).rejects.toThrow('exactly one');
});
