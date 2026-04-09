import * as os from "node:os";
import * as path from "node:path";
import * as fs from "node:fs";
import * as crypto from "node:crypto";
import * as util from "node:util";
import { exec } from "node:child_process";
import { red, green, yellow } from 'colors';
import { ensureDirSync, readJsonSync, outputJsonSync, removeSync, copySync } from "fs-extra2";

export const VERSION = "1.0.0";

export const logError = (message: string) => {
    console.error(red(message));
}

export const logSuccess = (message: string) => {
    console.log(green(message));
}

export const logWarning = (message: string) => {
    console.log(yellow(message));
}

export const logInfo = (message: string) => {
    console.log(message);
}
export const sleepTime = (time: number) =>
    new Promise<void>((resolve) => {
        setTimeout(() => {
            resolve();
        }, time);
    });

export const browsersKill = async () => {
    await taskKillBrowser();
    await taskKillFlowser();
};

const taskKillBrowser = () =>
    new Promise<void>((resolve) => {
        const cmd = ["linux", "darwin"].includes(process.platform) ? 'pkill -u `whoami` -f "SunBrowser"' : "taskkill -PID SunBrowser.exe";
        exec(cmd, (err) => {
            if (err) {
                // logError(`[!] Kill SunBrowser进程失败: ${err.message}`);
            }
            resolve();
        });
    });
const taskKillFlowser = () =>
    new Promise<void>((resolve) => {
        const cmd = ["linux", "darwin"].includes(process.platform) ? 'pkill -u `whoami` -f "FlowerBrowser"' : "taskkill -PID FlowerBrowser.exe";
        exec(cmd, (err) => {
            if (err) {
                // logError(`[!] Kill FlowerBrowser进程失败: ${err.message}`);
            }
            resolve();
        });
    });

const getHomedir = () => {
    // 默认设置为`~`，防止Linux在开机启动时Node无法获取homedir
    return (typeof os.homedir == "function" ? os.homedir() : process.env[process.platform == "win32" ? "USERPROFILE" : "HOME"]) || "~";
};

const getPidFileDir = () => {
    const dir = path.join(getHomedir(), ".adspowerCli");
    if (!fs.existsSync(dir)) {
        ensureDirSync(dir);
    }
    return dir;
};

const pidFileName = () => {
    const md5 = crypto.createHash("md5").update(VERSION).digest("hex");
    return md5;
};

export const writePidFile = (config: any) => {
    const filePath = path.join(getPidFileDir(), pidFileName());
    outputJsonSync(filePath, config || {});
};

export const readPidFile = () => {
    const filePath = path.join(getPidFileDir(), pidFileName());
    if (fs.existsSync(filePath)) {
        return readJsonSync(filePath);
    }
    return {};
};

export const removePidFile = () => {
    const filePath = path.join(getPidFileDir(), pidFileName());
    if (fs.existsSync(filePath)) {
        removeSync(filePath);
    }
}

export const isRunning = (pid: string) => {
    return new Promise<boolean>((resolve) => {
        if (pid) {
            exec(util.format(process.platform === 'win32' ? 
                'tasklist /fi "PID eq %s" | findstr /i "node.exe"'
                : 'ps -f -p %s | grep "node"', pid), 
                function (err, stdout, stderr) {
                    resolve(!err && !!stdout.toString().trim());
                });
        } else {
            resolve(false);
        }
    });
}

export const ensureBrowserPath = () => {
    const dir = path.join(__dirname, '../cwd/source', '.browser');
    if (!fs.existsSync(dir)) {
        ensureDirSync(dir);
    }
}

export const getApiKeyAndPort = (options: any) => {
    const apiKey = options.apiKey;
    const port = options.port;
    if (apiKey && port) {
        return {
            apiKey,
            port
        };
    }
    const result = {
        apiKey: apiKey,
        port: port,
    };
    const processInstance = readPidFile();
    if (!apiKey) {
        if (processInstance.apiKey) {
            result.apiKey = processInstance.apiKey;
        } else if (process.env.ADS_API_KEY) {
            result.apiKey = process.env.ADS_API_KEY;
        }
    }
    if (!port && processInstance.apiPort) {
        result.port = processInstance.apiPort;
    }
    return result;
}

