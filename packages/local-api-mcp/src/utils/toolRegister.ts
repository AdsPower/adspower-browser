import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
    buildMcpToolDescription,
    browserHandlers,
    groupHandlers,
    applicationHandlers,
    proxyHandlers,
    tagHandlers,
    kernelHandlers,
    patchHandlers,
    automationHandlers,
    schemas
} from '@adspower/local-api-core';
import { wrapHandler } from './handlerWrapper.js';
import { z } from 'zod';

// @modelcontextprotocol/sdk types tool inputs against Zod 3 shapes; Zod 4 is runtime-compatible.
type McpToolInputShape = Parameters<McpServer['tool']>[2];

function getSchemaShape(schema: z.ZodTypeAny): Record<string, z.ZodTypeAny> {
    if ('shape' in schema && typeof schema.shape === 'object' && schema.shape !== null) {
        return schema.shape as Record<string, z.ZodTypeAny>;
    }

    if ('_def' in schema) {
        const def = (schema as any)._def;
        if (def && 'schema' in def) {
            return getSchemaShape(def.schema);
        }
    }

    throw new Error(`Cannot extract shape from schema. Schema type: ${(schema as any)._def?.typeName || 'unknown'}`);
}

export function registerTools(server: McpServer) {
    server.tool('open-browser', buildMcpToolDescription('open-browser', 'Open the browser, both environment and profile mean browser'), getSchemaShape(schemas.openBrowserSchema) as unknown as McpToolInputShape,
        wrapHandler(browserHandlers.openBrowser));

    server.tool('close-browser', buildMcpToolDescription('close-browser', 'Close the browser'), getSchemaShape(schemas.closeBrowserSchema) as unknown as McpToolInputShape,
        wrapHandler(browserHandlers.closeBrowser));

    server.tool('create-browser', buildMcpToolDescription('create-browser', 'Create a browser'), getSchemaShape(schemas.createBrowserSchema) as unknown as McpToolInputShape,
        wrapHandler(browserHandlers.createBrowser));

    server.tool('update-browser', buildMcpToolDescription('update-browser', 'Update the browser'), schemas.updateBrowserSchema.shape as unknown as McpToolInputShape,
        wrapHandler(browserHandlers.updateBrowser));

    server.tool('delete-browser', buildMcpToolDescription('delete-browser', 'Delete the browser'), schemas.deleteBrowserSchema.shape as unknown as McpToolInputShape,
        wrapHandler(browserHandlers.deleteBrowser));

    server.tool('get-browser-list', buildMcpToolDescription('get-browser-list', 'Get the list of browsers'), schemas.getBrowserListSchema.shape as unknown as McpToolInputShape,
        wrapHandler(browserHandlers.getBrowserList));

    server.tool('get-opened-browser', buildMcpToolDescription('get-opened-browser', 'Get the list of opened browsers'), schemas.emptySchema.shape as unknown as McpToolInputShape,
        wrapHandler(browserHandlers.getOpenedBrowser));

    server.tool('move-browser', buildMcpToolDescription('move-browser', 'Move browsers to a group'), schemas.moveBrowserSchema.shape as unknown as McpToolInputShape,
        wrapHandler(browserHandlers.moveBrowser));

    server.tool('get-profile-cookies', buildMcpToolDescription('get-profile-cookies', 'Query and return cookies of the specified profile. Only one profile can be queried per request.'), getSchemaShape(schemas.getProfileCookiesSchema) as unknown as McpToolInputShape,
        wrapHandler(browserHandlers.getProfileCookies));

    server.tool('get-profile-ua', buildMcpToolDescription('get-profile-ua', 'Query and return the User-Agent of specified profiles. Up to 10 profiles can be queried per request.'), getSchemaShape(schemas.getProfileUaSchema) as unknown as McpToolInputShape,
        wrapHandler(browserHandlers.getProfileUa));

    server.tool('close-all-profiles', buildMcpToolDescription('close-all-profiles', 'Close all opened profiles on the current device'), schemas.closeAllProfilesSchema.shape as unknown as McpToolInputShape,
        wrapHandler(browserHandlers.closeAllProfiles));

    server.tool('new-fingerprint', buildMcpToolDescription('new-fingerprint', 'Generate a new fingerprint for specified profiles. Up to 10 profiles are supported per request.'), getSchemaShape(schemas.newFingerprintSchema) as unknown as McpToolInputShape,
        wrapHandler(browserHandlers.newFingerprint));

    server.tool('delete-cache-v2', buildMcpToolDescription('delete-cache-v2', 'Clear local cache of specific profiles.For account security, please ensure that there are no open browsers on the device when using this interface.'), schemas.deleteCacheV2Schema.shape as unknown as McpToolInputShape,
        wrapHandler(browserHandlers.deleteCacheV2));

    server.tool('share-profile', buildMcpToolDescription('share-profile', 'Share profiles via account email or phone number. The maximum number of profiles that can be shared at one time is 200.'), schemas.shareProfileSchema.shape as unknown as McpToolInputShape,
        wrapHandler(browserHandlers.shareProfile));

    server.tool('get-browser-active', buildMcpToolDescription('get-browser-active', 'Get active browser profile information'), getSchemaShape(schemas.getBrowserActiveSchema) as unknown as McpToolInputShape,
        wrapHandler(browserHandlers.getBrowserActive));

    server.tool('get-cloud-active', buildMcpToolDescription('get-cloud-active', 'Query the status of browser profiles by user_ids, up to 100 profiles per request. If the team has enabled "Multi device mode," specific statuses cannot be retrieved and the response will indicate "Profile not opened."'), getSchemaShape(schemas.getCloudActiveSchema) as unknown as McpToolInputShape,
        wrapHandler(browserHandlers.getCloudActive));

    server.tool('create-group', buildMcpToolDescription('create-group', 'Create a browser group'), schemas.createGroupSchema.shape as unknown as McpToolInputShape,
        wrapHandler(groupHandlers.createGroup));

    server.tool('update-group', buildMcpToolDescription('update-group', 'Update the browser group'), schemas.updateGroupSchema.shape as unknown as McpToolInputShape,
        wrapHandler(groupHandlers.updateGroup));

    server.tool('get-group-list', buildMcpToolDescription('get-group-list', 'Get the list of groups'), schemas.getGroupListSchema.shape as unknown as McpToolInputShape,
        wrapHandler(groupHandlers.getGroupList));

    server.tool('check-status', buildMcpToolDescription('check-status', 'Check the availability of the current device API interface (Connection Status)'), schemas.emptySchema.shape as unknown as McpToolInputShape,
        wrapHandler(applicationHandlers.checkStatus));

    server.tool('get-application-list', buildMcpToolDescription('get-application-list', 'Get application categories with optional category_id filtering and page/limit pagination.'), schemas.getApplicationListSchema.shape as unknown as McpToolInputShape,
        wrapHandler(applicationHandlers.getApplicationList));

    server.tool('create-proxy', buildMcpToolDescription('create-proxy', 'Create a proxy'), getSchemaShape(schemas.createProxyMcpSchema) as unknown as McpToolInputShape,
        wrapHandler((params: { proxies: Parameters<typeof proxyHandlers.createProxy>[0] }) => proxyHandlers.createProxy(params.proxies)));

    server.tool('update-proxy', buildMcpToolDescription('update-proxy', 'Update the proxy'), getSchemaShape(schemas.updateProxySchema) as unknown as McpToolInputShape,
        wrapHandler(proxyHandlers.updateProxy));

    server.tool('get-proxy-list', buildMcpToolDescription('get-proxy-list', 'Get the list of proxies'), schemas.getProxyListSchema.shape as unknown as McpToolInputShape,
        wrapHandler(proxyHandlers.getProxyList));

    server.tool('delete-proxy', buildMcpToolDescription('delete-proxy', 'Delete the proxy'), schemas.deleteProxySchema.shape as unknown as McpToolInputShape,
        wrapHandler(proxyHandlers.deleteProxy));

    server.tool('get-tag-list', buildMcpToolDescription('get-tag-list', 'Get the list of browser tags'), schemas.getTagListSchema.shape as unknown as McpToolInputShape,
        wrapHandler(tagHandlers.getTagList));

    server.tool('create-tag', buildMcpToolDescription('create-tag', 'Create browser tags (batch supported)'), schemas.createTagSchema.shape as unknown as McpToolInputShape,
        wrapHandler(tagHandlers.createTag));

    server.tool('update-tag', buildMcpToolDescription('update-tag', 'Update browser tags (batch supported)'), schemas.updateTagSchema.shape as unknown as McpToolInputShape,
        wrapHandler(tagHandlers.updateTag));

    server.tool('delete-tag', buildMcpToolDescription('delete-tag', 'Delete browser tags'), schemas.deleteTagSchema.shape as unknown as McpToolInputShape,
        wrapHandler(tagHandlers.deleteTag));

    server.tool('download-kernel', buildMcpToolDescription('download-kernel', 'Download or update a browser kernel version'), schemas.downloadKernelSchema.shape as unknown as McpToolInputShape,
        wrapHandler(kernelHandlers.downloadKernel));

    server.tool('get-kernel-list', buildMcpToolDescription('get-kernel-list', 'Get browser kernel list by type or all'), schemas.getKernelListSchema.shape as unknown as McpToolInputShape ,
        wrapHandler(kernelHandlers.getKernelList));

    server.tool('update-patch', buildMcpToolDescription('update-patch', 'Update AdsPower to latest patch version'), schemas.updatePatchSchema.shape as unknown as McpToolInputShape,
        wrapHandler(patchHandlers.updatePatch));

    server.tool('connect-browser-with-ws', buildMcpToolDescription('connect-browser-with-ws', 'Connect the browser with the ws url'), schemas.createAutomationSchema.shape as unknown as McpToolInputShape,
        wrapHandler(automationHandlers.connectBrowserWithWs));

    server.tool('open-new-page', buildMcpToolDescription('open-new-page', 'Open a new page'), schemas.emptySchema.shape as unknown as McpToolInputShape,
        wrapHandler(automationHandlers.openNewPage));

    server.tool('navigate', buildMcpToolDescription('navigate', 'Navigate to the url'), schemas.navigateSchema.shape as unknown as McpToolInputShape,
        wrapHandler(automationHandlers.navigate));

    server.tool('screenshot', buildMcpToolDescription('screenshot', 'Get the screenshot of the page'), schemas.screenshotSchema.shape as unknown as McpToolInputShape,
        wrapHandler(automationHandlers.screenshot));

    server.tool('get-page-visible-text', buildMcpToolDescription('get-page-visible-text', 'Get the visible text content of the page'), schemas.emptySchema.shape as unknown as McpToolInputShape,
        wrapHandler(automationHandlers.getPageVisibleText));

    server.tool('get-page-html', buildMcpToolDescription('get-page-html', 'Get the html content of the page'), schemas.emptySchema.shape as unknown as McpToolInputShape,
        wrapHandler(automationHandlers.getPageHtml));

    server.tool('click-element', buildMcpToolDescription('click-element', 'Click the element'), schemas.clickElementSchema.shape as unknown as McpToolInputShape,
        wrapHandler(automationHandlers.clickElement));

    server.tool('fill-input', buildMcpToolDescription('fill-input', 'Fill the input'), schemas.fillInputSchema.shape as unknown as McpToolInputShape,
        wrapHandler(automationHandlers.fillInput));

    server.tool('select-option', buildMcpToolDescription('select-option', 'Select the option'), schemas.selectOptionSchema.shape as unknown as McpToolInputShape,
        wrapHandler(automationHandlers.selectOption));

    server.tool('hover-element', buildMcpToolDescription('hover-element', 'Hover the element'), schemas.hoverElementSchema.shape as unknown as McpToolInputShape,
        wrapHandler(automationHandlers.hoverElement));

    server.tool('scroll-element', buildMcpToolDescription('scroll-element', 'Scroll the element'), schemas.scrollElementSchema.shape as unknown as McpToolInputShape,
        wrapHandler(automationHandlers.scrollElement));

    server.tool('press-key', buildMcpToolDescription('press-key', 'Press the key'), schemas.pressKeySchema.shape as unknown as McpToolInputShape,
        wrapHandler(automationHandlers.pressKey));

    server.tool('evaluate-script', buildMcpToolDescription('evaluate-script', 'Evaluate the script'), schemas.evaluateScriptSchema.shape as unknown as McpToolInputShape,
        wrapHandler(automationHandlers.evaluateScript));

    server.tool('drag-element', buildMcpToolDescription('drag-element', 'Drag the element'), schemas.dragElementSchema.shape as unknown as McpToolInputShape,
        wrapHandler(automationHandlers.dragElement));

    server.tool('iframe-click-element', buildMcpToolDescription('iframe-click-element', 'Click the element in the iframe'), schemas.iframeClickElementSchema.shape as unknown as McpToolInputShape,
        wrapHandler(automationHandlers.iframeClickElement));
}
