import { API_ENDPOINTS, getApiClient, getLocalApiBase } from '../constants/api.js';
import type { UpdatePatchParams } from '../types/patch.js';

export const patchHandlers = {
    async updatePatch({ version_type }: UpdatePatchParams) {
        const requestBody: Record<string, string> = {};
        if (version_type) {
            requestBody.version_type = version_type;
        }

        const response = await getApiClient().post(`${getLocalApiBase()}${API_ENDPOINTS.UPDATE_PATCH}`, requestBody);
        if (response.data.code === 0) {
            return JSON.stringify(response.data.data, null, 2);
        }
        throw new Error(response.data.msg);
    }
};

