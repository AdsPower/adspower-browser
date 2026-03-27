import { apiClient, LOCAL_API_BASE, API_ENDPOINTS } from '../constants/api.js';
import type { UpdatePatchParams } from '../types/patch.js';

export const patchHandlers = {
    async updatePatch({ version_type }: UpdatePatchParams) {
        const requestBody: Record<string, string> = {};
        if (version_type) {
            requestBody.version_type = version_type;
        }

        const response = await apiClient.post(`${LOCAL_API_BASE}${API_ENDPOINTS.UPDATE_PATCH}`, requestBody);
        if (response.data.code === 0) {
            return `Patch update status: ${JSON.stringify(response.data.data, null, 2)}, message: ${response.data.msg}`;
        }

        throw new Error(`Failed to update patch: ${response.data.msg}`);
    }
};

