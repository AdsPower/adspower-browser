import { rpaLocalTools, rpaRemoteTools } from '@adspower/local-api-core';
import { createMcpClient } from '../../runner/mcpClient.js';
import type { CaseRunResult } from '../../types.js';

export const rpaValidationCases: Record<string, () => Promise<CaseRunResult>> = Object.fromEntries(
    [...rpaLocalTools, ...rpaRemoteTools].map(tool => {
        const name = `rpa-${tool.name}`;
        return [`rpa.validation.${tool.name}.reject-unknown-field`, async (): Promise<CaseRunResult> => {
            const client = await createMcpClient();
            try {
                try {
                    await client.callTool(name, { __unsupported_rpa_field__: true });
                    return { passed: false, details: ['The MCP boundary accepted an unsupported parameter.'] };
                } catch (error) {
                    const message = error instanceof Error ? error.message : String(error);
                    const passed = message.includes(`Invalid arguments for tool ${name}`)
                        && message.includes('__unsupported_rpa_field__');
                    return { passed, details: [passed
                        ? 'Unsupported parameter rejected over MCP stdio; business execution and optional-field coverage are not validated by this case.'
                        : `Unexpected MCP validation error: ${message}`] };
                }
            } finally {
                await client.close();
            }
        }];
    }),
);
