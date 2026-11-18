import { afterEach, expect, it, vi } from 'vitest';
import axios from 'axios';
import { rpaHandlers } from '../src/rpa/local/handlers';
import { CONFIG, updateConfig } from '../src/constants/config';
import { getRpaApiBase } from '../src/rpa/local/api';

const initialRpaPort = CONFIG.rpaPort;

vi.mock('axios', () => ({ default: { post: vi.fn(), get: vi.fn() } }));
afterEach(() => { vi.clearAllMocks(); updateConfig(undefined, undefined, initialRpaPort); });

it('sends the Excel path to the configured RPA port and returns fields', async () => {
    updateConfig(undefined, undefined, '20508');
    vi.mocked(axios.post).mockResolvedValue({ data: { code: 0, data: { variable_list: ['name'] } } });
    expect(JSON.parse(await rpaHandlers.readExcelFields({ file_path: '/tmp/test.xlsx' })))
        .toEqual({ variable_list: ['name'] });
    expect(axios.post).toHaveBeenCalledWith('http://127.0.0.1:20508/api/rpav2/tool/getExcelContent',
        { file_path: '/tmp/test.xlsx' }, { timeout: 30000, proxy: false });
});

it.each(['0', '65536', 'abc', '12/path'])('rejects invalid port %s', async (port) => {
    updateConfig(undefined, undefined, port);
    await expect(rpaHandlers.readExcelFields({ file_path: 'test.xlsx' })).rejects.toThrow('RPA Plus port');
    expect(axios.post).not.toHaveBeenCalled();
});

it('validates Excel input before requesting', async () => {
    updateConfig(undefined, undefined, '20508');
    await expect(rpaHandlers.readExcelFields({ file_path: '' })).rejects.toThrow();
    await expect(rpaHandlers.readExcelFields({ file_path: 'test.xlsx', extra: true } as any)).rejects.toThrow();
    expect(axios.post).not.toHaveBeenCalled();
});

it('propagates service errors', async () => {
    updateConfig(undefined, undefined, '20508');
    vi.mocked(axios.post).mockResolvedValue({ data: { code: -1, msg: 'Excel file not found' } });
    await expect(rpaHandlers.readExcelFields({ file_path: 'missing.xlsx' })).rejects.toThrow('Excel file not found');
});

it('retains the configured port when no CLI override is provided', () => {
    updateConfig(undefined, undefined, '20509');
    updateConfig(undefined, undefined, undefined);
    expect(getRpaApiBase()).toBe('http://127.0.0.1:20509');
    updateConfig(undefined, undefined, '20510');
    expect(getRpaApiBase()).toBe('http://127.0.0.1:20510');
});

it.each([
    ['readTextList', { file_path: '/tmp/list.txt' }, 'getTxtContent', { list: ['a'] }],
    ['checkEmail', { user: 'user@example.com', password: 'test', imapHost: 'imap.example.com', seen: '1', dateType: 'yestoday' }, 'getCheckEmail', { subject: 'test' }],
    ['getTwoFa', { secret: 'test-secret' }, 'getCheckTwoFa', { code: '123456' }],
] as const)('posts %s to its RPA endpoint', async (method, params, endpoint, data) => {
    updateConfig(undefined, undefined, '20508');
    vi.mocked(axios.post).mockResolvedValue({ data: { code: 0, data } });
    const result = await (rpaHandlers[method] as (params: any) => Promise<string>)(params);
    expect(JSON.parse(result)).toEqual(data);
    expect(axios.post).toHaveBeenCalledWith(`http://127.0.0.1:20508/api/rpav2/tool/${endpoint}`,
        params, { timeout: 30000, proxy: false });
});

it.each(['read', 'write', 'clear'] as const)('uses GET query params for Google Sheets %s', async (type) => {
    updateConfig(undefined, undefined, '20508');
    const params = { sheetId: 'sheet-id', sheetName: 'Sheet1', type,
        ...(type === 'write' ? { template: '[["name"],["Alice"]]' } : {}) };
    vi.mocked(axios.get).mockResolvedValue({ data: { code: 0, data: { res: [] } } });
    expect(JSON.parse(await rpaHandlers.googleSheets(params))).toEqual({ res: [] });
    expect(axios.get).toHaveBeenCalledWith('http://127.0.0.1:20508/api/rpav2/tool/googleSheet/test',
        { params: { ...params, isKey: '1', rangeType: 'append' }, timeout: 30000, proxy: false });
});

