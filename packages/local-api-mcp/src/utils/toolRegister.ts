import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
    CallToolRequestSchema,
    ErrorCode,
    ListToolsRequestSchema,
    McpError,
    type CallToolResult
} from '@modelcontextprotocol/sdk/types.js';
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

type McpToolInputShape = Parameters<McpServer['tool']>[2];
type ToolHandler = (params: any, extra?: unknown) => Promise<CallToolResult>;

type Zod4Tool = {
    name: string;
    description: string;
    schema: z.ZodTypeAny;
    shape: Record<string, z.ZodTypeAny>;
    handler: ToolHandler;
};

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

function registerZod4Tool(
    server: McpServer,
    tools: Zod4Tool[],
    name: string,
    description: string,
    schema: z.ZodTypeAny,
    handler: ToolHandler
) {
    const shape = getSchemaShape(schema);

    // Tests use a lightweight fake server to inspect the public shape. Real MCP
    // registration is installed once below so Zod 4 schemas never enter the SDK's
    // Zod 3 parser.
    const maybeServer = server as McpServer & { server?: unknown };
    if (!maybeServer.server) {
        server.tool(name, description, shape as unknown as McpToolInputShape, handler);
        return;
    }

    tools.push({ name, description, schema, shape, handler });
}

function installZod4ToolHandlers(server: McpServer, tools: Zod4Tool[]) {
    const toolMap = new Map(tools.map((tool) => [tool.name, tool]));

    server.server.assertCanSetRequestHandler(ListToolsRequestSchema.shape.method.value);
    server.server.assertCanSetRequestHandler(CallToolRequestSchema.shape.method.value);
    server.server.registerCapabilities({ tools: {} });

    server.server.setRequestHandler(ListToolsRequestSchema, () => ({
        tools: tools.map((tool) => ({
            name: tool.name,
            description: tool.description,
            inputSchema: tool.schema.toJSONSchema()
        }))
    }));

    server.server.setRequestHandler(CallToolRequestSchema, async (request, extra) => {
        const tool = toolMap.get(request.params.name);
        if (!tool) {
            throw new McpError(ErrorCode.InvalidParams, `Tool ${request.params.name} not found`);
        }

        const parseResult = await tool.schema.safeParseAsync(request.params.arguments ?? {});
        if (!parseResult.success) {
            throw new McpError(
                ErrorCode.InvalidParams,
                `Invalid arguments for tool ${request.params.name}: ${parseResult.error.message}`
            );
        }

        return tool.handler(parseResult.data, extra);
    });
}

