#!/usr/bin/env node
import { Command, Option } from "commander";
import { store } from "./store";
import { getChildStatus, restartChild, startChild, stopChild } from "./core/start";
import { createLoading, getApiKeyAndPort, hasRunning, logError, logInfo, logSuccess, VERSION } from "./tools";
import { green } from 'colors';
import { updateConfig } from '@adspower/local-api-core';
import { SINGLE_PROFILE_ID_ARRAY_COMMANDS, SINGLE_PROFILE_ID_COMMANDS, STATELESS_HANDLERS } from "./cli";

const program = new Command();
program.name("adspower-browser").description("CLI and runtime for adspower-browser").version(VERSION);

// 设置API Key
program.command("start")
    .description("Start the adspower runtime")
    .requiredOption("-k, --api-key <apiKey>", "Set the API key for the adspower runtime")
    .addOption(new Option("--base-url <baseUrl>", "Set the base URL for the adspower runtime").hideHelp())
    .addOption(new Option("--node-env <nodeEnv>", "Set the node environment for the adspower runtime").hideHelp())
    .action(async (options) => {
        if (options.apiKey) {
            store.setStoreValue('apiKey', options.apiKey);
        }
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
            let args: Record<string, any> = {};
            if (params) {
                const trimmed = params.trim();
                if (trimmed.startsWith('{')) {
                    try {
                        args = JSON.parse(params);
                    } catch {
                        logError('Invalid JSON for command args');
                        return;
                    }
                } else if (SINGLE_PROFILE_ID_COMMANDS[command.name()]) {
                    const key = SINGLE_PROFILE_ID_COMMANDS[command.name()];
                    if (!isNaN(Number(trimmed))) {
                        args = { profileNo: Number(trimmed) };
                    } else {
                        args = { profileId: trimmed };
                    }
                } else if (SINGLE_PROFILE_ID_ARRAY_COMMANDS.includes(command.name())) {
                    args = { profileId: [trimmed] };
                } else {
                    try {
                        args = JSON.parse(params);
                    } catch {
                        logError('Command requires JSON args (e.g. \'{"key":"value"}\') or use a supported shorthand');
                        return;
                    }
                }
            }
            logSuccess(`Executing command: ${command.name()}, params: ${JSON.stringify(args)}`);
            const loading = createLoading(`Executing ${command.name()}...`);
            try {
                const result = await fnc(args);
                const out = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
                logInfo(`\n\n${out}\n`);
            } finally {
                loading.stop();
            }
        });
}

program.parseAsync(process.argv).catch((error) => {
    console.error(error);
    process.exit(1);
});
