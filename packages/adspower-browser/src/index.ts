#!/usr/bin/env node
import { Command, Option } from "commander";
import { store } from "./store";
import { getChildStatus, restartChild, startChild, stopChild } from "./core/start";
import { logError, VERSION } from "./tools";
import { STATELESS_HANDLERS } from "./cli";
import { resolveStartApiKey } from "./startConfig";
import { isShellCompletionRequest, setupShellCompletion, wrapShellScriptOutput } from "./completion";
import { handleAction } from "./handleAction";

const program = new Command();
program.description("CLI and runtime for adspower-browser").version(VERSION);

// 设置API Key
program.command("start")
    .description("Start the adspower runtime")
    .option("-k, --api-key <apiKey>", "Set the API key for the adspower runtime")
    .addOption(new Option("--base-url <baseUrl>", "Set the base URL for the adspower runtime").hideHelp())
    .addOption(new Option("--node-env <nodeEnv>", "Set the node environment for the adspower runtime").hideHelp())
    .option("--hide", "Hide Windows cmd windows when spawning child processes (Windows only)")
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
        if (options.hide) {
            store.setStoreValue('hide', 'true');
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
    program.command(`${cmd}`)
        .description(STATELESS_HANDLERS[cmd].description)
        .option("-k, --api-key <apiKey>", "Set the API key for the adspower runtime")
        .option("-p, --port <port>", "Set the port for the adspower runtime")
        .argument("[params]", STATELESS_HANDLERS[cmd].paramsDescription)
        .action(async (params, options, command) => {
            await handleAction(params, options, command, fnc);
        });
}

setupShellCompletion(program);

const shellScriptArg = process.argv[2] === 'complete' ? process.argv[3] : undefined;
const restoreStdout = wrapShellScriptOutput(shellScriptArg);

if (isShellCompletionRequest()) {
    program.parse(process.argv);
    restoreStdout();
} else {
    program.parseAsync(process.argv).catch((error) => {
        console.error(error);
        process.exit(1);
    }).finally(restoreStdout);
}
