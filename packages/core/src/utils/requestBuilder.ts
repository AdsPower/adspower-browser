import { CreateBrowserParams, UpdateBrowserParams } from '../types/browser.js';

export function buildRequestBody(params: CreateBrowserParams | UpdateBrowserParams): Record<string, any> {
    const requestBody: Record<string, any> = {};

    const basicFields: Record<string, string> = {
        groupId: 'group_id',
        username: 'username',
        password: 'password',
        cookie: 'cookie',
        fakey: 'fakey',
        name: 'name',
        platform: 'platform',
        remark: 'remark',
        proxyid: 'proxyid',
        repeatConfig: 'repeat_config',
        ignoreCookieError: 'ignore_cookie_error',
        tabs: 'tabs',
        ip: 'ip',
        country: 'country',
        region: 'region',
        city: 'city',
        ipchecker: 'ipchecker',
        categoryId: 'category_id',
        launchArgs: 'launch_args',
        profileId: 'profile_id',
        profileTagIds: 'profile_tag_ids',
        tagsUpdateType: 'tags_update_type'
    };
    Object.entries(basicFields).forEach(([paramKey, key]) => {
        const value = params[paramKey as keyof typeof params];
        if (value !== undefined) {
            requestBody[key] = value;
        }
    });

    if (params.userProxyConfig) {
        const proxyConfig = buildNestedConfig(params.userProxyConfig);
        if (Object.keys(proxyConfig).length > 0) {
            requestBody.user_proxy_config = proxyConfig;
        }
    }

    if (params.fingerprintConfig) {
        const fpConfig = buildNestedConfig(params.fingerprintConfig);
        if (Object.keys(fpConfig).length > 0) {
            requestBody.fingerprint_config = fpConfig;
        }
    }

    return requestBody;
}

function buildNestedConfig(config: Record<string, any>): Record<string, any> {
    const result: Record<string, any> = {};

    Object.entries(config).forEach(([key, value]) => {
        if (value !== undefined) {
            if (typeof value === 'object' && value !== null) {
                const nestedConfig = buildNestedConfig(value);
                if (Object.keys(nestedConfig).length > 0) {
                    result[key] = nestedConfig;
                }
            } else {
                result[key] = value;
            }
        }
    });

    return result;
}
