import {
    browserHandlers,
    groupHandlers,
    applicationHandlers,
    proxyHandlers,
    tagHandlers,
    kernelHandlers,
    patchHandlers
} from '@adspower/local-api-core';

type HandlerFn = (params: any) => Promise<string | unknown>;

type Handler = {
    fn: HandlerFn;
    description: string;
}

export const STATELESS_HANDLERS: Record<string, Handler> = {
    'open-browser': {
        fn: browserHandlers.openBrowser as HandlerFn,
        description: 'Open the browser, both environment and profile mean browser'
    },
    'close-browser': {
        fn: browserHandlers.closeBrowser as HandlerFn,
        description: 'Close the browser'
    },  
    'create-browser': {
        fn: browserHandlers.createBrowser as HandlerFn,
        description: 'Create a browser'
    },
    'update-browser': {
        fn: browserHandlers.updateBrowser as HandlerFn,
        description: 'Update the browser'
    },
    'delete-browser': {
        fn: browserHandlers.deleteBrowser as HandlerFn,
        description: 'Delete the browser'
    },
    'get-browser-list': {
        fn: browserHandlers.getBrowserList as HandlerFn,
        description: 'Get the list of browsers'
    },
    'get-opened-browser': {
        fn: browserHandlers.getOpenedBrowser as HandlerFn,
        description: 'Get the list of opened browsers'
    },
    'move-browser': {
        fn: browserHandlers.moveBrowser as HandlerFn,
        description: 'Move browsers to a group'
    },
    'get-profile-cookies': {
        fn: browserHandlers.getProfileCookies as HandlerFn,
        description: 'Query and return cookies of the specified profile. Only one profile can be queried per request.'
    },
    'get-profile-ua': {
        fn: browserHandlers.getProfileUa as HandlerFn,
        description: 'Query and return the User-Agent of specified profiles. Up to 10 profiles can be queried per request.'
    },
    'close-all-profiles': {
        fn: browserHandlers.closeAllProfiles as HandlerFn,
        description: 'Close all opened profiles on the current device'
    },
    'new-fingerprint': {
        fn: browserHandlers.newFingerprint as HandlerFn,
        description: 'Generate a new fingerprint for specified profiles. Up to 10 profiles are supported per request.'
    },
    'delete-cache-v2': {
        fn: browserHandlers.deleteCacheV2 as HandlerFn,
        description: 'Clear local cache of specific profiles.For account security, please ensure that there are no open browsers on the device when using this interface.'
    },
    'share-profile': {
        fn: browserHandlers.shareProfile as HandlerFn,
        description: 'Share profiles via account email or phone number. The maximum number of profiles that can be shared at one time is 200.'
    },
    'get-browser-active': {
        fn: browserHandlers.getBrowserActive as HandlerFn,
        description: 'Get active browser profile information'
    },
    'get-cloud-active': {
        fn: browserHandlers.getCloudActive as HandlerFn,
        description: 'Query the status of browser profiles by user_id, up to 100 profiles per request. If the team has enabled "Multi device mode," specific statuses cannot be retrieved and the response will indicate "Profile not opened."'
    },
    'create-group': {
        fn: groupHandlers.createGroup as HandlerFn,
        description: 'Create a browser group'
    },
    'update-group': {
        fn: groupHandlers.updateGroup as HandlerFn,
        description: 'Update the browser group'
    },
    'get-group-list': {
        fn: groupHandlers.getGroupList as HandlerFn,
        description: 'Get the list of groups'
    },
    'check-status': {
        fn: applicationHandlers.checkStatus as HandlerFn,
        description: 'Check the availability of the current device API interface (Connection Status)'
    },
    'get-application-list': {
        fn: applicationHandlers.getApplicationList as HandlerFn,
        description: 'Get the list of applications (categories)'
    },
    'create-proxy': {
        fn: proxyHandlers.createProxy as HandlerFn,
        description: 'Create the proxy'
    },
    'update-proxy': {
        fn: proxyHandlers.updateProxy as HandlerFn,
        description: 'Update the proxy'
    },
    'get-proxy-list': {
        fn: proxyHandlers.getProxyList as HandlerFn,
        description: 'Get the list of proxies'
    },
    'delete-proxy': {
        fn: proxyHandlers.deleteProxy as HandlerFn,
        description: 'Delete the proxy'
    },
    'get-tag-list': {
        fn: tagHandlers.getTagList as HandlerFn,
        description: 'Get the list of browser tags'
    },
    'create-tag': {
        fn: tagHandlers.createTag as HandlerFn,
        description: 'Create browser tags (batch supported)'
    },
    'update-tag': {
        fn: tagHandlers.updateTag as HandlerFn,
        description: 'Update browser tags (batch supported)'
    },
    'delete-tag': {
        fn: tagHandlers.deleteTag as HandlerFn,
        description: 'Delete browser tags'
    },
    'download-kernel': {
        fn: kernelHandlers.downloadKernel as HandlerFn,
        description: 'Download or update a browser kernel version'
    },
    'get-kernel-list': {
        fn: kernelHandlers.getKernelList as HandlerFn,
        description: 'Get browser kernel list by type or all'
    },
    'update-patch': {
        fn: patchHandlers.updatePatch as HandlerFn,
        description: 'Update AdsPower to latest patch version'
    },
};

// Commands that accept a single profile identifier shorthand and expand to Postman field names.
export const SINGLE_PROFILE_ID_COMMANDS: Record<string, 'profile_id' | 'profile_no'> = {
    'open-browser': 'profile_id',
    'close-browser': 'profile_id',
    'get-profile-cookies': 'profile_id',
    'get-browser-active': 'profile_id',
};
// Commands that accept one shorthand token and expand to profile_id[] or profile_no[].
export const SINGLE_PROFILE_ID_ARRAY_COMMANDS: string[] = ['get-profile-ua', 'new-fingerprint'];

type ResolveCommandArgsResult =
    | { ok: true; args: Record<string, any> }
    | { ok: false; error: string };

export function resolveStatelessCommandArgs(commandName: string, params?: string): ResolveCommandArgsResult {
    let args: Record<string, any> = {};

    if (!params) {
        return { ok: true, args };
    }

    const trimmed = params.trim();

    if (trimmed.startsWith('{')) {
        try {
            args = JSON.parse(params);
            return { ok: true, args };
        } catch {
            return { ok: false, error: 'Invalid JSON for command args' };
        }
    }

    if (SINGLE_PROFILE_ID_COMMANDS[commandName]) {
        if (!isNaN(Number(trimmed))) {
            return { ok: true, args: { profile_no: trimmed } };
        }

        return { ok: true, args: { profile_id: trimmed } };
    }

    if (SINGLE_PROFILE_ID_ARRAY_COMMANDS.includes(commandName)) {
        if (!isNaN(Number(trimmed))) {
            return { ok: true, args: { profile_no: [trimmed] } };
        }

        return { ok: true, args: { profile_id: [trimmed] } };
    }

    try {
        args = JSON.parse(params);
        return { ok: true, args };
    } catch {
        return {
            ok: false,
            error: 'Command requires JSON args (e.g. \'{"key":"value"}\') or use a supported shorthand'
        };
    }
}