it('rejects invalid new RPA inputs before sending requests', async () => {
    await expect(rpaHandlers.readTextList({ file_path: '' })).rejects.toThrow();
    await expect(rpaHandlers.checkEmail({ user: 'a', password: '', imapHost: 'imap' })).rejects.toThrow();
    await expect(rpaHandlers.getTwoFa({ secret: '' })).rejects.toThrow();
    for (const template of [undefined, 'bad json', '[1,2]']) {
        await expect(rpaHandlers.googleSheets({ sheetId: 'id', sheetName: 'Sheet1', type: 'write', template })).rejects.toThrow();
    }
    expect(axios.post).not.toHaveBeenCalled();
    expect(axios.get).not.toHaveBeenCalled();
});

it('propagates Google Sheets service errors', async () => {
    updateConfig(undefined, undefined, '20508');
    vi.mocked(axios.get).mockResolvedValue({ data: { code: -1, msg: 'Sheet not found' } });
    await expect(rpaHandlers.googleSheets({ sheetId: 'id', sheetName: 'Sheet1', type: 'read' })).rejects.toThrow('Sheet not found');
});

const debugInput = {
    start_node_id: 'node-1', process: '{"nodes":[],"edges":[]}', process_name: 'Debug flow',
    variable: '[]', setting: '{}', fbcc_id: 'profile-id', acc_id: '123',
};

it.each([true, false])('posts debug input with process_name included: %s', async (includeName) => {
    updateConfig(undefined, undefined, '20508');
    const { process_name, ...requiredInput } = debugInput;
    const input = includeName ? { ...requiredInput, process_name } : requiredInput;
    vi.mocked(axios.post).mockResolvedValue({ data: { code: 0, data: { id: 42 } } });
    expect(JSON.parse(await rpaHandlers.startDebug(input))).toEqual({ id: 42 });
    expect(axios.post).toHaveBeenCalledWith('http://127.0.0.1:20508/api/rpav2/debug',
        input, { timeout: 30000, proxy: false });
});

it.each([
    ['getDebugLog', 'debug/getLog', { id: '42', status: 'DOING', logs: 'full log\nline 2' }],
    ['cancelDebug', 'debug/cancel', {}],
] as const)('uses GET and the debug id for %s', async (method, endpoint, data) => {
    updateConfig(undefined, undefined, '20508');
    vi.mocked(axios.get).mockResolvedValue({ data: { code: 0, data } });
    expect(JSON.parse(await rpaHandlers[method]({ id: '42' }))).toEqual(data);
    expect(axios.get).toHaveBeenCalledWith(`http://127.0.0.1:20508/api/rpav2/${endpoint}`,
        { params: { id: '42' }, timeout: 30000, proxy: false });
});

it('rejects missing debug fields and empty ids before requesting', async () => {
    for (const field of Object.keys(debugInput)) {
        if (field === 'process_name' || field === 'setting' || field === 'variable') continue;
        const input = { ...debugInput } as Record<string, string>;
        delete input[field];
        await expect(rpaHandlers.startDebug(input as any)).rejects.toThrow();
    }
    await expect(rpaHandlers.getDebugLog({ id: '' })).rejects.toThrow();
    await expect(rpaHandlers.cancelDebug({ id: '' })).rejects.toThrow();
    await expect(rpaHandlers.cancelDebug({ task_id: '42' } as any)).rejects.toThrow();
    expect(axios.post).not.toHaveBeenCalled();
    expect(axios.get).not.toHaveBeenCalled();
});

