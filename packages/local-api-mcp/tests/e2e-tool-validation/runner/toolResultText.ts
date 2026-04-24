import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/** Concatenate all `text` parts from an MCP tool result (for JSON / message inspection). */
export function getToolTextContent(result: CallToolResult): string {
    if (!result.content?.length) {
        return '';
    }
    return result.content
        .filter((block): block is { type: 'text'; text: string } => block.type === 'text' && 'text' in block)
        .map((block) => block.text)
        .join('\n');
}
