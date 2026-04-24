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
            return `Tag list: ${JSON.stringify(response.data.data.list || response.data.data, null, 2)}`;
        }
        throw new Error(`Failed to get tag list: ${response.data.msg}`);
    },

    async createTag({ tags }: CreateTagParams) {
        const response = await getApiClient().post(`${getLocalApiBase()}${API_ENDPOINTS.CREATE_TAG}`, { tags });
        if (response.data.code === 0) {
            return `Tags created successfully: ${JSON.stringify(response.data.data, null, 2)}`;
        }
        throw new Error(`Failed to create tags: ${response.data.msg}`);
    },

    async updateTag({ tags }: UpdateTagParams) {
        const response = await getApiClient().post(`${getLocalApiBase()}${API_ENDPOINTS.UPDATE_TAG}`, { tags });
        if (response.data.code === 0) {
            return `Tags updated successfully: ${JSON.stringify(response.data.data, null, 2)}`;
        }
        throw new Error(`Failed to update tags: ${response.data.msg}`);
    },

    async deleteTag({ ids }: DeleteTagParams) {
        const response = await getApiClient().post(`${getLocalApiBase()}${API_ENDPOINTS.DELETE_TAG}`, { ids });
        if (response.data.code === 0) {
            return `Tags deleted successfully: ${ids.join(', ')}`;
        }
        throw new Error(`Failed to delete tags: ${response.data.msg}`);
    }
};
