import { RPA_LOCAL_HANDLERS } from './rpa/local';
import { RPA_REMOTE_HANDLERS } from './rpa/remote';

export const RPA_HANDLERS = { ...RPA_LOCAL_HANDLERS, ...RPA_REMOTE_HANDLERS };
