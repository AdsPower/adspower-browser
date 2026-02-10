import { z } from 'zod';
import { schemas } from './schemas.js';

export type CreateProxyParams = z.infer<typeof schemas.createProxySchema>;
export type UpdateProxyParams = z.infer<typeof schemas.updateProxySchema>;
export type GetProxyListParams = z.infer<typeof schemas.getProxyListSchema>;
export type DeleteProxyParams = z.infer<typeof schemas.deleteProxySchema>;
