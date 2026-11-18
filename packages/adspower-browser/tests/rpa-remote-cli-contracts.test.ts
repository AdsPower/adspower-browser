import { expect, it } from 'vitest';
import { rpaRemoteTools } from '@adspower/local-api-core';
import { RPA_REMOTE_HANDLERS } from '../src/rpa/remote';
import { RPA_LOCAL_HANDLERS } from '../src/rpa/local';
import { STATELESS_HANDLERS, resolveStatelessCommandArgs } from '../src/cli';

it('merges all 26 remote commands without shadowing local RPA commands', () => {
    const remoteNames = rpaRemoteTools.map(tool => `rpa-${tool.name}`);
    expect(Object.keys(RPA_REMOTE_HANDLERS)).toEqual(remoteNames);
    expect(remoteNames).toHaveLength(26);
    for (const name of remoteNames) {
        expect(RPA_LOCAL_HANDLERS[name]).toBeUndefined();
        expect(STATELESS_HANDLERS[name]).toBe(RPA_REMOTE_HANDLERS[name]);
        expect(STATELESS_HANDLERS[name].paramsDescription).toBeTypeOf('string');
    }
    for (const [name, handler] of Object.entries(RPA_LOCAL_HANDLERS)) {
        expect(STATELESS_HANDLERS[name]).toBe(handler);
    }
});

it('preserves the backend field names and scalar types in remote JSON arguments', () => {
    const params = { name: 'Task', process_id: 1, exec_type: 1, exec_sort: 2, exec_priority: 0, schedule_rule: '{}' };
    expect(resolveStatelessCommandArgs('rpa-create-task', JSON.stringify(params)))
        .toEqual({ ok: true, args: params });
    expect(resolveStatelessCommandArgs('rpa-get-task-detail', '124').ok).toBe(true);
    // Single-ID shorthand is reserved for existing browser commands; the remote schema requires an object.
    expect(resolveStatelessCommandArgs('rpa-get-task-detail', 'task-id').ok).toBe(false);
});
