import { getApiClient, getLocalApiBase, API_ENDPOINTS } from '../constants/api.js';
import type { GetApplicationListParams } from '../types/application.js';
import { buildQueryParamsFor } from '../utils/requestBuilder.js';

export const applicationHandlers = {
    async checkStatus() {
        const response = await getApiClient().get(`${getLocalApiBase()}${API_ENDPOINTS.STATUS}`);
        return `Connection status: ${JSON.stringify(response.data, null, 2)}`;
    },

    async getApplicationList(params: GetApplicationListParams) {
        const query = buildQueryParamsFor('get-application-list', params as Record<string, unknown>);
        const response = await getApiClient().get(`${getLocalApiBase()}${API_ENDPOINTS.GET_APPLICATION_LIST}`, { params: query });
        return `Application list: ${JSON.stringify(response.data.data.list, null, 2)}`;
    }
};