export const hasRunning = async (options: any) => {
    const { apiKey, port } = options;
    if (apiKey && port) {
        return true;
    }
    const processInstance = readPidFile();
    if (processInstance.pid) {
        return await isRunning(processInstance.pid);
    }
    return false;
}

const loadingFramesList = {
    default: ['|', '/', '-', '\\'],
    frames: ['▖', '▗', '▘', '▙', '▚', '▛', '▜', '▝', '▞', '▟'],
    dotFrames: ['⡀', '⡄', '⡆', '⡇', '⡏', '⡟', '⡿', '⣿', '⣷', '⣶', '⣦', '⣤', '⣠', '⢀'],
};
export const createLoading = (text: string) => {
    if (!process.stdout.isTTY) {
        return {
            stop() {
                //
            }
        };
    }

    let index = 0;
    const frames = loadingFramesList.default;
    process.stdout.write(`${frames[index]} ${text}`);
    const timer = setInterval(() => {
        index = (index + 1) % frames.length;
        process.stdout.write(`\r${frames[index]} ${text}`);
    }, 120);

    return {
        stop() {
            clearInterval(timer);
            process.stdout.write(`\r${' '.repeat(text.length + 2)}\r`);
        }
    };
};

export const initSqlite3 = () => {
    const sqliteFile = path.join(__dirname, '../cwd/lib', 'node_sqlite3.node');
    if (fs.existsSync(sqliteFile)) {
        return;
    }
    const isMac = process.platform === 'darwin';
    const isLinux = process.platform === 'linux';
    const is32 = process.arch === 'ia32';
    const isArm = process.arch === 'arm64';
    const isX64 = process.arch === 'x64';
    const macFolder = isArm ? 'arm64' : 'mac';
    const winFolder = is32 ? 'ia32' : 'x64';
    const linuxFolder = isLinux && isX64 && 'linux';
    const sqliteFolder = isMac ? macFolder : (isLinux ? linuxFolder : winFolder);
    const dir = path.join(__dirname, `../sqlite/${sqliteFolder}`);
    if (!fs.existsSync(dir)) {
        throw new Error(`SQLite folder not found: ${dir}`);
    } else {
        const sqliteFile = path.join(dir, 'node_sqlite3.node');
        const cwdPath = path.join(__dirname, '../cwd/lib');
        // 将sqliteFile复制到cwdPath
        copySync(sqliteFile, path.join(cwdPath, 'node_sqlite3.node'));
        logSuccess(`[i] SQLite file initialized successfully!`);
    }
}


const renderKernelProgress = (result: any) => {
    const status = result.status || 'pending';
    const progress = ['completed', 'installing'].includes(status) ? 100 : Math.max(0, Math.min(100, Number(result.progress) || 0));

    if (!process.stdout.isTTY) {
        logInfo(`Kernel progress: ${progress}% [${status}]`);
        return;
    }

    const width = 30;
    const filled = Math.round((progress / 100) * width);
    const bar = `${'='.repeat(filled)}${'-'.repeat(width - filled)}`;
    process.stdout.write(`\r[${bar}] ${progress.toFixed(0).padStart(3, ' ')}% ${status}     `);
};

const finishKernelProgress = () => {
    if (process.stdout.isTTY) {
        process.stdout.write('\n');
    }
};

export const trackKernelDownload = async (fnc: (params: any) => Promise<unknown>, args: Record<string, any>) => {
    while (true) {
        const result = await fnc(args);
        try {
            const resultJson: any = JSON.parse((result as string).replace('Kernel download/update status: ', ''));
            if (resultJson && resultJson.status && ['pending', 'downloading', 'completed', 'installing', 'failed'].includes(resultJson.status)) {
                renderKernelProgress(resultJson);
                if (['completed', 'failed'].includes(resultJson.status)) {
                    finishKernelProgress();
                    return result;
                }
                await sleepTime(3000);
            } else {
                return result;
            }
        } catch (error) {
            return result;
        }
    }
};