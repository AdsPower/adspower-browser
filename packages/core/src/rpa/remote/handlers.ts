import { RPA_REMOTE_ENDPOINTS, requestRpaRemote } from './api.js';
import { rpaRemoteSchemas } from './schemas.js';
import type {
    RpaRemoteUpdateProcessParams,
    RpaRemoteGetTemplateSubscriptionInfoParams,
    RpaRemoteCreateProcessParams,
    RpaRemoteCreateTaskParams,
    RpaRemoteGetProcessListParams,
    RpaRemoteGetProcessListCountParams,
    RpaRemoteGetTaskListParams,
    RpaRemoteGetTaskListCountParams,
    RpaRemoteGetTaskDetailParams,
    RpaRemoteDeleteTaskParams,
    RpaRemoteUpdateTaskParams,
    RpaRemoteGetTaskRuntimeListParams,
    RpaRemoteGetTaskRuntimeListCountParams,
    RpaRemoteAddTaskRuntimeParams,
    RpaRemoteDeleteTaskRuntimeParams,
    RpaRemoteUpdateProcessEditableFieldsParams,
    RpaRemoteDeleteProcessParams,
    RpaRemoteCopyProcessParams,
    RpaRemoteMoveProcessParams,
    RpaRemoteTopProcessParams,
    RpaRemoteGetBatchListParams,
    RpaRemoteCreateBatchParams,
    RpaRemoteUpdateBatchParams,
    RpaRemoteDeleteBatchParams,
    RpaRemoteCreateShareParams,
    RpaRemoteReceiveShareParams,
} from './types.js';

