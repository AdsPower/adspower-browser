import type { z } from 'zod';
import { rpaHandlers } from './handlers.js';
import { rpaSchemas } from './schemas.js';

export type RpaLocalTool = {
    name: string;
    description: string;
    schema: z.ZodTypeAny;
    handler: (params: any) => Promise<string>;
    readOnly: boolean;
};

// Shared definitions for CLI help and MCP discovery. Remote tools belong in rpa/remote.
export const rpaLocalTools: RpaLocalTool[] = [
    {
        name: 'read-excel-fields',
        description: 'Parse Excel fields and return valid variable names from the first row (variable_list).',
        schema: rpaSchemas.readExcelFieldsSchema,
        handler: rpaHandlers.readExcelFields,
        readOnly: true,
    },
    {
        name: 'read-text-list',
        description: 'Read a text file line by line and return the list.',
        schema: rpaSchemas.readTextListSchema,
        handler: rpaHandlers.readTextList,
        readOnly: true,
    },
    {
        name: 'check-email',
        description: 'Read and filter email messages. Setting seen=1 marks fetched messages as read.',
        schema: rpaSchemas.checkEmailSchema,
        handler: rpaHandlers.checkEmail,
        readOnly: false,
    },
    {
        name: 'get-two-fa',
        description: 'Generate a two-factor authentication (TOTP) verification code.',
        schema: rpaSchemas.getTwoFaSchema,
        handler: rpaHandlers.getTwoFa,
        readOnly: true,
    },
    {
        name: 'google-sheets',
        description: 'Read, write, or clear Google Sheets. Write and clear modify data.',
        schema: rpaSchemas.googleSheetsSchema,
        handler: rpaHandlers.googleSheets,
        readOnly: false,
    },
    {
        name: 'start-debug',
        description: 'Debug a flow from process_file (preferred) or legacy inline process; return only its debug ID.',
        schema: rpaSchemas.startDebugSchema,
        handler: rpaHandlers.startDebug,
        readOnly: false,
    },
    {
        name: 'get-debug-log',
        description: 'Get debug status and logs. Supply output_file to keep complete logs on disk and return only metadata.',
        schema: rpaSchemas.getDebugLogSchema,
        handler: rpaHandlers.getDebugLog,
        readOnly: true,
    },
    {
        name: 'cancel-debug',
        description: 'Cancel a debug run by debug ID.',
        schema: rpaSchemas.cancelDebugSchema,
        handler: rpaHandlers.cancelDebug,
        readOnly: false,
    },
    {
        name: 'add-task',
        description: 'Submit an existing RPA task and return its execution ID (record_id). If the task already has an active run, return that run ID without submitting again.',
        schema: rpaSchemas.addTaskSchema,
        handler: rpaHandlers.addTask,
        readOnly: false,
    },
    {
        name: 'cancel-task',
        description: 'Cancel a single execution by record_id, or all active executions of a task by task_id.',
        schema: rpaSchemas.cancelTaskSchema,
        handler: rpaHandlers.cancelTask,
        readOnly: false,
    },
    {
        name: 'add-plan',
        description: 'Register and enable an existing scheduled RPA task.',
        schema: rpaSchemas.addPlanSchema,
        handler: rpaHandlers.addPlan,
        readOnly: false,
    },
    {
        name: 'get-plan-switch',
        description: 'Query enabled scheduled tasks and return open_tasks.',
        schema: rpaSchemas.getPlanSwitchSchema,
        handler: rpaHandlers.getPlanSwitch,
        readOnly: true,
    },
    {
        name: 'cancel-plan',
        description: 'Disable a scheduled task and cancel its active executions.',
        schema: rpaSchemas.cancelPlanSchema,
        handler: rpaHandlers.cancelPlan,
        readOnly: false,
    },
    {
        name: 'get-rpa-config',
        description: 'Get the thread concurrency for RPA task execution.',
        schema: rpaSchemas.getRpaConfigSchema,
        handler: rpaHandlers.getRpaConfig,
        readOnly: true,
    },
    {
        name: 'update-rpa-config',
        description: 'Update the thread concurrency for RPA task execution (1-100).',
        schema: rpaSchemas.updateRpaConfigSchema,
        handler: rpaHandlers.updateRpaConfig,
        readOnly: false,
    },
    {
        name: 'get-latest-execution',
        description: 'Get the latest execution status for each task (task_id/latest_status), not a specific run.',
        schema: rpaSchemas.getLatestExecutionSchema,
        handler: rpaHandlers.getLatestExecution,
        readOnly: true,
    },
    {
        name: 'get-record-list',
        description: 'Get the list of execution records with optional pagination and filters.',
        schema: rpaSchemas.getRecordListSchema,
        handler: rpaHandlers.getRecordList,
        readOnly: true,
    },
    {
        name: 'get-record-count',
        description: 'Get the number of execution records. Returns {count}.',
        schema: rpaSchemas.getRecordCountSchema,
        handler: rpaHandlers.getRecordCount,
        readOnly: true,
    },
    {
        name: 'get-record-detail',
        description: 'Get the status and success, failure, and cancellation counts for a execution record.',
        schema: rpaSchemas.getRecordDetailSchema,
        handler: rpaHandlers.getRecordDetail,
        readOnly: true,
    },
    {
        name: 'get-record-items',
        description: 'Get the profile execution items and logs for a execution record.',
        schema: rpaSchemas.getRecordItemsSchema,
        handler: rpaHandlers.getRecordItems,
        readOnly: true,
    },
    {
        name: 'get-record-items-count',
        description: 'Get the number of profile execution items for a execution record. Returns a number.',
        schema: rpaSchemas.getRecordItemsCountSchema,
        handler: rpaHandlers.getRecordItemsCount,
        readOnly: true,
    },
    {
        name: 'get-task-execute-items',
        description: 'Get profile execution items across runs by task ID or process ID.',
        schema: rpaSchemas.getTaskExecuteItemsSchema,
        handler: rpaHandlers.getTaskExecuteItems,
        readOnly: true,
    },
    {
        name: 'get-task-execute-items-count',
        description: 'Get the number of profile execution items across runs by task ID or process ID. Returns {count}.',
        schema: rpaSchemas.getTaskExecuteItemsCountSchema,
        handler: rpaHandlers.getTaskExecuteItemsCount,
        readOnly: true,
    },
    {
        name: 'get-task-log',
        description: 'Get the status and full logs for a profile execution item.',
        schema: rpaSchemas.getTaskLogSchema,
        handler: rpaHandlers.getTaskLog,
        readOnly: true,
    },
    {
        name: 'cancel-task-items',
        description: 'Cancel profile execution items using comma-separated item IDs.',
        schema: rpaSchemas.cancelTaskItemsSchema,
        handler: rpaHandlers.cancelTaskItems,
        readOnly: false,
    },
    {
        name: 'delete-record',
        description: 'Delete a execution record and its associated profile execution items and logs.',
        schema: rpaSchemas.deleteRecordSchema,
        handler: rpaHandlers.deleteRecord,
        readOnly: false,
    },
];
