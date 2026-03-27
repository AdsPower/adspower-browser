import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { browserBase } from '@adspower/local-api-core';

export function wrapHandler(handler: Function) {
    return async (params: any): Promise<CallToolResult> => {
        try {
            const content = await handler(params);
            if (typeof content === 'string') {
                return {
                    content: [{
                        type: 'text' as const,
                        text: content
                    }]
                };
            }
            return {
                content
            };
        } catch (error) {
            let errorMessage = error instanceof Error ? error.message : String(error);
            const lowerErrorMessage = errorMessage.toLowerCase();
            if (
                errorMessage.includes("Target page, context or browser has been closed") ||
                errorMessage.includes("Target closed") ||
                errorMessage.includes("Browser has been disconnected") ||
                errorMessage.includes("Protocol error") ||
                errorMessage.includes("Connection closed")
            ) {
                await browserBase.resetBrowser();
                errorMessage = `Browser connection error: ${errorMessage}. Connection has been reset - please retry the operation.`;
            }
            if (lowerErrorMessage.includes('not found')) {
                errorMessage = `${errorMessage}\n\nIf this API was introduced in a newer client version, please update AdsPower client to the latest patch first (use update-patch), then retry.`;
            }
            return {
                content: [{
                    type: 'text' as const,
                    text: errorMessage
                }]
            };
        }
    };
}
