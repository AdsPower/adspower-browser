import { expect, it } from 'vitest';
import { rpaRemoteSchemas } from '../src/rpa/remote/schemas';

it.each([rpaRemoteSchemas.getProcessListSchema, rpaRemoteSchemas.getProcessListCountSchema])('defaults flow query options %#', schema => {
    expect(schema.parse({})).toEqual({ page_size: 10, access_link: 0, origin: '0', block_expired_paid_template_process: 0 });
    expect(schema.parse({ access_link: 1 }).access_link).toBe(1);
    expect(schema.parse({ block_expired_paid_template_process: 1 }).block_expired_paid_template_process).toBe(1);
    for (const params of [{ access_link: 2 }, { origin: '1' }, { origin: 0 }, { block_expired_paid_template_process: 2 }]) {
        expect(schema.safeParse(params).success).toBe(false);
    }
});

it('accepts the nine unique response fields and rejects unsupported or malformed lists', () => {
    const fields = 'id,name,batch_id,remark,uri,top_time,setting,variable,file_size';
    expect(rpaRemoteSchemas.getProcessListSchema.parse({ fields }).fields).toBe(fields);
    for (const value of ['', 'unknown', 'id,unknown', 'id, name', 'id,', ',id']) {
        expect(rpaRemoteSchemas.getProcessListSchema.safeParse({ fields: value }).success).toBe(false);
    }
    expect(rpaRemoteSchemas.getProcessListCountSchema.safeParse({ fields }).success).toBe(false);
});
