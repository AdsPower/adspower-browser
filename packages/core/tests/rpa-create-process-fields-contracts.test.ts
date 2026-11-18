import { expect, it } from 'vitest';
import { rpaRemoteSchemas } from '../src/rpa/remote/schemas';
import { RefType } from '../src/rpa/flowSchemas';

const input = { name: 'Flow', ref_type: RefType.AI_AGENT, process_file: '/tmp/flow.json.gz' };
const schema = rpaRemoteSchemas.createProcessSchema;

it('defaults to ungrouped and allows random names without overriding explicit values', () => {
    expect(schema.parse(input)).toMatchObject({ batch_id: 0, allow_random_name: 1 });
    expect(schema.parse({ ...input, batch_id: '123', allow_random_name: 0, ref_id: 'template-456' }))
        .toMatchObject({ batch_id: '123', allow_random_name: 0, ref_id: 'template-456' });
    expect(schema.toJSONSchema({ io: 'input' }).required).not.toContain('batch_id');
    expect(schema.toJSONSchema({ io: 'input' }).required).not.toContain('allow_random_name');
});

it.each(Object.values(RefType))('accepts string and numeric source type %s', ref_type => {
    expect(schema.safeParse({ ...input, ref_type }).success).toBe(true);
    expect(schema.safeParse({ ...input, ref_type: Number(ref_type) }).success).toBe(true);
});

it.each([-1, 9, 1.5, '9', '08', 'AI_AGENT', null])('rejects unsupported source type %s', ref_type => {
    expect(schema.safeParse({ ...input, ref_type }).success).toBe(false);
});

it('rejects the removed agreement field and still requires a source type', () => {
    expect(schema.safeParse({ ...input, agreement_accepted: 1 }).success).toBe(false);
    expect(schema.safeParse({ name: 'Flow', process_file: '/tmp/flow.json.gz' }).success).toBe(false);
});
