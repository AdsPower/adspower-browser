import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest';
import type { z } from 'zod';
import * as apiModule from '../src/constants/api.js';
import { API_ENDPOINTS } from '../src/constants/api.js';
import { LOCAL_API_CONTRACTS } from '../src/constants/localApiContracts.js';
import { browserHandlers } from '../src/handlers/browser.js';
import { groupHandlers } from '../src/handlers/group.js';
import { proxyHandlers } from '../src/handlers/proxy.js';
import type { CreateGroupParams, GetGroupListParams, UpdateGroupParams } from '../src/types/group.js';
import { buildQueryParamsFor, buildRequestBodyFor } from '../src/utils/requestBuilder.js';
import { schemas } from '../src/types/schemas.js';

/**
 * Browser-profile external / wire contract: parameter names use AdsPower Postman spellings.
 * These tests intentionally stay within Task 4 scope.
 */

function mustParse<T extends z.ZodTypeAny>(schema: T, payload: unknown, message: string): void {
    const result = schema.safeParse(payload);
    expect(result.success, message + (result.success ? '' : `: ${JSON.stringify(result.error.flatten())}`)).toBe(
        true
    );
}

afterEach(() => {
    vi.restoreAllMocks();
});

describe('Zod schemas accept Postman-style external keys', () => {
    it('open-browser: supports documented Postman field names', () => {
        mustParse(
            schemas.openBrowserSchema,
            {
                profile_id: 'h1yynkm',
                profile_no: '123',
                ip_tab: '0',
                launch_args: ['--foo'],
                headless: '0',
                last_opened_tabs: '1',
                proxy_detection: '0',
                password_filling: '1',
                password_saving: '0',
                cdp_mask: '1',
                delete_cache: '0',
                device_scale: '1',
            },
            'openBrowserSchema must accept documented Postman keys for browser-profile/start'
        );
    });

    it('open-browser: allows profile_no without profile_id and rejects missing both', () => {
        mustParse(
            schemas.openBrowserSchema,
            {
                profile_no: '123',
                ip_tab: '0',
            },
            'openBrowserSchema must accept profile_no without requiring profile_id'
        );

        expect(
            schemas.openBrowserSchema.safeParse({ ip_tab: '0' }).success,
            'openBrowserSchema must require at least one of profile_id or profile_no'
        ).toBe(false);
    });

    it('close-browser: profile_id | profile_no', () => {
        mustParse(
            schemas.closeBrowserSchema,
            { profile_id: 'h1yynkm' },
            'closeBrowserSchema must accept profile_id'
        );
        mustParse(schemas.closeBrowserSchema, { profile_no: '99' }, 'closeBrowserSchema must accept profile_no');
    });

    it('create-browser: group_id、category_id、user_proxy_config、repeat_config、ignore_cookie_error、profile_tag_ids、platform_account', () => {
        mustParse(
            schemas.createBrowserSchema,
            {
                group_id: '0',
                category_id: 'cat1',
                user_proxy_config: { proxy_soft: 'no_proxy' },
                repeat_config: '0',
                ignore_cookie_error: '0',
                profile_tag_ids: ['t1'],
                ipchecker: 'ipapi',
                platform_account: {
                    domain_name: 'facebook.com',
                    login_user: 'shop-user',
                    password: 'secret',
                    fakey: 'otp-secret',
                },
                fingerprint_config: { browser_kernel_config: { version: 'latest' } },
                name: 'n',
            },
            'createBrowserSchema must accept updated ipchecker values, structured platform_account, and latest kernel version'
        );
    });

    it('update-browser: profile_id 与 Postman 对齐的可选字段及收紧后的 platform_account', () => {
        mustParse(
            schemas.updateBrowserSchema,
            {
                profile_id: 'abc',
                launch_args: '--disable-gpu',
                tags_update_type: '1',
                group_id: '1',
                ipchecker: 'ipfoxy',
                fingerprint_config: { browser_kernel_config: { version: 'latest' } },
                platform_account: {
                    domain_name: 'facebook.com',
                    login_user: 'shop-user',
                },
            },
            'updateBrowserSchema must accept profile_id, updated ipchecker values, latest kernel version, and tightened platform_account'
        );

        expect(
            schemas.updateBrowserSchema.safeParse({
                profile_id: 'abc',
                platform_account: { arbitrary: true },
            }).success,
            'updateBrowserSchema must reject arbitrary platform_account objects'
        ).toBe(false);
    });

    it('delete-browser: profile_id as array', () => {
        mustParse(
            schemas.deleteBrowserSchema,
            { profile_id: ['a', 'b'] },
            'deleteBrowserSchema must accept profile_id[] per Postman'
        );
    });

    it('get-browser-list: group_id, profile_id[], profile_no[], sort_type, sort_order', () => {
        mustParse(
            schemas.getBrowserListSchema,
            {
                group_id: '1',
                page: 1,
                limit: 50,
                profile_id: ['p1'],
                profile_no: ['1'],
                sort_type: 'created_time',
                sort_order: 'desc',
                tag_ids: ['x'],
                tags_filter: 'include',
                name: 'foo',
                name_filter: 'exclude',
            },
            'getBrowserListSchema must use Postman key names for list filters'
        );
    });

    it('get-browser-list: enforces documented page and limit bounds', () => {
        expect(
            schemas.getBrowserListSchema.safeParse({ page: 0 }).success,
            'getBrowserListSchema must reject page values below 1'
        ).toBe(false);
        expect(
            schemas.getBrowserListSchema.safeParse({ limit: 0 }).success,
            'getBrowserListSchema must reject limit values below 1'
        ).toBe(false);
        expect(
            schemas.getBrowserListSchema.safeParse({ limit: 201 }).success,
            'getBrowserListSchema must reject limit values above 200'
        ).toBe(false);
    });

    it('get-browser-list: rejects empty filter arrays so they are not serialized downstream', () => {
        expect(
            schemas.getBrowserListSchema.safeParse({ profile_id: [] }).success,
            'getBrowserListSchema must reject empty profile_id arrays'
        ).toBe(false);
        expect(
            schemas.getBrowserListSchema.safeParse({ profile_no: [] }).success,
            'getBrowserListSchema must reject empty profile_no arrays'
        ).toBe(false);
        expect(
            schemas.getBrowserListSchema.safeParse({ tag_ids: [] }).success,
            'getBrowserListSchema must reject empty tag_ids arrays'
        ).toBe(false);
    });

    it('get-profile-cookies: profile_id | profile_no (query)', () => {
        mustParse(
            schemas.getProfileCookiesSchema,
            { profile_id: 'p' },
            'getProfileCookiesSchema must accept profile_id'
        );
    });

    it('get-profile-ua: profile_id[] | profile_no[]', () => {
        mustParse(
            schemas.getProfileUaSchema,
            { profile_id: ['a'] },
            'getProfileUaSchema must accept profile_id array'
        );
    });

    it('get-profile-ua: rejects empty arrays even when another selector is present', () => {
        expect(
            schemas.getProfileUaSchema.safeParse({ profile_id: [], profile_no: ['1'] }).success,
            'getProfileUaSchema must reject empty profile_id arrays'
        ).toBe(false);
        expect(
            schemas.getProfileUaSchema.safeParse({ profile_id: ['1'], profile_no: [] }).success,
            'getProfileUaSchema must reject empty profile_no arrays'
        ).toBe(false);
    });

    it('new-fingerprint: profile_id[] | profile_no[]', () => {
        mustParse(
            schemas.newFingerprintSchema,
            { profile_id: ['a'] },
            'newFingerprintSchema must accept profile_id array'
        );
    });

    it('new-fingerprint: rejects empty selector arrays', () => {
        expect(
            schemas.newFingerprintSchema.safeParse({ profile_id: [] }).success,
            'newFingerprintSchema must reject empty profile_id arrays'
        ).toBe(false);
        expect(
            schemas.newFingerprintSchema.safeParse({ profile_no: [] }).success,
            'newFingerprintSchema must reject empty profile_no arrays'
        ).toBe(false);
    });

    it('new-fingerprint: rejects empty object when no selectors are provided', () => {
        expect(
            schemas.newFingerprintSchema.safeParse({}).success,
            'newFingerprintSchema must reject empty objects without profile selectors'
        ).toBe(false);
    });

    it('delete-cache-v2: profile_id[], type[]', () => {
        mustParse(
            schemas.deleteCacheV2Schema,
            { profile_id: ['a'], type: ['cookie'] },
            'deleteCacheV2Schema must accept profile_id and type'
        );
    });

    it('share-profile: profile_id[], share_type, content', () => {
        mustParse(
            schemas.shareProfileSchema,
            {
                profile_id: ['a'],
                receiver: 'a@b.com',
                share_type: 1,
                content: ['name'],
            },
            'shareProfileSchema must accept profile_id, share_type, content'
        );
    });

    it('get-browser-active: profile_id | profile_no', () => {
        mustParse(
            schemas.getBrowserActiveSchema,
            { profile_id: 'p' },
            'getBrowserActiveSchema must accept profile_id'
        );
    });

});

