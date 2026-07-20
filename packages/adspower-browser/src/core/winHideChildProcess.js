'use strict';

/**
 * Windows 专用 preload，在 fork 出的 AdsPower 运行时（main.min.js）加载前注入。
 * 拦截 child_process，防止 wmic / tasklist / reg query 等命令弹出 cmd 窗口：
 * - exec / execSync：始终隐藏 cmd 窗口
 * - spawn / spawnSync：仅对控制台工具隐藏，浏览器 exe 不隐藏
 */
if (process.platform !== 'win32') {
    return;
}

const cp = require('node:child_process');
const { withWindowsHideForExec, withWindowsHideForSpawn } = require('./winHideChildProcessLogic');

/** 规范化 exec 的参数签名（options 与 callback 位置可能互换） */
function normalizeExecArgs(options, callback) {
    if (typeof options === 'function') {
        return { options: withWindowsHideForExec({}), callback: options };
    }
    return { options: withWindowsHideForExec(options || {}), callback };
}

/** 规范化 spawn 的参数签名（args 与 options 位置可能互换） */
function normalizeSpawnArgs(command, args, options) {
    if (Array.isArray(args)) {
        return { args, options: withWindowsHideForSpawn(command, options || {}) };
    }
    return { args: [], options: withWindowsHideForSpawn(command, args || {}) };
}

const origExec = cp.exec.bind(cp);
cp.exec = function exec(cmd, options, callback) {
    const { options: opts, callback: cb } = normalizeExecArgs(options, callback);
    return origExec(cmd, opts, cb);
};

const origExecSync = cp.execSync.bind(cp);
cp.execSync = function execSync(cmd, options) {
    return origExecSync(cmd, withWindowsHideForExec(options || {}));
};

const origSpawn = cp.spawn.bind(cp);
cp.spawn = function spawn(command, args, options) {
    const normalized = normalizeSpawnArgs(command, args, options);
    return origSpawn(command, normalized.args, normalized.options);
};

const origSpawnSync = cp.spawnSync.bind(cp);
cp.spawnSync = function spawnSync(command, args, options) {
    const normalized = normalizeSpawnArgs(command, args, options);
    return origSpawnSync(command, normalized.args, normalized.options);
};
