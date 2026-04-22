import * as path from 'node:path';
import { ChildProcess, fork } from 'node:child_process';
import { store } from '../store';
import { browsersKill, ensureBrowserPath, initSqlite3, isRunning, logError, logInfo, logSuccess, logWarning, readPidFile, removePidFile, sleepTime, toTerminalLink, writePidFile } from '../tools';

type ForkOptionsWithWindowsHide = Parameters<typeof fork>[2] & {
    windowsHide?: boolean;
};

const getEnv = (): Record<string, string | boolean | undefined> => {
    const env: Record<string, string | boolean | undefined> = {
        ...process.env, // 系统的环境变量信息
        API_KEY: store.getStoreValue('apiKey'),
        IS_CLOUD_BROWSER: true,                         // 云浏览器场景预留标识
    };
    if (store.getStoreValue('baseUrl')) {
        env.BASE_URL = store.getStoreValue('baseUrl');
    }
    if (store.getStoreValue('nodeEnv')) {
        env.NODE_ENV = store.getStoreValue('nodeEnv');
    }
    return env;
};
export const startChild = (type?: string) => {
    let timer: NodeJS.Timeout | undefined;
    let child: ChildProcess | null = null;
    /** Windows glue 内 fork 出的真实 worker PID，用于超时/restart/stop 与 pid 文件 */
    let workerPid: number | null = null;
    /** Windows：API 成功后断开 IPC 时 glue 会 exit(0)，避免误触发自动重启 */
    let ipcClosedAfterSuccessWin = false;
    return new Promise<void>(async (resolve, reject) => {
        initSqlite3();
        const processInstance = readPidFile();
        if (processInstance && processInstance.pid) {
            const isRun = await isRunning(processInstance.pid);
            removePidFile();
            if (isRun) {
                process.kill(Number(processInstance.pid), 'SIGKILL');
                await sleepTime(1000);
            }
        }
        const env = Object.fromEntries(
            Object.entries(getEnv()).map(([key, value]) => [key, value == null ? value : String(value)])
        ) as NodeJS.ProcessEnv;
        try {
            const mainJs = path.join(__dirname, '../cwd/lib', 'main.min.js');
            const forkEnv: NodeJS.ProcessEnv = { ...env };
            const useWinGlue = process.platform === 'win32';
            if (useWinGlue) {
                forkEnv.ADSPOWER_MAIN_JS = mainJs;
            }
            const forkOptions: ForkOptionsWithWindowsHide = {
                env: forkEnv,
                detached: useWinGlue ? false : true,
                windowsHide: true, // 隐藏子进程的控制台窗口
                stdio: ['ignore', 'ignore', 'ignore', 'ipc'],
                execArgv: [],
            };
            child = useWinGlue
                ? fork(path.join(__dirname, 'win-child-glue.cjs'), [], forkOptions)
                : fork(mainJs, [], forkOptions);
            ensureBrowserPath();
            store.setStoreValue('status', 'starting');
            logSuccess(`[i] Adspower program is starting...`);
            if (!useWinGlue) {
                store.setStoreValue('pid', child?.pid?.toString() || '');
            }
            let isAppPortOk = false;
            writePidFile(store.getAllStoreValue());
            child.on('message', async (msg) => {
                const text = String(msg);
                if (text.indexOf('ADSPOWER_WORKER_PID_$$_') === 0) {
                    const wpid = text.replace('ADSPOWER_WORKER_PID_$$_', '').trim();
                    workerPid = Number(wpid) || null;
                    store.setStoreValue('pid', wpid);
                    writePidFile(store.getAllStoreValue());
                }
                if (text.indexOf('ADSPOWER_GLUE_ERROR_$$_') === 0) {
                    logError(`[!] Node启动失败: ${text.replace('ADSPOWER_GLUE_ERROR_$$_', '')}`);
                }
                if (text.indexOf('SERVER_PORT_$$_') === 0 && !isAppPortOk) {
                    const port = text.replace('SERVER_PORT_$$_', '').trim();
                    store.setStoreValue('appPort', port);
                    isAppPortOk = true;
                }
                if (text.indexOf('START_API_SERVER_SUCCESS_$$_') === 0) {
                    const port = text.replace('START_API_SERVER_SUCCESS_$$_', '').trim();
                    store.setStoreValue('apiPort', port);
                    const localUrl = `http://local.adspower.net:${port}`;
                    logSuccess(`Server running at:`);
                    logSuccess(` - local: ${toTerminalLink(localUrl)}`);
                    writePidFile(store.getAllStoreValue());
                    if (child) {
                        if (useWinGlue) {
                            ipcClosedAfterSuccessWin = true;
                        }
                        child.disconnect();
                        child.unref();
                    }
                }
                if (text.includes('CACHE_FOLDER_$$_')) {
                    const cacheFolder = text.replace('CACHE_FOLDER_$$_', '').trim();
                    logSuccess(`[i] Cache folder: ${cacheFolder}`);
                }
                if (text.indexOf('START_API_SERVER_FAIL_$$_') === 0) {
                    const serverMsg = text.replace('START_API_SERVER_FAIL_$$_', '').split('_').filter(Boolean);
                    if (serverMsg[0]) {
                        logError(`ERROR - ${serverMsg[0]}`);
                    }
                    if (serverMsg[1]) {
                        logError(`ERROR - ${serverMsg[1]}`);
                    }
                    process.exit(0);
                }
                if (text === 'start') {
                    clearTimeout(timer);
                    resolve();
                    store.setStoreValue('status', 'doing');
                    writePidFile(store.getAllStoreValue());
                }
                if (text === 'restart') {
                    if (workerPid != null) {
                        try {
                            process.kill(workerPid, 'SIGKILL');
                        } catch {
                            //
                        }
                    }
                    child && child.kill('SIGKILL');
                    store.setStoreValue('status', 'restarting');
                    startChild('2').catch(() => {
                        //
                    });
                }
                if (text.indexOf('INTRANET_$$_') > -1) {
                    const arr = text.split('_$$_');
                    if (arr && arr[1]) {
                        store.setStoreValue('intranet', arr[1]);
                    }
                }
                if (text === 'browser-kill') {
                    // 强制kill掉浏览器进程
                    await browsersKill();
                }
                if (text.indexOf('RPA_PROCESS_PID_') > -1) {
                    const rpaPid = text.replace('RPA_PROCESS_PID_', '');
                    store.setStoreValue('rpaPid', rpaPid);
                }
                if (text.indexOf('RPA_PLUS_PROCESS_PID_') > -1) {
                    const rpaPlusPid = text.replace('RPA_PLUS_PROCESS_PID_', '');
                    store.setStoreValue('rpaPlusPid', rpaPlusPid);
                }
                if (text.indexOf('AI_PROCESS_PID_') > -1) {
                    const aiPid = text.replace('AI_PROCESS_PID_', '');
                    store.setStoreValue('aiPid', aiPid);
                }
            });
            child.on('error', (err) => {
                logError(`[!] Node启动失败: ${err.message}`);
                store.setStoreValue('status', 'stop');
                store.clear();
                removePidFile();
                process.exit(0);
            });
            child.on('exit', async (code, signal) => {
                if (signal === 'SIGKILL') {
                    await browsersKill();
                    store.clear();
                    removePidFile();
                } else if (useWinGlue && ipcClosedAfterSuccessWin && code === 0) {
                    // glue 在 API 成功后随 IPC 断开正常退出，worker 仍为 detached 存活
                } else {
                    // node异常退出的时候重启
                    child = null;
                    await sleepTime(500);
                    startChild('2').then(() => {
                    }).catch(() => {
                        logError('[!] Restart failed');
                    });
                }
            });
            // 启动超时
            timer = setTimeout(() => {
                if (workerPid != null) {
                    try {
                        process.kill(workerPid, 'SIGKILL');
                    } catch {
                        //
                    }
                }
                child && child.kill('SIGKILL');
                child = null;
                store.setStoreValue('status', 'stop');
                logError('[!] Start Timeout');
                reject('Start Timeout');
            }, 30 * 1000);
        } catch (error) {
            clearTimeout(timer);
            reject(error);
            child = null;
            store.clear();
            logError(`[!] Node启动失败: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
        }
    });
};

export const stopChild = async () => {
    const processInstance = readPidFile();
    if (processInstance.pid) {
        const isRun = await isRunning(processInstance.pid);
        try {
            process.kill(Number(processInstance.pid), 'SIGKILL');
            removePidFile();
        } catch (error) {
            try {
                await sleepTime(2000);
                process.kill(Number(processInstance.pid), 'SIGKILL');
                removePidFile();
            } catch (error) {
                logError(`[!] Stop child fail: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
                if (isRun) {
                    logWarning(`[!] Please manually close the browser process: ${processInstance.pid}`);
                }
                return;
            }
        }
        logSuccess('[i] Adspower program is stopped');
    } else {
        logInfo('[i] No running adspower program');
    }
}

export const restartChild = async () => {
    const processInstance = readPidFile();
    if (processInstance.pid) {
        const apiKey = processInstance.apiKey;
        const baseUrl = processInstance.baseUrl;
        const nodeEnv = processInstance.nodeEnv;
        await stopChild();
        await sleepTime(1000);
        store.setStoreValue('apiKey', apiKey);
        store.setStoreValue('baseUrl', baseUrl);
        store.setStoreValue('nodeEnv', nodeEnv);
        await startChild().then(() => {
            logSuccess('[i] Adspower program is restarted');
        }).catch((error) => {
            logError(`[!] Restart failed: ${error.message}`);
        });
    } else {
        logInfo('[i] No running adspower program');
    }
}

export const getChildStatus = async () => {
    const processInstance = readPidFile();
    if (processInstance.pid) {
        const isRun = await isRunning(processInstance.pid);
        if (!isRun) {
            removePidFile();
            logInfo('[i] Adspower program is not running');
            return;
        }
        const status = processInstance.status;
        if (status === 'starting') {
            logSuccess('[i] Adspower program is starting...');
        } else if (status === 'doing' && processInstance.apiPort) {
            logSuccess('[i] Adspower program is running at:');
            logSuccess(` - http://local.adspower.net:${ processInstance.apiPort }`);
        } else if (status === 'stop') {
            logInfo('[i] Adspower program is stopped');
        } else {
            logInfo('[i] Adspower program is not started');
        }
    } else {
        logInfo('[i] Adspower program is not running');
    }
}