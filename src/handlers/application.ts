import { apiClient, LOCAL_API_BASE, API_ENDPOINTS } from '../constants/api.js';
import type { GetApplicationListParams } from '../types/application.js';

export const applicationHandlers = {
    /** Check the availability of the current device API interface (GET /status) */
    async checkStatus() {
        const response = await apiClient.get(`${LOCAL_API_BASE}${API_ENDPOINTS.STATUS}`);
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

        const response = await apiClient.get(`${LOCAL_API_BASE}${API_ENDPOINTS.GET_APPLICATION_LIST}`, { params });
        return `Application list: ${JSON.stringify(response.data.data.list, null, 2)}`;
    }
}; 