import { expect, it } from 'vitest';
import { rpaRemoteSchemas } from '../src/rpa/remote/schemas';
const schema = rpaRemoteSchemas.createShareSchema;
it('applies share defaults and advertises optional fields', () => {
    expect(schema.parse({ process_ids: '1,2' })).toEqual({ process_ids: '1,2', quota: 10, expired_time: 7, share_config: '' });
    expect(schema.toJSONSchema({ io: 'input' }).required).toEqual(['process_ids']);
});
it.each([1, 7, 30])('accepts validity %s with remark and maximum quota', expired_time => {
    expect(schema.safeParse({ process_ids: '1', quota: 1000, expired_time, share_config: 'remark' }).success).toBe(true);
});
it.each([{ quota: 1001 }, { quota: '10' }, { expired_time: 2 }, { expired_time: '7' },
    { share_config: '{}' }, { share_config: 'variable' }, { share_config: null }])('rejects invalid share fields %#', fields => {
    expect(schema.safeParse({ process_ids: '1', ...fields }).success).toBe(false);
});
