import { afterEach, describe, expect, it, vi } from 'vitest';
import * as apiModule from '../src/constants/api.js';
import { proxyHandlers } from '../src/handlers/proxy.js';
import { schemas } from '../src/types/schemas.js';

afterEach(() => vi.restoreAllMocks());

describe('dynamic proxy traffic', () => {
    it.each([
        {},
        { start_date: '2026-10-01' },
        { end_date: '2026-10-20' },
        { start_date: '2026-10-01', end_date: '2026-10-20' },
    ])('posts only supplied dates and preserves the API data: %j', async (params) => {
        const data = { traffic: 123 };
        const post = vi.fn().mockResolvedValue({ data: { code: 0, data } });
        vi.spyOn(apiModule, 'getApiClient').mockReturnValue({ post } as any);
        const result = await proxyHandlers.getDynamicProxyTraffic(schemas.getDynamicProxyTrafficSchema.parse(params));
        expect(post).toHaveBeenCalledWith(
            `${apiModule.getLocalApiBase()}/api/v2/proxy/dynamic-proxy-traffic`, params,
        );
        expect(JSON.parse(result)).toEqual(data);
    });

    it('supports omitted parameters and propagates API errors', async () => {
        const post = vi.fn().mockResolvedValue({ data: { code: -1, msg: 'Traffic query failed' } });
        vi.spyOn(apiModule, 'getApiClient').mockReturnValue({ post } as any);
        await expect(proxyHandlers.getDynamicProxyTraffic()).rejects.toThrow('Traffic query failed');
        expect(post).toHaveBeenCalledWith(expect.stringContaining('/api/v2/proxy/dynamic-proxy-traffic'), {});
    });

    it.each(['2026-2-01', '2026-02-30', '2026-10-20T00:00:00Z', ''])('rejects invalid dates: %s', (date) => {
        expect(schemas.getDynamicProxyTrafficSchema.safeParse({ start_date: date }).success).toBe(false);
        expect(schemas.getDynamicProxyTrafficSchema.safeParse({ end_date: date }).success).toBe(false);
    });
});