it('propagates debug business failures', async () => {
    updateConfig(undefined, undefined, '20508');
    vi.mocked(axios.post).mockResolvedValue({ data: { code: -1, msg: 'There are tasks still being handled' } });
    await expect(rpaHandlers.startDebug(debugInput)).rejects.toThrow('There are tasks still being handled');
    vi.mocked(axios.get).mockResolvedValue({ data: { code: -1, msg: 'Debug failed' } });
    await expect(rpaHandlers.getDebugLog({ id: '42' })).rejects.toThrow('Debug failed');
    await expect(rpaHandlers.cancelDebug({ id: '42' })).rejects.toThrow('Debug failed');
});

it.each([
    ['cancelTask', 'task/cancel', { task_id: '123' }],
    ['addPlan', 'plan/add', { task_id: '123' }],
    ['cancelPlan', 'plan/cancel', { task_id: '123' }],
    ['updateRpaConfig', 'updateConfig', { thread: '10' }],
] as const)('posts %s with the documented body', async (method, endpoint, params) => {
    updateConfig(undefined, undefined, '20508');
    vi.mocked(axios.post).mockResolvedValue({ data: { code: 0, data: {} } });
    expect(JSON.parse(await (rpaHandlers[method] as (params: any) => Promise<string>)(params))).toEqual({});
    expect(axios.post).toHaveBeenCalledWith(`http://127.0.0.1:20508/api/rpav2/${endpoint}`,
        params, { timeout: 30000, proxy: false });
});

it('queries enabled plans with a comma-separated task id list', async () => {
    updateConfig(undefined, undefined, '20508');
    vi.mocked(axios.get).mockResolvedValue({ data: { code: 0, data: { open_tasks: ['123'] } } });
    expect(JSON.parse(await rpaHandlers.getPlanSwitch({ task_ids: '123,456' }))).toEqual({ open_tasks: ['123'] });
    expect(axios.get).toHaveBeenCalledWith('http://127.0.0.1:20508/api/rpav2/plan/switch',
        { params: { task_ids: '123,456' }, timeout: 30000, proxy: false });
});

it('defaults the configuration query to thread', async () => {
    updateConfig(undefined, undefined, '20508');
    vi.mocked(axios.get).mockResolvedValue({ data: { code: 0, data: { thread: '3' } } });
    expect(JSON.parse(await rpaHandlers.getRpaConfig({}))).toEqual({ thread: '3' });
    expect(axios.get).toHaveBeenCalledWith('http://127.0.0.1:20508/api/rpav2/getConfig',
        { params: { keys: 'thread' }, timeout: 30000, proxy: false });
});

it.each(['0', '101', '-1', '1.5', 'abc', '', '01'])('rejects invalid thread value %s', async (thread) => {
    await expect(rpaHandlers.updateRpaConfig({ thread })).rejects.toThrow();
    expect(axios.post).not.toHaveBeenCalled();
});

it('validates required task ids, id lists, and configuration keys', async () => {
    for (const method of ['addTask', 'cancelTask', 'addPlan', 'cancelPlan'] as const) {
        await expect(rpaHandlers[method]({ task_id: '' })).rejects.toThrow();
        await expect(rpaHandlers[method]({ id: '123' } as any)).rejects.toThrow();
    }
    for (const task_ids of ['', '123,', '123,,456', '123, 456']) {
        await expect(rpaHandlers.getPlanSwitch({ task_ids })).rejects.toThrow();
    }
    await expect(rpaHandlers.getRpaConfig({ keys: 'other' } as any)).rejects.toThrow();
    await expect(rpaHandlers.updateRpaConfig({ thread: '3', other: 'value' } as any)).rejects.toThrow();
    expect(axios.post).not.toHaveBeenCalled();
    expect(axios.get).not.toHaveBeenCalled();
});

it('propagates task, plan, and concurrency service failures', async () => {
    updateConfig(undefined, undefined, '20508');
    vi.mocked(axios.post).mockResolvedValue({ data: { code: -1, msg: 'Task or configuration failed' } });
    for (const method of ['addTask', 'cancelTask', 'addPlan', 'cancelPlan'] as const) {
        await expect(rpaHandlers[method]({ task_id: '123' })).rejects.toThrow('Task or configuration failed');
    }
    await expect(rpaHandlers.updateRpaConfig({ thread: '3' })).rejects.toThrow('Task or configuration failed');
    vi.mocked(axios.get).mockResolvedValue({ data: { code: -1, msg: 'Query failed' } });
    await expect(rpaHandlers.getPlanSwitch({ task_ids: '123' })).rejects.toThrow('Query failed');
    await expect(rpaHandlers.getRpaConfig({ keys: 'thread' })).rejects.toThrow('Query failed');
});

