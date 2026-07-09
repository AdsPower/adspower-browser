import { describe, expect, it } from 'vitest';
// @ts-expect-error plain JS module
import { getExecutableBaseName, shouldHideForSpawn, withWindowsHideForExec, withWindowsHideForSpawn } from '../src/core/winHideChildProcessLogic.js';

describe('winHideChildProcessLogic', () => {
    it('always hides exec shell windows unless explicitly disabled', () => {
        expect(withWindowsHideForExec({})).toEqual({ windowsHide: true });
        expect(withWindowsHideForExec({ cwd: 'C:\\Windows\\System32' })).toEqual({
            cwd: 'C:\\Windows\\System32',
            windowsHide: true,
        });
        expect(withWindowsHideForExec({ windowsHide: false })).toEqual({ windowsHide: false });
    });

    it('hides spawn for console utilities', () => {
        expect(shouldHideForSpawn('wmic', {})).toBe(true);
        expect(shouldHideForSpawn('C:\\Windows\\System32\\tasklist.exe', {})).toBe(true);
        expect(shouldHideForSpawn('reg', {})).toBe(true);
        expect(withWindowsHideForSpawn('cmd', [' /c', 'echo hi'], {})).toEqual({ windowsHide: true });
    });

    it('does not hide spawn for browser executables', () => {
        expect(shouldHideForSpawn('C:\\AdsPower\\SunBrowser.exe', {})).toBe(false);
        expect(shouldHideForSpawn('"D:\\FlowerBrowser\\FlowerBrowser.exe"', {})).toBe(false);
        expect(withWindowsHideForSpawn('C:\\AdsPower\\SunBrowser.exe', { env: { FOO: '1' } })).toEqual({
            env: { FOO: '1' },
        });
    });

    it('does not hide unknown GUI executables by default', () => {
        expect(shouldHideForSpawn('C:\\Apps\\SomeTool.exe', {})).toBe(false);
    });

    it('parses executable basename from quoted paths', () => {
        expect(getExecutableBaseName('"C:\\Program Files\\SunBrowser.exe"')).toBe('sunbrowser.exe');
        expect(getExecutableBaseName('C:\\Windows\\System32\\wmic.exe')).toBe('wmic.exe');
    });
});
