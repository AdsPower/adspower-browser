import { getApiClient, getLocalApiBase, API_ENDPOINTS } from '../constants/api.js';
import type {
    CreateGroupParams,
    UpdateGroupParams,
    GetGroupListParams
} from '../types/group.js';

export const groupHandlers = {
    async createGroup({ groupName, remark }: CreateGroupParams) {
        const requestBody: Record<string, string> = {
            group_name: groupName
        };

        if (remark !== undefined) {
            requestBody.remark = remark;
        }

        const response = await getApiClient().post(`${getLocalApiBase()}${API_ENDPOINTS.CREATE_GROUP}`, requestBody);

        if (response.data.code === 0) {
            return `Group created successfully with name: ${groupName}${remark ? `, remark: ${remark}` : ''}`;
        }
        throw new Error(`Failed to create group: ${response.data.msg}`);
    },

    async updateGroup({ groupId, groupName, remark }: UpdateGroupParams) {
        const requestBody: Record<string, any> = {
            group_id: groupId,
            group_name: groupName
        };

        if (remark !== undefined) {
            requestBody.remark = remark;
        }

        const response = await getApiClient().post(`${getLocalApiBase()}${API_ENDPOINTS.UPDATE_GROUP}`, requestBody);

        if (response.data.code === 0) {
            return `Group updated successfully with id: ${groupId}, name: ${groupName}${remark !== undefined ? `, remark: ${remark === null ? '(cleared)' : remark}` : ''}`;
        }
        throw new Error(`Failed to update group: ${response.data.msg}`);
    },

    async getGroupList({ groupName, size, page }: GetGroupListParams) {
        const params = new URLSearchParams();
        if (groupName) {
            params.set('group_name', groupName);
        }
        if (size) {
            params.set('page_size', size.toString());
        }
        if (page) {
            params.set('page', page.toString());
        }

        const response = await getApiClient().get(`${getLocalApiBase()}${API_ENDPOINTS.GET_GROUP_LIST}`, { params });
        return `Group list: ${JSON.stringify(response.data.data.list, null, 2)}`;
    }
};
