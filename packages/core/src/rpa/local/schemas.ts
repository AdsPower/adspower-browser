import { z } from 'zod';
import { rpaPageSizeSchema } from '../pagination.js';
import { flowNameSchema, flowVariablesSchema } from '../flowSchemas.js';
import { rpaCreateSettingsJsonSchema } from '../settings.js';

const historyPagination = {
    page: z.number().int().positive().optional().describe('Page number, starting at 1; defaults to 1 on the service.'),
    page_size: rpaPageSizeSchema,
};

const taskOrProcessShape = {
    task_id: z.string().trim().min(1).optional().describe('Task ID. Provide task_id or process_id; the service uses task_id if both are supplied.'),
    process_id: z.string().trim().min(1).optional().describe('Process ID used to query profile execution items across tasks for this process.'),
};

function historyFilterSchema(fields: [string, ...string[]]) {
    const condition = z.object({
        field: z.enum(fields),
        op: z.enum(['like', 'eq', '=', 'ne', '!=', 'gt', '>', 'gte', '>=', 'lt', '<', 'lte', '<=', 'in', 'not_in', 'is_null', 'is_not_null']),
        val: z.union([z.string(), z.number(), z.boolean(), z.null(), z.array(z.union([z.string(), z.number()]))]),
    }).strict();
    const filter = z.object({ and: z.array(condition).optional(), or: z.array(condition).optional() }).strict();
    return z.string().refine(value => {
        try {
            return filter.safeParse(JSON.parse(value)).success;
        } catch {
            return false;
        }
    }, 'filter must be a valid JSON string with and/or condition arrays and allowed fields.').describe(
        `Filter encoded as JSON, for example {"and":[{"field":"status","op":"eq","val":"COMPLETE"}]}; allowed fields: ${fields.join(', ')}`,
    );
}

const recordFilterSchema = historyFilterSchema([
    'id', 'task_id', 'task_name', 'process_id', 'process_name', 'task_type',
    'profile_count', 'status', 'start_time', 'end_time', 'create_time', 'update_time',
]);
const itemFilterSchema = historyFilterSchema([
    'id', 'record_id', 'task_id', 'process_id', 'process_name', 'fbcc_id', 'acc_id',
    'status', 'start_time', 'end_time', 'create_time', 'update_time',
]);

