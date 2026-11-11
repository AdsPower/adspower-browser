import { getApiClient, getLocalApiBase } from '../../constants/api.js';

// These remote-backend operations are forwarded by the same AdsPower runtime
// used for browser/group management. They do not use the local RPA Plus port.
export const RPA_REMOTE_ENDPOINTS = {
    updateProcess: '/rpav2/local-api/update-process-by-api',
    getTemplateSubscriptionInfo: '/rpav2/local-api/get-template-subscription-info-by-api',
    createProcess: '/rpav2/local-api/create-process-by-api',
    createTask: '/rpav2/local-api/create-task-by-api',
    getProcessList: '/rpav2/local-api/get-process-list-by-api',
    getProcessListCount: '/rpav2/local-api/get-process-list-count-by-api',
    getTaskList: '/rpav2/local-api/get-task-list-by-api',
    getTaskListCount: '/rpav2/local-api/get-task-list-count-by-api',
    getTaskDetail: '/rpav2/local-api/get-task-detail-by-api',
    deleteTask: '/rpav2/local-api/delete-task-by-api',
    updateTask: '/rpav2/local-api/update-task-by-api',
    getTaskRuntimeList: '/rpav2/local-api/get-task-runtime-list-by-api',
    getTaskRuntimeListCount: '/rpav2/local-api/get-task-runtime-list-count-by-api',
    addTaskRuntime: '/rpav2/local-api/add-task-runtime-by-api',
    deleteTaskRuntime: '/rpav2/local-api/delete-task-runtime-by-api',
    updateProcessEditableFields: '/rpav2/local-api/update-process-editable-fields-by-api',
    deleteProcess: '/rpav2/local-api/delete-process-by-api',
    copyProcess: '/rpav2/local-api/copy-process-by-api',
    moveProcess: '/rpav2/local-api/move-process-by-api',
    topProcess: '/rpav2/local-api/top-process-by-api',
    getBatchList: '/rpav2/local-api/get-batch-list-by-api',
    createBatch: '/rpav2/local-api/create-batch-by-api',
    updateBatch: '/rpav2/local-api/update-batch-by-api',
    deleteBatch: '/rpav2/local-api/delete-batch-by-api',
    createShare: '/rpav2/local-api/create-share-by-api',
    receiveShare: '/rpav2/local-api/receive-share-by-api',
} as const;

export async function requestRpaRemote(method: 'GET' | 'POST', endpoint: string, params: Record<string, unknown>): Promise<string> {
    const client = getApiClient();
    client.defaults.timeout = 30000;
    const url = `${getLocalApiBase()}${endpoint}`;
    const response = method === 'GET'
        ? await client.get(url, { params })
        : await client.post(url, params);
    if (response.data.code === 0) {
        return JSON.stringify(response.data.data, null, 2);
    }
    throw new Error(response.data.msg || 'Remote RPA request failed');
}
