import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
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
    server.tool('open-browser', 'Open the browser, both environment and profile mean browser', schemas.openBrowserSchema.shape,
        wrapHandler(browserHandlers.openBrowser));

    server.tool('close-browser', 'Close the browser', getSchemaShape(schemas.closeBrowserSchema),
        wrapHandler(browserHandlers.closeBrowser));

    server.tool('create-browser', 'Create a browser', getSchemaShape(schemas.createBrowserSchema),
        wrapHandler(browserHandlers.createBrowser));

    server.tool('update-browser', 'Update the browser', schemas.updateBrowserSchema.shape,
        wrapHandler(browserHandlers.updateBrowser));

    server.tool('delete-browser', 'Delete the browser', schemas.deleteBrowserSchema.shape,
        wrapHandler(browserHandlers.deleteBrowser));

    server.tool('get-browser-list', 'Get the list of browsers', schemas.getBrowserListSchema.shape,
        wrapHandler(browserHandlers.getBrowserList));

    server.tool('get-opened-browser', 'Get the list of opened browsers', schemas.emptySchema.shape,
        wrapHandler(browserHandlers.getOpenedBrowser));

    server.tool('move-browser', 'Move browsers to a group', schemas.moveBrowserSchema.shape,
        wrapHandler(browserHandlers.moveBrowser));

    server.tool('get-profile-cookies', 'Query and return cookies of the specified profile. Only one profile can be queried per request.', getSchemaShape(schemas.getProfileCookiesSchema),
        wrapHandler(browserHandlers.getProfileCookies));

    server.tool('get-profile-ua', 'Query and return the User-Agent of specified profiles. Up to 10 profiles can be queried per request.', getSchemaShape(schemas.getProfileUaSchema),
        wrapHandler(browserHandlers.getProfileUa));

    server.tool('close-all-profiles', 'Close all opened profiles on the current device', schemas.closeAllProfilesSchema.shape,
        wrapHandler(browserHandlers.closeAllProfiles));

    server.tool('new-fingerprint', 'Generate a new fingerprint for specified profiles. Up to 10 profiles are supported per request.', schemas.newFingerprintSchema.shape,
        wrapHandler(browserHandlers.newFingerprint));

    server.tool('delete-cache-v2', 'Clear local cache of specific profiles.For account security, please ensure that there are no open browsers on the device when using this interface.', schemas.deleteCacheV2Schema.shape,
        wrapHandler(browserHandlers.deleteCacheV2));

    server.tool('share-profile', 'Share profiles via account email or phone number. The maximum number of profiles that can be shared at one time is 200.', schemas.shareProfileSchema.shape,
        wrapHandler(browserHandlers.shareProfile));

    server.tool('get-browser-active', 'Get active browser profile information', getSchemaShape(schemas.getBrowserActiveSchema),
        wrapHandler(browserHandlers.getBrowserActive));

    server.tool('get-cloud-active', 'Query the status of browser profiles by user_id, up to 100 profiles per request. If the team has enabled "Multi device mode," specific statuses cannot be retrieved and the response will indicate "Profile not opened."', getSchemaShape(schemas.getCloudActiveSchema),
        wrapHandler(browserHandlers.getCloudActive));

    server.tool('create-group', 'Create a browser group', schemas.createGroupSchema.shape,
        wrapHandler(groupHandlers.createGroup));

    server.tool('update-group', 'Update the browser group', schemas.updateGroupSchema.shape,
        wrapHandler(groupHandlers.updateGroup));

    server.tool('get-group-list', 'Get the list of groups', schemas.getGroupListSchema.shape,
        wrapHandler(groupHandlers.getGroupList));

    server.tool('check-status', 'Check the availability of the current device API interface (Connection Status)', schemas.emptySchema.shape,
        wrapHandler(applicationHandlers.checkStatus));

    server.tool('get-application-list', 'Get the list of applications (categories)', schemas.getApplicationListSchema.shape,
        wrapHandler(applicationHandlers.getApplicationList));

    server.tool('create-proxy', 'Create a proxy', getSchemaShape(schemas.createProxySchema),
        wrapHandler(proxyHandlers.createProxy));

    server.tool('update-proxy', 'Update the proxy', getSchemaShape(schemas.updateProxySchema),
        wrapHandler(proxyHandlers.updateProxy));

    server.tool('get-proxy-list', 'Get the list of proxies', schemas.getProxyListSchema.shape,
        wrapHandler(proxyHandlers.getProxyList));

    server.tool('delete-proxy', 'Delete the proxy', schemas.deleteProxySchema.shape,
        wrapHandler(proxyHandlers.deleteProxy));

    server.tool('get-tag-list', 'Get the list of browser tags', schemas.getTagListSchema.shape,
        wrapHandler(tagHandlers.getTagList));

    server.tool('create-tag', 'Create browser tags (batch supported)', schemas.createTagSchema.shape,
        wrapHandler(tagHandlers.createTag));

    server.tool('update-tag', 'Update browser tags (batch supported)', schemas.updateTagSchema.shape,
        wrapHandler(tagHandlers.updateTag));

    server.tool('delete-tag', 'Delete browser tags', schemas.deleteTagSchema.shape,
        wrapHandler(tagHandlers.deleteTag));

    server.tool('download-kernel', 'Download or update a browser kernel version', schemas.downloadKernelSchema.shape,
        wrapHandler(kernelHandlers.downloadKernel));

    server.tool('get-kernel-list', 'Get browser kernel list by type or all', schemas.getKernelListSchema.shape,
        wrapHandler(kernelHandlers.getKernelList));

    server.tool('update-patch', 'Update AdsPower to latest patch version', schemas.updatePatchSchema.shape,
        wrapHandler(patchHandlers.updatePatch));

    server.tool('connect-browser-with-ws', 'Connect the browser with the ws url', schemas.createAutomationSchema.shape,
        wrapHandler(automationHandlers.connectBrowserWithWs));

    server.tool('open-new-page', 'Open a new page', schemas.emptySchema.shape,
        wrapHandler(automationHandlers.openNewPage));

    server.tool('navigate', 'Navigate to the url', schemas.navigateSchema.shape,
        wrapHandler(automationHandlers.navigate));

    server.tool('screenshot', 'Get the screenshot of the page', schemas.screenshotSchema.shape,
        wrapHandler(automationHandlers.screenshot));

    server.tool('get-page-visible-text', 'Get the visible text content of the page', schemas.emptySchema.shape,
        wrapHandler(automationHandlers.getPageVisibleText));

    server.tool('get-page-html', 'Get the html content of the page', schemas.emptySchema.shape,
        wrapHandler(automationHandlers.getPageHtml));

    server.tool('click-element', 'Click the element', schemas.clickElementSchema.shape,
        wrapHandler(automationHandlers.clickElement));

    server.tool('fill-input', 'Fill the input', schemas.fillInputSchema.shape,
        wrapHandler(automationHandlers.fillInput));

    server.tool('select-option', 'Select the option', schemas.selectOptionSchema.shape,
        wrapHandler(automationHandlers.selectOption));

    server.tool('hover-element', 'Hover the element', schemas.hoverElementSchema.shape,
        wrapHandler(automationHandlers.hoverElement));

    server.tool('scroll-element', 'Scroll the element', schemas.scrollElementSchema.shape,
        wrapHandler(automationHandlers.scrollElement));

    server.tool('press-key', 'Press the key', schemas.pressKeySchema.shape,
        wrapHandler(automationHandlers.pressKey));

    server.tool('evaluate-script', 'Evaluate the script', schemas.evaluateScriptSchema.shape,
        wrapHandler(automationHandlers.evaluateScript));

    server.tool('drag-element', 'Drag the element', schemas.dragElementSchema.shape,
        wrapHandler(automationHandlers.dragElement));

    server.tool('iframe-click-element', 'Click the element in the iframe', schemas.iframeClickElementSchema.shape,
        wrapHandler(automationHandlers.iframeClickElement));
}