export function registerTools(server: McpServer) {
    const tools: Zod4Tool[] = [];
    const tool = (name: string, description: string, schema: z.ZodTypeAny, handler: ToolHandler) =>
        registerZod4Tool(server, tools, name, description, schema, handler);

    tool('open-browser', buildMcpToolDescription('open-browser', 'Open the browser, both environment and profile mean browser'), schemas.openBrowserSchema,
        wrapHandler(browserHandlers.openBrowser));

    tool('close-browser', buildMcpToolDescription('close-browser', 'Close the browser'), schemas.closeBrowserSchema,
        wrapHandler(browserHandlers.closeBrowser));

    tool('create-browser', buildMcpToolDescription('create-browser', 'Create a browser'), schemas.createBrowserSchema,
        wrapHandler(browserHandlers.createBrowser));

    tool('update-browser', buildMcpToolDescription('update-browser', 'Update the browser'), schemas.updateBrowserSchema,
        wrapHandler(browserHandlers.updateBrowser));

    tool('delete-browser', buildMcpToolDescription('delete-browser', 'Delete the browser'), schemas.deleteBrowserSchema,
        wrapHandler(browserHandlers.deleteBrowser));

    tool('get-browser-list', buildMcpToolDescription('get-browser-list', 'Get the list of browsers'), schemas.getBrowserListSchema,
        wrapHandler(browserHandlers.getBrowserList));

    tool('get-opened-browser', buildMcpToolDescription('get-opened-browser', 'Get the list of opened browsers'), schemas.emptySchema,
        wrapHandler(browserHandlers.getOpenedBrowser));

    tool('move-browser', buildMcpToolDescription('move-browser', 'Move browsers to a group'), schemas.moveBrowserSchema,
        wrapHandler(browserHandlers.moveBrowser));

    tool('get-profile-cookies', buildMcpToolDescription('get-profile-cookies', 'Query and return cookies of the specified profile. Only one profile can be queried per request.'), schemas.getProfileCookiesSchema,
        wrapHandler(browserHandlers.getProfileCookies));

    tool('get-profile-ua', buildMcpToolDescription('get-profile-ua', 'Query and return the User-Agent of specified profiles. Up to 10 profiles can be queried per request.'), schemas.getProfileUaSchema,
        wrapHandler(browserHandlers.getProfileUa));

    tool('close-all-profiles', buildMcpToolDescription('close-all-profiles', 'Close all opened profiles on the current device'), schemas.closeAllProfilesSchema,
        wrapHandler(browserHandlers.closeAllProfiles));

    tool('new-fingerprint', buildMcpToolDescription('new-fingerprint', 'Generate a new fingerprint for specified profiles. Up to 10 profiles are supported per request.'), schemas.newFingerprintSchema,
        wrapHandler(browserHandlers.newFingerprint));

    tool('delete-cache-v2', buildMcpToolDescription('delete-cache-v2', 'Clear local cache of specific profiles.For account security, please ensure that there are no open browsers on the device when using this interface.'), schemas.deleteCacheV2Schema,
        wrapHandler(browserHandlers.deleteCacheV2));

    tool('share-profile', buildMcpToolDescription('share-profile', 'Share profiles via account email or phone number. The maximum number of profiles that can be shared at one time is 200.'), schemas.shareProfileSchema,
        wrapHandler(browserHandlers.shareProfile));

    tool('get-browser-active', buildMcpToolDescription('get-browser-active', 'Get active browser profile information'), schemas.getBrowserActiveSchema,
        wrapHandler(browserHandlers.getBrowserActive));

    tool('get-cloud-active', buildMcpToolDescription('get-cloud-active', 'Query the status of browser profiles by user_ids, up to 100 profiles per request. If the team has enabled "Multi device mode," specific statuses cannot be retrieved and the response will indicate "Profile not opened."'), schemas.getCloudActiveSchema,
        wrapHandler(browserHandlers.getCloudActive));

    tool('create-group', buildMcpToolDescription('create-group', 'Create a browser group'), schemas.createGroupSchema,
        wrapHandler(groupHandlers.createGroup));

    tool('update-group', buildMcpToolDescription('update-group', 'Update the browser group'), schemas.updateGroupSchema,
        wrapHandler(groupHandlers.updateGroup));

    tool('get-group-list', buildMcpToolDescription('get-group-list', 'Get the list of groups'), schemas.getGroupListSchema,
        wrapHandler(groupHandlers.getGroupList));

    tool('check-status', buildMcpToolDescription('check-status', 'Check the availability of the current device API interface (Connection Status)'), schemas.emptySchema,
        wrapHandler(applicationHandlers.checkStatus));

    tool('get-application-list', buildMcpToolDescription('get-application-list', 'Get application categories with optional category_id filtering and page/limit pagination.'), schemas.getApplicationListSchema,
        wrapHandler(applicationHandlers.getApplicationList));

    tool('create-proxy', buildMcpToolDescription('create-proxy', 'Create a proxy'), schemas.createProxyMcpSchema,
        wrapHandler((params: { proxies: Parameters<typeof proxyHandlers.createProxy>[0] }) => proxyHandlers.createProxy(params.proxies)));

    tool('update-proxy', buildMcpToolDescription('update-proxy', 'Update the proxy'), schemas.updateProxySchema,
        wrapHandler(proxyHandlers.updateProxy));

    tool('get-proxy-list', buildMcpToolDescription('get-proxy-list', 'Get the list of proxies'), schemas.getProxyListSchema,
        wrapHandler(proxyHandlers.getProxyList));

    tool('delete-proxy', buildMcpToolDescription('delete-proxy', 'Delete the proxy'), schemas.deleteProxySchema,
        wrapHandler(proxyHandlers.deleteProxy));

    tool('get-tag-list', buildMcpToolDescription('get-tag-list', 'Get the list of browser tags'), schemas.getTagListSchema,
        wrapHandler(tagHandlers.getTagList));

    tool('create-tag', buildMcpToolDescription('create-tag', 'Create browser tags (batch supported)'), schemas.createTagSchema,
        wrapHandler(tagHandlers.createTag));

    tool('update-tag', buildMcpToolDescription('update-tag', 'Update browser tags (batch supported)'), schemas.updateTagSchema,
        wrapHandler(tagHandlers.updateTag));

    tool('delete-tag', buildMcpToolDescription('delete-tag', 'Delete browser tags'), schemas.deleteTagSchema,
        wrapHandler(tagHandlers.deleteTag));

    tool('download-kernel', buildMcpToolDescription('download-kernel', 'Download or update a browser kernel version'), schemas.downloadKernelSchema,
        wrapHandler(kernelHandlers.downloadKernel));

    tool('get-kernel-list', buildMcpToolDescription('get-kernel-list', 'Get browser kernel list by type or all'), schemas.getKernelListSchema,
        wrapHandler(kernelHandlers.getKernelList));

    tool('update-patch', buildMcpToolDescription('update-patch', 'Update AdsPower to latest patch version'), schemas.updatePatchSchema,
        wrapHandler(patchHandlers.updatePatch));

    tool('connect-browser-with-ws', buildMcpToolDescription('connect-browser-with-ws', 'Connect the browser with the ws url'), schemas.createAutomationSchema,
        wrapHandler(automationHandlers.connectBrowserWithWs));

    tool('open-new-page', buildMcpToolDescription('open-new-page', 'Open a new page'), schemas.emptySchema,
        wrapHandler(automationHandlers.openNewPage));

    tool('navigate', buildMcpToolDescription('navigate', 'Navigate to the url'), schemas.navigateSchema,
        wrapHandler(automationHandlers.navigate));

    tool('screenshot', buildMcpToolDescription('screenshot', 'Get the screenshot of the page'), schemas.screenshotSchema,
        wrapHandler(automationHandlers.screenshot));

    tool('get-page-visible-text', buildMcpToolDescription('get-page-visible-text', 'Get the visible text content of the page'), schemas.emptySchema,
        wrapHandler(automationHandlers.getPageVisibleText));

    tool('get-page-html', buildMcpToolDescription('get-page-html', 'Get the html content of the page'), schemas.emptySchema,
        wrapHandler(automationHandlers.getPageHtml));

    tool('click-element', buildMcpToolDescription('click-element', 'Click the element'), schemas.clickElementSchema,
        wrapHandler(automationHandlers.clickElement));

    tool('fill-input', buildMcpToolDescription('fill-input', 'Fill the input'), schemas.fillInputSchema,
        wrapHandler(automationHandlers.fillInput));

    tool('select-option', buildMcpToolDescription('select-option', 'Select the option'), schemas.selectOptionSchema,
        wrapHandler(automationHandlers.selectOption));

    tool('hover-element', buildMcpToolDescription('hover-element', 'Hover the element'), schemas.hoverElementSchema,
        wrapHandler(automationHandlers.hoverElement));

    tool('scroll-element', buildMcpToolDescription('scroll-element', 'Scroll the element'), schemas.scrollElementSchema,
        wrapHandler(automationHandlers.scrollElement));

    tool('press-key', buildMcpToolDescription('press-key', 'Press the key'), schemas.pressKeySchema,
        wrapHandler(automationHandlers.pressKey));

    tool('evaluate-script', buildMcpToolDescription('evaluate-script', 'Evaluate the script'), schemas.evaluateScriptSchema,
        wrapHandler(automationHandlers.evaluateScript));

    tool('drag-element', buildMcpToolDescription('drag-element', 'Drag the element'), schemas.dragElementSchema,
        wrapHandler(automationHandlers.dragElement));

    tool('iframe-click-element', buildMcpToolDescription('iframe-click-element', 'Click the element in the iframe'), schemas.iframeClickElementSchema,
        wrapHandler(automationHandlers.iframeClickElement));

    if ((server as McpServer & { server?: unknown }).server) {
        installZod4ToolHandlers(server, tools);
    }
}
