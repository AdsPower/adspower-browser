import { z } from 'zod';
import { schemas } from './schemas.js';

export type DownloadKernelParams = z.infer<typeof schemas.downloadKernelSchema>;

