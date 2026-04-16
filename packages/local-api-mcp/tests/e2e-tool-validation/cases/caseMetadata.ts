/**
 * Declares which MCP tool each case exercises and which optional parameters are
 * validated on success (for aggregation / missingOptional reporting).
 */
export type CaseMetadata = {
    /** Primary MCP tool name (kebab-case). */
    tool: string;
    /** Optional parameter names covered when the case passes. */
    optionalParamsOnSuccess: string[];
    /**
     * Optional roundtrip metadata for compare rows in `details`.
     * Maps compare input field -> tool optional parameter name to mark covered
     * only when row status is `passed`.
     */
    roundtrip?: {
        optionalCoverageByInputPath?: Record<string, string>;
    };
};

export const caseMetadata: Record<string, CaseMetadata> = {
    'group.create.basic': { tool: 'create-group', optionalParamsOnSuccess: [] },
    'group.create.withRemark': { tool: 'create-group', optionalParamsOnSuccess: ['remark'] },
    'group.create.roundtrip.full-optional-subset': {
        tool: 'create-group',
        optionalParamsOnSuccess: [],
        roundtrip: {
            optionalCoverageByInputPath: {
                remark: 'remark',
            },
        },
    },
    'group.update.roundtrip.full-optional-subset': {
        tool: 'update-group',
        optionalParamsOnSuccess: [],
        roundtrip: {
            optionalCoverageByInputPath: {
                remark: 'remark',
            },
        },
    },
    'group.cleanup.visibility': { tool: 'update-group', optionalParamsOnSuccess: ['remark'] },
    'proxy.create.list.delete': {
        tool: 'create-proxy',
        optionalParamsOnSuccess: [],
    },
    'proxy.create.roundtrip.full-optional-subset': {
        tool: 'create-proxy',
        optionalParamsOnSuccess: [],
        roundtrip: {
            optionalCoverageByInputPath: {
                remark: 'remark',
            },
        },
    },
    'proxy.update.roundtrip.full-optional-subset': {
        tool: 'update-proxy',
        optionalParamsOnSuccess: [],
        roundtrip: {
            optionalCoverageByInputPath: {
                type: 'type',
                host: 'host',
                port: 'port',
                remark: 'remark',
            },
        },
    },
    'proxy.delete.visibility': { tool: 'delete-proxy', optionalParamsOnSuccess: [] },
    'browser.open.headless': { tool: 'open-browser', optionalParamsOnSuccess: ['headless'] },
    'lifecycle.open-browser.headless': { tool: 'open-browser', optionalParamsOnSuccess: ['headless'] },
    'lifecycle.close-browser.visibility': { tool: 'close-browser', optionalParamsOnSuccess: [] },
    'lifecycle.close-all-profiles.global': { tool: 'close-all-profiles', optionalParamsOnSuccess: [] },
    'browser.create.roundtrip.full-optional-subset': {
        tool: 'create-browser',
        optionalParamsOnSuccess: [],
        roundtrip: {
            optionalCoverageByInputPath: {
                username: 'username',
                password: 'password',
                cookie: 'cookie',
                name: 'name',
                remark: 'remark',
                platform: 'platform',
            },
        },
    },
    'browser.create.roundtrip.geo-and-account-optional-subset': {
        tool: 'create-browser',
        optionalParamsOnSuccess: [],
        roundtrip: {
            optionalCoverageByInputPath: {
                username: 'username',
                password: 'password',
                name: 'name',
                remark: 'remark',
                platform: 'platform',
                fakey: 'fakey',
                tabs: 'tabs',
                ignore_cookie_error: 'ignore_cookie_error',
                repeat_config: 'repeat_config',
                ip: 'ip',
                country: 'country',
                region: 'region',
                city: 'city',
                ipchecker: 'ipchecker',
            },
        },
    },
    'browser.create.roundtrip.proxy-and-fingerprint-optional-subset': {
        tool: 'create-browser',
        optionalParamsOnSuccess: [],
        roundtrip: {
            optionalCoverageByInputPath: {
                name: 'name',
                user_proxy_config_proxy_soft: 'user_proxy_config',
                user_proxy_config_global_config: 'user_proxy_config',
                fingerprint_config_audio: 'fingerprint_config',
                fingerprint_config_scan_port_type: 'fingerprint_config',
            },
        },
    },
    'browser.create.roundtrip.external-optional.blocked': {
        tool: 'create-browser',
        optionalParamsOnSuccess: [],
    },
    'browser.update.roundtrip.full-optional-subset': {
        tool: 'update-browser',
        optionalParamsOnSuccess: [],
        roundtrip: {
            optionalCoverageByInputPath: {
                username: 'username',
                password: 'password',
                cookie: 'cookie',
                name: 'name',
                remark: 'remark',
                platform: 'platform',
            },
        },
    },
    'browser.delete.visibility': { tool: 'delete-browser', optionalParamsOnSuccess: [] },

    'application.list.query': {
        tool: 'get-application-list',
        optionalParamsOnSuccess: ['category_id', 'page', 'limit'],
    },
    'tag.list.query': {
        tool: 'get-tag-list',
        optionalParamsOnSuccess: ['ids', 'limit', 'page'],
    },
    'tag.create.roundtrip.full-optional-subset': {
        tool: 'create-tag',
        optionalParamsOnSuccess: [],
        roundtrip: {
            optionalCoverageByInputPath: {},
        },
    },
    'tag.update.roundtrip.full-optional-subset': {
        tool: 'update-tag',
        optionalParamsOnSuccess: [],
        roundtrip: {
            optionalCoverageByInputPath: {},
        },
    },
    'tag.delete.visibility': { tool: 'delete-tag', optionalParamsOnSuccess: [] },
    'kernel.list.chrome': {
        tool: 'get-kernel-list',
        optionalParamsOnSuccess: ['kernel_type'],
    },
    'highimpact.new-fingerprint.by-profile-id': {
        tool: 'new-fingerprint',
        optionalParamsOnSuccess: ['profile_id'],
    },
    'highimpact.delete-cache-v2.cookie-only': {
        tool: 'delete-cache-v2',
        optionalParamsOnSuccess: ['profile_id', 'type'],
    },
    'highimpact.share-profile.with-receiver': {
        tool: 'share-profile',
        optionalParamsOnSuccess: ['profile_id', 'receiver'],
    },
    'patch.update.stable': {
        tool: 'update-patch',
        optionalParamsOnSuccess: ['version_type'],
    },
    'patch.update.blocked-by-default': {
        tool: 'update-patch',
        optionalParamsOnSuccess: [],
    },
    'automation.getOpened': { tool: 'get-opened-browser', optionalParamsOnSuccess: [] },
    'automation.checkStatus': { tool: 'check-status', optionalParamsOnSuccess: [] },
    'automation.chain.basic': { tool: 'get-page-visible-text', optionalParamsOnSuccess: [] },
    'kernel.download.minimal': {
        tool: 'download-kernel',
        optionalParamsOnSuccess: ['kernel_type', 'kernel_version'],
    },
    'query.get-browser-list.basic': { tool: 'get-browser-list', optionalParamsOnSuccess: [] },
    'query.get-browser-list.by-profile-id': {
        tool: 'get-browser-list',
        optionalParamsOnSuccess: ['profile_id'],
    },
    'query.get-group-list.basic': { tool: 'get-group-list', optionalParamsOnSuccess: [] },
    'query.get-group-list.by-group-name': {
        tool: 'get-group-list',
        optionalParamsOnSuccess: ['group_name'],
    },
    'query.get-proxy-list.basic': { tool: 'get-proxy-list', optionalParamsOnSuccess: [] },
    'query.get-proxy-list.by-proxy-id': {
        tool: 'get-proxy-list',
        optionalParamsOnSuccess: ['proxy_id'],
    },
    'query.get-tag-list.basic': { tool: 'get-tag-list', optionalParamsOnSuccess: [] },
    'query.get-tag-list.by-ids': { tool: 'get-tag-list', optionalParamsOnSuccess: ['ids'] },
    'query.get-application-list.basic': { tool: 'get-application-list', optionalParamsOnSuccess: [] },
    'query.get-application-list.by-category-id': {
        tool: 'get-application-list',
        optionalParamsOnSuccess: ['category_id'],
    },
    'query.get-kernel-list.basic': { tool: 'get-kernel-list', optionalParamsOnSuccess: [] },
    'query.get-kernel-list.by-kernel-type': {
        tool: 'get-kernel-list',
        optionalParamsOnSuccess: ['kernel_type'],
    },
    'query.get-browser-active.basic': { tool: 'get-browser-active', optionalParamsOnSuccess: [] },
    'query.get-browser-active.by-profile-no': {
        tool: 'get-browser-active',
        optionalParamsOnSuccess: ['profile_no'],
    },
    'query.get-cloud-active.basic': { tool: 'get-cloud-active', optionalParamsOnSuccess: [] },
    'query.get-cloud-active.filter-blocked': { tool: 'get-cloud-active', optionalParamsOnSuccess: [] },
    'query.check-status.basic': { tool: 'check-status', optionalParamsOnSuccess: [] },
    'query.check-status.filter-blocked': { tool: 'check-status', optionalParamsOnSuccess: [] },
    'query.get-opened-browser.basic': { tool: 'get-opened-browser', optionalParamsOnSuccess: [] },
    'query.get-opened-browser.filter-blocked': {
        tool: 'get-opened-browser',
        optionalParamsOnSuccess: [],
    },
};
