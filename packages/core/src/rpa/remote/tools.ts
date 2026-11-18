import type { z } from 'zod';
import { rpaRemoteHandlers } from './handlers.js';
import { rpaRemoteSchemas } from './schemas.js';

export type RpaRemoteTool = {
    name: string;
    description: string;
    schema: z.ZodTypeAny;
    handler: (params: any) => Promise<string>;
    readOnly: boolean;
};

export const rpaRemoteTools: RpaRemoteTool[] = [
    {
        name: 'update-process',
        description: 'Use for process content changes. Supply complete existing metadata (group, name, variables, settings and remark), merging only requested changes. A replacement .json.gz file is required (maximum 4MB). For metadata-only changes, use rpa-update-process-editable-fields.',
        schema: rpaRemoteSchemas.updateProcessSchema,
        handler: rpaRemoteHandlers.updateProcess,
        readOnly: false,
    },
    {
        name: 'get-template-subscription-info',
        description: 'Get paid-template subscription information by process ID.',
        schema: rpaRemoteSchemas.getTemplateSubscriptionInfoSchema,
        handler: rpaRemoteHandlers.getTemplateSubscriptionInfo,
        readOnly: true,
    },
    {
        name: 'create-process',
        description: 'Create an RPA process in one backend upload request using a .json.gz process file accessible to the runtime.',
        schema: rpaRemoteSchemas.createProcessSchema,
        handler: rpaRemoteHandlers.createProcess,
        readOnly: false,
    },
    {
        name: 'create-task',
        description: 'Create an regular or scheduled RPA task configuration. Default regular-task workflow: follow success with rpa-add-task unless the user requests creation only; use rpa-add-plan to enable a schedule. The creation endpoint itself does not execute or enable tasks.',
        schema: rpaRemoteSchemas.createTaskSchema,
        handler: rpaRemoteHandlers.createTask,
        readOnly: false,
    },
    {
        name: 'get-process-list',
        description: 'List RPA processes with optional filters and pagination. Includes expired paid-template processes by default. Disclose any exclusion of expired processes when summarizing results.',
        schema: rpaRemoteSchemas.getProcessListSchema,
        handler: rpaRemoteHandlers.getProcessList,
        readOnly: true,
    },
    {
        name: 'get-process-list-count',
        description: 'Count RPA processes matching the filters. Includes expired paid-template processes by default. If the list excludes them, use the same other filters with this option set to 0 and 1 to report the total and the number excluded.',
        schema: rpaRemoteSchemas.getProcessListCountSchema,
        handler: rpaRemoteHandlers.getProcessListCount,
        readOnly: true,
    },
    {
        name: 'get-task-list',
        description: 'Get the list of RPA task configurations with optional filters and pagination.',
        schema: rpaRemoteSchemas.getTaskListSchema,
        handler: rpaRemoteHandlers.getTaskList,
        readOnly: true,
    },
    {
        name: 'get-task-list-count',
        description: 'Get the number of RPA task configurations matching the filters.',
        schema: rpaRemoteSchemas.getTaskListCountSchema,
        handler: rpaRemoteHandlers.getTaskListCount,
        readOnly: true,
    },
    {
        name: 'get-task-detail',
        description: 'Get RPA task configuration details by task IDs.',
        schema: rpaRemoteSchemas.getTaskDetailSchema,
        handler: rpaRemoteHandlers.getTaskDetail,
        readOnly: true,
    },
    {
        name: 'delete-task',
        description: 'Delete RPA task configurations by task IDs.',
        schema: rpaRemoteSchemas.deleteTaskSchema,
        handler: rpaRemoteHandlers.deleteTask,
        readOnly: false,
    },
    {
        name: 'update-task',
        description: 'Update an RPA task configuration using the complete task write fields.',
        schema: rpaRemoteSchemas.updateTaskSchema,
        handler: rpaRemoteHandlers.updateTask,
        readOnly: false,
    },
    {
        name: 'get-task-runtime-list',
        description: 'Get profiles bound to an RPA task, not local execution items.',
        schema: rpaRemoteSchemas.getTaskRuntimeListSchema,
        handler: rpaRemoteHandlers.getTaskRuntimeList,
        readOnly: true,
    },
    {
        name: 'get-task-runtime-list-count',
        description: 'Get the number of profiles bound to an RPA task.',
        schema: rpaRemoteSchemas.getTaskRuntimeListCountSchema,
        handler: rpaRemoteHandlers.getTaskRuntimeListCount,
        readOnly: true,
    },
    {
        name: 'add-task-runtime',
        description: 'Bind profiles to an RPA task using profile IDs.',
        schema: rpaRemoteSchemas.addTaskRuntimeSchema,
        handler: rpaRemoteHandlers.addTaskRuntime,
        readOnly: false,
    },
    {
        name: 'delete-task-runtime',
        description: 'Remove profile bindings from an RPA task using binding record IDs.',
        schema: rpaRemoteSchemas.deleteTaskRuntimeSchema,
        handler: rpaRemoteHandlers.deleteTaskRuntime,
        readOnly: false,
    },
    {
        name: 'update-process-editable-fields',
        description: 'Use for metadata-only updates to process name, variables, settings, remark or group when process content is unchanged. Does not replace process nodes.',
        schema: rpaRemoteSchemas.updateProcessEditableFieldsSchema,
        handler: rpaRemoteHandlers.updateProcessEditableFields,
        readOnly: false,
    },
    {
        name: 'delete-process',
        description: 'Delete RPA processes by process IDs.',
        schema: rpaRemoteSchemas.deleteProcessSchema,
        handler: rpaRemoteHandlers.deleteProcess,
        readOnly: false,
    },
    {
        name: 'copy-process',
        description: 'Copy an RPA process to a specified process group.',
        schema: rpaRemoteSchemas.copyProcessSchema,
        handler: rpaRemoteHandlers.copyProcess,
        readOnly: false,
    },
    {
        name: 'move-process',
        description: 'Move RPA processes to a specified process group.',
        schema: rpaRemoteSchemas.moveProcessSchema,
        handler: rpaRemoteHandlers.moveProcess,
        readOnly: false,
    },
    {
        name: 'top-process',
        description: 'Toggle an RPA process between pinned and unpinned. Query its top_time first: a positive value means pinned. Call only when the current state differs from the requested state. Do not automatically retry this toggle.',
        schema: rpaRemoteSchemas.topProcessSchema,
        handler: rpaRemoteHandlers.topProcess,
        readOnly: false,
    },
    {
        name: 'get-batch-list',
        description: 'Get the list of RPA process groups with pagination.',
        schema: rpaRemoteSchemas.getBatchListSchema,
        handler: rpaRemoteHandlers.getBatchList,
        readOnly: true,
    },
    {
        name: 'create-batch',
        description: 'Create an RPA process group.',
        schema: rpaRemoteSchemas.createBatchSchema,
        handler: rpaRemoteHandlers.createBatch,
        readOnly: false,
    },
    {
        name: 'update-batch',
        description: 'Rename an RPA process group.',
        schema: rpaRemoteSchemas.updateBatchSchema,
        handler: rpaRemoteHandlers.updateBatch,
        readOnly: false,
    },
    {
        name: 'delete-batch',
        description: 'Delete RPA process groups by group IDs.',
        schema: rpaRemoteSchemas.deleteBatchSchema,
        handler: rpaRemoteHandlers.deleteBatch,
        readOnly: false,
    },
    {
        name: 'create-share',
        description: 'Create a process share code.',
        schema: rpaRemoteSchemas.createShareSchema,
        handler: rpaRemoteHandlers.createShare,
        readOnly: false,
    },
    {
        name: 'receive-share',
        description: 'Receive RPA processes using a share code, optionally into a process group.',
        schema: rpaRemoteSchemas.receiveShareSchema,
        handler: rpaRemoteHandlers.receiveShare,
        readOnly: false,
    },
];