export const rpaRemoteHandlers = {
    async updateProcess(params: RpaRemoteUpdateProcessParams): Promise<string> {
        const input = rpaRemoteSchemas.updateProcessSchema.parse(params);
        return requestRpaRemote('POST', RPA_REMOTE_ENDPOINTS.updateProcess, input);
    },
    async getTemplateSubscriptionInfo(params: RpaRemoteGetTemplateSubscriptionInfoParams): Promise<string> {
        const input = rpaRemoteSchemas.getTemplateSubscriptionInfoSchema.parse(params);
        return requestRpaRemote('GET', RPA_REMOTE_ENDPOINTS.getTemplateSubscriptionInfo, input);
    },
    async createProcess(params: RpaRemoteCreateProcessParams): Promise<string> {
        const input = rpaRemoteSchemas.createProcessSchema.parse(params);
        return requestRpaRemote('POST', RPA_REMOTE_ENDPOINTS.createProcess, input);
    },
    async createTask(params: RpaRemoteCreateTaskParams): Promise<string> {
        const input = rpaRemoteSchemas.createTaskSchema.parse(params);
        return requestRpaRemote('POST', RPA_REMOTE_ENDPOINTS.createTask, input);
    },
    async getProcessList(params: RpaRemoteGetProcessListParams): Promise<string> {
        const input = rpaRemoteSchemas.getProcessListSchema.parse(params);
        return requestRpaRemote('GET', RPA_REMOTE_ENDPOINTS.getProcessList, input);
    },
    async getProcessListCount(params: RpaRemoteGetProcessListCountParams): Promise<string> {
        const input = rpaRemoteSchemas.getProcessListCountSchema.parse(params);
        return requestRpaRemote('GET', RPA_REMOTE_ENDPOINTS.getProcessListCount, input);
    },
    async getTaskList(params: RpaRemoteGetTaskListParams): Promise<string> {
        const input = rpaRemoteSchemas.getTaskListSchema.parse(params);
        return requestRpaRemote('GET', RPA_REMOTE_ENDPOINTS.getTaskList, input);
    },
    async getTaskListCount(params: RpaRemoteGetTaskListCountParams): Promise<string> {
        const input = rpaRemoteSchemas.getTaskListCountSchema.parse(params);
        return requestRpaRemote('GET', RPA_REMOTE_ENDPOINTS.getTaskListCount, input);
    },
    async getTaskDetail(params: RpaRemoteGetTaskDetailParams): Promise<string> {
        const input = rpaRemoteSchemas.getTaskDetailSchema.parse(params);
        return requestRpaRemote('GET', RPA_REMOTE_ENDPOINTS.getTaskDetail, input);
    },
    async deleteTask(params: RpaRemoteDeleteTaskParams): Promise<string> {
        const input = rpaRemoteSchemas.deleteTaskSchema.parse(params);
        return requestRpaRemote('POST', RPA_REMOTE_ENDPOINTS.deleteTask, input);
    },
    async updateTask(params: RpaRemoteUpdateTaskParams): Promise<string> {
        const input = rpaRemoteSchemas.updateTaskSchema.parse(params);
        return requestRpaRemote('POST', RPA_REMOTE_ENDPOINTS.updateTask, input);
    },
    async getTaskRuntimeList(params: RpaRemoteGetTaskRuntimeListParams): Promise<string> {
        const input = rpaRemoteSchemas.getTaskRuntimeListSchema.parse(params);
        return requestRpaRemote('GET', RPA_REMOTE_ENDPOINTS.getTaskRuntimeList, input);
    },
    async getTaskRuntimeListCount(params: RpaRemoteGetTaskRuntimeListCountParams): Promise<string> {
        const input = rpaRemoteSchemas.getTaskRuntimeListCountSchema.parse(params);
        return requestRpaRemote('GET', RPA_REMOTE_ENDPOINTS.getTaskRuntimeListCount, input);
    },
    async addTaskRuntime(params: RpaRemoteAddTaskRuntimeParams): Promise<string> {
        const input = rpaRemoteSchemas.addTaskRuntimeSchema.parse(params);
        return requestRpaRemote('POST', RPA_REMOTE_ENDPOINTS.addTaskRuntime, input);
    },
    async deleteTaskRuntime(params: RpaRemoteDeleteTaskRuntimeParams): Promise<string> {
        const input = rpaRemoteSchemas.deleteTaskRuntimeSchema.parse(params);
        return requestRpaRemote('POST', RPA_REMOTE_ENDPOINTS.deleteTaskRuntime, input);
    },
    async updateProcessEditableFields(params: RpaRemoteUpdateProcessEditableFieldsParams): Promise<string> {
        const input = rpaRemoteSchemas.updateProcessEditableFieldsSchema.parse(params);
        return requestRpaRemote('POST', RPA_REMOTE_ENDPOINTS.updateProcessEditableFields, input);
    },
    async deleteProcess(params: RpaRemoteDeleteProcessParams): Promise<string> {
        const input = rpaRemoteSchemas.deleteProcessSchema.parse(params);
        return requestRpaRemote('POST', RPA_REMOTE_ENDPOINTS.deleteProcess, input);
    },
    async copyProcess(params: RpaRemoteCopyProcessParams): Promise<string> {
        const input = rpaRemoteSchemas.copyProcessSchema.parse(params);
        return requestRpaRemote('POST', RPA_REMOTE_ENDPOINTS.copyProcess, input);
    },
    async moveProcess(params: RpaRemoteMoveProcessParams): Promise<string> {
        const input = rpaRemoteSchemas.moveProcessSchema.parse(params);
        return requestRpaRemote('POST', RPA_REMOTE_ENDPOINTS.moveProcess, input);
    },
    async topProcess(params: RpaRemoteTopProcessParams): Promise<string> {
        const input = rpaRemoteSchemas.topProcessSchema.parse(params);
        return requestRpaRemote('POST', RPA_REMOTE_ENDPOINTS.topProcess, input);
    },
    async getBatchList(params: RpaRemoteGetBatchListParams): Promise<string> {
        const input = rpaRemoteSchemas.getBatchListSchema.parse(params);
        return requestRpaRemote('GET', RPA_REMOTE_ENDPOINTS.getBatchList, input);
    },
    async createBatch(params: RpaRemoteCreateBatchParams): Promise<string> {
        const input = rpaRemoteSchemas.createBatchSchema.parse(params);
        return requestRpaRemote('POST', RPA_REMOTE_ENDPOINTS.createBatch, input);
    },
    async updateBatch(params: RpaRemoteUpdateBatchParams): Promise<string> {
        const input = rpaRemoteSchemas.updateBatchSchema.parse(params);
        return requestRpaRemote('POST', RPA_REMOTE_ENDPOINTS.updateBatch, input);
    },
    async deleteBatch(params: RpaRemoteDeleteBatchParams): Promise<string> {
        const input = rpaRemoteSchemas.deleteBatchSchema.parse(params);
        return requestRpaRemote('POST', RPA_REMOTE_ENDPOINTS.deleteBatch, input);
    },
    async createShare(params: RpaRemoteCreateShareParams): Promise<string> {
        const input = rpaRemoteSchemas.createShareSchema.parse(params);
        return requestRpaRemote('POST', RPA_REMOTE_ENDPOINTS.createShare, input);
    },
    async receiveShare(params: RpaRemoteReceiveShareParams): Promise<string> {
        const input = rpaRemoteSchemas.receiveShareSchema.parse(params);
        return requestRpaRemote('POST', RPA_REMOTE_ENDPOINTS.receiveShare, input);
    },
};
