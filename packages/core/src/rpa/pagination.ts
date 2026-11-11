import { z } from 'zod';

export const rpaPageSizeSchema = z.union([z.literal(10), z.literal(20), z.literal(50), z.literal(100)])
    .default(10).describe('Items per page; allowed values: 10, 20, 50, 100. Defaults to 10.');