export const rpaSchemas = {
    readExcelFieldsSchema: z.object({
        file_path: z.string().min(1).describe('Excel file path accessible to the computer running RPA.'),
    }).strict(),
    readTextListSchema: z.object({
        file_path: z.string().min(1).describe('Local text file path.'),
    }).strict(),
    checkEmailSchema: z.object({
        user: z.string().min(1).describe('Email login account.'),
        password: z.string().min(1).describe('Password or app password; required even when OAuth parameters are supplied.'),
        imapHost: z.string().min(1).describe('IMAP server address.'),
        port: z.string().optional().describe('IMAP port as a string; the mail service defaults to 993.'),
        status: z.string().optional().describe('IMAP status filter, converted to uppercase; defaults to UNSEEN.'),
        subject: z.string().optional().describe('Email subject filter.'),
        from: z.string().optional().describe('Sender filter.'),
        mailTo: z.string().optional().describe('Recipient filter.'),
        dateType: z.enum(['today','yestoday','7days','30days']).optional()
            .describe('Date filter: today, yesterday, last 7 days, or last 30 days. The service uses the spelling yestoday.'),
        keyword: z.string().optional().describe('Email TEXT search keyword.'),
        reg: z.string().optional().describe('Regular expression for extracting message content.'),
        timeout: z.string().optional().describe('IMAP connection timeout in milliseconds, supplied as a string; defaults to 30000 (30 seconds) on the service.'),
        tls: z.enum(['0','1']).optional().describe('Set to 1 to enable TLS; enabled by default.'),
        seen: z.enum(['0','1']).optional().describe('Set to 1 to mark fetched messages as read; disabled by default.'),
        isJunk: z.enum(['0','1']).optional().describe('Set to 1 to query junk folders; disabled by default.'),
        clientId: z.string().optional().describe('OAuth client ID.'),
        clientSecret: z.string().optional().describe('OAuth client secret.'),
        refreshToken: z.string().optional().describe('OAuth refresh token.'),
    }).strict(),
    getTwoFaSchema: z.object({
        secret: z.string().min(1).describe('TOTP secret; do not include it in logs.'),
    }).strict(),
    googleSheetsSchema: z.object({
        sheetId: z.string().min(1).describe('Spreadsheet ID'),
        sheetName: z.string().min(1).describe('Worksheet name.'),
        type: z.enum(['read','write','clear']).default('read').describe('Operation to perform; defaults to read.'),
        apiKey: z.string().optional()
            .describe('Service-account configuration as a JSON string containing private_key, client_email, and client_id; not a plain API key.'),
        isKey: z.enum(['0','1']).default('1')
            .describe('For read, 0 returns a two-dimensional array; 1 uses the first row as object keys. Defaults to 1.'),
        range: z.string().optional().describe('A1 range, such as A1:C10; omission uses the worksheet range.'),
        template: z.string().refine(value => {
            try {
                const rows: unknown = JSON.parse(value);
                return Array.isArray(rows) && rows.every(Array.isArray);
            } catch {
                return false;
            }
        }, 'template must be a two-dimensional array encoded as JSON.').optional().describe('Required for write: a two-dimensional array encoded as JSON.'),
        rangeType: z.enum(['append','custom']).default('append')
            .describe('For write, append adds rows to the worksheet; custom writes to range. Defaults to append.'),
    }).strict().refine(value => value.type !== 'write' || Boolean(value.template), 'template is required for write.'),
    startDebugSchema: z.object({
        start_node_id: z.string().min(1).describe('Starting node ID.'),
        process: z.string().optional().describe('Legacy inline flow JSON. Prefer process_file to avoid repeating full workflows in context.'),
        process_file: z.string().trim().min(1).optional().describe('Absolute local path to full flow JSON or gzip JSON, at most 32 MiB expanded. Provide exactly one of process_file/process; the tool reads it only when sending the RPA request.'),
        process_name: flowNameSchema.optional(),
        variable: flowVariablesSchema,
        setting: rpaCreateSettingsJsonSchema,
        fbcc_id: z.string().min(1).describe('Profile ID.'),
        acc_id: z.string().min(1).describe('Profile number, distinct from fbcc_id.'),
    }).strict().refine(value => (value.process !== undefined) !== (value.process_file !== undefined), 'Provide exactly one of process_file/process.'),
    getDebugLogSchema: z.object({
        id: z.string().min(1).describe('Debug ID, not a task ID or execution record ID.'),
        output_file: z.string().trim().min(1).optional().describe('Write the complete response to a new absolute local file and return only status metadata and its path. Omit for legacy full output.'),
    }).strict(),
    cancelDebugSchema: z.object({
        id: z.string().min(1).describe('debug_id'),
    }).strict(),
    addTaskSchema: z.object({
        task_id: z.string().trim().min(1).describe('Existing RPA task ID.'),
    }).strict(),
    cancelTaskSchema: z.object({
        task_id: z.string().trim().min(1).optional().describe('RPA task ID. Cancels all active runs of this task; provide either task_id or record_id.'),
        record_id: z.string().regex(/^[1-9]\d*$/).optional().describe('Execution ID returned by add-task. Cancels only this run; provide either record_id or task_id.'),
    }).strict().refine(value => Boolean(value.task_id) !== Boolean(value.record_id), 'Provide exactly one of task_id or record_id.'),
    addPlanSchema: z.object({
        task_id: z.string().min(1).describe('RPA task ID with a schedule already configured.'),
    }).strict(),
    getPlanSwitchSchema: z.object({
        task_ids: z.string().regex(/^[^,\s]+(?:,[^,\s]+)*$/).describe('Comma-separated RPA task IDs, such as 123,456.'),
    }).strict(),
    cancelPlanSchema: z.object({
        task_id: z.string().min(1).describe('Scheduled RPA task ID.'),
    }).strict(),
    getRpaConfigSchema: z.object({
        keys: z.literal('thread').default('thread').describe('Configuration key; only thread is supported and is used by default.'),
    }).strict(),
    updateRpaConfigSchema: z.object({
        thread: z.string().regex(/^(?:[1-9]|[1-9][0-9]|100)$/).describe('RPA thread concurrency as an integer string from 1 to 100.'),
    }).strict(),
    getLatestExecutionSchema: z.object({
        task_ids: z.string().regex(/^[^,\s]+(?:,[^,\s]+)*$/).describe('Comma-separated remote task IDs, such as 123,456.'),
    }).strict(),
    getRecordListSchema: z.object({
        filter: recordFilterSchema.optional(),
        ...historyPagination,
    }).strict(),
    getRecordCountSchema: z.object({
        filter: recordFilterSchema.optional(),
    }).strict(),
    getRecordDetailSchema: z.object({
        id: z.string().trim().min(1).describe('Local execution record ID (record_id), not a task ID.'),
        output_file: z.string().trim().min(1).optional().describe('Write the complete response to a new absolute local file and return only status metadata and its path. Omit for legacy full output.'),
    }).strict(),
    getRecordItemsSchema: z.object({
        id: z.string().trim().min(1).describe('Local execution record ID (record_id).'),
        filter: itemFilterSchema.optional(),
        ...historyPagination,
        output_file: z.string().trim().min(1).optional().describe('Write complete response including embedded logs to a new absolute file and return metadata only.'),
    }).strict(),
    getRecordItemsCountSchema: z.object({
        id: z.string().trim().min(1).describe('Local execution record ID (record_id).'),
        filter: itemFilterSchema.optional(),
    }).strict(),
    getTaskExecuteItemsSchema: z.object({
        ...taskOrProcessShape,
        ...historyPagination,
        output_file: z.string().trim().min(1).optional().describe('Write complete response including embedded logs to a new absolute file and return metadata only.'),
    }).strict().refine(value => Boolean(value.task_id || value.process_id), 'At least one of task_id/process_id must be provided.'),
    getTaskExecuteItemsCountSchema: z.object({
        ...taskOrProcessShape,
    }).strict().refine(value => Boolean(value.task_id || value.process_id), 'At least one of task_id/process_id must be provided.'),
    getTaskLogSchema: z.object({
        id: z.string().trim().min(1).describe('Profile execution item ID (item_id), not a task ID or execution record ID.'),
        output_file: z.string().trim().min(1).optional().describe('Write the complete response to a new absolute local file and return only status metadata and its path. Omit for legacy full output.'),
    }).strict(),
    cancelTaskItemsSchema: z.object({
        ids: z.string().regex(/^[^,\s]+(?:,[^,\s]+)*$/).describe('Comma-separated profile execution item IDs (item_id), such as 99,100; not task IDs or execution record IDs.'),
    }).strict(),
    deleteRecordSchema: z.object({
        id: z.string().trim().min(1).describe('Local execution record ID (record_id), not a task ID or profile execution item ID.'),
    }).strict(),
};

export const taskSubmissionResultSchema = z.object({
    record_id: z.string().min(1),
}).strict();
