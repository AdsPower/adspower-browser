import { open, writeFile } from 'node:fs/promises';
import { isAbsolute } from 'node:path';
import { gunzipSync } from 'node:zlib';

const MAX_FLOW_BYTES = 32 * 1024 * 1024;

/** Only the transport owns the expanded process; callers retain its file reference. */
export async function readDebugProcess(filePath: string): Promise<string> {
    if (!isAbsolute(filePath)) throw new Error('process_file must be an absolute local path');
    const file = await open(filePath, 'r');
    let bytes: Buffer;
    try {
        const stat = await file.stat();
        if (!stat.isFile() || stat.size > MAX_FLOW_BYTES) throw new Error('process_file must be a regular file no larger than 32 MiB');
        bytes = await file.readFile();
    } finally {
        await file.close();
    }
    if (filePath.endsWith('.gz')) bytes = gunzipSync(bytes, { maxOutputLength: MAX_FLOW_BYTES });
    const process = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    let flow: unknown;
    try { flow = JSON.parse(process); } catch { throw new Error('process_file must contain valid flow JSON'); }
    if (!flow || typeof flow !== 'object' || !('nodes' in flow) || !Array.isArray(flow.nodes)
        || !('edges' in flow) || !Array.isArray(flow.edges)) throw new Error('process_file must contain nodes and edges arrays');
    return process;
}

/** The opt-in file result preserves the complete response without echoing logs or node config. */
export async function writeRpaLogResult(data: unknown, outputFile?: string): Promise<string> {
    if (!outputFile) return JSON.stringify(data, null, 2);
    if (!isAbsolute(outputFile)) throw new Error('output_file must be an absolute local path');
    await writeFile(outputFile, JSON.stringify(data), { flag: 'wx', mode: 0o600 });
    const result = Array.isArray(data)
        ? { total_items: data.length, items: data.slice(0, 10).map(summarizeLog), next_offset: data.length > 10 ? 10 : null }
        : summarizeLog(data);
    return JSON.stringify({ output_file: outputFile, ...result }, null, 2);
}

function summarizeLog(data: unknown): Record<string, unknown> {
    const summary: Record<string, unknown> = {};
    if (data && typeof data === 'object' && !Array.isArray(data)) {
        for (const key of ['id', 'status', 'task_id', 'process_id', 'acc_id', 'fbcc_id', 'start_time', 'end_time', 'update_time', 'reason']) {
            const value: unknown = Reflect.get(data, key);
            if (typeof value === 'string') summary[key] = value.slice(0, 500);
            else if (typeof value === 'number' || value === null) summary[key] = value;
        }
        const logs: unknown = Reflect.get(data, 'logs');
        if (typeof logs === 'string') summary.log_characters = logs.length;
        else if (Array.isArray(logs)) summary.log_entries = logs.length;
    }
    return summary;
}
