import { afterEach, expect, it, vi } from 'vitest';
import axios from 'axios';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { gzipSync } from 'node:zlib';
import { rpaHandlers } from '../src/rpa/local/handlers';
import { rpaSchemas } from '../src/rpa/local/schemas';
import { updateConfig } from '../src/constants/config';

vi.mock('axios', () => ({ default: { post: vi.fn(), get: vi.fn() } }));
const roots: string[] = [];
afterEach(async () => { vi.clearAllMocks(); await Promise.all(roots.splice(0).map(root => rm(root, { recursive: true, force: true }))); });
async function root() { const path = await mkdtemp(join(tmpdir(), 'rpa-file-contract-')); roots.push(path); return path; }
const target = { start_node_id: 'node-1', fbcc_id: 'profile', acc_id: '123' };

it.each(['flow.json', 'flow.json.gz'])('expands %s only at the HTTP boundary without sending its path or changing source', async name => {
    updateConfig(undefined, undefined, '20508');
    const file = join(await root(), name);
    const process = JSON.stringify({ nodes: [{ id: 'node-1', data: { config: { content: 'return "large-script";' } } }], edges: [] });
    const source = name.endsWith('.gz') ? gzipSync(process) : Buffer.from(process);
    await writeFile(file, source);
    vi.mocked(axios.post).mockResolvedValue({ data: { code: 0, data: { id: 42 } } });
    expect(JSON.parse(await rpaHandlers.startDebug({ ...target, process_file: file }))).toEqual({ id: 42 });
    expect(axios.post).toHaveBeenCalledWith('http://127.0.0.1:20508/api/rpav2/debug', { ...rpaSchemas.startDebugSchema.parse({ ...target, process }), process }, { timeout: 30000, proxy: false });
    expect(await readFile(file)).toEqual(source);
});

it('rejects missing or ambiguous sources, invalid files and malformed JSON before starting debug', async () => {
    expect(rpaSchemas.startDebugSchema.safeParse(target).success).toBe(false);
    expect(rpaSchemas.startDebugSchema.safeParse({ ...target, process: '{}', process_file: '/tmp/flow.json' }).success).toBe(false);
    const file = join(await root(), 'flow.json');
    for (const text of ['invalid', '[]', '{"nodes":[]}']) {
        await writeFile(file, text);
        await expect(rpaHandlers.startDebug({ ...target, process_file: file })).rejects.toThrow();
    }
    await expect(rpaHandlers.startDebug({ ...target, process_file: 'relative.json' })).rejects.toThrow('absolute');
    await expect(rpaHandlers.startDebug({ ...target, process_file: file + '.missing' })).rejects.toThrow();
    expect(axios.post).not.toHaveBeenCalled();
});

it.each([
    ['getDebugLog', { id: '42' }], ['getTaskLog', { id: '42' }], ['getRecordDetail', { id: '42' }],
    ['getRecordItems', { id: '42' }], ['getTaskExecuteItems', { task_id: '42' }],
] as const)('%s writes the entire response but returns no scripts/logs, and never overwrites a saved snapshot', async (method, query) => {
    const file = join(await root(), 'log.json');
    const data = { id: '42', status: 'ERROR', logs: 'SECRET-SCRIPT'.repeat(10000), reason: 'node failed' };
    vi.mocked(axios.get).mockResolvedValue({ data: { code: 0, data } });
    const result = JSON.parse(await rpaHandlers[method]({ ...query, output_file: file }));
    expect(result).toMatchObject({ output_file: file, id: '42', status: 'ERROR', reason: 'node failed' });
    expect(JSON.stringify(result)).not.toContain('SECRET-SCRIPT');
    expect(JSON.parse(await readFile(file, 'utf8'))).toEqual(data);
    const request = vi.mocked(axios.get).mock.calls[0][1];
    expect(request?.params).not.toHaveProperty('output_file');
    await expect(rpaHandlers[method]({ ...query, output_file: file })).rejects.toThrow();
    expect(JSON.parse(await readFile(file, 'utf8'))).toEqual(data);
});

it('bounds list summaries while retaining every embedded log in the file', async () => {
    const file = join(await root(), 'items.json');
    const data = Array.from({ length: 30 }, (_, id) => ({ id, status: 'COMPLETE', logs: 'large-source' }));
    vi.mocked(axios.get).mockResolvedValue({ data: { code: 0, data } });
    const result = JSON.parse(await rpaHandlers.getRecordItems({ id: 'record', output_file: file }));
    expect(result.total_items).toBe(30);
    expect(result.items).toHaveLength(10);
    expect(result.next_offset).toBe(10);
    expect(JSON.stringify(result)).not.toContain('large-source');
    expect(JSON.parse(await readFile(file, 'utf8'))).toHaveLength(30);
});
