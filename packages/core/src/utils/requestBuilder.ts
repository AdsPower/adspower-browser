import { CreateBrowserParams, UpdateBrowserParams } from '../types/browser.js';
import { LOCAL_API_CONTRACTS, type ContractCommand } from '../constants/localApiContracts.js';

const LEGACY_BROWSER_PARAM_ALIASES: Record<string, string> = {
    groupId: 'group_id',
    userProxyConfig: 'user_proxy_config',
    repeatConfig: 'repeat_config',
    ignoreCookieError: 'ignore_cookie_error',
    categoryId: 'category_id',
    launchArgs: 'launch_args',
    profileId: 'profile_id',
    profileTagIds: 'profile_tag_ids',
    tagsUpdateType: 'tags_update_type',
    fingerprintConfig: 'fingerprint_config',
};

function normalizeBrowserParams(params: Record<string, any>): Record<string, unknown> {
    const normalized: Record<string, unknown> = {};

    Object.entries(params).forEach(([key, value]) => {
        normalized[LEGACY_BROWSER_PARAM_ALIASES[key] ?? key] = value;
    });

    return normalized;
}

function toContractValue(value: unknown): unknown {
    if (Array.isArray(value)) {
        return value;
    }

    if (value && typeof value === 'object') {
        return buildNestedConfig(value as Record<string, any>);
    }

    return value;
}

export function buildRequestBodyFor(command: ContractCommand, params: Record<string, unknown>): Record<string, unknown> {
    const requestBody: Record<string, unknown> = {};
    const contract = LOCAL_API_CONTRACTS[command];

    Object.entries(contract.params).forEach(([inputName, config]) => {
        if (config.location !== 'body') {
            return;
        }

        const value = params[inputName];
        if (value !== undefined) {
            requestBody[config.apiName] = toContractValue(value);
        }
    });

    return requestBody;
}

export function buildQueryParamsFor(command: ContractCommand, params: Record<string, unknown>): URLSearchParams {
    const query = new URLSearchParams();
    const contract = LOCAL_API_CONTRACTS[command];

    Object.entries(contract.params).forEach(([inputName, config]) => {
        if (config.location !== 'query') {
            return;
        }

        const value = params[inputName];
        if (value === undefined) {
            return;
        }

        query.set(config.apiName, Array.isArray(value) ? value.join(',') : String(value));
    });

    return query;
}

export function buildRequestBody(params: CreateBrowserParams | UpdateBrowserParams): Record<string, any> {
    const normalized = normalizeBrowserParams(params as Record<string, any>);
    const command: ContractCommand = normalized.profile_id !== undefined ? 'update-browser' : 'create-browser';
    return buildRequestBodyFor(command, normalized) as Record<string, any>;
}

export function buildNestedConfig(config: Record<string, any>): Record<string, any> {
    const result: Record<string, any> = {};

    Object.entries(config).forEach(([key, value]) => {
        if (value !== undefined) {
            if (Array.isArray(value)) {
                result[key] = value;
            } else if (typeof value === 'object' && value !== null) {
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
