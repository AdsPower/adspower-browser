import { describe, expect, it } from 'vitest';
import type { z } from 'zod';
import { API_ENDPOINTS } from '../src/constants/api.js';
import { buildQueryParamsFor, buildRequestBodyFor } from '../src/utils/requestBuilder.js';
import { schemas } from '../src/types/schemas.js';

/**
 * External / wire contract (AdsPower Postman): parameter names use Postman spellings
 * such as profile_id, profile_no, group_id, proxy_id, proxy_url, share_type, user_ids, etc.
 * These tests encode that contract for Zod parsing and request body shaping.
 */

function mustParse<T extends z.ZodTypeAny>(schema: T, payload: unknown, message: string): void {
    const result = schema.safeParse(payload);
    expect(result.success, message + (result.success ? '' : `: ${JSON.stringify(result.error.flatten())}`)).toBe(
        true
    );
}

function schemaInputKeys(schema: z.ZodTypeAny): string[] {
    if ('shape' in schema && typeof schema.shape === 'object' && schema.shape !== null) {
        return Object.keys(schema.shape as Record<string, z.ZodTypeAny>);
    }

    if ('_def' in schema) {
        const def = (schema as { _def?: { schema?: z.ZodTypeAny } })._def;
        if (def?.schema) {
            return schemaInputKeys(def.schema);
        }
    }

    throw new Error('Cannot extract schema keys');
}

describe('Zod schemas accept Postman-style external keys', () => {
    it('get-application-list: category_id, page, limit (query/body parity)', () => {
        mustParse(
            schemas.getApplicationListSchema,
            { category_id: 'ext_cat', page: 1, limit: 50 },
            'getApplicationListSchema must accept Postman keys category_id, page, limit'
        );
    });

    it('open-browser: profile_id required; profile_no, ip_tab, launch_args optional', () => {
        mustParse(
            schemas.openBrowserSchema,
            {
                profile_id: 'h1yynkm',
                profile_no: '123',
                ip_tab: '0',
                launch_args: '--foo',
            },
            'openBrowserSchema must accept Postman keys profile_id, profile_no, ip_tab, launch_args'
        );
    });

    it('close-browser: profile_id | profile_no', () => {
        mustParse(
            schemas.closeBrowserSchema,
            { profile_id: 'h1yynkm' },
            'closeBrowserSchema must accept profile_id'
        );
        mustParse(schemas.closeBrowserSchema, { profile_no: '99' }, 'closeBrowserSchema must accept profile_no');
    });

    it('create-browser: group_id, category_id, user_proxy_config, repeat_config, ignore_cookie_error, profile_tag_ids', () => {
        mustParse(
            schemas.createBrowserSchema,
            {
                group_id: '0',
                category_id: 'cat1',
                user_proxy_config: { proxy_soft: 'no_proxy' },
                repeat_config: [0, 2],
                ignore_cookie_error: '0',
                profile_tag_ids: ['t1'],
                name: 'n',
            },
            'createBrowserSchema must accept Postman-style top-level keys (group_id, category_id, …)'
        );
    });

    it('update-browser: profile_id plus Postman-aligned optional fields', () => {
        mustParse(
            schemas.updateBrowserSchema,
            {
                profile_id: 'abc',
                launch_args: '--disable-gpu',
                tags_update_type: '1',
                group_id: '1',
            },
            'updateBrowserSchema must accept profile_id, launch_args, tags_update_type, group_id'
        );
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

    it('move-browser: user_ids, group_id', () => {
        mustParse(
            schemas.moveBrowserSchema,
            { user_ids: ['u1', 'u2'], group_id: '3' },
            'moveBrowserSchema must accept user_ids and group_id'
        );
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

    it('new-fingerprint: profile_id[] | profile_no[]', () => {
        mustParse(
            schemas.newFingerprintSchema,
            { profile_id: ['a'] },
            'newFingerprintSchema must accept profile_id array'
        );
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

    it('get-cloud-active: exposes user_ids key without locking unresolved value shape', () => {
        expect(
            schemaInputKeys(schemas.getCloudActiveSchema),
            'getCloudActiveSchema must expose Postman key user_ids'
        ).toContain('user_ids');
    });

    it('create-group: group_name', () => {
        mustParse(schemas.createGroupSchema, { group_name: 'G' }, 'createGroupSchema must accept group_name');
    });

    it('update-group: group_id, group_name', () => {
        mustParse(
            schemas.updateGroupSchema,
            { group_id: '1', group_name: 'N', remark: null },
            'updateGroupSchema must accept group_id and group_name'
        );
    });

    it('get-group-list: group_name, page, page_size', () => {
        mustParse(
            schemas.getGroupListSchema,
            { group_name: 'x', page: 1, page_size: 10 },
            'getGroupListSchema must accept group_name, page, page_size'
        );
    });

    it('update-proxy: proxy_id, proxy_url', () => {
        mustParse(
            schemas.updateProxySchema,
            { proxy_id: 'px', proxy_url: 'http://example.com' },
            'updateProxySchema must accept proxy_id and proxy_url'
        );
    });

    it('get-proxy-list: proxy_id[]', () => {
        mustParse(
            schemas.getProxyListSchema,
            { proxy_id: ['a'], page: 1, limit: 10 },
            'getProxyListSchema must accept proxy_id array'
        );
    });

    it('delete-proxy: proxy_id[]', () => {
        mustParse(
            schemas.deleteProxySchema,
            { proxy_id: ['a', 'b'] },
            'deleteProxySchema must accept proxy_id array'
        );
    });
});

describe('shared contract metadata and serializers', () => {
    it('maps open-browser to the documented v2 body contract', () => {
        const parsed = {
            profile_id: 'h1yynkm',
            ip_tab: '1',
            launch_args: ['--start-maximized'],
            delete_cache: '0',
            cdp_mask: '1',
        };

        expect(API_ENDPOINTS.START_BROWSER).toBe('/api/v2/browser-profile/start');
        expect(buildRequestBodyFor('open-browser', parsed)).toEqual({
            profile_id: 'h1yynkm',
            ip_tab: '1',
            launch_args: ['--start-maximized'],
            delete_cache: '0',
            cdp_mask: '1',
        });
    });

    it('maps query-style commands with documented API field names', () => {
        const query = buildQueryParamsFor('get-application-list', {
            category_id: '123',
            page: 2,
            limit: 50,
        });

        expect(query.toString()).toBe('category_id=123&page=2&limit=50');
    });
});
