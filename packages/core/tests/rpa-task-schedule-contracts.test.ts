import { afterEach, expect, it, vi } from 'vitest';
import { rpaRemoteSchemas } from '../src/rpa/remote/schemas';

const input = { process_id: 1, fbcc_user_ids: '11,12' };
const start = 2000000000;
const schema = rpaRemoteSchemas.createTaskSchema;
afterEach(() => vi.restoreAllMocks());

it('generates task defaults at call time and preserves explicit choices', () => {
    const now = vi.spyOn(Date, 'now').mockReturnValue(1900000000000);
    expect(schema.parse(input)).toEqual({ ...input, name: 'RPA_TASK_1900000000000', exec_type: 1,
        exec_sort: 1, exec_priority: 0, schedule_rule: '{}' });
    now.mockReturnValue(1900000000001);
    expect(schema.parse(input).name).toBe('RPA_TASK_1900000000001');
    expect(schema.parse({ ...input, name: 'x'.repeat(64), exec_sort: 2, exec_priority: 1 }))
        .toMatchObject({ name: 'x'.repeat(64), exec_sort: 2, exec_priority: 1 });
});

it.each([
    { name: '' }, { name: 'x'.repeat(65) }, { fbcc_user_ids: undefined }, { fbcc_user_ids: '' },
    { fbcc_user_ids: '11,' }, { exec_type: 3 }, { exec_sort: 0 }, { exec_priority: 2 },
    { exec_type: 2 }, { schedule_rule: '{"anything":1}' },
])('rejects invalid creation fields %#', fields => {
    expect(schema.safeParse({ ...input, ...fields }).success).toBe(false);
});

const validRules = [
    { freq: 'once', start_time: start },
    { freq: 'interval', start_time: start, gap_time: 10, end_time: start + 601 },
    { freq: 'interval', start_time: start, gap_time: 1440 },
    { freq: 'day', start_time: start, exec_time: 0 },
    { freq: 'day', start_time: start, exec_time: 86340 },
    { freq: 'week', start_time: start, exec_time: 32400, weekday: 'Monday' },
    { freq: 'month', start_time: start, exec_time: 32400, monthday: 30 },
];
it.each(validRules)('validates frequency-specific schedule %#', rule => {
    const schedule_rule = JSON.stringify(rule);
    expect(schema.parse({ ...input, exec_type: 2, schedule_rule }).schedule_rule).toBe(schedule_rule);
    expect(rpaRemoteSchemas.updateTaskSchema.safeParse({ ...input, id: '1', name: 'Task',
        exec_type: 2, exec_sort: 1, exec_priority: 0, schedule_rule }).success).toBe(true);
});

it.each([
    {}, { freq: 'bad', start_time: start }, { freq: 'once' }, { freq: 'once', start_time: '2000000000' },
    { freq: 'once', start_time: start, end_time: start + 3600 },
    { freq: 'interval', start_time: start }, { freq: 'interval', start_time: start, gap_time: 9 },
    { freq: 'interval', start_time: start, gap_time: 1441 }, { freq: 'interval', start_time: start, gap_time: 10.5 },
    { freq: 'day', start_time: start }, { freq: 'day', start_time: start, exec_time: 1 },
    { freq: 'day', start_time: start, exec_time: 86400 }, { freq: 'day', start_time: start, exec_time: 0, unknown: 1 },
    { freq: 'day', start_time: start, exec_time: 0, end_time: start + 600 },
    { freq: 'week', start_time: start, exec_time: 0 }, { freq: 'week', start_time: start, exec_time: 0, weekday: 'monday' },
    { freq: 'month', start_time: start, exec_time: 0, monthday: 31 },
    { freq: 'month', start_time: start, exec_time: 0, monthday: 0 },
])('rejects malformed scheduled rules %#', rule => {
    expect(schema.safeParse({ ...input, exec_type: 2, schedule_rule: JSON.stringify(rule) }).success).toBe(false);
});

it('enforces the creation time window while allowing existing schedule times on updates', () => {
    vi.spyOn(Date, 'now').mockReturnValue(start * 1000 - 600000);
    const schedule_rule = JSON.stringify({ freq: 'once', start_time: start });
    expect(schema.safeParse({ ...input, exec_type: 2, schedule_rule }).success).toBe(false);
    expect(rpaRemoteSchemas.updateTaskSchema.safeParse({ id: '1', name: 'Task', process_id: 1,
        exec_type: 2, exec_sort: 1, exec_priority: 0, schedule_rule }).success).toBe(true);
});
