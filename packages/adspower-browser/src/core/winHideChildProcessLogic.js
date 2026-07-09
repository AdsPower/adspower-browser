'use strict';

const path = require('node:path');

/** 控制台工具：spawn/exec 时应隐藏 cmd 窗口，避免屏幕闪烁 */
const CONSOLE_EXECUTABLES = /^(cmd|powershell|pwsh|wmic|tasklist|reg|findstr|where|whoami|systeminfo|netstat|sc|net|chcp|hostname|conhost)(\.exe)?$/i;

/** 浏览器/GUI 程序：spawn 时不能加 windowsHide，否则部分 Windows 环境会导致窗口无法显示 */
const BROWSER_EXECUTABLES = /^(sunbrowser|flowerbrowser|chrome|chromium|msedge|firefox|brave|opera)(\.exe)?$/i;

/**
 * 从 spawn/exec 的命令字符串中提取可执行文件名（小写）。
 * 支持带空格的路径，如 "C:\Program Files\SunBrowser.exe"。
 */
function getExecutableBaseName(command) {
    const trimmed = String(command).trim();
    let executable = trimmed;

    // 优先解析引号包裹的完整路径
    const quotedMatch = trimmed.match(/^"([^"]+)"|^'([^']+)'/);
    if (quotedMatch) {
        executable = quotedMatch[1] || quotedMatch[2];
    } else {
        executable = trimmed.split(/\s+/)[0] || trimmed;
    }

    executable = executable.replace(/^["']|["']$/g, '');
    // 统一反斜杠，确保在非 Windows 环境（如 CI）也能正确解析 Windows 路径
    return path.basename(executable.replace(/\\/g, '/')).toLowerCase();
}

/**
 * 判断 spawn 调用是否应设置 windowsHide。
 */
function shouldHideForSpawn(command, options) {
    // 调用方显式要求显示窗口时，不做处理
    if (options?.windowsHide === false) {
        return false;
    }

    const base = getExecutableBaseName(command);
    if (BROWSER_EXECUTABLES.test(base)) {
        return false;
    }
    if (CONSOLE_EXECUTABLES.test(base)) {
        return true;
    }
    // 通过 shell 启动的命令会创建 cmd 窗口
    if (options?.shell) {
        return true;
    }
    if (/\.(cmd|bat)$/i.test(base)) {
        return true;
    }

    // 未知 exe 默认不强制 hide，避免误伤 GUI 程序
    return false;
}

/**
 * exec/execSync 始终走 shell（cmd），统一隐藏窗口。
 * 除非调用方显式传入 windowsHide: false。
 */
function withWindowsHideForExec(options) {
    if (typeof options === 'object' && options !== null && !Array.isArray(options)) {
        if (options.windowsHide === false) {
            return options;
        }
        return { ...options, windowsHide: true };
    }
    return { windowsHide: true };
}

/**
 * 按进程类型决定是否给 spawn 选项加上 windowsHide。
 */
function withWindowsHideForSpawn(command, options) {
    const opts = typeof options === 'object' && options !== null && !Array.isArray(options)
        ? { ...options }
        : {};
    if (!shouldHideForSpawn(command, opts)) {
        return opts;
    }
    return { ...opts, windowsHide: true };
}

module.exports = {
    CONSOLE_EXECUTABLES,
    BROWSER_EXECUTABLES,
    getExecutableBaseName,
    shouldHideForSpawn,
    withWindowsHideForExec,
    withWindowsHideForSpawn,
};
