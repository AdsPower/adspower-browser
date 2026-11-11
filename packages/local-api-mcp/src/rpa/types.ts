import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import type { z } from 'zod';

export type RpaToolAnnotations = {
    readOnlyHint: boolean;
    destructiveHint: boolean;
    idempotentHint: boolean;
    openWorldHint: boolean;
};

export type RegisterRpaTool = (
    name: string,
    description: string,
    schema: z.ZodTypeAny,
    handler: (params: any) => Promise<CallToolResult>,
    annotations?: RpaToolAnnotations,
) => void;
