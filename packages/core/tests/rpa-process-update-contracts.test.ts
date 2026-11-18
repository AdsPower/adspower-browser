import { expect, it } from 'vitest';
import { rpaRemoteSchemas } from '../src/rpa/remote/schemas';
const previous = { id: '123', process_file: '/tmp/updated.json.gz', batch_id: '0', name: 'Existing process', variable: '[{"key":"a","val":"b"}]',
    setting: '{"use_headless":"true"}', remark: 'Keep this remark' };
it('requires all existing metadata for process content updates without replacing it with creation defaults', () => {
    expect(rpaRemoteSchemas.updateProcessSchema.parse(previous)).toEqual(previous);
    expect(rpaRemoteSchemas.updateProcessSchema.toJSONSchema({ io: 'input' }).required)
        .toEqual(expect.arrayContaining(['id', 'batch_id', 'name', 'variable', 'setting', 'remark', 'process_file']));
    for (const field of Object.keys(previous)) {
        const missing: Record<string, unknown> = { ...previous };
        delete missing[field];
        expect(rpaRemoteSchemas.updateProcessSchema.safeParse(missing).success).toBe(false);
    }
    const replacement = { ...previous, process_file: '/tmp/updated.json.gz' };
    expect(rpaRemoteSchemas.updateProcessSchema.parse(replacement)).toEqual(replacement);
    expect(rpaRemoteSchemas.updateProcessSchema.parse({ ...previous, remark: '' }).remark).toBe('');
});
it('supports metadata-only partial updates and rejects replacement files on that endpoint', () => {
    expect(rpaRemoteSchemas.updateProcessEditableFieldsSchema.parse({ id: '123', name: 'Renamed' }))
        .toEqual({ id: '123', name: 'Renamed' });
    expect(rpaRemoteSchemas.updateProcessEditableFieldsSchema.safeParse({ id: '123', process_file: '/tmp/updated.json.gz' }).success).toBe(false);
});
it('always supplies a creation remark and preserves a provided remark', () => {
    const input = { ref_type: 8, name: 'New process', process_file: '/tmp/new.json.gz' };
    expect(rpaRemoteSchemas.createProcessSchema.parse(input).remark).toBe('');
    expect(rpaRemoteSchemas.createProcessSchema.parse({ ...input, remark: 'Provided' }).remark).toBe('Provided');
});
