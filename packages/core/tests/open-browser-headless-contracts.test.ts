import { describe, expect, it } from 'vitest';
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
