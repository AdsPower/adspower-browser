import * as readline from 'node:readline/promises';
import { updateConfig } from "@adspower/local-api-core";
import { green } from "colors";
import { HandlerFn, resolveStatelessCommandArgs, STATELESS_HANDLERS } from "./cli";
import { restartChild } from "./core/start";
import { hasRunning, logError, getApiKeyAndPort, logSuccess, createLoading, logInfo, sleepTime, logWarning } from "./tools";

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

const trackKernelDownload = async (fnc: HandlerFn, args: Record<string, any>) => {
    while (true) {
        const result = await fnc(args);
        try {
            const resultJson: any = JSON.parse((result as string));
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

export const handleAction = async (params: any, options: any, command: any, fnc: HandlerFn) => {
    const isRun = await hasRunning(options);
    if (!isRun) {
        logError('[!] Adspower runtime is not running');
        const info = `[i] Please run "${green("adspower-browser start -k <apiKey>")}" to start the adspower runtime`;
        console.log(info);
        return;
    }
    const { apiKey, port } = getApiKeyAndPort(options);
    updateConfig(apiKey, port);

    const commandName = command.name();
    // Preserve the external Local API contract names before handing params to the core handlers.
    const resolved = resolveStatelessCommandArgs(commandName, params);
    if (!resolved.ok) {
        logError(resolved.error);
        return;
    }
    const args = resolved.args;
    logSuccess(`Executing command: ${commandName}, params: ${JSON.stringify(args)}`);
    const loading = createLoading(`Executing ${commandName}...`);
    try {
        if (commandName === 'download-kernel') {
            loading.stop();
            const result = await trackKernelDownload(fnc, args);
            const out = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
            logInfo(`\n\n${out}\n\n`);
        } else {
            const result = await fnc(args);
            const out = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
            loading.stop();
            logInfo(`\n\n${out}\n`);
            if (commandName === 'update-patch' && !out.includes('The client is already on the latest patch version. No update is required')) {
                await sleepTime(1000 * 60);
                await restartChild();
            }
            return out;
        }
    } catch (error) {
        loading.stop();
        const msg = error instanceof Error ? error.message : JSON.stringify(error);
        logError(`\n${msg}\n`);
        await handleError(msg, commandName, params);
    } finally {
        loading.stop();
    }
};

const handleError = async (msg: string, commandName: string, params: any) => {
    if (commandName === 'open-browser') {
        if (msg.includes('ready,please to download!')) {
            const reg = /(SunBrowser|FlowerBrowser) (\d+) is not ready,please to download!/;
            const match = msg.match(reg);
            if (match) {
                const kernelType = match[1] === 'FlowerBrowser' ? 'Firefox' : 'Chrome';
                const kernelVersion = match[2];
                if (kernelType && kernelVersion) {
                    //问答模式的命令执行，询问用户是否需要下载内核，用户输入 y 或 n 后，执行 download-kernel 命令
                    const answer = await promptYesNo(`[?] Kernel ${match[1]} ${kernelVersion} is not ready. Download now?`);
                    if (answer === 'y') {
                        // 我想要直接执行 ads download-kernel {"kernel_type":"Chrome","kernel_version":"141"} 这个命令
                        const _params = {"kernel_type":kernelType,"kernel_version":kernelVersion};
                        await handleAction(
                            JSON.stringify(_params), 
                            {}, 
                            {name: () => 'download-kernel'}, 
                            STATELESS_HANDLERS['download-kernel'].fn
                        );
                        await sleepTime(1000 * 3);
                        // 再次执行 open-browser 命令
                        await handleAction(
                            params,
                            {}, 
                            {name: () => 'open-browser'}, 
                            STATELESS_HANDLERS['open-browser'].fn
                        );
                    }
                }
            }
        }
    }

    if (commandName === 'close-browser') {
        if (msg.includes('Profile does not exist')) {
            // 如果发现关闭的profile不存在，则询问用户是否需要帮他查出来所有已经打开的环境
            const answer = await promptYesNo(`[?] Profile does not exist. Check all opened profiles?`);
            if (answer === 'y') {
                const result = await handleAction(
                    '{}',
                    {},
                    {name: () => 'get-opened-browser'},
                    STATELESS_HANDLERS['get-opened-browser'].fn
                );
                if (result) {
                    const jsonStr = result.replace(/^Opened browser list:\s*/, '');
                    try {
                        const list = JSON.parse(jsonStr) as Array<{ user_id: string }>;
                        const userIds = list.map((item) => item.user_id);
                        if (userIds.length === 1) {
                            // 如果只有一个已经打开的环境，则询问是否要帮他直接关闭
                            const answer = await promptYesNo(`[?] Only one opened profile. Close it now?`);
                            if (answer === 'y') {
                                await handleAction(
                                    `{"profile_id":["${userIds[0]}"]}`,
                                    {},
                                    {name: () => 'close-browser'},
                                    STATELESS_HANDLERS['close-browser'].fn
                                );
                            }
                        } else if (userIds.length > 1) {
                            // 如果是多个浏览器的话，就直接输入可以关闭的浏览器id
                            logWarning(`[!] Closeable profiles: ${userIds.join(', ')}`);
                            // 如果你要关闭所有的浏览器,可以使用 "ads close-all-profiles" 这个命令
                            logWarning(`[!] If you want to close all profiles, please enter "ads close-all-profiles"`);
                        }
                    } catch (error) {
                        
                    }
                }
            }
        }
    }
};

export async function promptYesNo(question: string): Promise<'y' | 'n' | null> {
    if (!process.stdin.isTTY || !process.stdout.isTTY) {
        logWarning('[!] Interactive prompt is unavailable in non-interactive mode.');
        return null;
    }

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    try {
        while (true) {
            const answer = (await rl.question(`${question} [y/N]: `)).trim().toLowerCase();
            if (answer === 'y' || answer === 'yes') {
                return 'y';
            }
            if (answer === 'n' || answer === 'no' || answer === '') {
                return 'n';
            }
            logWarning('[!] Please enter y or n.');
        }
    } finally {
        rl.close();
    }
}