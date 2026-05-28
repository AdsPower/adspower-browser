import os from 'node:os';
import { getApiClient, getLocalApiBase, API_ENDPOINTS } from '../constants/api.js';
import { buildQueryParamsFor, buildRequestBodyFor } from '../utils/requestBuilder.js';
import { resolveOpenBrowserHeadless } from '../utils/openBrowserHeadless.js';
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
    async openBrowser(params: OpenBrowserParams) {
        const { params: resolvedParams, didAutoSetHeadless } = resolveOpenBrowserHeadless(
            params,
            process.env,
            os.platform()
        );
        const requestBody = buildRequestBodyFor('open-browser', resolvedParams);
        const response = await getApiClient().post(`${getLocalApiBase()}${API_ENDPOINTS.START_BROWSER}`, requestBody);
        if (response.data.code === 0) {
            return JSON.stringify(response.data.data, null, 2);
        }
        throw new Error(response.data.msg);
    },

    async closeBrowser(params: CloseBrowserParams) {
        const requestBody = buildRequestBodyFor('close-browser', params);
        const response = await getApiClient().post(`${getLocalApiBase()}${API_ENDPOINTS.CLOSE_BROWSER}`, requestBody);
        if (response.data.code === 0) {
            return JSON.stringify(response.data.data, null, 2);
        }
        throw new Error(response.data.msg);
    },

    async createBrowser(params: CreateBrowserParams) {
        const requestBody = buildRequestBodyFor('create-browser', params);
        const response = await getApiClient().post(`${getLocalApiBase()}${API_ENDPOINTS.CREATE_BROWSER}`, requestBody);

        if (response.data.code === 0) {
            return JSON.stringify(response.data.data, null, 2);
        }
        throw new Error(response.data.msg);
    },

    async updateBrowser(params: UpdateBrowserParams) {
        const requestBody = buildRequestBodyFor('update-browser', params);
        const response = await getApiClient().post(`${getLocalApiBase()}${API_ENDPOINTS.UPDATE_BROWSER}`, requestBody);

        if (response.data.code === 0) {
            return JSON.stringify(response.data.data, null, 2);
        }
        throw new Error(response.data.msg);
    },

    async deleteBrowser(params: DeleteBrowserParams) {
        const response = await getApiClient().post(
            `${getLocalApiBase()}${API_ENDPOINTS.DELETE_BROWSER}`,
            buildRequestBodyFor('delete-browser', params)
        );

        if (response.data.code === 0) {
            return JSON.stringify(response.data.data, null, 2);
        }
        throw new Error(response.data.msg);
    },

    async getBrowserList(params: GetBrowserListParams) {
        const requestBody = buildRequestBodyFor('get-browser-list', params);
        const response = await getApiClient().post(`${getLocalApiBase()}${API_ENDPOINTS.GET_BROWSER_LIST}`, requestBody);
        if (response.data.code === 0) {
            return JSON.stringify(response.data.data, null, 2);
        }
        throw new Error(response.data.msg);
    },

    async getOpenedBrowser() {
        const response = await getApiClient().get(`${getLocalApiBase()}${API_ENDPOINTS.GET_OPENED_BROWSER}`);

        if (response.data.code === 0) {
            return JSON.stringify(response.data.data, null, 2);
        }
        throw new Error(response.data.msg);
    },

    async moveBrowser(params: MoveBrowserParams) {
        const requestBody = buildRequestBodyFor('move-browser', params as Record<string, unknown>);
        const response = await getApiClient().post(`${getLocalApiBase()}${API_ENDPOINTS.MOVE_BROWSER}`, requestBody);
        // const { group_id, user_ids } = params as MoveBrowserParams & { group_id: string; user_ids: string[] };

        if (response.data.code === 0) {
            return JSON.stringify(response.data.data, null, 2);
        }
        throw new Error(response.data.msg);
    },

    async getProfileCookies(params: GetProfileCookiesParams) {
        const query = buildQueryParamsFor('get-profile-cookies', params);
        const response = await getApiClient().get(`${getLocalApiBase()}${API_ENDPOINTS.GET_PROFILE_COOKIES}`, { params: query });
        if (response.data.code === 0) {
            return JSON.stringify(response.data.data, null, 2);
        }
        throw new Error(response.data.msg);
    },

    async getProfileUa(params: GetProfileUaParams) {
        const requestBody = buildRequestBodyFor('get-profile-ua', params);
        const response = await getApiClient().post(`${getLocalApiBase()}${API_ENDPOINTS.GET_PROFILE_UA}`, requestBody);
        if (response.data.code === 0) {
            return JSON.stringify(response.data.data, null, 2);
        }
        throw new Error(response.data.msg);
    },

    async closeAllProfiles(_params: CloseAllProfilesParams) {
        const response = await getApiClient().post(`${getLocalApiBase()}${API_ENDPOINTS.CLOSE_ALL_PROFILES}`, {});
        if (response.data.data.code === 0) {
            return JSON.stringify(response.data.data, null, 2);
        }
        throw new Error(response.data.data.msg);
    },

    async newFingerprint(params: NewFingerprintParams) {
        const requestBody = buildRequestBodyFor('new-fingerprint', params);
        const response = await getApiClient().post(`${getLocalApiBase()}${API_ENDPOINTS.NEW_FINGERPRINT}`, requestBody);
        if (response.data.code === 0) {
            return JSON.stringify(response.data.data, null, 2);
        }
        throw new Error(response.data.msg);
    },

    async deleteCacheV2(params: DeleteCacheV2Params) {
        const response = await getApiClient().post(
            `${getLocalApiBase()}${API_ENDPOINTS.DELETE_CACHE_V2}`,
            buildRequestBodyFor('delete-cache-v2', params)
        );
        if (response.data.code === 0) {
            return JSON.stringify(response.data.data, null, 2);
        }
        throw new Error(response.data.msg);
    },

    async shareProfile(params: ShareProfileParams) {
        const requestBody = buildRequestBodyFor('share-profile', params);
        const response = await getApiClient().post(`${getLocalApiBase()}${API_ENDPOINTS.SHARE_PROFILE}`, requestBody);
        if (response.data.code === 0) {
            return JSON.stringify(response.data.data, null, 2);
        }
        throw new Error(response.data.msg);
    },

    async getBrowserActive(params: GetBrowserActiveParams) {
        const query = buildQueryParamsFor('get-browser-active', params);
        const response = await getApiClient().get(`${getLocalApiBase()}${API_ENDPOINTS.GET_BROWSER_ACTIVE}`, { params: query });
        if (response.data.code === 0) {
            return JSON.stringify(response.data.data, null, 2);
        }
        throw new Error(response.data.msg);
    },

    async getCloudActive(params: GetCloudActiveParams) {
        const requestBody = buildRequestBodyFor('get-cloud-active', params as Record<string, unknown>);
        const response = await getApiClient().post(`${getLocalApiBase()}${API_ENDPOINTS.GET_CLOUD_ACTIVE}`, requestBody);
        if (response.data.code === 0) {
            return JSON.stringify(response.data.data, null, 2);
        }
        throw new Error(response.data.msg);
    }
};
