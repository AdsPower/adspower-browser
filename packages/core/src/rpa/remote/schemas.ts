import { z } from 'zod';
import { rpaPageSizeSchema } from '../pagination.js';
import { rpaScheduleJsonSchema, validateTaskSchedule } from '../schedule.js';
import { flowNameSchema, flowVariablesSchema, flowRefTypeSchema } from '../flowSchemas.js';
import { rpaSettingsJsonSchema, rpaCreateSettingsJsonSchema } from '../settings.js';

const id = z.string().trim().min(1);
const flowFilePath = z.string().regex(/\.json\.gz$/, 'Must be a .json.gz process file path.');
const csvIds = z.string().regex(/^[^,\s]+(?:,[^,\s]+)*$/);
const pagination = {
    page: z.number().int().positive().optional().describe('Page number, starting at 1.'),
    page_size: rpaPageSizeSchema,
};

const taskWriteShape = {
    name: z.string().min(1).max(64).describe('Task name, up to 64 characters.'),
    fbcc_user_ids: csvIds.optional().describe('Comma-separated profile IDs.'),
    process_id: z.number().int().positive().describe('Process ID.'),
    exec_type: z.union([z.literal(1), z.literal(2)]).describe('Execution type: 1 for regular tasks, 2 for scheduled tasks.'),
    exec_sort: z.union([z.literal(1), z.literal(2)]).describe('Profile order: 1 for ordered, 2 for random. This is not concurrency.'),
    exec_priority: z.union([z.literal(0), z.literal(1)]).describe('Priority: 0 for normal, 1 for priority execution.'),
    schedule_rule: rpaScheduleJsonSchema.optional(),
};
const taskQueryShape = {
    exec_type: z.union([z.literal(1), z.literal(2)]).optional().describe('Filter by execution type: 1 regular, 2 scheduled; omit to query all tasks.'),
    name: z.string().optional().describe('Task name filter.'),
    fbcc_user_ids: csvIds.optional().describe('Comma-separated profile IDs.'),
    fbcc_user_acc_id: z.string().regex(/^[0-9]+(?:,[0-9]+)*$/).optional().describe('Comma-separated numeric profile numbers, such as 123,456; no whitespace or empty entries.'),
    process_name: z.string().optional().describe('Process name filter.'),
    ...pagination,
};
export const FLOW_RESPONSE_FIELDS = ['id', 'name', 'batch_id', 'remark', 'uri', 'top_time', 'setting', 'variable', 'file_size'] as const;

const flowQueryShape = {
    ids: csvIds.optional().describe('Comma-separated process IDs. Use one ID to query a process detail.'),
    keyword: z.string().optional().describe('Process search keyword.'),
    fields: z.string().refine(value => value.split(',').every(field => (FLOW_RESPONSE_FIELDS as readonly string[]).includes(field)), 'fields must contain only allowed response fields.').optional().describe('Comma-separated response fields: id, name, batch_id, remark, uri, top_time, setting, variable, file_size. No empty entries or whitespace.'),
    batch_id: id.optional().describe('Process group ID.'),
    ...pagination,
    access_link: z.union([z.literal(0), z.literal(1)]).default(0).describe('Defaults to 0; set to 1 only when a process file download link is needed.'),
    origin: z.literal('0').default('0').describe('Process origin; fixed to string 0.'),
    block_expired_paid_template_process: z.literal(1).default(1).describe('Expired paid-template filtering option; fixed to 1.'),
};


