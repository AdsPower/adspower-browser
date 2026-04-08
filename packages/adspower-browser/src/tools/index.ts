import * as os from "node:os";
import * as path from "node:path";
import * as fs from "node:fs";
import * as crypto from "node:crypto";
import * as util from "node:util";
import { exec } from "node:child_process";
import { red, green, yellow } from 'colors';
import { ensureDirSync, readJsonSync, outputJsonSync, removeSync } from "fs-extra2";

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

// export const initDefaultArgs = (argv: string[]) => {
//     const nextArgv = [...argv];
//     const command = nextArgv[2];
//     const commandsRequireApiKey = ['get-browser-list'];
    
//     const hasApiKey = nextArgv.includes('--api-key');
//     const hasPort = nextArgv.includes('--port');

//     if (!command || !commandsRequireApiKey.includes(command)) {
//         return nextArgv;
//     }
//     if (hasApiKey && hasPort) {
//         return normalizeArgv(nextArgv);
//     }
//     const processInstance = readPidFile();

//     if (!hasApiKey && processInstance.apiKey) {
//         nextArgv.splice(3, 0, '--api-key', processInstance.apiKey);
//     }

//     if (!hasPort && processInstance.apiPort) {
//         nextArgv.splice(3, 0, '--port', processInstance.apiPort);
//     }
//     console.log('===> nextArgv: ', nextArgv);
//     return normalizeArgv(nextArgv);
// }

// const normalizeArgv = (argv: string[]) => {
//     // 将argv中的--api-key=value和--port=value转换为--api-key value和--port value的形式
//     const nextArgv = [...argv];
//     for (let i = 0; i < nextArgv.length; i++) {
//         if (nextArgv[i].startsWith('--api-key=')) {
//             // ["--api-key=value"]换成["--api-key", "value"]
//             const value = nextArgv[i].split('=')[1];
//             // 先去掉["--api-key=value"]，在最末位插入["--api-key", "value"]
//             nextArgv.splice(i, 1, '--api-key', value);
//             nextArgv.push('--api-key', value);
//         }
//         if (nextArgv[i].startsWith('--port=')) {
//             const value = nextArgv[i].split('=')[1];
//             nextArgv.splice(i, 1, '--port', value);
//             nextArgv.push('--port', value);
//         }
//     }
//     return nextArgv;
// }

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
    if (!apiKey && processInstance.apiKey) {
        result.apiKey = processInstance.apiKey;
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