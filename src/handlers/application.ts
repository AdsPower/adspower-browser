import { apiClient, LOCAL_API_BASE, API_ENDPOINTS } from '../constants/api.js';
import type { GetApplicationListParams } from '../types/application.js';

export const applicationHandlers = {
    async getApplicationList({ size }: GetApplicationListParams) {
        const params = new URLSearchParams();
        if (size) {
            params.set('page_size', size.toString());
        }

        const response = await apiClient.get(`${LOCAL_API_BASE}${API_ENDPOINTS.GET_APPLICATION_LIST}`, { params });
        return `Application list: ${JSON.stringify(response.data.data.list, null, 2)}`;
    }
}; 