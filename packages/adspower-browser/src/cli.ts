import {
    browserHandlers,
    groupHandlers,
    applicationHandlers,
    proxyHandlers,
    tagHandlers,
    kernelHandlers,
    patchHandlers,
    buildCliCommandDescription
} from '@adspower/local-api-core';
import { schemas } from '@adspower/local-api-core/src/types/schemas';

export type HandlerFn = (params: any) => Promise<string | unknown>;

export type Handler = {
    fn: HandlerFn;
    description: string;
    paramsDescription: string;
}

function formatJsonValueForHelp(value: unknown, indent: number): string {
    const pad = '  '.repeat(indent);
    const childPad = '  '.repeat(indent + 1);

    if (value === null || typeof value !== 'object') {
        return JSON.stringify(value);
    }

    if (Array.isArray(value)) {
        if (value.length === 0) {
            return '[]';
        }

        const lines = value.map((item) => `${childPad}${formatJsonValueForHelp(item, indent + 1)}`);
        return `[\n${lines.join(',\n')}\n${pad}]`;
    }

    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) {
        return '{}';
    }

    const lines = entries.map(([key, val]) => {
        if (['enum', 'oneOf', 'required'].includes(key) && Array.isArray(val)) {
            return `${childPad}${JSON.stringify(key)}: ${JSON.stringify(val)}`;
        }

        return `${childPad}${JSON.stringify(key)}: ${formatJsonValueForHelp(val, indent + 1)}`;
    });

    return `{\n${lines.join(',\n')}\n${pad}}`;
}

export function formatSchemaPropertiesForHelp(properties: unknown): string {
    return formatJsonValueForHelp(properties, 0);
}

function schemaParamsDescription(schema: { toJSONSchema(): { properties?: unknown } }, type: string): string {
    let paramStr = 'view help: https://documenter.getpostman.com/view/45822952/2sB2x5JDXn\n';
    switch (type) {
        case 'open-browser':
            paramStr += 'use cmd: "ads open-browser <profile_id>"\nor use params: "ads open-browser \'{"profile_id":"..."}\' "\n';
            break;
        case 'close-browser':
            paramStr += 'use cmd: "ads close-browser <profile_id>"\nor use params: "ads close-browser \'{"profile_id":"..."}\' "\n';
            break;
        case 'get-profile-cookies':
            paramStr += 'use cmd: "ads get-profile-cookies <profile_id>"\nor use params: "ads get-profile-cookies \'{"profile_id":"..."}\' "\n';
            break;
        case 'get-browser-active':
            paramStr += 'use cmd: "ads get-browser-active <profile_id>"\nor use params: "ads get-browser-active \'{"profile_id":"..."}\' "\n';
            break;
    }
    const _str = formatSchemaPropertiesForHelp(schema.toJSONSchema().properties);
    return paramStr + _str;
}

