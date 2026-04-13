import { z } from 'zod';
import { schemas } from './schemas.js';

export type CreateGroupParams = z.infer<typeof schemas.createGroupSchema>;
export type UpdateGroupParams = z.infer<typeof schemas.updateGroupSchema>;
export type GetGroupListParams = z.infer<typeof schemas.getGroupListSchema>;
