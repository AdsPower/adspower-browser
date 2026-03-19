import { z } from 'zod';
import { schemas } from './schemas.js';

export type GetTagListParams = z.infer<typeof schemas.getTagListSchema>;
export type CreateTagParams = z.infer<typeof schemas.createTagSchema>;
export type UpdateTagParams = z.infer<typeof schemas.updateTagSchema>;
export type DeleteTagParams = z.infer<typeof schemas.deleteTagSchema>;
