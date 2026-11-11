import { CONFIG } from '../../constants/config.js';

export function getRpaApiBase(): string {
    const { rpaPort } = CONFIG;
    if (!rpaPort || !/^\d+$/.test(rpaPort) || Number(rpaPort) < 1 || Number(rpaPort) > 65535) {
        throw new Error('Please specify a valid RPA Plus port (1-65535) using -rp or --rpa-port');
    }
    return `http://127.0.0.1:${rpaPort}`;
}
