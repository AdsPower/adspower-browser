import type { E2EEnv } from '../types';

export function readE2EEnv(env: NodeJS.ProcessEnv): E2EEnv {
    const localApiBaseUrl = env.ADSP_LOCAL_API_BASE_URL?.trim() ?? '';
    if (!localApiBaseUrl) {
        throw new Error('Missing required env: ADSP_LOCAL_API_BASE_URL');
    }
    return {
        enabled: env.ADSP_MCP_E2E_ENABLED === '1',
        localApiBaseUrl,
        timeoutMs: Number(env.ADSP_MCP_E2E_TIMEOUT_MS ?? 15000),
        retryCount: Number(env.ADSP_MCP_E2E_RETRY_COUNT ?? 1),
    };
}
