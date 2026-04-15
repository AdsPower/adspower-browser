export type ToolCaseResultStatus = 'passed' | 'failed' | 'blocked';

export interface E2EEnv {
    enabled: boolean;
    localApiBaseUrl: string;
    timeoutMs: number;
    retryCount: number;
}
