import { describe, expect, it } from 'vitest';
import { readE2EEnv } from './config/env';

describe('readE2EEnv', () => {
    it('missing required env should throw readable error', () => {
        expect(() =>
            readE2EEnv({
                ADSP_LOCAL_API_BASE_URL: '',
                ADSP_MCP_E2E_ENABLED: '1',
            } as NodeJS.ProcessEnv),
        ).toThrow(/ADSP_LOCAL_API_BASE_URL/);
    });
});
