import { z } from 'zod';
import { schemas } from './schemas.js';

export type CreateMemberParams = z.infer<typeof schemas.createMemberSchema>;
export type UpdateMemberParams = z.infer<typeof schemas.updateMemberSchema>;
export type ResetMemberPasswordParams = z.infer<typeof schemas.resetMemberPasswordSchema>;
export type DeleteMemberParams = z.infer<typeof schemas.deleteMemberSchema>;
export type GetMemberListParams = z.infer<typeof schemas.getMemberListSchema>;
export type GetMemberGroupListParams = z.infer<typeof schemas.getMemberGroupListSchema>;
