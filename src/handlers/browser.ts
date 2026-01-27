import { apiClient, LOCAL_API_BASE, API_ENDPOINTS } from '../constants/api.js';
import { buildRequestBody } from '../utils/requestBuilder.js';
import type { 
    OpenBrowserParams,
    CloseBrowserParams,
    CreateBrowserParams,
    UpdateBrowserParams,
    DeleteBrowserParams,
    GetBrowserListParams,
    MoveBrowserParams
} from '../types/browser.js';

export const browserHandlers = {
    async openBrowser({ serialNumber, userId, ipTab, launchArgs, clearCacheAfterClosing, cdpMask }: OpenBrowserParams) {
        const params = new URLSearchParams();
        if (serialNumber) {
            params.set('serial_number', serialNumber);
        }
        if (userId) {
            params.set('user_id', userId);
        }
        if (ipTab) {
            params.set('open_tabs', ipTab);
        }
        if (launchArgs) {
            params.set('launch_args', launchArgs);
        }
        if (clearCacheAfterClosing) {
            params.set('clear_cache_after_closing', clearCacheAfterClosing);
        }
        if (cdpMask) {
            params.set('cdp_mask', cdpMask);
        }
        params.set('open_tabs', '0');

        const response = await apiClient.get(`${LOCAL_API_BASE}${API_ENDPOINTS.START_BROWSER}`, { params });
        if (response.data.code === 0) {
            return `Browser opened successfully with: ${Object.entries(response.data.data).map(([key, value]) => {
                if (value && typeof value === 'object') {
                    return Object.entries(value).map(([key, value]) => `ws.${key}: ${value}`).join('\n');
                }
                return `${key}: ${value}`;
            }).join('\n')}`;
        }
        throw new Error(`Failed to open browser: ${response.data.msg}`);
    },

    async closeBrowser({ userId }: CloseBrowserParams) {
        const response = await apiClient.get(`${LOCAL_API_BASE}${API_ENDPOINTS.CLOSE_BROWSER}`, {
            params: { user_id: userId }
        });
        return 'Browser closed successfully';
    },

    async createBrowser(params: CreateBrowserParams) {
        const requestBody = buildRequestBody(params);
        const response = await apiClient.post(`${LOCAL_API_BASE}${API_ENDPOINTS.CREATE_BROWSER}`, requestBody);
        
        if (response.data.code === 0) {
            return `Browser created successfully with: ${Object.entries(response.data.data).map(([key, value]) => `${key}: ${value}`).join('\n')}`;
        }
        throw new Error(`Failed to create browser: ${response.data.msg}`);
    },

    async updateBrowser(params: UpdateBrowserParams) {
        const requestBody = buildRequestBody({
            ...params
        });
        requestBody.user_id = params.userId;

        const response = await apiClient.post(`${LOCAL_API_BASE}${API_ENDPOINTS.UPDATE_BROWSER}`, requestBody);
        
        if (response.data.code === 0) {
            return `Browser updated successfully with: ${Object.entries(response.data.data).map(([key, value]) => `${key}: ${value}`).join('\n')}`;
        }
        throw new Error(`Failed to update browser: ${response.data.msg}`);
    },

    async deleteBrowser({ userIds }: DeleteBrowserParams) {
        const response = await apiClient.post(`${LOCAL_API_BASE}${API_ENDPOINTS.DELETE_BROWSER}`, {
            user_ids: userIds
        });
        
        if (response.data.code === 0) {
            return `Browsers deleted successfully: ${userIds.join(', ')}`;
        }
        throw new Error(`Failed to delete browsers: ${response.data.msg}`);
    },

    async getBrowserList(params: GetBrowserListParams) {
        const { groupId, size, id, serialNumber, sort, order, page } = params;
        const urlParams = new URLSearchParams();
        if (size) {
            urlParams.set('page_size', size.toString());
        }
        if (page) {
            urlParams.set('page', page.toString());
        }
        if (id) {
            urlParams.set('user_id', id);
        }
        if (groupId) {
            urlParams.set('group_id', groupId);
        }
        if (serialNumber) {
            urlParams.set('serial_number', serialNumber);
        }
        if (sort) {
            urlParams.set('user_sort', JSON.stringify({
                [sort]: order || 'asc',
            }));
        }

        const response = await apiClient.get(`${LOCAL_API_BASE}${API_ENDPOINTS.GET_BROWSER_LIST}`, { params: urlParams });
        return `Browser list: ${JSON.stringify(response.data.data.list, null, 2)}`;
    },

    async getOpenedBrowser() {
        const response = await apiClient.get(`${LOCAL_API_BASE}${API_ENDPOINTS.GET_OPENED_BROWSER}`);
        
        if (response.data.code === 0) {
            return `Opened browser list: ${JSON.stringify(response.data.data.list, null, 2)}`;
        }
        throw new Error(`Failed to get opened browsers: ${response.data.msg}`);
    },

    async moveBrowser({ groupId, userIds }: MoveBrowserParams) {
        const response = await apiClient.post(`${LOCAL_API_BASE}${API_ENDPOINTS.MOVE_BROWSER}`, {
            group_id: groupId,
            user_ids: userIds
        });

        if (response.data.code === 0) {
            return `Browsers moved successfully to group ${groupId}: ${userIds.join(', ')}`;
        }
        throw new Error(`Failed to move browsers: ${response.data.msg}`);
    }
}; 