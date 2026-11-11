import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import axios from 'axios';
import { CONFIG, updateConfig } from '../src/constants/config';
import { rpaRemoteHandlers } from '../src/rpa/remote/handlers';
import { rpaRemoteSchemas } from '../src/rpa/remote/schemas';
import { DEFAULT_RPA_SETTINGS } from '../src/rpa/settings';
import { remoteCases } from './fixtures/rpa-remote';

const client = vi.hoisted(() => ({
    get: vi.fn(), post: vi.fn(), defaults: { timeout: 0 }, interceptors: { request: { use: vi.fn() } },
}));
vi.mock('axios', () => ({ default: { create: vi.fn(() => client) } }));
const initial = { ...CONFIG };
it('limits process group names to 30 characters on creation and update', () => {
    expect(rpaRemoteSchemas.updateBatchSchema.safeParse({ id: '1', name: '组'.repeat(30) }).success).toBe(true);
    expect(rpaRemoteSchemas.updateBatchSchema.safeParse({ id: '1', name: '组'.repeat(31) }).success).toBe(false);
    expect(rpaRemoteSchemas.createBatchSchema.safeParse({ name: '组'.repeat(30) }).success).toBe(true);
    expect(rpaRemoteSchemas.createBatchSchema.safeParse({ name: '组'.repeat(31) }).success).toBe(false);
});
it.each([
    [rpaRemoteSchemas.createProcessSchema, { batch_id: 0, ref_type: 8, process_file: '/tmp/flow.json.gz' }],
    [rpaRemoteSchemas.updateProcessSchema, { id: '123', process_file: '/tmp/updated.json.gz', batch_id: '0', name: 'Existing process', variable: '[]', setting: '{}', remark: 'Existing remark' }],
    [rpaRemoteSchemas.updateProcessEditableFieldsSchema, { id: '123' }],
])('enforces flow name and remark length boundaries %#', (schema, required) => {
    expect(schema.safeParse({ ...required, name: '流'.repeat(100), remark: '注'.repeat(200) }).success).toBe(true);
    expect(schema.safeParse({ ...required, name: '流'.repeat(101) }).success).toBe(false);
    expect(schema.safeParse({ ...required, name: 'Flow', remark: '注'.repeat(201) }).success).toBe(false);
});
beforeEach(() => {
    vi.clearAllMocks();
    updateConfig('runtime-key', '50326', '20508');
});
afterEach(() => { Object.assign(CONFIG, initial); });

it.each(remoteCases)('routes $handler to the exact mapped path using runtime configuration', async (testCase) => {
    const data = { list: [{ id: '123' }], total: 1 };
    const request = testCase.method === 'GET' ? client.get : client.post;
    request.mockResolvedValue({ data: { code: 0, data } });
    const handler = rpaRemoteHandlers[testCase.handler] as (params: any) => Promise<string>;
    expect(JSON.parse(await handler(testCase.params))).toEqual(data);
    const url = `http://127.0.0.1:50326${testCase.path}`;
    if (testCase.method === 'GET') {
        expect(client.get).toHaveBeenCalledWith(url, { params: testCase.params });
        expect(client.post).not.toHaveBeenCalled();
    } else {
        const expected = testCase.handler === 'createProcess'
            ? { ...testCase.params, allow_random_name: 1, remark: '', setting: JSON.stringify(DEFAULT_RPA_SETTINGS) } : testCase.params;
        expect(client.post).toHaveBeenCalledWith(url, expected);
        expect(client.get).not.toHaveBeenCalled();
    }
    expect(client.defaults.timeout).toBe(30000);
    expect(axios.create).toHaveBeenCalledWith({
        headers: { Authorization: 'Bearer runtime-key', 'x-mcp-client': 'mcp' },
    });
    expect(client.interceptors.request.use).toHaveBeenCalled();
});

it.each(remoteCases)('propagates backend failures without retrying $handler', async (testCase) => {
    const request = testCase.method === 'GET' ? client.get : client.post;
    request.mockResolvedValue({ data: { code: -1, msg: 'Remote operation failed' } });
    await expect((rpaRemoteHandlers[testCase.handler] as (params: any) => Promise<string>)(testCase.params))
        .rejects.toThrow('Remote operation failed');
    expect(request).toHaveBeenCalledTimes(1);
});

