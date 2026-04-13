import { describe, expect, it } from 'vitest';
import type { z } from 'zod';
import { API_ENDPOINTS } from '../src/constants/api.js';
import { buildRequestBodyFor } from '../src/utils/requestBuilder.js';
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

    it('create-browser: group_id, category_id, user_proxy_config, repeat_config, ignore_cookie_error, profile_tag_ids, platform_account', () => {
        mustParse(
            schemas.createBrowserSchema,
            {
                group_id: '0',
                category_id: 'cat1',
                user_proxy_config: { proxy_soft: 'no_proxy' },
                repeat_config: [0, 2],
                ignore_cookie_error: '0',
                profile_tag_ids: ['t1'],
                ipchecker: 'ipinfo',
                platform_account: { account: 'shop-user', password: 'secret' },
                fingerprint_config: { browser_kernel_config: { version: 'latest' } },
                name: 'n',
            },
            'createBrowserSchema must accept browser-profile keys including ipchecker, platform_account, and latest kernel version'
        );
    });

    it('update-browser: profile_id plus Postman-aligned optional fields and tightened platform_account', () => {
        mustParse(
            schemas.updateBrowserSchema,
            {
                profile_id: 'abc',
                launch_args: '--disable-gpu',
                tags_update_type: '1',
                group_id: '1',
                ipchecker: 'ipfoxy',
                fingerprint_config: { browser_kernel_config: { version: 'latest' } },
                platform_account: { account: 'shop-user' },
            },
            'updateBrowserSchema must accept profile_id, ipchecker, latest kernel version, and tightened platform_account'
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
            ipchecker: 'ipinfo',
            user_proxy_config: { proxy_soft: 'no_proxy' },
            platform_account: { account: 'shop-user', password: 'secret' },
            fingerprint_config: { browser_kernel_config: { version: 'latest' } },
        });

        expect(buildRequestBodyFor('create-browser', parsed)).toEqual({
            group_id: '0',
            name: 'shop',
            ipchecker: 'ipinfo',
            user_proxy_config: { proxy_soft: 'no_proxy' },
            fingerprint_config: { browser_kernel_config: { version: 'latest' } },
            platform_account: { account: 'shop-user', password: 'secret' },
        });
    });

    it('serializes update-browser body with platform_account', () => {
        const parsed = schemas.updateBrowserSchema.parse({
            profile_id: 'abc',
            ipchecker: 'ipfoxy',
            fingerprint_config: { browser_kernel_config: { version: 'latest' } },
            platform_account: { account: 'shop-user' },
        });

        expect(buildRequestBodyFor('update-browser', parsed)).toEqual({
            profile_id: 'abc',
            ipchecker: 'ipfoxy',
            fingerprint_config: { browser_kernel_config: { version: 'latest' } },
            platform_account: { account: 'shop-user' },
        });
    });

});
