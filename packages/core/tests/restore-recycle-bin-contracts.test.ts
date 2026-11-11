import { afterEach, describe, expect, it, vi } from 'vitest';
import * as apiModule from '../src/constants/api.js';
import { browserHandlers } from '../src/handlers/browser.js';
import { schemas } from '../src/types/schemas.js';

afterEach(() => vi.restoreAllMocks());

describe('batch restore recycle bin', () => {
    it.each([
        { profile_id: ['id1', 'id2'] },
        { profile_no: ['00338', '339'] },
        { profile_id: ['id1'], profile_no: ['00338'] },
    ])('sends arrays to Local API as ASCII comma-separated strings: %j', async (selectors) => {
        const post = vi.fn().mockResolvedValue({ data: { code: 0, data: { restored: true } } });
        vi.spyOn(apiModule, 'getApiClient').mockReturnValue({ post } as any);
        const params = schemas.restoreRecycleBinSchema.parse({ ...selectors, group_id: '0' });
        await browserHandlers.restoreRecycleBin(params);
        expect(post).toHaveBeenCalledWith(
            `${apiModule.getLocalApiBase()}/api/v2/browser-profile/recycle-bin/restore`,
            {
                group_id: '0',
                ...(selectors.profile_id ? { profile_id: selectors.profile_id.join(',') } : {}),
                ...(selectors.profile_no ? { profile_no: selectors.profile_no.join(',') } : {}),
            },
        );
    });

    it.each([
        {}, { profile_id: [] }, { profile_no: [] },
        { profile_id: 'id1,id2' }, { profile_no: '338,339' },
        { profile_no: ['abc'] }, { profile_no: [338] },
        { profile_id: [], profile_no: ['338'] },
    ])('rejects missing, empty or non-array selectors: %j', (selectors) => {
        expect(schemas.restoreRecycleBinSchema.safeParse({ ...selectors, group_id: '0' }).success).toBe(false);
    });
});
