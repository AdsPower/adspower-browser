import { expect, it } from 'vitest';
import { rpaSchemas } from '../src/rpa/local/schemas';
import { rpaRemoteSchemas } from '../src/rpa/remote/schemas';

const debugInput = { start_node_id: 'node-1', process: '{}', fbcc_id: 'profile', acc_id: '1' };
const createInput = { batch_id: 0, ref_type: 8, name: 'Flow', process_file: '/tmp/flow.json.gz' };
const updateInput = { id: '123', process_file: '/tmp/updated.json.gz', batch_id: '0', name: 'Existing process', variable: '[]', setting: '{}', remark: 'Existing remark' };

it('allows omitted debug variables and flow name', () => {
    expect(rpaSchemas.startDebugSchema.safeParse(debugInput).success).toBe(true);
});

it.each([
    [undefined, true], ['[]', true], [JSON.stringify([{ key: 'x'.repeat(32), val: 'v'.repeat(1000) }]), true],
    [JSON.stringify([{ key: 'key', value: 'value' }]), true],
    ['{}', false], ['bad json', false], [JSON.stringify([{ key: 'x'.repeat(33), val: '' }]), false],
    [JSON.stringify([{ key: 'x', val: 'v'.repeat(1001) }]), false],
    [JSON.stringify([{ key: 'x', val: 1 }]), false],
    [JSON.stringify(Array.from({ length: 1001 }, () => ({ key: 'x', val: '' }))), false],
    [JSON.stringify(Array.from({ length: 400 }, () => ({ key: 'x', val: '中'.repeat(1000) }))), false],
] as const)('uses the same variable validation across flow creation, update and debug %#', (variable, valid) => {
    expect(rpaSchemas.startDebugSchema.safeParse({ ...debugInput, variable }).success).toBe(valid);
    expect(rpaRemoteSchemas.createProcessSchema.safeParse({ ...createInput, variable }).success).toBe(valid);
    expect(rpaRemoteSchemas.updateProcessSchema.safeParse({ ...updateInput, variable }).success).toBe(valid && variable !== undefined);
    expect(rpaRemoteSchemas.updateProcessEditableFieldsSchema.safeParse({ id: '123', variable }).success).toBe(valid);
});

it.each([['', false], ['流'.repeat(100), true], ['流'.repeat(101), false]] as const)(
    'uses the same flow name validation for debug, creation and update %#', (name, valid) => {
        expect(rpaSchemas.startDebugSchema.safeParse({ ...debugInput, process_name: name }).success).toBe(valid);
        expect(rpaRemoteSchemas.createProcessSchema.safeParse({ ...createInput, name }).success).toBe(valid);
        expect(rpaRemoteSchemas.updateProcessSchema.safeParse({ ...updateInput, name }).success).toBe(valid);
    },
);
