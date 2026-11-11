import axios from 'axios';
import { readDebugProcess, writeRpaLogResult } from './fileTransport.js';
import { getRpaApiBase } from './api.js';
import type {
    CancelTaskItemsParams, DeleteRecordParams,
    GetLatestExecutionParams, GetRecordListParams, GetRecordCountParams, GetRecordDetailParams, GetRecordItemsParams, GetRecordItemsCountParams, GetTaskExecuteItemsParams, GetTaskExecuteItemsCountParams, GetTaskLogParams,
    ReadExcelFieldsParams, ReadTextListParams, CheckEmailParams, GetTwoFaParams, GoogleSheetsParams,
    StartDebugParams, GetDebugLogParams, CancelDebugParams, AddTaskParams, CancelTaskParams,
    AddPlanParams, GetPlanSwitchParams, CancelPlanParams, GetRpaConfigParams, UpdateRpaConfigParams,
} from './types.js';
import { rpaSchemas, taskSubmissionResultSchema } from './schemas.js';

export const rpaHandlers = {
    async readExcelFields(params: ReadExcelFieldsParams): Promise<string> {
        const body = rpaSchemas.readExcelFieldsSchema.parse(params);
        const response = await axios.post(
            `${getRpaApiBase()}/api/rpav2/tool/getExcelContent`,
            body,
            { timeout: 30000, proxy: false },
        );
        if (response.data.code === 0) {
            return JSON.stringify(response.data.data, null, 2);
        }
        throw new Error(response.data.msg || 'Failed to read Excel fields');
    },
    async readTextList(params: ReadTextListParams): Promise<string> {
        const body = rpaSchemas.readTextListSchema.parse(params);
        const response = await axios.post(
            `${getRpaApiBase()}/api/rpav2/tool/getTxtContent`,
            body,
            { timeout: 30000, proxy: false },
        );
        if (response.data.code === 0) {
            return JSON.stringify(response.data.data, null, 2);
        }
        throw new Error(response.data.msg || 'RPA readTextList failed');
    },
    async checkEmail(params: CheckEmailParams): Promise<string> {
        const body = rpaSchemas.checkEmailSchema.parse(params);
        const response = await axios.post(
            `${getRpaApiBase()}/api/rpav2/tool/getCheckEmail`,
            body,
            { timeout: 30000, proxy: false },
        );
        if (response.data.code === 0) {
            return JSON.stringify(response.data.data, null, 2);
        }
        throw new Error(response.data.msg || 'RPA checkEmail failed');
    },
    async getTwoFa(params: GetTwoFaParams): Promise<string> {
        const body = rpaSchemas.getTwoFaSchema.parse(params);
        const response = await axios.post(
            `${getRpaApiBase()}/api/rpav2/tool/getCheckTwoFa`,
            body,
            { timeout: 30000, proxy: false },
        );
        if (response.data.code === 0) {
            return JSON.stringify(response.data.data, null, 2);
        }
        throw new Error(response.data.msg || 'RPA getTwoFa failed');
    },
    async googleSheets(params: GoogleSheetsParams): Promise<string> {
        const query = rpaSchemas.googleSheetsSchema.parse(params);
        const response = await axios.get(
            `${getRpaApiBase()}/api/rpav2/tool/googleSheet/test`,
            { params: query, timeout: 30000, proxy: false },
        );
        if (response.data.code === 0) {
            return JSON.stringify(response.data.data, null, 2);
        }
        throw new Error(response.data.msg || 'RPA googleSheets failed');
    },
    async startDebug(params: StartDebugParams): Promise<string> {
        const { process_file, ...body } = rpaSchemas.startDebugSchema.parse(params);
        if (process_file) body.process = await readDebugProcess(process_file);
        const response = await axios.post(
            `${getRpaApiBase()}/api/rpav2/debug`,
            body,
            { timeout: 30000, proxy: false },
        );
        if (response.data.code === 0) {
            return JSON.stringify(response.data.data, null, 2);
        }
        throw new Error(response.data.msg || 'RPA startDebug failed');
    },
    async getDebugLog(params: GetDebugLogParams): Promise<string> {
        const { output_file, ...query } = rpaSchemas.getDebugLogSchema.parse(params);
        const response = await axios.get(
            `${getRpaApiBase()}/api/rpav2/debug/getLog`,
            { params: query, timeout: 30000, proxy: false },
        );
        if (response.data.code === 0) {
            return writeRpaLogResult(response.data.data, output_file);
        }
        throw new Error(response.data.msg || 'RPA getDebugLog failed');
    },
    async cancelDebug(params: CancelDebugParams): Promise<string> {
        const query = rpaSchemas.cancelDebugSchema.parse(params);
        const response = await axios.get(
            `${getRpaApiBase()}/api/rpav2/debug/cancel`,
            { params: query, timeout: 30000, proxy: false },
        );
        if (response.data.code === 0) {
            return JSON.stringify(response.data.data, null, 2);
        }
        throw new Error(response.data.msg || 'RPA cancelDebug failed');
    },
    async addTask(params: AddTaskParams): Promise<string> {
        const body = rpaSchemas.addTaskSchema.parse(params);
        const response = await axios.post(
            `${getRpaApiBase()}/api/rpav2/task/add`,
            body,
            { timeout: 30000, proxy: false },
        );
        if (response.data.code === 0) {
            return JSON.stringify(taskSubmissionResultSchema.parse(response.data.data), null, 2);
        }
        throw new Error(response.data.msg || 'RPA addTask failed');
    },
    async cancelTask(params: CancelTaskParams): Promise<string> {
        const body = rpaSchemas.cancelTaskSchema.parse(params);
        const response = await axios.post(
            `${getRpaApiBase()}/api/rpav2/task/cancel`,
            body,
            { timeout: 30000, proxy: false },
        );
        if (response.data.code === 0) {
            return JSON.stringify(response.data.data, null, 2);
        }
        throw new Error(response.data.msg || 'RPA cancelTask failed');
    },
    async addPlan(params: AddPlanParams): Promise<string> {
        const body = rpaSchemas.addPlanSchema.parse(params);
        const response = await axios.post(
            `${getRpaApiBase()}/api/rpav2/plan/add`,
            body,
            { timeout: 30000, proxy: false },
        );
        if (response.data.code === 0) {
            return JSON.stringify(response.data.data, null, 2);
        }
        throw new Error(response.data.msg || 'RPA addPlan failed');
    },
    async getPlanSwitch(params: GetPlanSwitchParams): Promise<string> {
        const query = rpaSchemas.getPlanSwitchSchema.parse(params);
        const response = await axios.get(
            `${getRpaApiBase()}/api/rpav2/plan/switch`,
            { params: query, timeout: 30000, proxy: false },
        );
        if (response.data.code === 0) {
            return JSON.stringify(response.data.data, null, 2);
        }
        throw new Error(response.data.msg || 'RPA getPlanSwitch failed');
    },
    async cancelPlan(params: CancelPlanParams): Promise<string> {
        const body = rpaSchemas.cancelPlanSchema.parse(params);
        const response = await axios.post(
            `${getRpaApiBase()}/api/rpav2/plan/cancel`,
            body,
            { timeout: 30000, proxy: false },
        );
        if (response.data.code === 0) {
            return JSON.stringify(response.data.data, null, 2);
        }
        throw new Error(response.data.msg || 'RPA cancelPlan failed');
    },
    async getRpaConfig(params: GetRpaConfigParams): Promise<string> {
        const query = rpaSchemas.getRpaConfigSchema.parse(params);
        const response = await axios.get(
            `${getRpaApiBase()}/api/rpav2/getConfig`,
            { params: query, timeout: 30000, proxy: false },
        );
        if (response.data.code === 0) {
            return JSON.stringify(response.data.data, null, 2);
        }
        throw new Error(response.data.msg || 'RPA getRpaConfig failed');
    },
    async updateRpaConfig(params: UpdateRpaConfigParams): Promise<string> {
        const body = rpaSchemas.updateRpaConfigSchema.parse(params);
        const response = await axios.post(
            `${getRpaApiBase()}/api/rpav2/updateConfig`,
            body,
            { timeout: 30000, proxy: false },
        );
        if (response.data.code === 0) {
            return JSON.stringify(response.data.data, null, 2);
        }
        throw new Error(response.data.msg || 'RPA updateRpaConfig failed');
    },
    async getLatestExecution(params: GetLatestExecutionParams): Promise<string> {
        const query = rpaSchemas.getLatestExecutionSchema.parse(params);
        const response = await axios.get(
            `${getRpaApiBase()}/api/rpav2/task/getLatestExecution`,
            { params: query, timeout: 30000, proxy: false },
        );
        if (response.data.code === 0) {
            return JSON.stringify(response.data.data, null, 2);
        }
        throw new Error(response.data.msg || 'RPA getLatestExecution failed');
    },
    async getRecordList(params: GetRecordListParams): Promise<string> {
        const query = rpaSchemas.getRecordListSchema.parse(params);
        const response = await axios.get(
            `${getRpaApiBase()}/api/rpav2/task/getRecordList`,
            { params: query, timeout: 30000, proxy: false },
        );
        if (response.data.code === 0) {
            return JSON.stringify(response.data.data, null, 2);
        }
        throw new Error(response.data.msg || 'RPA getRecordList failed');
    },
    async getRecordCount(params: GetRecordCountParams): Promise<string> {
        const query = rpaSchemas.getRecordCountSchema.parse(params);
        const response = await axios.get(
            `${getRpaApiBase()}/api/rpav2/task/getRecordCount`,
            { params: query, timeout: 30000, proxy: false },
        );
        if (response.data.code === 0) {
            return JSON.stringify(response.data.data, null, 2);
        }
        throw new Error(response.data.msg || 'RPA getRecordCount failed');
    },
    async getRecordDetail(params: GetRecordDetailParams): Promise<string> {
        const { output_file, ...query } = rpaSchemas.getRecordDetailSchema.parse(params);
        const response = await axios.get(
            `${getRpaApiBase()}/api/rpav2/task/getRecordDetail`,
            { params: query, timeout: 30000, proxy: false },
        );
        if (response.data.code === 0) {
            return writeRpaLogResult(response.data.data, output_file);
        }
        throw new Error(response.data.msg || 'RPA getRecordDetail failed');
    },
    async getRecordItems(params: GetRecordItemsParams): Promise<string> {
        const { output_file, ...query } = rpaSchemas.getRecordItemsSchema.parse(params);
        const response = await axios.get(
            `${getRpaApiBase()}/api/rpav2/task/getRecordItems`,
            { params: query, timeout: 30000, proxy: false },
        );
        if (response.data.code === 0) {
            return writeRpaLogResult(response.data.data, output_file);
        }
        throw new Error(response.data.msg || 'RPA getRecordItems failed');
    },
    async getRecordItemsCount(params: GetRecordItemsCountParams): Promise<string> {
        const query = rpaSchemas.getRecordItemsCountSchema.parse(params);
        const response = await axios.get(
            `${getRpaApiBase()}/api/rpav2/task/getRecordItemsCount`,
            { params: query, timeout: 30000, proxy: false },
        );
        if (response.data.code === 0) {
            return JSON.stringify(response.data.data, null, 2);
        }
        throw new Error(response.data.msg || 'RPA getRecordItemsCount failed');
    },
    async getTaskExecuteItems(params: GetTaskExecuteItemsParams): Promise<string> {
        const { output_file, ...query } = rpaSchemas.getTaskExecuteItemsSchema.parse(params);
        const response = await axios.get(
            `${getRpaApiBase()}/api/rpav2/task/getTaskExecuteItems`,
            { params: query, timeout: 30000, proxy: false },
        );
        if (response.data.code === 0) {
            return writeRpaLogResult(response.data.data, output_file);
        }
        throw new Error(response.data.msg || 'RPA getTaskExecuteItems failed');
    },
    async getTaskExecuteItemsCount(params: GetTaskExecuteItemsCountParams): Promise<string> {
        const query = rpaSchemas.getTaskExecuteItemsCountSchema.parse(params);
        const response = await axios.get(
            `${getRpaApiBase()}/api/rpav2/task/getTaskExecuteItemsCount`,
            { params: query, timeout: 30000, proxy: false },
        );
        if (response.data.code === 0) {
            return JSON.stringify(response.data.data, null, 2);
        }
        throw new Error(response.data.msg || 'RPA getTaskExecuteItemsCount failed');
    },
    async getTaskLog(params: GetTaskLogParams): Promise<string> {
        const { output_file, ...query } = rpaSchemas.getTaskLogSchema.parse(params);
        const response = await axios.get(
            `${getRpaApiBase()}/api/rpav2/task/getLog`,
            { params: query, timeout: 30000, proxy: false },
        );
        if (response.data.code === 0) {
            return writeRpaLogResult(response.data.data, output_file);
        }
        throw new Error(response.data.msg || 'RPA getTaskLog failed');
    },
    async cancelTaskItems(params: CancelTaskItemsParams): Promise<string> {
        const body = rpaSchemas.cancelTaskItemsSchema.parse(params);
        const response = await axios.post(
            `${getRpaApiBase()}/api/rpav2/task/cancelItems`,
            body,
            { timeout: 30000, proxy: false },
        );
        if (response.data.code === 0) {
            return JSON.stringify(response.data.data, null, 2);
        }
        throw new Error(response.data.msg || 'RPA cancelTaskItems failed');
    },
    async deleteRecord(params: DeleteRecordParams): Promise<string> {
        const body = rpaSchemas.deleteRecordSchema.parse(params);
        const response = await axios.post(
            `${getRpaApiBase()}/api/rpav2/task/deleteRecord`,
            body,
            { timeout: 30000, proxy: false },
        );
        if (response.data.code === 0) {
            return JSON.stringify(response.data.data, null, 2);
        }
        throw new Error(response.data.msg || 'RPA deleteRecord failed');
    },
};
