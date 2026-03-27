import { z } from 'zod';
import { schemas } from './schemas.js';

export type UpdatePatchParams = z.infer<typeof schemas.updatePatchSchema>;

