'use strict';

/**
 * Preload for the forked AdsPower runtime (main.min.js) on Windows.
 * Patches child_process before main.min.js loads so exec/spawn calls
 * (wmic, tasklist, reg query, etc.) do not flash visible cmd.exe windows.
 */
if (process.platform !== 'win32') {
    return;
}

const cp = require('node:child_process');

function withWindowsHide(options) {
    if (typeof options === 'object' && options !== null && !Array.isArray(options)) {
        if (options.windowsHide === false) {
            return options;
        }
        return { ...options, windowsHide: true };
    }
    return { windowsHide: true };
}

function normalizeExecArgs(options, callback) {
    if (typeof options === 'function') {
        return { options: { windowsHide: true }, callback: options };
    }
    return { options: withWindowsHide(options || {}), callback };
}

function normalizeSpawnArgs(args, options) {
    if (Array.isArray(args)) {
        return { args, options: withWindowsHide(options || {}) };
    }
    return { args: [], options: withWindowsHide(args || {}) };
}

const origExec = cp.exec.bind(cp);
cp.exec = function exec(cmd, options, callback) {
    const { options: opts, callback: cb } = normalizeExecArgs(options, callback);
    return origExec(cmd, opts, cb);
};

const origExecSync = cp.execSync.bind(cp);
cp.execSync = function execSync(cmd, options) {
    return origExecSync(cmd, withWindowsHide(options || {}));
};

const origSpawn = cp.spawn.bind(cp);
cp.spawn = function spawn(command, args, options) {
    const normalized = normalizeSpawnArgs(args, options);
    return origSpawn(command, normalized.args, normalized.options);
};

const origSpawnSync = cp.spawnSync.bind(cp);
cp.spawnSync = function spawnSync(command, args, options) {
    const normalized = normalizeSpawnArgs(args, options);
    return origSpawnSync(command, normalized.args, normalized.options);
};
