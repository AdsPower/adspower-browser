import { expect, it } from 'vitest';
import { DEFAULT_RPA_SETTINGS, rpaSettingsJsonSchema, rpaSettingsObjectSchema } from '../src/rpa/settings';
import { rpaRemoteSchemas } from '../src/rpa/remote/schemas';
import { rpaSchemas } from '../src/rpa/local/schemas';

const createInput = { batch_id: 0, ref_type: 8, name: 'Flow', process_file: '/tmp/flow.json.gz' };

it('uses the complete defaults when setting is omitted on creation or debugging', () => {
    expect(JSON.parse(rpaRemoteSchemas.createProcessSchema.parse(createInput).setting)).toEqual(DEFAULT_RPA_SETTINGS);
    const setting = '{ "use_headless": "true" }';
    expect(rpaRemoteSchemas.createProcessSchema.parse({ ...createInput, setting }).setting).toBe(setting);
    const debugInput = { start_node_id: 'node-1', process: '{}', variable: '[]', fbcc_id: 'profile', acc_id: '1' };
    expect(JSON.parse(rpaSchemas.startDebugSchema.parse(debugInput).setting)).toEqual(DEFAULT_RPA_SETTINGS);
    expect(rpaSchemas.startDebugSchema.parse({ ...debugInput, setting }).setting).toBe(setting);
    expect(rpaSchemas.startDebugSchema.toJSONSchema({ io: 'input' }).required).not.toContain('setting');
    for (const schema of [rpaRemoteSchemas.updateProcessEditableFieldsSchema]) {
        expect(schema.parse({ id: '123' })).not.toHaveProperty('setting');
        expect(schema.parse({ id: '123', setting })).toEqual({ id: '123', setting });
    }
});

it('accepts every supported setting and exposes a serializable CLI/MCP schema', () => {
    const settings = {
        exceptHandle: 'interrupt', close_browser: 'manual', save_tab: '1',
        use_headless: 'true', disable_password_filling: 'true', clear_cache_after_closing: 'true',
        enable_password_saving: 'true', launch_args: 'x'.repeat(300), task_timeout: 864000, delay_exec: 1440,
    };
    expect(rpaSettingsObjectSchema.safeParse(settings).success).toBe(true);
    expect(rpaSettingsObjectSchema.safeParse(DEFAULT_RPA_SETTINGS).success).toBe(true);
    expect(rpaRemoteSchemas.createProcessSchema.toJSONSchema().properties?.setting).toMatchObject({
        type: 'string', default: JSON.stringify(DEFAULT_RPA_SETTINGS),
    });
});

it.each([
    'bad json', '[]', 'null', '"text"',
    ...[
        { unexpected: true }, { exceptHandle: 'handle' }, { close_browser: 'never' }, { save_tab: 1 },
        ...['use_headless', 'disable_password_filling', 'clear_cache_after_closing', 'enable_password_saving']
            .map(key => ({ [key]: true })),
        { use_headless: 'yes' }, { launch_args: 'x'.repeat(301) },
        { task_timeout: -1 }, { task_timeout: 864001 }, { task_timeout: 0.5 }, { task_timeout: '30' },
        { delay_exec: -1 }, { delay_exec: 1441 }, { delay_exec: 0.5 }, { delay_exec: '1' },
    ].map(value => JSON.stringify(value)),
])('rejects invalid settings in all entry points: %s', setting => {
    expect(rpaSettingsJsonSchema.safeParse(setting).success).toBe(false);
    expect(rpaRemoteSchemas.createProcessSchema.safeParse({ ...createInput, setting }).success).toBe(false);
    expect(rpaRemoteSchemas.updateProcessSchema.safeParse({ id: '123', process_file: '/tmp/updated.json.gz', batch_id: '0', name: 'Existing process', variable: '[]', remark: 'Existing remark', setting }).success).toBe(false);
    expect(rpaRemoteSchemas.updateProcessEditableFieldsSchema.safeParse({ id: '123', setting }).success).toBe(false);
    expect(rpaSchemas.startDebugSchema.safeParse({
        start_node_id: 'node-1', process: '{}', variable: '[]', setting, fbcc_id: 'profile', acc_id: '1',
    }).success).toBe(false);
});
