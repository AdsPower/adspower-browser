import { getApiClient, getLocalApiBase, API_ENDPOINTS } from '../constants/api.js';
import type { GetTagListParams, CreateTagParams, UpdateTagParams, DeleteTagParams } from '../types/tag.js';

export const tagHandlers = {
    async getTagList(params: GetTagListParams) {
        const { ids, limit, page } = params;
        const requestBody: Record<string, any> = {};

        if (ids && ids.length > 0) {
            requestBody.ids = ids;
        }
        if (limit !== undefined) {
            requestBody.limit = limit;
        }
        if (page !== undefined) {
            requestBody.page = page;
        }

        const response = await getApiClient().post(`${getLocalApiBase()}${API_ENDPOINTS.GET_TAG_LIST}`, requestBody);
        if (response.data.code === 0) {
            return JSON.stringify(response.data.data, null, 2);
        }
        throw new Error(response.data.msg);
    },

    async createTag({ tags }: CreateTagParams) {
        const response = await getApiClient().post(`${getLocalApiBase()}${API_ENDPOINTS.CREATE_TAG}`, { tags });
        if (response.data.code === 0) {
            return JSON.stringify(response.data.data, null, 2);
        }
        throw new Error(response.data.msg);
    },

    async updateTag({ tags }: UpdateTagParams) {
        const response = await getApiClient().post(`${getLocalApiBase()}${API_ENDPOINTS.UPDATE_TAG}`, { tags });
        if (response.data.code === 0) {
            return JSON.stringify(response.data.data, null, 2);
        }
        throw new Error(response.data.msg);
    },

    async deleteTag({ ids }: DeleteTagParams) {
        const response = await getApiClient().post(`${getLocalApiBase()}${API_ENDPOINTS.DELETE_TAG}`, { ids });
        if (response.data.code === 0) {
            return JSON.stringify(response.data.data, null, 2);
        }
        throw new Error(response.data.msg);
    }
};
