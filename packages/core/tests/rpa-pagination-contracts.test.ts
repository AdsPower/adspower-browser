import { expect, it } from 'vitest';
import { rpaLocalTools } from '../src/rpa/local/tools';
import { rpaRemoteTools } from '../src/rpa/remote/tools';
import { rpaRemoteSchemas } from '../src/rpa/remote/schemas';

for (const tool of [...rpaLocalTools, ...rpaRemoteTools]) {
    const field = (tool.schema as any).shape?.page_size;
    if (!field) continue;
    it(`restricts page_size for ${tool.name}`, () => {
        expect(field.parse(undefined)).toBe(10);
        for (const value of [10, 20, 50, 100]) expect(field.safeParse(value).success).toBe(true);
        for (const value of [0, 1, 15, 25, 200, 1.5, '10']) expect(field.safeParse(value).success).toBe(false);
    });
}

it.each([rpaRemoteSchemas.getTaskListSchema, rpaRemoteSchemas.getTaskListCountSchema])('accepts omitted task type and numeric environment-number lists %#', schema => {
    expect(schema.parse({})).not.toHaveProperty('exec_type');
    expect(schema.parse({ fbcc_user_acc_id: '123,456', fbcc_user_ids: 'env-a,env-b' }))
        .toMatchObject({ fbcc_user_acc_id: '123,456', fbcc_user_ids: 'env-a,env-b' });
    for (const value of ['', 'a', '1,', ',1', '1,,2', '1, 2', '1.5', '-1']) {
        expect(schema.safeParse({ fbcc_user_acc_id: value }).success).toBe(false);
    }
});
