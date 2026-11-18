import { rpaRemoteTools } from '@adspower/local-api-core';
import type { RegisterRpaTool } from './types.js';

export function registerRemoteRpaTools(register: RegisterRpaTool): void {
    for (const tool of rpaRemoteTools) {
        register(
            `rpa-${tool.name}`,
            tool.description,
            tool.schema,
            async (params) => {
                try {
                    return { content: [{ type: 'text', text: await tool.handler(params) }] };
                } catch (error) {
                    return {
                        isError: true,
                        content: [{ type: 'text', text: error instanceof Error ? error.message : String(error) }],
                    };
                }
            },
            {
                readOnlyHint: tool.readOnly,
                destructiveHint: !tool.readOnly,
                idempotentHint: tool.readOnly,
                openWorldHint: true,
            },
        );
    }
}