const historyFilter = JSON.stringify({ and: [{ field: 'status', op: 'eq', val: 'COMPLETE' }] });
const historyCases = [
    ['getLatestExecution', 'getLatestExecution', { task_ids: '123,456' }, [{ task_id: '123', latest_status: 'COMPLETE' }]],
    ['getRecordList', 'getRecordList', { page: 1, page_size: 10, filter: historyFilter }, [{ id: '42' }]],
    ['getRecordCount', 'getRecordCount', { filter: historyFilter }, { count: 1 }],
    ['getRecordDetail', 'getRecordDetail', { id: '42' }, { id: '42', status: 'COMPLETE', count: 1, success_count: 1 }],
    ['getRecordItems', 'getRecordItems', { id: '42', page: 1, page_size: 10, filter: historyFilter }, [{ id: '99', logs: 'full log' }]],
    ['getRecordItemsCount', 'getRecordItemsCount', { id: '42', filter: historyFilter }, 1],
    ['getTaskExecuteItems', 'getTaskExecuteItems', { task_id: '123', page: 1, page_size: 10 }, [{ id: '99' }]],
    ['getTaskExecuteItems', 'getTaskExecuteItems', { task_id: '123' }, [{ id: '99' }]],
    ['getTaskExecuteItems', 'getTaskExecuteItems', { process_id: '456', page: 2 }, [{ id: '100' }]],
    ['getTaskExecuteItems', 'getTaskExecuteItems', { task_id: '123', page_size: 20 }, [{ id: '99' }]],
    ['getTaskExecuteItems', 'getTaskExecuteItems', { process_id: '456', page: 2, page_size: 20 }, [{ id: '100' }]],
    ['getTaskExecuteItemsCount', 'getTaskExecuteItemsCount', { task_id: '123' }, { count: 1 }],
    ['getTaskExecuteItemsCount', 'getTaskExecuteItemsCount', { process_id: '456' }, { count: 2 }],
    ['getTaskLog', 'getLog', { id: '99' }, { id: '99', logs: 'line 1\nline 2' }],
] as const;

it.each(historyCases)('queries history via %s preserving the service response', async (method, endpoint, params, data) => {
    updateConfig(undefined, undefined, '20508');
    vi.mocked(axios.get).mockResolvedValue({ data: { code: 0, data } });
    expect(JSON.parse(await (rpaHandlers[method] as (params: any) => Promise<string>)(params))).toEqual(data);
    expect(axios.get).toHaveBeenCalledWith(`http://127.0.0.1:20508/api/rpav2/task/${endpoint}`,
        { params: ['getRecordList', 'getRecordItems', 'getTaskExecuteItems'].includes(method)
            ? { page_size: 10, ...params } : params, timeout: 30000, proxy: false });
});

it.each(historyCases)('propagates query errors from %s', async (method, _endpoint, params) => {
    updateConfig(undefined, undefined, '20508');
    vi.mocked(axios.get).mockResolvedValue({ data: { code: -1, msg: 'History query failed' } });
    await expect((rpaHandlers[method] as (params: any) => Promise<string>)(params)).rejects.toThrow('History query failed');
});

