import { getApiClient, getLocalApiBase, API_ENDPOINTS } from '../constants/api.js';
import type {
    CreateMemberParams,
    DeleteMemberParams,
    GetMemberGroupListParams,
    GetMemberListParams,
    ResetMemberPasswordParams,
    UpdateMemberParams
} from '../types/member.js';
import { buildQueryParamsFor, buildRequestBodyFor } from '../utils/requestBuilder.js';

function serializeMemberListQuery(params: GetMemberListParams): Record<string, unknown> {
    const queryParams: Record<string, unknown> = { ...params };
    if (Array.isArray(params.user_id)) {
        queryParams.user_id = JSON.stringify(params.user_id);
    }
    if (Array.isArray(params.email)) {
        queryParams.email = JSON.stringify(params.email);
    }
    return queryParams;
}

export const memberHandlers = {
    async createMember(params: CreateMemberParams) {
        const requestBody = buildRequestBodyFor('create-member', params as Record<string, unknown>);
        const response = await getApiClient().post(`${getLocalApiBase()}${API_ENDPOINTS.CREATE_MEMBER}`, requestBody);

        if (response.data.code === 0) {
            return JSON.stringify(response.data.data, null, 2);
        }
        throw new Error(response.data.msg);
    },

    async updateMember(params: UpdateMemberParams) {
        const requestBody = buildRequestBodyFor('update-member', params as Record<string, unknown>);
        const response = await getApiClient().post(`${getLocalApiBase()}${API_ENDPOINTS.UPDATE_MEMBER}`, requestBody);

        if (response.data.code === 0) {
            return JSON.stringify(response.data.data, null, 2);
        }
        throw new Error(response.data.msg);
    },

    async resetMemberPassword(params: ResetMemberPasswordParams) {
        const requestBody = buildRequestBodyFor('reset-member-password', params as Record<string, unknown>);
        const response = await getApiClient().post(
            `${getLocalApiBase()}${API_ENDPOINTS.RESET_MEMBER_PASSWORD}`,
            requestBody
        );

        if (response.data.code === 0) {
            return JSON.stringify(response.data.data, null, 2);
        }
        throw new Error(response.data.msg);
    },

    async deleteMember(params: DeleteMemberParams) {
        const requestBody = buildRequestBodyFor('delete-member', params as Record<string, unknown>);
        const response = await getApiClient().post(`${getLocalApiBase()}${API_ENDPOINTS.DELETE_MEMBER}`, requestBody);

        if (response.data.code === 0) {
            return JSON.stringify(response.data.data, null, 2);
        }
        throw new Error(response.data.msg);
    },

    async getMemberList(params: GetMemberListParams) {
        const query = buildQueryParamsFor('get-member-list', serializeMemberListQuery(params));
        const response = await getApiClient().get(`${getLocalApiBase()}${API_ENDPOINTS.GET_MEMBER_LIST}`, { params: query });
        if (response.data.code === 0) {
            return JSON.stringify(response.data.data, null, 2);
        }
        throw new Error(response.data.msg);
    },

    async getMemberGroupList(params: GetMemberGroupListParams) {
        const query = buildQueryParamsFor('get-member-group-list', params as Record<string, unknown>);
        const response = await getApiClient().get(`${getLocalApiBase()}${API_ENDPOINTS.GET_MEMBER_GROUP_LIST}`, {
            params: query
        });
        if (response.data.code === 0) {
            return JSON.stringify(response.data.data, null, 2);
        }
        throw new Error(response.data.msg);
    }
};
