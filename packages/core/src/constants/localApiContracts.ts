export type ContractCommand =
    | 'check-status'
    | 'get-application-list'
    | 'open-browser'
    | 'close-browser'
    | 'create-browser'
    | 'update-browser'
    | 'delete-browser'
    | 'get-browser-list'
    | 'get-opened-browser'
    | 'move-browser'
    | 'get-profile-cookies'
    | 'get-profile-ua'
    | 'close-all-profiles'
    | 'new-fingerprint'
    | 'delete-cache-v2'
    | 'share-profile'
    | 'get-browser-active'
    | 'get-cloud-active'
    | 'create-group'
    | 'update-group'
    | 'get-group-list'
    | 'create-proxy'
    | 'update-proxy'
    | 'get-proxy-list'
    | 'delete-proxy'
    | 'get-tag-list'
    | 'create-tag'
    | 'update-tag'
    | 'delete-tag'
    | 'download-kernel'
    | 'get-kernel-list'
    | 'update-patch';

export type ParamLocation = 'body' | 'query';

export type ContractParam = {
    apiName: string;
    location: ParamLocation;
};

export type LocalApiContract = {
    method: 'GET' | 'POST';
    path: string;
    params: Record<string, ContractParam>;
    bodyShape?: 'object' | 'array';
};