export const STATELESS_HANDLERS: Record<string, Handler> = {
    'open-browser': {
        fn: browserHandlers.openBrowser as HandlerFn,
        description: buildCliCommandDescription(
            'open-browser',
            'Open the browser, both environment and profile mean browser'
        ),
        paramsDescription: schemaParamsDescription(schemas.openBrowserSchema, 'open-browser')
    },
    'close-browser': {
        fn: browserHandlers.closeBrowser as HandlerFn,
        description: buildCliCommandDescription('close-browser', 'Close the browser'),
        paramsDescription: schemaParamsDescription(schemas.closeBrowserSchema, 'close-browser')
    },
    'create-browser': {
        fn: browserHandlers.createBrowser as HandlerFn,
        description: buildCliCommandDescription('create-browser', 'Create a browser'),
        paramsDescription: schemaParamsDescription(schemas.createBrowserSchema, 'create-browser')
    },
    'update-browser': {
        fn: browserHandlers.updateBrowser as HandlerFn,
        description: buildCliCommandDescription('update-browser', 'Update the browser'),
        paramsDescription: schemaParamsDescription(schemas.updateBrowserSchema, 'update-browser')
    },
    'delete-browser': {
        fn: browserHandlers.deleteBrowser as HandlerFn,
        description: buildCliCommandDescription('delete-browser', 'Delete the browser'),
        paramsDescription: schemaParamsDescription(schemas.deleteBrowserSchema, 'delete-browser')
    },
    'get-browser-list': {
        fn: browserHandlers.getBrowserList as HandlerFn,
        description: buildCliCommandDescription('get-browser-list', 'Get the list of browsers'),
        paramsDescription: schemaParamsDescription(schemas.getBrowserListSchema, 'get-browser-list')
    },
    'get-opened-browser': {
        fn: browserHandlers.getOpenedBrowser as HandlerFn,
        description: buildCliCommandDescription('get-opened-browser', 'Get the list of opened browsers'),
        paramsDescription: schemaParamsDescription(schemas.emptySchema, 'get-opened-browser')
    },
    'move-browser': {
        fn: browserHandlers.moveBrowser as HandlerFn,
        description: buildCliCommandDescription('move-browser', 'Move browsers to a group'),
        paramsDescription: schemaParamsDescription(schemas.moveBrowserSchema, 'move-browser')
    },
    'get-profile-cookies': {
        fn: browserHandlers.getProfileCookies as HandlerFn,
        description: buildCliCommandDescription(
            'get-profile-cookies',
            'Query and return cookies of the specified profile. Only one profile can be queried per request.'
        ),
        paramsDescription: schemaParamsDescription(schemas.getProfileCookiesSchema, 'get-profile-cookies')
    },
    'get-profile-ua': {
        fn: browserHandlers.getProfileUa as HandlerFn,
        description: buildCliCommandDescription(
            'get-profile-ua',
            'Query and return the User-Agent of specified profiles. Up to 10 profiles can be queried per request.'
        ),
        paramsDescription: schemaParamsDescription(schemas.getProfileUaSchema, 'get-profile-ua')
    },
    'close-all-profiles': {
        fn: browserHandlers.closeAllProfiles as HandlerFn,
        description: buildCliCommandDescription(
            'close-all-profiles',
            'Close all opened profiles on the current device'
        ),
        paramsDescription: schemaParamsDescription(schemas.closeAllProfilesSchema, 'close-all-profiles')
    },
    'new-fingerprint': {
        fn: browserHandlers.newFingerprint as HandlerFn,
        description: buildCliCommandDescription(
            'new-fingerprint',
            'Generate a new fingerprint for specified profiles. Up to 10 profiles are supported per request.'
        ),
        paramsDescription: schemaParamsDescription(schemas.newFingerprintSchema, 'new-fingerprint')
    },
    'delete-cache-v2': {
        fn: browserHandlers.deleteCacheV2 as HandlerFn,
        description: buildCliCommandDescription(
            'delete-cache-v2',
            'Clear local cache of specific profiles.For account security, please ensure that there are no open browsers on the device when using this interface.'
        ),
        paramsDescription: schemaParamsDescription(schemas.deleteCacheV2Schema, 'delete-cache-v2')
    },
    'share-profile': {
        fn: browserHandlers.shareProfile as HandlerFn,
        description: buildCliCommandDescription(
            'share-profile',
            'Share profiles via account email or phone number. The maximum number of profiles that can be shared at one time is 200.'
        ),
        paramsDescription: schemaParamsDescription(schemas.shareProfileSchema, 'share-profile')
    },
    'get-browser-active': {
        fn: browserHandlers.getBrowserActive as HandlerFn,
        description: buildCliCommandDescription('get-browser-active', 'Get active browser profile information'),
        paramsDescription: schemaParamsDescription(schemas.getBrowserActiveSchema, 'get-browser-active')
    },
    'get-cloud-active': {
        fn: browserHandlers.getCloudActive as HandlerFn,
        description: buildCliCommandDescription(
            'get-cloud-active',
            'Query the status of browser profiles by user_ids, up to 100 profiles per request. If the team has enabled "Multi device mode," specific statuses cannot be retrieved and the response will indicate "Profile not opened."'
        ),
        paramsDescription: schemaParamsDescription(schemas.getCloudActiveSchema, 'get-cloud-active')
    },
    'create-group': {
        fn: groupHandlers.createGroup as HandlerFn,
        description: buildCliCommandDescription('create-group', 'Create a browser group'),
        paramsDescription: schemaParamsDescription(schemas.createGroupSchema, 'create-group')
    },
    'update-group': {
        fn: groupHandlers.updateGroup as HandlerFn,
        description: buildCliCommandDescription('update-group', 'Update the browser group'),
        paramsDescription: schemaParamsDescription(schemas.updateGroupSchema, 'update-group')
    },
    'get-group-list': {
        fn: groupHandlers.getGroupList as HandlerFn,
        description: buildCliCommandDescription('get-group-list', 'Get the list of groups'),
        paramsDescription: schemaParamsDescription(schemas.getGroupListSchema, 'get-group-list')
    },
    'check-status': {
        fn: applicationHandlers.checkStatus as HandlerFn,
        description: buildCliCommandDescription(
            'check-status',
            'Check the availability of the current device API interface (Connection Status)'
        ),
        paramsDescription: schemaParamsDescription(schemas.emptySchema, 'check-status')
    },
    'get-application-list': {
        fn: applicationHandlers.getApplicationList as HandlerFn,
        description: buildCliCommandDescription(
            'get-application-list',
            'Get the list of applications (categories)'
        ),
        paramsDescription: schemaParamsDescription(schemas.getApplicationListSchema, 'get-application-list')
    },
    'create-proxy': {
        fn: proxyHandlers.createProxy as HandlerFn,
        description: buildCliCommandDescription('create-proxy', 'Create the proxy'),
        paramsDescription: schemaParamsDescription(schemas.createProxySchema, 'create-proxy')
    },
    'update-proxy': {
        fn: proxyHandlers.updateProxy as HandlerFn,
        description: buildCliCommandDescription('update-proxy', 'Update the proxy'),
        paramsDescription: schemaParamsDescription(schemas.updateProxySchema, 'update-proxy')
    },
    'get-proxy-list': {
        fn: proxyHandlers.getProxyList as HandlerFn,
        description: buildCliCommandDescription('get-proxy-list', 'Get the list of proxies'),
        paramsDescription: schemaParamsDescription(schemas.getProxyListSchema, 'get-proxy-list')
    },
    'delete-proxy': {
        fn: proxyHandlers.deleteProxy as HandlerFn,
        description: buildCliCommandDescription('delete-proxy', 'Delete the proxy'),
        paramsDescription: schemaParamsDescription(schemas.deleteProxySchema, 'delete-proxy')
    },
    'get-tag-list': {
        fn: tagHandlers.getTagList as HandlerFn,
        description: buildCliCommandDescription('get-tag-list', 'Get the list of browser tags'),
        paramsDescription: schemaParamsDescription(schemas.getTagListSchema, 'get-tag-list')
    },
    'create-tag': {
        fn: tagHandlers.createTag as HandlerFn,
        description: buildCliCommandDescription('create-tag', 'Create browser tags (batch supported)'),
        paramsDescription: schemaParamsDescription(schemas.createTagSchema, 'create-tag')
    },
    'update-tag': {
        fn: tagHandlers.updateTag as HandlerFn,
        description: buildCliCommandDescription('update-tag', 'Update browser tags (batch supported)'),
        paramsDescription: schemaParamsDescription(schemas.updateTagSchema, 'update-tag')
    },
    'delete-tag': {
        fn: tagHandlers.deleteTag as HandlerFn,
        description: buildCliCommandDescription('delete-tag', 'Delete browser tags'),
        paramsDescription: schemaParamsDescription(schemas.deleteTagSchema, 'delete-tag')
    },
    'download-kernel': {
        fn: kernelHandlers.downloadKernel as HandlerFn,
        description: buildCliCommandDescription(
            'download-kernel',
            'Download or update a browser kernel version'
        ),
        paramsDescription: schemaParamsDescription(schemas.downloadKernelSchema, 'download-kernel')
    },
    'get-kernel-list': {
        fn: kernelHandlers.getKernelList as HandlerFn,
        description: buildCliCommandDescription('get-kernel-list', 'Get browser kernel list by type or all'),
        paramsDescription: schemaParamsDescription(schemas.getKernelListSchema, 'get-kernel-list')
    },
    'update-patch': {
        fn: patchHandlers.updatePatch as HandlerFn,
        description: buildCliCommandDescription('update-patch', 'Update AdsPower to latest patch version'),
        paramsDescription: schemaParamsDescription(schemas.updatePatchSchema, 'update-patch')
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

