import { getApiClient, getLocalApiBase, API_ENDPOINTS } from '../constants/api.js';
import type {
    CreateGroupParams,
    UpdateGroupParams,
    GetGroupListParams
} from '../types/group.js';
import { buildQueryParamsFor, buildRequestBodyFor } from '../utils/requestBuilder.js';

export const groupHandlers = {
    async createGroup(params: CreateGroupParams) {
        const requestBody = buildRequestBodyFor('create-group', params as Record<string, unknown>);
        const response = await getApiClient().post(`${getLocalApiBase()}${API_ENDPOINTS.CREATE_GROUP}`, requestBody);

        if (response.data.code === 0) {
            return JSON.stringify(response.data.data, null, 2);
        }
        throw new Error(response.data.msg);
    },

    async updateGroup(params: UpdateGroupParams) {
        const requestBody = buildRequestBodyFor('update-group', params as Record<string, unknown>);
        const response = await getApiClient().post(`${getLocalApiBase()}${API_ENDPOINTS.UPDATE_GROUP}`, requestBody);

        if (response.data.code === 0) {
            return JSON.stringify(response.data.data, null, 2);
        }
        throw new Error(response.data.msg);
    },

    async getGroupList(params: GetGroupListParams) {
        const query = buildQueryParamsFor('get-group-list', params as Record<string, unknown>);
        const response = await getApiClient().get(`${getLocalApiBase()}${API_ENDPOINTS.GET_GROUP_LIST}`, { params: query });
        if (response.data.code === 0) {
            return JSON.stringify(response.data.data, null, 2);
        }
        throw new Error(response.data.msg);
    }
};
