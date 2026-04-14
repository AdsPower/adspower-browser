import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as apiModule from '../src/constants/api.js';
import { browserHandlers } from '../src/handlers/browser.js';
import { resolveOpenBrowserHeadless } from '../src/utils/openBrowserHeadless.js';

describe('resolveOpenBrowserHeadless', () => {
    it('Linux 且无 DISPLAY/WAYLAND 且未传 headless → headless=1 且 marked auto', () => {
        const env = { ...process.env, CI: undefined, DISPLAY: '', WAYLAND_DISPLAY: '' };
        const r = resolveOpenBrowserHeadless({ profile_id: 'x' }, env, 'linux');
        expect(r.params.headless).toBe('1');
        expect(r.didAutoSetHeadless).toBe(true);
    });

    it('显式 headless=0 → 不修改且不标记 auto', () => {
        const r = resolveOpenBrowserHeadless(
            { profile_id: 'x', headless: '0' },
            {},
            'linux'
        );
        expect(r.params.headless).toBe('0');
        expect(r.didAutoSetHeadless).toBe(false);
    });

    it('CI=true 且未传 headless → headless=1', () => {
        const r = resolveOpenBrowserHeadless({ profile_id: 'x' }, { CI: 'true' }, 'darwin');
        expect(r.params.headless).toBe('1');
        expect(r.didAutoSetHeadless).toBe(true);
    });

    it('macOS 有 DISPLAY 类无关变量、无 CI、未传 headless → 不写入 headless', () => {
        const r = resolveOpenBrowserHeadless({ profile_id: 'x' }, {}, 'darwin');
        expect(r.params.headless).toBeUndefined();
        expect(r.didAutoSetHeadless).toBe(false);
    });
});

describe('browserHandlers.openBrowser headless integration', () => {
    const origEnv = process.env;

    beforeEach(() => {
        vi.restoreAllMocks();
    });

    afterEach(() => {
        process.env = origEnv;
    });

    it('omitted headless on linux headless env → POST body includes headless 1', async () => {
        const post = vi.fn().mockResolvedValue({
            data: { code: 0, msg: 'success', data: { ws: { puppeteer: 'ws://x' } } },
        });
        vi.spyOn(apiModule, 'getApiClient').mockReturnValue({ post } as any);
        vi.spyOn(process, 'platform', 'get').mockReturnValue('linux');
        process.env = { ...origEnv, DISPLAY: '', WAYLAND_DISPLAY: '', CI: '' };

        await browserHandlers.openBrowser({ profile_id: 'p1' });

        expect(post).toHaveBeenCalled();
        const body = post.mock.calls[0][1];
        expect(body.headless).toBe('1');
    });

    it('explicit headless=0 → POST body keeps 0', async () => {
        const post = vi.fn().mockResolvedValue({
            data: { code: 0, msg: 'success', data: { ws: { puppeteer: 'ws://x' } } },
        });
        vi.spyOn(apiModule, 'getApiClient').mockReturnValue({ post } as any);
        vi.spyOn(process, 'platform', 'get').mockReturnValue('linux');
        process.env = { ...origEnv, DISPLAY: '', WAYLAND_DISPLAY: '', CI: '' };

        await browserHandlers.openBrowser({ profile_id: 'p1', headless: '0' });

        const body = post.mock.calls[0][1];
        expect(body.headless).toBe('0');
    });

    it('auto headless success response includes bilingual note', async () => {
        const post = vi.fn().mockResolvedValue({
            data: { code: 0, msg: 'success', data: { ws: { puppeteer: 'ws://x' } } },
        });
        vi.spyOn(apiModule, 'getApiClient').mockReturnValue({ post } as any);
        vi.spyOn(process, 'platform', 'get').mockReturnValue('linux');
        process.env = { ...origEnv, DISPLAY: '', WAYLAND_DISPLAY: '', CI: '' };

        const out = await browserHandlers.openBrowser({ profile_id: 'p1' });
        expect(out).toContain('自动使用 headless=1');
        expect(out).toContain('Auto-set headless=1');
    });
});