it('rejects invalid JSON containers, pagination, IDs and unsupported workflow fields before requesting', async () => {
    await expect(rpaRemoteHandlers.getProcessList({ page: 0 })).rejects.toThrow();
    await expect(rpaRemoteHandlers.getTaskDetail({ ids: '1,' })).rejects.toThrow();
    await expect(rpaRemoteHandlers.getProcessListCount({ fields: 'id' } as any)).rejects.toThrow();
    await expect(rpaRemoteHandlers.updateProcessEditableFields({ id: '1', variable: '{}' })).rejects.toThrow();
    await expect(rpaRemoteHandlers.updateProcessEditableFields({ id: '1', setting: '[]' })).rejects.toThrow();
    await expect(rpaRemoteHandlers.updateProcessEditableFields({ id: '1', process: '{}' } as any)).rejects.toThrow();
    await expect(rpaRemoteHandlers.deleteTaskRuntime({ task_id: '1', fbcc_user_ids: '2' } as any)).rejects.toThrow();
    expect(axios.create).not.toHaveBeenCalled();
});

it('keeps numeric task configuration fields and encoded schedule JSON unchanged', async () => {
    client.post.mockResolvedValue({ data: { code: 0, data: { id: '12' } } });
    const params = { name: 'Scheduled task', fbcc_user_ids: '11,12', process_id: 1, exec_type: 2 as const, exec_sort: 1 as const,
        exec_priority: 0 as const, schedule_rule: JSON.stringify({ freq: 'once', start_time: Math.floor(Date.now() / 1000) + 3600 }) };
    await rpaRemoteHandlers.createTask(params);
    expect(client.post).toHaveBeenCalledWith('http://127.0.0.1:50326/rpav2/local-api/create-task-by-api', params);
    await expect(rpaRemoteHandlers.createTask({ ...params, exec_type: 3 } as any)).rejects.toThrow();
    await expect(rpaRemoteHandlers.createTask({ ...params, process_id: '1' } as any)).rejects.toThrow();
    await expect(rpaRemoteHandlers.createTask({ ...params, schedule_rule: 'invalid JSON' })).rejects.toThrow();
});

it('validates creation variable limits using UTF-8 bytes', async () => {
    const params = { batch_id: 0, ref_type: 8 as const, name: 'Flow', process_file: '/tmp/flow.json.gz' };
    for (const variable of [
        JSON.stringify(Array.from({ length: 1001 }, () => ({ key: 'x', val: '' }))),
        JSON.stringify([{ key: 'x'.repeat(33), val: '' }]),
        JSON.stringify([{ key: 'x', val: 'x'.repeat(1001) }]),
        JSON.stringify(Array.from({ length: 400 }, () => ({ key: 'x', val: '中'.repeat(1000) }))),
    ]) await expect(rpaRemoteHandlers.createProcess({ ...params, variable })).rejects.toThrow();
    expect(client.post).not.toHaveBeenCalled();
});

it('requires a flow id for template subscription queries', async () => {
    await expect(rpaRemoteHandlers.getTemplateSubscriptionInfo({ id: ' ' })).rejects.toThrow();
    await expect(rpaRemoteHandlers.getTemplateSubscriptionInfo({ template_id: '123' } as any)).rejects.toThrow();
    expect(client.get).not.toHaveBeenCalled();
});

it('sends the replacement file with complete existing metadata', async () => {
    client.post.mockResolvedValue({ data: { code: 0, data: { id: '123' } } });
    await rpaRemoteHandlers.updateProcess({ id: '123', process_file: '/tmp/updated.json.gz', batch_id: '0', name: 'Existing process', variable: '[]', setting: '{}', remark: 'Existing remark' });
    expect(client.post).toHaveBeenCalledWith('http://127.0.0.1:50326/rpav2/local-api/update-process-by-api',
        { id: '123', process_file: '/tmp/updated.json.gz', batch_id: '0', name: 'Existing process', variable: '[]', setting: '{}', remark: 'Existing remark' });
    await expect(rpaRemoteHandlers.updateProcess({ id: '123', batch_id: '0', name: 'Existing process', variable: '[]', setting: '{}', remark: 'Existing remark', process_file: '' })).rejects.toThrow();
    await expect(rpaRemoteHandlers.updateProcess({ id: '123', process_file: '/tmp/updated.json.gz', batch_id: '0', name: 'Existing process', setting: '{}', remark: 'Existing remark', variable: JSON.stringify([{ key: 'x'.repeat(33), val: '' }]) })).rejects.toThrow();
});

it('rejects other flow file extensions before calling the runtime', async () => {
    for (const process_file of ['/tmp/flow.json', '/tmp/flow.adspower.gz']) {
        await expect(rpaRemoteHandlers.createProcess({ batch_id: 0, ref_type: 8, name: 'Flow', process_file })).rejects.toThrow();
        await expect(rpaRemoteHandlers.updateProcess({ id: '123', batch_id: '0', name: 'Existing process', variable: '[]', setting: '{}', remark: 'Existing remark', process_file })).rejects.toThrow();
    }
    expect(client.post).not.toHaveBeenCalled();
});
