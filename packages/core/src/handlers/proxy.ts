import { apiClient, LOCAL_API_BASE, API_ENDPOINTS } from '../constants/api.js';
import type {
    CreateProxyParams,
    UpdateProxyParams,
    GetProxyListParams,
    DeleteProxyParams
} from '../types/proxy.js';

function buildProxyRequestBody(params: UpdateProxyParams): Record<string, any> {
    const requestBody: Record<string, any> = {};

    if (params.proxyId) {
        requestBody.proxy_id = params.proxyId;
    }
    if (params.type !== undefined) {
        requestBody.type = params.type;
    }
    if (params.host !== undefined) {
        requestBody.host = params.host;
    }
    if (params.port !== undefined) {
        requestBody.port = params.port;
    }
    if (params.user !== undefined) {
        requestBody.user = params.user;
    }
    if (params.password !== undefined) {
        requestBody.password = params.password;
    }
    if (params.proxyUrl !== undefined) {
        requestBody.proxy_url = params.proxyUrl;
    }
    if (params.remark !== undefined) {
        requestBody.remark = params.remark;
    }
    if (params.ipchecker !== undefined) {
        requestBody.ipchecker = params.ipchecker;
    }

    return requestBody;
}

type ProxyItem = CreateProxyParams['proxies'][number];

function buildCreateProxyRequestBody(proxy: ProxyItem): Record<string, any> {
    const requestBody: Record<string, any> = {};

    requestBody.type = proxy.type;
    requestBody.host = proxy.host;
    requestBody.port = proxy.port;

    if (proxy.user !== undefined) {
        requestBody.user = proxy.user;
    }
    if (proxy.password !== undefined) {
        requestBody.password = proxy.password;
    }
    if (proxy.proxy_url !== undefined) {
        requestBody.proxy_url = proxy.proxy_url;
    }
    if (proxy.remark !== undefined) {
        requestBody.remark = proxy.remark;
    }
    if (proxy.ipchecker !== undefined) {
        requestBody.ipchecker = proxy.ipchecker;
    }

    return requestBody;
}

export const proxyHandlers = {
    async createProxy(params: CreateProxyParams) {
        const requestBody = params.proxies.map(proxy => buildCreateProxyRequestBody(proxy));
        const response = await apiClient.post(`${LOCAL_API_BASE}${API_ENDPOINTS.CREATE_PROXY}`, requestBody);

        if (response.data.code === 0) {
            return `Proxy created successfully with: ${Object.entries(response.data.data || {}).map(([key, value]) => `${key}: ${value}`).join('\n')}`;
        }
        throw new Error(`Failed to create proxy: ${response.data.msg}`);
    },

    async updateProxy(params: UpdateProxyParams) {
        const requestBody = buildProxyRequestBody(params);
        const response = await apiClient.post(`${LOCAL_API_BASE}${API_ENDPOINTS.UPDATE_PROXY}`, requestBody);

        if (response.data.code === 0) {
            return `Proxy updated successfully with: ${Object.entries(response.data.data || {}).map(([key, value]) => `${key}: ${value}`).join('\n')}`;
        }
        throw new Error(`Failed to update proxy: ${response.data.msg}`);
    },

    async getProxyList(params: GetProxyListParams) {
        const { limit, page, proxyId } = params;
        const requestBody: Record<string, any> = {};

        if (limit !== undefined) {
            requestBody.limit = limit;
        }
        if (page !== undefined) {
            requestBody.page = page;
        }
        if (proxyId && proxyId.length > 0) {
            requestBody.proxy_id = proxyId;
        }

        const response = await apiClient.post(`${LOCAL_API_BASE}${API_ENDPOINTS.GET_PROXY_LIST}`, requestBody);
        if (response.data.code === 0) {
            return `Proxy list: ${JSON.stringify(response.data.data.list || response.data.data, null, 2)}`;
        }
        throw new Error(`Failed to get proxy list: ${response.data.msg}`);
    },

    async deleteProxy({ proxyIds }: DeleteProxyParams) {
        const response = await apiClient.post(`${LOCAL_API_BASE}${API_ENDPOINTS.DELETE_PROXY}`, {
            proxy_id: proxyIds
        });

        if (response.data.code === 0) {
            return `Proxies deleted successfully: ${proxyIds.join(', ')}`;
        }
        throw new Error(`Failed to delete proxies: ${response.data.msg}`);
    }
};
