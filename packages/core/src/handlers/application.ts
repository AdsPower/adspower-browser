import { getApiClient, getLocalApiBase, API_ENDPOINTS } from '../constants/api.js';
import type { GetApplicationListParams } from '../types/application.js';

export const applicationHandlers = {
    async checkStatus() {
        const response = await getApiClient().get(`${getLocalApiBase()}${API_ENDPOINTS.STATUS}`);
        return `Connection status: ${JSON.stringify(response.data, null, 2)}`;
    },

    async getApplicationList({ category_id, page, limit }: GetApplicationListParams) {
        const params = new URLSearchParams();
        if (category_id) {
            params.set('category_id', category_id);
        }
        if (page !== undefined) {
            params.set('page', page.toString());
        }
        if (limit !== undefined) {
            params.set('limit', limit.toString());
        }

        const response = await getApiClient().get(`${getLocalApiBase()}${API_ENDPOINTS.GET_APPLICATION_LIST}`, { params });
        return `Application list: ${JSON.stringify(response.data.data.list, null, 2)}`;
    }
};
