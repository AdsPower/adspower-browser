import { apiClient, LOCAL_API_BASE, API_ENDPOINTS } from '../constants/api.js';
import { buildRequestBody } from '../utils/requestBuilder.js';
import type {
    OpenBrowserParams,
    CloseBrowserParams,
    CreateBrowserParams,
    UpdateBrowserParams,
    DeleteBrowserParams,
    GetBrowserListParams,
    MoveBrowserParams,
    GetProfileCookiesParams,
    GetProfileUaParams,
    CloseAllProfilesParams,
    NewFingerprintParams,
    DeleteCacheV2Params,
    ShareProfileParams,
    GetBrowserActiveParams,
    GetCloudActiveParams
} from '../types/browser.js';

export const browserHandlers = {
    async openBrowser({ profileNo, profileId, ipTab, launchArgs, clearCacheAfterClosing, cdpMask }: OpenBrowserParams) {
        const requestBody: Record<string, string> = {};
        if (profileId) {
            requestBody.profile_id = profileId;
        }
        if (profileNo) {
            requestBody.profile_no = profileNo;
        }
        if (ipTab) {
            requestBody.ip_tab = ipTab;
        }
        if (launchArgs) {
            requestBody.launch_args = launchArgs;
        }
        if (clearCacheAfterClosing) {
            requestBody.delete_cache = clearCacheAfterClosing;
        }
        if (cdpMask) {
            requestBody.cdp_mask = cdpMask;
        }

        const response = await apiClient.post(`${LOCAL_API_BASE}${API_ENDPOINTS.START_BROWSER}`, requestBody);
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

    async closeBrowser({ profileId, profileNo }: CloseBrowserParams) {
        const requestBody: Record<string, string> = {};
        if (profileId) {
            requestBody.profile_id = profileId;
        }
        if (profileNo) {
            requestBody.profile_no = profileNo;
        }

        const response = await apiClient.post(`${LOCAL_API_BASE}${API_ENDPOINTS.CLOSE_BROWSER}`, requestBody);
        if (response.data.code === 0) {
            return 'Browser closed successfully';
        }
        throw new Error(`Failed to close browser: ${response.data.msg}`);
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
        const requestBody = buildRequestBody(params);

        const response = await apiClient.post(`${LOCAL_API_BASE}${API_ENDPOINTS.UPDATE_BROWSER}`, requestBody);

        if (response.data.code === 0) {
            return `Browser updated successfully with: ${Object.entries(response.data.data || {}).map(([key, value]) => `${key}: ${value}`).join('\n')}`;
        }
        throw new Error(`Failed to update browser: ${response.data.msg}`);
    },

    async deleteBrowser({ profileIds }: DeleteBrowserParams) {
        const response = await apiClient.post(`${LOCAL_API_BASE}${API_ENDPOINTS.DELETE_BROWSER}`, {
            profile_id: profileIds
        });

        if (response.data.code === 0) {
            return `Browsers deleted successfully: ${profileIds.join(', ')}`;
        }
        throw new Error(`Failed to delete browsers: ${response.data.msg}`);
    },

    async getBrowserList(params: GetBrowserListParams) {
        const { groupId, limit, page, profileId, profileNo, sortType, sortOrder } = params;
        const requestBody: Record<string, any> = {};

        if (limit !== undefined) {
            requestBody.limit = limit;
        }
        if (page !== undefined) {
            requestBody.page = page;
        }
        if (profileId && profileId.length > 0) {
            requestBody.profile_id = profileId;
        }
        if (profileNo && profileNo.length > 0) {
            requestBody.profile_no = profileNo;
        }
        if (groupId !== undefined) {
            requestBody.group_id = groupId;
        }
        if (sortType) {
            requestBody.sort_type = sortType;
        }
        if (sortOrder) {
            requestBody.sort_order = sortOrder;
        }

        const response = await apiClient.post(`${LOCAL_API_BASE}${API_ENDPOINTS.GET_BROWSER_LIST}`, requestBody);
        if (response.data.code === 0) {
            return `Browser list: ${JSON.stringify(response.data.data.list, null, 2)}`;
        }
        throw new Error(`Failed to get browser list: ${response.data.msg}`);
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
    },

    async getProfileCookies({ profileId, profileNo }: GetProfileCookiesParams) {
        const params = new URLSearchParams();
        if (profileId) {
            params.set('profile_id', profileId);
        }
        if (profileNo) {
            params.set('profile_no', profileNo);
        }

        const response = await apiClient.get(`${LOCAL_API_BASE}${API_ENDPOINTS.GET_PROFILE_COOKIES}`, { params });
        if (response.data.code === 0) {
            return `Profile cookies: ${JSON.stringify(response.data.data, null, 2)}`;
        }
        throw new Error(`Failed to get profile cookies: ${response.data.msg}`);
    },

    async getProfileUa({ profileId, profileNo }: GetProfileUaParams) {
        const requestBody: Record<string, any> = {};
        if (profileId && profileId.length > 0) {
            requestBody.profile_id = profileId;
        }
        if (profileNo && profileNo.length > 0) {
            requestBody.profile_no = profileNo;
        }

        const response = await apiClient.post(`${LOCAL_API_BASE}${API_ENDPOINTS.GET_PROFILE_UA}`, requestBody);
        if (response.data.code === 0) {
            return `Profile User-Agent: ${JSON.stringify(response.data.data, null, 2)}`;
        }
        throw new Error(`Failed to get profile User-Agent: ${response.data.msg}`);
    },

    async closeAllProfiles(_params: CloseAllProfilesParams) {
        const response = await apiClient.post(`${LOCAL_API_BASE}${API_ENDPOINTS.CLOSE_ALL_PROFILES}`, {});
        if (response.data.code === 0) {
            return 'All profiles closed successfully';
        }
        throw new Error(`Failed to close all profiles: ${response.data.msg}`);
    },

    async newFingerprint({ profileId, profileNo }: NewFingerprintParams) {
        const requestBody: Record<string, any> = {};
        if (profileId && profileId.length > 0) {
            requestBody.profile_id = profileId;
        }
        if (profileNo && profileNo.length > 0) {
            requestBody.profile_no = profileNo;
        }
        const response = await apiClient.post(`${LOCAL_API_BASE}${API_ENDPOINTS.NEW_FINGERPRINT}`, requestBody);
        if (response.data.code === 0) {
            return `New fingerprint created: ${JSON.stringify(response.data.data, null, 2)}`;
        }
        throw new Error(`Failed to create new fingerprint: ${response.data.msg}`);
    },

    async deleteCacheV2({ profileIds, type }: DeleteCacheV2Params) {
        const response = await apiClient.post(`${LOCAL_API_BASE}${API_ENDPOINTS.DELETE_CACHE_V2}`, {
            profile_id: profileIds,
            type: type
        });
        if (response.data.code === 0) {
            return `Cache deleted successfully for profiles: ${profileIds.join(', ')}`;
        }
        throw new Error(`Failed to delete cache: ${response.data.msg}`);
    },

    async shareProfile({ profileIds, receiver, shareType, content }: ShareProfileParams) {
        const requestBody: Record<string, any> = {
            profile_id: profileIds,
            receiver: receiver
        };
        if (shareType !== undefined) {
            requestBody.share_type = shareType;
        }
        if (content !== undefined) {
            requestBody.content = content;
        }

        const response = await apiClient.post(`${LOCAL_API_BASE}${API_ENDPOINTS.SHARE_PROFILE}`, requestBody);
        if (response.data.code === 0) {
            return `Profiles shared successfully: ${profileIds.join(', ')}`;
        }
        throw new Error(`Failed to share profiles: ${response.data.msg}`);
    },

    async getBrowserActive({ profileId, profileNo }: GetBrowserActiveParams) {
        const params = new URLSearchParams();
        if (profileId) {
            params.set('profile_id', profileId);
        }
        if (profileNo) {
            params.set('profile_no', profileNo);
        }

        const response = await apiClient.get(`${LOCAL_API_BASE}${API_ENDPOINTS.GET_BROWSER_ACTIVE}`, { params });
        if (response.data.code === 0) {
            return `Browser active info: ${JSON.stringify(response.data.data, null, 2)}`;
        }
        throw new Error(`Failed to get browser active: ${response.data.msg}`);
    },

    async getCloudActive({ userIds }: GetCloudActiveParams) {
        const response = await apiClient.post(`${LOCAL_API_BASE}${API_ENDPOINTS.GET_CLOUD_ACTIVE}`, {
            user_ids: userIds
        });
        if (response.data.code === 0) {
            return `Cloud active browsers: ${JSON.stringify(response.data.data, null, 2)}`;
        }
        throw new Error(`Failed to get cloud active browsers: ${response.data.msg}`);
    }
};