it('validates history query identifiers, dimensions, pagination and filter strings', async () => {
    await expect(rpaHandlers.getLatestExecution({ task_ids: '123,' })).rejects.toThrow();
    for (const method of ['getRecordDetail', 'getRecordItems', 'getRecordItemsCount', 'getTaskLog'] as const) {
        await expect(rpaHandlers[method]({ id: ' ' })).rejects.toThrow();
    }
    await expect(rpaHandlers.getTaskExecuteItems({ page: 1, page_size: 10 })).rejects.toThrow();
    await expect(rpaHandlers.getTaskExecuteItemsCount({})).rejects.toThrow();
    await expect(rpaHandlers.getTaskExecuteItems({ task_id: '123', page: 0 })).rejects.toThrow();
    await expect(rpaHandlers.getTaskExecuteItems({ task_id: '123', page_size: 1.5 })).rejects.toThrow();
    await expect(rpaHandlers.getRecordList({ page: 0 })).rejects.toThrow();
    await expect(rpaHandlers.getRecordItems({ id: '42', page_size: 1.5 })).rejects.toThrow();
    for (const filter of ['bad json', '[]', '{"and":[{"field":"unknown","op":"eq","val":"1"}]}',
        '{"and":[{"field":"status","op":"invalid","val":"1"}]}']) {
        await expect(rpaHandlers.getRecordList({ filter })).rejects.toThrow();
        await expect(rpaHandlers.getRecordItemsCount({ id: '42', filter })).rejects.toThrow();
    }
    expect(axios.get).not.toHaveBeenCalled();
});

it.each([
    ['cancelTaskItems', 'cancelItems', { ids: '99,100' }],
    ['deleteRecord', 'deleteRecord', { id: '42' }],
] as const)('posts %s using the documented identifier', async (method, endpoint, params) => {
    updateConfig(undefined, undefined, '20508');
    vi.mocked(axios.post).mockResolvedValue({ data: { code: 0, data: {} } });
    expect(JSON.parse(await (rpaHandlers[method] as (params: any) => Promise<string>)(params))).toEqual({});
    expect(axios.post).toHaveBeenCalledWith(`http://127.0.0.1:20508/api/rpav2/task/${endpoint}`,
        params, { timeout: 30000, proxy: false });
    vi.mocked(axios.post).mockResolvedValue({ data: { code: -1, msg: 'Operation failed' } });
    await expect((rpaHandlers[method] as (params: any) => Promise<string>)(params)).rejects.toThrow('Operation failed');
});

it('rejects invalid cancellation lists and record ids before requesting', async () => {
    for (const ids of ['', ' ', '99,', ',99', '99,,100', '99, 100']) {
        await expect(rpaHandlers.cancelTaskItems({ ids })).rejects.toThrow();
    }
    await expect(rpaHandlers.cancelTaskItems({ task_id: '123' } as any)).rejects.toThrow();
    await expect(rpaHandlers.deleteRecord({ id: ' ' })).rejects.toThrow();
    await expect(rpaHandlers.deleteRecord({ task_id: '123' } as any)).rejects.toThrow();
    expect(axios.post).not.toHaveBeenCalled();
});

it('returns the execution ID when submitting a task', async () => {
    updateConfig(undefined, undefined, '20508');
    vi.mocked(axios.post).mockResolvedValue({ data: { code: 0, data: { record_id: '42' } } });
    expect(JSON.parse(await rpaHandlers.addTask({ task_id: '123' }))).toEqual({ record_id: '42' });
    expect(axios.post).toHaveBeenCalledWith('http://127.0.0.1:20508/api/rpav2/task/add',
        { task_id: '123' }, { timeout: 30000, proxy: false });
});

it('cancels a single execution using record_id', async () => {
    updateConfig(undefined, undefined, '20508');
    vi.mocked(axios.post).mockResolvedValue({ data: { code: 0, data: {} } });
    await rpaHandlers.cancelTask({ record_id: '42' });
    expect(axios.post).toHaveBeenCalledWith('http://127.0.0.1:20508/api/rpav2/task/cancel',
        { record_id: '42' }, { timeout: 30000, proxy: false });
});

it.each([{}, { task_id: '123', record_id: '42' }, { record_id: '0' }, { record_id: 'abc' }])('rejects ambiguous or invalid execution cancellation %j', async (params) => {
    await expect(rpaHandlers.cancelTask(params)).rejects.toThrow();
    expect(axios.post).not.toHaveBeenCalled();
});

it('rejects a successful submission response without an execution ID', async () => {
    vi.mocked(axios.post).mockResolvedValue({ data: { code: 0, data: {} } });
    await expect(rpaHandlers.addTask({ task_id: '123' })).rejects.toThrow();
});
