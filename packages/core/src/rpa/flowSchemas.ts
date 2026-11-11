import { z } from 'zod';

export enum RefType {
    CREATE = '0',
    SHARE = '1',
    COPY = '2',
    MARKETPLACE = '3',
    OLD_RPA = '4',
    PAY_MARKETPLACE = '5',
    GET_COPY = '6',
    NEW_MARKETPLACE = '7',
    AI_AGENT = '8',
}

export const flowRefTypeSchema = z.union([z.enum(RefType), z.number().int().min(0).max(8)])
    .describe('Process source: 0 creation, 1 share, 2 copy, 3 legacy Template Store, 4 legacy RPA migration, 5 paid Template Store template, 6 received copy, 7 new Template Store, 8 AI Agent Local API. Accepts a numeric value or its string representation.');

export const flowNameSchema = z.string().min(1).max(100).describe('Process name, up to 100 characters.');

export const flowVariablesSchema = z.string().refine(value => {
            if (Buffer.byteLength(value, 'utf8') > 1048576) return false;
            try {
                const variables = JSON.parse(value);
                return Array.isArray(variables) && variables.length <= 1000 && variables.every(item =>
                    item && typeof item.key === 'string' && item.key.length <= 32 &&
                    typeof (item.val ?? item.value) === 'string' && (item.val ?? item.value).length <= 1000);
            } catch { return false; }
        }, 'variable must be a JSON array of at most 1000 variables, up to 1MB UTF-8, with key <=32 and val/value <=1000 characters.').optional().describe('Global variables encoded as JSON, up to 1MB UTF-8 and 1000 variables.');

