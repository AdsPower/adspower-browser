import { getApiClient, getLocalApiBase, API_ENDPOINTS } from '../constants/api.js';
import type {
    CreateProxyParams,
    UpdateProxyParams,
    GetProxyListParams,
    DeleteProxyParams
} from '../types/proxy.js';
import { buildRequestBodyFor } from '../utils/requestBuilder.js';

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
        const response = await getApiClient().post(`${getLocalApiBase()}${API_ENDPOINTS.CREATE_PROXY}`, requestBody);

        if (response.data.code === 0) {
            return `Proxy created successfully with: ${Object.entries(response.data.data || {}).map(([key, value]) => `${key}: ${value}`).join('\n')}`;
        }
        throw new Error(`Failed to create proxy: ${response.data.msg}`);
    },

    async updateProxy(params: UpdateProxyParams) {
        const requestBody = buildRequestBodyFor('update-proxy', params as Record<string, unknown>);
        const response = await getApiClient().post(`${getLocalApiBase()}${API_ENDPOINTS.UPDATE_PROXY}`, requestBody);

        if (response.data.code === 0) {
            return `Proxy updated successfully with: ${Object.entries(response.data.data || {}).map(([key, value]) => `${key}: ${value}`).join('\n')}`;
        }
        throw new Error(`Failed to update proxy: ${response.data.msg}`);
    },

    async getProxyList(params: GetProxyListParams) {
        const requestBody = buildRequestBodyFor('get-proxy-list', params as Record<string, unknown>);
        const response = await getApiClient().post(`${getLocalApiBase()}${API_ENDPOINTS.GET_PROXY_LIST}`, requestBody);
        if (response.data.code === 0) {
            return `Proxy list: ${JSON.stringify(response.data.data.list || response.data.data, null, 2)}`;
        }
        throw new Error(`Failed to get proxy list: ${response.data.msg}`);
    },

    async deleteProxy(params: DeleteProxyParams) {
        const response = await getApiClient().post(
            `${getLocalApiBase()}${API_ENDPOINTS.DELETE_PROXY}`,
            buildRequestBodyFor('delete-proxy', params as Record<string, unknown>)
        );
        const { proxy_id } = params as DeleteProxyParams & { proxy_id: string[] };

        if (response.data.code === 0) {
            return `Proxies deleted successfully: ${proxy_id.join(', ')}`;
        }
        throw new Error(`Failed to delete proxies: ${response.data.msg}`);
    }
};