export const rpaRemoteSchemas = {
    updateProcessSchema: z.object({
        id: id.describe('Process ID to update.'),
        batch_id: z.union([z.number().int().nonnegative(), id]).describe('Process group ID, or 0. Supply the existing value unless changing it.'),
        name: flowNameSchema,
        variable: flowVariablesSchema.unwrap().describe('Process variables encoded as JSON. Required; supply the existing variables unless changing them.'),
        setting: rpaSettingsJsonSchema.describe(`${rpaSettingsJsonSchema.description} Required; supply the existing settings unless changing them.`),
        remark: z.string().max(200).describe('Process remark, up to 200 characters. Required; preserve the existing remark unless explicitly changing or clearing it.'),
        process_file: flowFilePath.describe('Required replacement .json.gz process file path readable by the runtime, at most 4MB (4194304 bytes). Use the editable-fields endpoint for metadata-only changes.'),
    }).strict(),
    getTemplateSubscriptionInfoSchema: z.object({ id: id.describe('Process ID used to query paid-template subscription information.') }).strict(),
    createProcessSchema: z.object({
        batch_id: z.union([z.number().int().nonnegative(), z.string().trim().min(1)]).default(0).describe('Process group ID; defaults to 0 for ungrouped processes.'),
        ref_type: flowRefTypeSchema,
        ref_id: z.string().optional().describe('Template ID identifying the source Template Store template.'),
        name: flowNameSchema,
        variable: flowVariablesSchema,
        setting: rpaCreateSettingsJsonSchema,
        remark: z.string().max(200).default('').describe('Process remark, up to 200 characters. Always sent; defaults to an empty string.'),
        allow_random_name: z.number().int().default(1).describe('Whether random names are allowed: 0 rejects conflicting names; nonzero allows a random name. Defaults to 1.'),
        process_file: flowFilePath.describe('.json.gz process file path accessible to the AdsPower runtime; uploaded as multipart process_file.'),
    }).strict(),

    createTaskSchema: z.object({
        ...taskWriteShape,
        name: taskWriteShape.name.default(() => `RPA_TASK_${Date.now()}`).describe('Task name, up to 64 characters; defaults to RPA_TASK_<current Unix timestamp in milliseconds>.'),
        fbcc_user_ids: csvIds.describe('Required comma-separated profile IDs.'),
        exec_type: taskWriteShape.exec_type.default(1).describe('Execution type: 1 regular (default), 2 scheduled.'),
        exec_sort: taskWriteShape.exec_sort.default(1).describe('Profile order: 1 ordered (default), 2 random; not concurrency.'),
        exec_priority: taskWriteShape.exec_priority.default(0).describe('Priority: 0 normal (default), 1 priority execution.'),
        schedule_rule: rpaScheduleJsonSchema.default('{}'),
    }).strict().superRefine((value, ctx) => validateTaskSchedule(value, ctx, true)),
    getProcessListSchema: z.object(flowQueryShape).strict(),
    getProcessListCountSchema: z.object(flowQueryShape).omit({ fields: true }).strict(),
    getTaskListSchema: z.object(taskQueryShape).strict(),
    getTaskListCountSchema: z.object(taskQueryShape).strict(),
    getTaskDetailSchema: z.object({
        ids: csvIds.describe('Comma-separated task IDs, not local execution IDs.'),
    }).strict(),
    deleteTaskSchema: z.object({ ids: csvIds.describe('Comma-separated task IDs to delete.') }).strict(),
    updateTaskSchema: z.object({ ...taskWriteShape, id: id.describe('Task ID to update.') }).strict()
        .superRefine((value, ctx) => validateTaskSchedule(value, ctx, false)),
    getTaskRuntimeListSchema: z.object({
        task_id: id.describe('Task ID.'),
        fbcc_user_ids: csvIds.optional().describe('Comma-separated profile IDs.'),
        fbcc_user_name: z.string().optional().describe('Profile name filter.'),
        fbcc_user_batch_id: id.optional().describe('Browser profile group ID, not a process group ID.'),
        fbcc_user_acc_id: z.string().regex(/^[0-9]+(?:,[0-9]+)*$/).optional().describe('Comma-separated numeric profile numbers, such as 123,456; no whitespace or empty entries.'),
        ...pagination,
    }).strict(),
    getTaskRuntimeListCountSchema: z.object({ task_id: id.describe('Task ID.') }).strict(),
    addTaskRuntimeSchema: z.object({
        task_id: id.describe('Task ID.'),
        fbcc_user_ids: csvIds.describe('Comma-separated profile IDs to bind.'),
    }).strict(),
    deleteTaskRuntimeSchema: z.object({
        task_id: id.describe('Task ID.'),
        ids: csvIds.describe('Comma-separated binding record IDs, not profile IDs or local execution item IDs.'),
    }).strict(),
    updateProcessEditableFieldsSchema: z.object({
        id: id.describe('Process ID.'),
        variable: flowVariablesSchema,
        setting: rpaSettingsJsonSchema.optional(),
        remark: z.string().max(200).optional().describe('Process remark, up to 200 characters.'),
        name: z.string().max(100).optional().describe('Process name, up to 100 characters.'),
        batch_id: id.optional().describe('Target process group ID.'),
    }).strict(),
    deleteProcessSchema: z.object({ ids: csvIds.describe('Comma-separated process IDs to delete.') }).strict(),
    copyProcessSchema: z.object({ id: id.describe('Process ID to copy.'), batch_id: id.describe('Target process group ID.') }).strict(),
    moveProcessSchema: z.object({ ids: csvIds.describe('Comma-separated process IDs to move.'), batch_id: id.describe('Target process group ID.') }).strict(),
    topProcessSchema: z.object({ id: id.describe('Process ID whose pinned state will be toggled. A positive top_time means it is currently pinned; calling this endpoint again unpins it.') }).strict(),
    getBatchListSchema: z.object({
        page: z.number().int().positive().describe('Page number, starting at 1.'),
        page_size: rpaPageSizeSchema,
    }).strict(),
    createBatchSchema: z.object({ name: z.string().max(30).describe('New process group name, up to 30 characters.') }).strict(),
    updateBatchSchema: z.object({ id: id.describe('Process group ID.'), name: z.string().max(30).describe('New process group name, up to 30 characters.') }).strict(),
    deleteBatchSchema: z.object({ ids: csvIds.describe('Comma-separated process group IDs to delete.') }).strict(),
    createShareSchema: z.object({
        process_ids: csvIds.describe('Comma-separated process IDs to share.'),
        quota: z.number().max(1000).default(10).describe('Share usage quota, at most 1000; defaults to 10.'),
        expired_time: z.union([z.literal(1), z.literal(7), z.literal(30)]).default(7).describe('Share validity in days: 1, 7 or 30; defaults to 7 days.'),
        share_config: z.enum(['', 'remark']).default('').describe('Optional shared content: empty string shares no remark; remark includes the process remark. Defaults to an empty string.'),
    }).strict(),
    receiveShareSchema: z.object({
        share_code: z.string().describe('Process share code.'),
        batch_id: id.optional().describe('Target process group ID. Omit for the all-groups view; do not pass all.'),
    }).strict(),
};