export const LOCAL_API_CONTRACTS: Record<ContractCommand, LocalApiContract> = {
    'check-status': {
        method: 'GET',
        path: '/status',
        params: {},
    },
    'get-application-list': {
        method: 'GET',
        path: '/api/v2/category/list',
        params: {
            category_id: { apiName: 'category_id', location: 'query' },
            page: { apiName: 'page', location: 'query' },
            limit: { apiName: 'limit', location: 'query' },
        },
    },
    'open-browser': {
        method: 'POST',
        path: '/api/v2/browser-profile/start',
        params: {
            profile_id: { apiName: 'profile_id', location: 'body' },
            profile_no: { apiName: 'profile_no', location: 'body' },
            ip_tab: { apiName: 'ip_tab', location: 'body' },
            launch_args: { apiName: 'launch_args', location: 'body' },
            headless: { apiName: 'headless', location: 'body' },
            last_opened_tabs: { apiName: 'last_opened_tabs', location: 'body' },
            proxy_detection: { apiName: 'proxy_detection', location: 'body' },
            password_filling: { apiName: 'password_filling', location: 'body' },
            password_saving: { apiName: 'password_saving', location: 'body' },
            cdp_mask: { apiName: 'cdp_mask', location: 'body' },
            delete_cache: { apiName: 'delete_cache', location: 'body' },
            device_scale: { apiName: 'device_scale', location: 'body' },
        },
    },
    'close-browser': {
        method: 'POST',
        path: '/api/v2/browser-profile/stop',
        params: {
            profile_id: { apiName: 'profile_id', location: 'body' },
            profile_no: { apiName: 'profile_no', location: 'body' },
        },
    },
    'create-browser': {
        method: 'POST',
        path: '/api/v2/browser-profile/create',
        params: {
            group_id: { apiName: 'group_id', location: 'body' },
            username: { apiName: 'username', location: 'body' },
            password: { apiName: 'password', location: 'body' },
            cookie: { apiName: 'cookie', location: 'body' },
            fakey: { apiName: 'fakey', location: 'body' },
            name: { apiName: 'name', location: 'body' },
            platform: { apiName: 'platform', location: 'body' },
            remark: { apiName: 'remark', location: 'body' },
            user_proxy_config: { apiName: 'user_proxy_config', location: 'body' },
            proxyid: { apiName: 'proxyid', location: 'body' },
            repeat_config: { apiName: 'repeat_config', location: 'body' },
            ignore_cookie_error: { apiName: 'ignore_cookie_error', location: 'body' },
            tabs: { apiName: 'tabs', location: 'body' },
            ip: { apiName: 'ip', location: 'body' },
            country: { apiName: 'country', location: 'body' },
            region: { apiName: 'region', location: 'body' },
            city: { apiName: 'city', location: 'body' },
            ipchecker: { apiName: 'ipchecker', location: 'body' },
            category_id: { apiName: 'category_id', location: 'body' },
            profile_tag_ids: { apiName: 'profile_tag_ids', location: 'body' },
            fingerprint_config: { apiName: 'fingerprint_config', location: 'body' },
            platform_account: { apiName: 'platform_account', location: 'body' },
        },
    },
    'update-browser': {
        method: 'POST',
        path: '/api/v2/browser-profile/update',
        params: {
            profile_id: { apiName: 'profile_id', location: 'body' },
            group_id: { apiName: 'group_id', location: 'body' },
            username: { apiName: 'username', location: 'body' },
            password: { apiName: 'password', location: 'body' },
            cookie: { apiName: 'cookie', location: 'body' },
            fakey: { apiName: 'fakey', location: 'body' },
            name: { apiName: 'name', location: 'body' },
            platform: { apiName: 'platform', location: 'body' },
            remark: { apiName: 'remark', location: 'body' },
            user_proxy_config: { apiName: 'user_proxy_config', location: 'body' },
            proxyid: { apiName: 'proxyid', location: 'body' },
            repeat_config: { apiName: 'repeat_config', location: 'body' },
            ignore_cookie_error: { apiName: 'ignore_cookie_error', location: 'body' },
            tabs: { apiName: 'tabs', location: 'body' },
            ip: { apiName: 'ip', location: 'body' },
            country: { apiName: 'country', location: 'body' },
            region: { apiName: 'region', location: 'body' },
            city: { apiName: 'city', location: 'body' },
            ipchecker: { apiName: 'ipchecker', location: 'body' },
            category_id: { apiName: 'category_id', location: 'body' },
            profile_tag_ids: { apiName: 'profile_tag_ids', location: 'body' },
            fingerprint_config: { apiName: 'fingerprint_config', location: 'body' },
            platform_account: { apiName: 'platform_account', location: 'body' },
            launch_args: { apiName: 'launch_args', location: 'body' },
            tags_update_type: { apiName: 'tags_update_type', location: 'body' },
        },
    },
    'delete-browser': {
        method: 'POST',
        path: '/api/v2/browser-profile/delete',
        params: {
            profile_id: { apiName: 'profile_id', location: 'body' },
        },
    },
    'get-browser-list': {
        method: 'POST',
        path: '/api/v2/browser-profile/list',
        params: {
            group_id: { apiName: 'group_id', location: 'body' },
            limit: { apiName: 'limit', location: 'body' },
            page: { apiName: 'page', location: 'body' },
            profile_id: { apiName: 'profile_id', location: 'body' },
            profile_no: { apiName: 'profile_no', location: 'body' },
            sort_type: { apiName: 'sort_type', location: 'body' },
            sort_order: { apiName: 'sort_order', location: 'body' },
            tag_ids: { apiName: 'tag_ids', location: 'body' },
            tags_filter: { apiName: 'tags_filter', location: 'body' },
            name: { apiName: 'name', location: 'body' },
            name_filter: { apiName: 'name_filter', location: 'body' },
        },
    },
    'get-opened-browser': {
        method: 'GET',
        path: '/api/v1/browser/local-active',
        params: {},
    },
    'move-browser': {
        method: 'POST',
        path: '/api/v1/user/regroup',
        params: {
            user_ids: { apiName: 'user_ids', location: 'body' },
            group_id: { apiName: 'group_id', location: 'body' },
        },
    },
    'get-profile-cookies': {
        method: 'GET',
        path: '/api/v2/browser-profile/cookies',
        params: {
            profile_id: { apiName: 'profile_id', location: 'query' },
            profile_no: { apiName: 'profile_no', location: 'query' },
        },
    },
    'get-profile-ua': {
        method: 'POST',
        path: '/api/v2/browser-profile/ua',
        params: {
            profile_id: { apiName: 'profile_id', location: 'body' },
            profile_no: { apiName: 'profile_no', location: 'body' },
        },
    },
    'close-all-profiles': {
        method: 'POST',
        path: '/api/v2/browser-profile/stop-all',
        params: {},
    },
    'new-fingerprint': {
        method: 'POST',
        path: '/api/v2/browser-profile/new-fingerprint',
        params: {
            profile_id: { apiName: 'profile_id', location: 'body' },
            profile_no: { apiName: 'profile_no', location: 'body' },
        },
    },
    'delete-cache-v2': {
        method: 'POST',
        path: '/api/v2/browser-profile/delete-cache',
        params: {
            profile_id: { apiName: 'profile_id', location: 'body' },
            type: { apiName: 'type', location: 'body' },
        },
    },
    'share-profile': {
        method: 'POST',
        path: '/api/v2/browser-profile/share',
        params: {
            profile_id: { apiName: 'profile_id', location: 'body' },
            receiver: { apiName: 'receiver', location: 'body' },
            share_type: { apiName: 'share_type', location: 'body' },
            content: { apiName: 'content', location: 'body' },
        },
    },
    'get-browser-active': {
        method: 'GET',
        path: '/api/v2/browser-profile/active',
        params: {
            profile_id: { apiName: 'profile_id', location: 'query' },
            profile_no: { apiName: 'profile_no', location: 'query' },
        },
    },
    'get-cloud-active': {
        method: 'POST',
        path: '/api/v1/browser/cloud-active',
        params: {
            user_ids: { apiName: 'user_ids', location: 'body' },
        },
    },
    'create-group': {
        method: 'POST',
        path: '/api/v1/group/create',
        params: {
            group_name: { apiName: 'group_name', location: 'body' },
            remark: { apiName: 'remark', location: 'body' },
        },
    },
    'update-group': {
        method: 'POST',
        path: '/api/v1/group/update',
        params: {
            group_id: { apiName: 'group_id', location: 'body' },
            group_name: { apiName: 'group_name', location: 'body' },
            remark: { apiName: 'remark', location: 'body' },
        },
    },
    'get-group-list': {
        method: 'GET',
        path: '/api/v1/group/list',
        params: {
            group_name: { apiName: 'group_name', location: 'query' },
            page: { apiName: 'page', location: 'query' },
            page_size: { apiName: 'page_size', location: 'query' },
        },
    },
    'create-proxy': {
        method: 'POST',
        path: '/api/v2/proxy-list/create',
        params: {},
        bodyShape: 'array',
    },
    'update-proxy': {
        method: 'POST',
        path: '/api/v2/proxy-list/update',
        params: {
            proxy_id: { apiName: 'proxy_id', location: 'body' },
            type: { apiName: 'type', location: 'body' },
            host: { apiName: 'host', location: 'body' },
            port: { apiName: 'port', location: 'body' },
            user: { apiName: 'user', location: 'body' },
            password: { apiName: 'password', location: 'body' },
            proxy_url: { apiName: 'proxy_url', location: 'body' },
            remark: { apiName: 'remark', location: 'body' },
            ipchecker: { apiName: 'ipchecker', location: 'body' },
        },
    },
    'get-proxy-list': {
        method: 'POST',
        path: '/api/v2/proxy-list/list',
        params: {
            proxy_id: { apiName: 'proxy_id', location: 'body' },
            limit: { apiName: 'limit', location: 'body' },
            page: { apiName: 'page', location: 'body' },
        },
    },
    'delete-proxy': {
        method: 'POST',
        path: '/api/v2/proxy-list/delete',
        params: {
            proxy_id: { apiName: 'proxy_id', location: 'body' },
        },
    },
    'get-tag-list': {
        method: 'POST',
        path: '/api/v2/browser-tags/list',
        params: {
            ids: { apiName: 'ids', location: 'body' },
            page: { apiName: 'page', location: 'body' },
            limit: { apiName: 'limit', location: 'body' },
        },
    },
    'create-tag': {
        method: 'POST',
        path: '/api/v2/browser-tags/create',
        params: {
            tags: { apiName: 'tags', location: 'body' },
        },
    },
    'update-tag': {
        method: 'POST',
        path: '/api/v2/browser-tags/update',
        params: {
            tags: { apiName: 'tags', location: 'body' },
        },
    },
    'delete-tag': {
        method: 'POST',
        path: '/api/v2/browser-tags/delete',
        params: {
            ids: { apiName: 'ids', location: 'body' },
        },
    },
    'download-kernel': {
        method: 'POST',
        path: '/api/v2/browser-profile/download-kernel',
        params: {
            kernel_type: { apiName: 'kernel_type', location: 'body' },
            kernel_version: { apiName: 'kernel_version', location: 'body' },
        },
    },
    'get-kernel-list': {
        method: 'GET',
        path: '/api/v2/browser-profile/kernels',
        params: {
            kernel_type: { apiName: 'kernel_type', location: 'query' },
        },
    },
    'update-patch': {
        method: 'POST',
        path: '/api/v2/browser-profile/update-patch',
        params: {
            version_type: { apiName: 'version_type', location: 'body' },
        },
    },
};