describe('shared contract metadata and serializers', () => {
    it('maps open-browser to the documented v2 body contract', () => {
        const parsed = schemas.openBrowserSchema.parse({
            profile_id: 'h1yynkm',
            profile_no: '123',
            ip_tab: '1',
            launch_args: ['--start-maximized'],
            headless: '0',
            last_opened_tabs: '1',
            proxy_detection: '0',
            password_filling: '1',
            password_saving: '0',
            delete_cache: '0',
            cdp_mask: '1',
            device_scale: '1',
        });

        expect(API_ENDPOINTS.START_BROWSER).toBe('/api/v2/browser-profile/start');
        expect(buildRequestBodyFor('open-browser', parsed)).toEqual({
            profile_id: 'h1yynkm',
            profile_no: '123',
            ip_tab: '1',
            launch_args: ['--start-maximized'],
            headless: '0',
            last_opened_tabs: '1',
            proxy_detection: '0',
            password_filling: '1',
            password_saving: '0',
            delete_cache: '0',
            cdp_mask: '1',
            device_scale: '1',
        });
    });

    it('serializes get-browser-list body with documented API field names', () => {
        const parsed = schemas.getBrowserListSchema.parse({
            group_id: '0',
            limit: 50,
            page: 1,
            profile_id: ['abc'],
            sort_type: 'profile_no',
            sort_order: 'desc',
            tag_ids: ['tag-1'],
            tags_filter: 'include',
            name: 'shop',
            name_filter: 'include',
        });

        expect(buildRequestBodyFor('get-browser-list', parsed)).toEqual({
            group_id: '0',
            limit: 50,
            page: 1,
            profile_id: ['abc'],
            sort_type: 'profile_no',
            sort_order: 'desc',
            tag_ids: ['tag-1'],
            tags_filter: 'include',
            name: 'shop',
            name_filter: 'include',
        });
    });

    it('serializes create-browser body with platform_account', () => {
        const parsed = schemas.createBrowserSchema.parse({
            group_id: '0',
            name: 'shop',
            ipchecker: 'ipapi',
            user_proxy_config: { proxy_soft: 'no_proxy' },
            platform_account: {
                domain_name: 'facebook.com',
                login_user: 'shop-user',
                password: 'secret',
            },
            fingerprint_config: { browser_kernel_config: { version: 'latest' } },
        });

        expect(buildRequestBodyFor('create-browser', parsed)).toEqual({
            group_id: '0',
            name: 'shop',
            ipchecker: 'ipapi',
            user_proxy_config: { proxy_soft: 'no_proxy' },
            fingerprint_config: { browser_kernel_config: { version: 'latest' } },
            platform_account: {
                domain_name: 'facebook.com',
                login_user: 'shop-user',
                password: 'secret',
            },
        });
    });

    it('serializes update-browser body with platform_account', () => {
        const parsed = schemas.updateBrowserSchema.parse({
            profile_id: 'abc',
            ipchecker: 'ipfoxy',
            fingerprint_config: { browser_kernel_config: { version: 'latest' } },
            platform_account: {
                domain_name: 'facebook.com',
                login_user: 'shop-user',
            },
        });

        expect(buildRequestBodyFor('update-browser', parsed)).toEqual({
            profile_id: 'abc',
            ipchecker: 'ipfoxy',
            fingerprint_config: { browser_kernel_config: { version: 'latest' } },
            platform_account: {
                domain_name: 'facebook.com',
                login_user: 'shop-user',
            },
        });
    });

    it('serializes get-application-list query using category_id on the wire', () => {
        const parsed = schemas.getApplicationListSchema.parse({
            category_id: 'cate-1',
            page: 2,
            limit: 20,
        });

        expect(buildQueryParamsFor('get-application-list', parsed).toString()).toBe(
            'category_id=cate-1&page=2&limit=20',
        );
    });

    it('serializes create-group body using group_name on the wire', () => {
        const parsed = schemas.createGroupSchema.parse({
            group_name: 'Ops',
            remark: 'team',
        });

        expect(buildRequestBodyFor('create-group', parsed)).toEqual({
            group_name: 'Ops',
            remark: 'team',
        });
    });

    it('serializes update-group body using group_id and group_name on the wire', () => {
        const parsed = schemas.updateGroupSchema.parse({
            group_id: '12',
            group_name: 'Ops',
            remark: null,
        });

        expect(buildRequestBodyFor('update-group', parsed)).toEqual({
            group_id: '12',
            group_name: 'Ops',
            remark: null,
        });
    });

    it('serializes get-group-list query using page_size on the wire', () => {
        const parsed = schemas.getGroupListSchema.parse({
            group_name: 'Ops',
            page_size: 25,
            page: 3,
        });

        expect(buildQueryParamsFor('get-group-list', parsed).toString()).toBe(
            'group_name=Ops&page=3&page_size=25',
        );
    });

    it('group schemas reject legacy camelCase external keys', () => {
        expect(
            schemas.createGroupSchema.safeParse({ groupName: 'Ops' }).success,
            'createGroupSchema should reject groupName in favor of group_name',
        ).toBe(false);
        expect(
            schemas.updateGroupSchema.safeParse({ groupId: '12', groupName: 'Ops' }).success,
            'updateGroupSchema should reject camelCase group fields',
        ).toBe(false);
        expect(
            schemas.getGroupListSchema.safeParse({ groupName: 'Ops', size: 10 }).success,
            'getGroupListSchema should reject groupName and size in favor of group_name/page_size',
        ).toBe(false);
    });

    it('group exported parameter types stay aligned with the public schema contract', () => {
        const createGroupParams: CreateGroupParams = { group_name: 'Ops' };
        const updateGroupParams: UpdateGroupParams = { group_id: '12', group_name: 'Ops' };
        const getGroupListParams: GetGroupListParams = { group_name: 'Ops', page_size: 10, page: 1 };

        expectTypeOf(createGroupParams).toEqualTypeOf<z.infer<typeof schemas.createGroupSchema>>();
        expectTypeOf(updateGroupParams).toEqualTypeOf<z.infer<typeof schemas.updateGroupSchema>>();
        expectTypeOf(getGroupListParams).toEqualTypeOf<z.infer<typeof schemas.getGroupListSchema>>();
        expectTypeOf<CreateGroupParams>().toEqualTypeOf<z.infer<typeof schemas.createGroupSchema>>();
        expectTypeOf<UpdateGroupParams>().toEqualTypeOf<z.infer<typeof schemas.updateGroupSchema>>();
        expectTypeOf<GetGroupListParams>().toEqualTypeOf<z.infer<typeof schemas.getGroupListSchema>>();
    });

    it('serializes update-proxy body using proxy_url on the wire', () => {
        const parsed = schemas.updateProxySchema.parse({
            proxy_id: 'proxy-1',
            proxy_url: 'https://refresh.example.com',
        });

        expect(buildRequestBodyFor('update-proxy', parsed)).toEqual({
            proxy_id: 'proxy-1',
            proxy_url: 'https://refresh.example.com',
        });
    });

    it('serializes get-proxy-list body using proxy_id on the wire', () => {
        const parsed = schemas.getProxyListSchema.parse({
            proxy_id: ['proxy-1', 'proxy-2'],
            page: 1,
            limit: 10,
        });

        expect(buildRequestBodyFor('get-proxy-list', parsed)).toEqual({
            proxy_id: ['proxy-1', 'proxy-2'],
            page: 1,
            limit: 10,
        });
    });

    it('serializes delete-proxy body using proxy_id array on the wire', () => {
        const parsed = schemas.deleteProxySchema.parse({
            proxy_id: ['proxy-1', 'proxy-2'],
        });

        expect(buildRequestBodyFor('delete-proxy', parsed)).toEqual({
            proxy_id: ['proxy-1', 'proxy-2'],
        });
    });

    it('accepts create-proxy as a top-level proxy array', () => {
        const parsed = schemas.createProxySchema.parse([
            {
                type: 'http',
                host: '127.0.0.1',
                port: '8080',
                proxy_url: 'https://refresh.example.com',
            },
        ]);

        expect(parsed).toEqual([
            {
                type: 'http',
                host: '127.0.0.1',
                port: '8080',
                proxy_url: 'https://refresh.example.com',
            },
        ]);
    });

    it('marks create-proxy contract metadata as a top-level body array', () => {
        expect(LOCAL_API_CONTRACTS['create-proxy']).toMatchObject({
            bodyShape: 'array',
            params: {},
        });
    });

    it('rejects legacy create-proxy wrapper objects', () => {
        expect(
            schemas.createProxySchema.safeParse({
                proxies: [
                    {
                        type: 'http',
                        host: '127.0.0.1',
                        port: '8080',
                    },
                ],
            }).success,
            'createProxySchema should reject the legacy proxies wrapper in favor of a top-level array',
        ).toBe(false);
    });

    it('proxy schemas reject legacy camelCase external keys', () => {
        expect(
            schemas.updateProxySchema.safeParse({ proxyId: 'proxy-1' }).success,
            'updateProxySchema should reject proxyId in favor of proxy_id',
        ).toBe(false);
        expect(
            schemas.getProxyListSchema.safeParse({ proxyId: ['proxy-1'] }).success,
            'getProxyListSchema should reject proxyId in favor of proxy_id',
        ).toBe(false);
        expect(
            schemas.deleteProxySchema.safeParse({ proxyIds: ['proxy-1'] }).success,
            'deleteProxySchema should reject proxyIds in favor of proxy_id',
        ).toBe(false);
    });

    it('getProxyListSchema rejects empty proxy_id arrays so they are not serialized downstream', () => {
        expect(
            schemas.getProxyListSchema.safeParse({ proxy_id: [] }).success,
            'getProxyListSchema must reject empty proxy_id arrays',
        ).toBe(false);
    });

    it('update-proxy schema rejects ipinfo and accepts the narrowed ipchecker set', () => {
        expect(
            schemas.updateProxySchema.safeParse({
                proxy_id: 'proxy-1',
                ipchecker: 'ipinfo',
            }).success,
            'updateProxySchema must reject ipinfo after schema narrowing',
        ).toBe(false);
        mustParse(
            schemas.updateProxySchema,
            {
                proxy_id: 'proxy-1',
                ipchecker: 'ipapi',
            },
            'updateProxySchema must accept narrowed ipchecker values',
        );
    });

    it('serializes get-tag-list body using ids on the wire', () => {
        const parsed = schemas.getTagListSchema.parse({
            ids: ['tag-1'],
            page: 2,
            limit: 10,
        });

        expect(buildRequestBodyFor('get-tag-list', parsed)).toEqual({
            ids: ['tag-1'],
            page: 2,
            limit: 10,
        });
    });

    it('serializes download-kernel body using kernel_type on the wire', () => {
        const parsed = schemas.downloadKernelSchema.parse({
            kernel_type: 'Chrome',
            kernel_version: '141',
        });

        expect(buildRequestBodyFor('download-kernel', parsed)).toEqual({
            kernel_type: 'Chrome',
            kernel_version: '141',
        });
    });

    it('serializes get-kernel-list query using kernel_type on the wire', () => {
        const parsed = schemas.getKernelListSchema.parse({
            kernel_type: 'Firefox',
        });

        expect(buildQueryParamsFor('get-kernel-list', parsed).toString()).toBe(
            'kernel_type=Firefox',
        );
    });

    it('serializes update-patch body using version_type on the wire', () => {
        const parsed = schemas.updatePatchSchema.parse({
            version_type: 'beta',
        });

        expect(buildRequestBodyFor('update-patch', parsed)).toEqual({
            version_type: 'beta',
        });
    });

    it('move-browser handler sends user_ids and group_id on the wire', async () => {
        const parsed = schemas.moveBrowserSchema.parse({
            user_ids: ['profile-1', 'profile-2'],
            group_id: '12',
        });
        const post = vi.fn().mockResolvedValue({
            data: {
                code: 0,
                data: {},
            },
        });

        vi.spyOn(apiModule, 'getApiClient').mockReturnValue({ post } as any);

        await browserHandlers.moveBrowser(parsed as any);

        expect(post).toHaveBeenCalledWith(
            `${apiModule.getLocalApiBase()}${API_ENDPOINTS.MOVE_BROWSER}`,
            {
                group_id: '12',
                user_ids: ['profile-1', 'profile-2'],
            },
        );
    });

    it('get-cloud-active handler sends user_ids on the wire', async () => {
        const parsed = schemas.getCloudActiveSchema.parse({
            user_ids: 'profile-1,profile-2',
        });
        const post = vi.fn().mockResolvedValue({
            data: {
                code: 0,
                data: {},
            },
        });

        vi.spyOn(apiModule, 'getApiClient').mockReturnValue({ post } as any);

        await browserHandlers.getCloudActive(parsed as any);

        expect(post).toHaveBeenCalledWith(
            `${apiModule.getLocalApiBase()}${API_ENDPOINTS.GET_CLOUD_ACTIVE}`,
            {
                user_ids: 'profile-1,profile-2',
            },
        );
    });

    it('create-proxy handler sends a top-level proxy array on the wire', async () => {
        const parsed = schemas.createProxySchema.parse([
            {
                type: 'http',
                host: '127.0.0.1',
                port: '8080',
                proxy_url: 'https://refresh.example.com',
            },
        ]);
        const post = vi.fn().mockResolvedValue({
            data: {
                code: 0,
                data: {},
            },
        });

        vi.spyOn(apiModule, 'getApiClient').mockReturnValue({ post } as any);

        await proxyHandlers.createProxy(parsed as any);

        expect(post).toHaveBeenCalledWith(
            `${apiModule.getLocalApiBase()}${API_ENDPOINTS.CREATE_PROXY}`,
            [
                {
                    type: 'http',
                    host: '127.0.0.1',
                    port: '8080',
                    proxy_url: 'https://refresh.example.com',
                },
            ],
        );
    });

    it('get-group-list handler returns the list only when response code is 0', async () => {
        const parsed = schemas.getGroupListSchema.parse({
            group_name: 'Ops',
            page: 1,
            page_size: 10,
        });
        const get = vi.fn().mockResolvedValue({
            data: {
                code: 0,
                data: {
                    list: [{ group_id: '1', group_name: 'Ops' }],
                },
            },
        });

        vi.spyOn(apiModule, 'getApiClient').mockReturnValue({ get } as any);

        await expect(groupHandlers.getGroupList(parsed as any)).resolves.toBe(
            'Group list: [\n  {\n    "group_id": "1",\n    "group_name": "Ops"\n  }\n]'
        );
    });

    it('get-group-list handler throws when response code is not 0', async () => {
        const parsed = schemas.getGroupListSchema.parse({
            group_name: 'Ops',
        });
        const get = vi.fn().mockResolvedValue({
            data: {
                code: 1,
                msg: 'group list failed',
                data: {
                    list: [],
                },
            },
        });

        vi.spyOn(apiModule, 'getApiClient').mockReturnValue({ get } as any);

        await expect(groupHandlers.getGroupList(parsed as any)).rejects.toThrow(
            'Failed to get group list: group list failed'
        );
    });

});
