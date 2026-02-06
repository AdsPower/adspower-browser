#!/usr/bin/env node
import {
    browserHandlers,
    groupHandlers,
    applicationHandlers,
    proxyHandlers
} from '@adspower/local-api-core';

type HandlerFn = (params: any) => Promise<string | unknown>;

const STATELESS_HANDLERS: Record<string, HandlerFn> = {
    'open-browser': browserHandlers.openBrowser as HandlerFn,
    'close-browser': browserHandlers.closeBrowser as HandlerFn,
    'create-browser': browserHandlers.createBrowser as HandlerFn,
    'update-browser': browserHandlers.updateBrowser as HandlerFn,
    'delete-browser': browserHandlers.deleteBrowser as HandlerFn,
    'get-browser-list': browserHandlers.getBrowserList as HandlerFn,
    'get-opened-browser': browserHandlers.getOpenedBrowser as HandlerFn,
    'move-browser': browserHandlers.moveBrowser as HandlerFn,
    'get-profile-cookies': browserHandlers.getProfileCookies as HandlerFn,
    'get-profile-ua': browserHandlers.getProfileUa as HandlerFn,
    'close-all-profiles': browserHandlers.closeAllProfiles as HandlerFn,
    'new-fingerprint': browserHandlers.newFingerprint as HandlerFn,
    'delete-cache-v2': browserHandlers.deleteCacheV2 as HandlerFn,
    'share-profile': browserHandlers.shareProfile as HandlerFn,
    'get-browser-active': browserHandlers.getBrowserActive as HandlerFn,
    'get-cloud-active': browserHandlers.getCloudActive as HandlerFn,
    'create-group': groupHandlers.createGroup as HandlerFn,
    'update-group': groupHandlers.updateGroup as HandlerFn,
    'get-group-list': groupHandlers.getGroupList as HandlerFn,
    'check-status': applicationHandlers.checkStatus as HandlerFn,
    'get-application-list': applicationHandlers.getApplicationList as HandlerFn,
    'create-proxy': proxyHandlers.createProxy as HandlerFn,
    'update-proxy': proxyHandlers.updateProxy as HandlerFn,
    'get-proxy-list': proxyHandlers.getProxyList as HandlerFn,
    'delete-proxy': proxyHandlers.deleteProxy as HandlerFn,
};

// Commands that accept a single profileId (or profileNo) as shorthand when one non-JSON arg is given
const SINGLE_PROFILE_ID_COMMANDS: Record<string, 'profileId' | 'profileNo'> = {
    'open-browser': 'profileId',
    'close-browser': 'profileId',
    'get-profile-cookies': 'profileId',
    'get-browser-active': 'profileId',
};
// Commands that accept a single value as profileId array (e.g. get-profile-ua, new-fingerprint)
const SINGLE_PROFILE_ID_ARRAY_COMMANDS: string[] = ['get-profile-ua', 'new-fingerprint'];

function parseArgv(argv: string[]): { command: string; args: Record<string, any> } {
    let i = 0;
    while (i < argv.length) {
        if (argv[i] === '--port' || argv[i] === '--api-key') {
            i += 2;
            continue;
        }
        break;
    }
    const command = argv[i];
    const arg = argv[i + 1];
    if (!command || !STATELESS_HANDLERS[command]) {
        throw new Error(`Unknown or unsupported command: ${command || '(missing)'}. Supported: ${Object.keys(STATELESS_HANDLERS).join(', ')}`);
    }
    let args: Record<string, any> = {};
    if (arg) {
        const trimmed = arg.trim();
        if (trimmed.startsWith('{')) {
            try {
                args = JSON.parse(arg);
            } catch {
                throw new Error('Invalid JSON for command args');
            }
        } else if (SINGLE_PROFILE_ID_COMMANDS[command]) {
            const key = SINGLE_PROFILE_ID_COMMANDS[command];
            args = { [key]: trimmed };
        } else if (SINGLE_PROFILE_ID_ARRAY_COMMANDS.includes(command)) {
            args = { profileId: [trimmed] };
        } else {
            try {
                args = JSON.parse(arg);
            } catch {
                throw new Error('Command requires JSON args (e.g. \'{"key":"value"}\') or use a supported shorthand');
            }
        }
    }
    return { command, args };
}

async function main() {
    const argv = process.argv.slice(2);
    try {
        const { command, args } = parseArgv(argv);
        const handler = STATELESS_HANDLERS[command];
        const result = await handler(args);
        const out = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
        process.stdout.write(out + '\n');
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        process.stderr.write(msg + '\n');
        process.exit(1);
    }
}

main();
