import type { OpenBrowserParams } from '../types/browser.js';

export type ResolveOpenBrowserHeadlessResult = {
    params: OpenBrowserParams;
    didAutoSetHeadless: boolean;
};

function isTruthyCi(env: NodeJS.ProcessEnv): boolean {
    const v = env.CI;
    return v === 'true' || v === '1' || v === 'True';
}

function linuxLooksHeadless(env: NodeJS.ProcessEnv): boolean {
    const d = (env.DISPLAY ?? '').trim();
    const w = (env.WAYLAND_DISPLAY ?? '').trim();
    return d === '' && w === '';
}

/**
 * 当且仅当 params 未显式携带 headless 时，按运行环境推断是否应使用 headless。
 * 显式 headless 永远保留用户值（见设计 spec）。
 */
export function resolveOpenBrowserHeadless(
    params: OpenBrowserParams,
    env: NodeJS.ProcessEnv,
    platform: NodeJS.Platform
): ResolveOpenBrowserHeadlessResult {
    if (params.headless !== undefined) {
        return { params: { ...params }, didAutoSetHeadless: false };
    }

    let needHeadless = false;
    if (isTruthyCi(env)) {
        needHeadless = true;
    } else if (platform === 'linux' && linuxLooksHeadless(env)) {
        needHeadless = true;
    }

    if (!needHeadless) {
        return { params: { ...params }, didAutoSetHeadless: false };
    }

    return {
        params: { ...params, headless: '1' },
        didAutoSetHeadless: true,
    };
}
