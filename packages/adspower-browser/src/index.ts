#!/usr/bin/env node
import { Command, Option } from "commander";
import { store } from "./store";
import { getChildStatus, restartChild, startChild, stopChild } from "./core/start";
import { createLoading, getApiKeyAndPort, hasRunning, logError, logInfo, logSuccess, sleepTime, trackKernelDownload, VERSION } from "./tools";
import { green } from 'colors';
import { updateConfig } from '@adspower/local-api-core';
import { resolveStatelessCommandArgs, STATELESS_HANDLERS } from "./cli";
import { resolveStartApiKey } from "./startConfig";

const program = new Command();
program.name("adspower-browser").description("CLI and runtime for adspower-browser").version(VERSION);

// 设置API Key
program.command("start")
    .description("Start the adspower runtime")
    .option("-k, --api-key <apiKey>", "Set the API key for the adspower runtime")
    .addOption(new Option("--base-url <baseUrl>", "Set the base URL for the adspower runtime").hideHelp())
    .addOption(new Option("--node-env <nodeEnv>", "Set the node environment for the adspower runtime").hideHelp())
    .action(async (options) => {
        const resolvedApiKey = resolveStartApiKey(options.apiKey, process.env);
        if (!resolvedApiKey.ok) {
            logError(resolvedApiKey.error);
            process.exit(1);
        }
        store.setStoreValue('apiKey', resolvedApiKey.apiKey);
        if (options.baseUrl) {
            store.setStoreValue('baseUrl', options.baseUrl);
        }
        if (options.nodeEnv) {
            store.setStoreValue('nodeEnv', options.nodeEnv);
        }
        await startChild();
    });

program.command("stop")
    .description("Stop the adspower runtime")
    .action(async () => {
        await stopChild();
    });

program.command("restart")
    .description("Restart the adspower runtime")
    .action(async () => {
        await restartChild();
    });

program.command("status")
    .description("Get the status of the adspower runtime")
    .action(async () => {
        getChildStatus();
    });

for (const cmd of Object.keys(STATELESS_HANDLERS)) {
    const fnc = STATELESS_HANDLERS[cmd].fn;
    program.command(`${cmd} [params]`)
        .description(STATELESS_HANDLERS[cmd].description)
        .option("-k, --api-key <apiKey>", "Set the API key for the adspower runtime")
        .option("-p, --port <port>", "Set the port for the adspower runtime")
        .action(async (params, options, command) => {
            const isRun = await hasRunning(options);
            if (!isRun) {
                logError('[!] Adspower runtime is not running');
                const info = `[i] Please run "${green("adspower-browser start -k <apiKey>")}" to start the adspower runtime`;
                console.log(info);
                return;
            }
            const { apiKey, port } = getApiKeyAndPort(options);
            updateConfig(apiKey, port);
            // Preserve the external Local API contract names before handing params to the core handlers.
            const resolved = resolveStatelessCommandArgs(command.name(), params);
            if (!resolved.ok) {
                logError(resolved.error);
                return;
            }
            const args = resolved.args;
            logSuccess(`Executing command: ${command.name()}, params: ${JSON.stringify(args)}`);
            const loading = createLoading(`Executing ${command.name()}...`);
            try {
                if (command.name() === 'download-kernel') {
                    loading.stop();
                    const result = await trackKernelDownload(fnc, args);
                    const out = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
                    logInfo(`\n\n${out}\n\n`);
                } else {
                    const result = await fnc(args);
                    const out = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
                    logInfo(`\n\n${out}\n`);
                    if (command.name() === 'update-patch' && !out.includes('The client is already on the latest patch version. No update is required')) {
                        loading.stop();
                        await sleepTime(1000 * 60);
                        await restartChild();
                    }
                }
            } finally {
                loading.stop();
            }
        });
}

program.parseAsync(process.argv).catch((error) => {
    console.error(error);
    process.exit(1);
});
