import { afterEach, describe, expect, it, vi } from 'vitest';
import { proxyHandlers } from '@adspower/local-api-core';
import { registerTools } from '../src/utils/toolRegister.js';

type RegisteredTool = {
    description: string;
    inputSchema: Record<string, unknown>;
    handler: unknown;
};

function captureRegisteredTools(): Record<string, RegisteredTool> {
    const registered: Record<string, RegisteredTool> = {};
    const fakeServer = {
        tool(name: string, description: string, inputSchema: Record<string, unknown>, handler: unknown) {
            registered[name] = { description, inputSchema, handler };
        }
    };

    registerTools(fakeServer as any);
    return registered;
}

afterEach(() => {
    vi.restoreAllMocks();
});

const localApiToolExpectations: Array<{ tool: string; mustInclude: string[] }> = [
    { tool: 'open-browser', mustInclude: ['profile_id', 'profile_no'] },
    { tool: 'close-browser', mustInclude: ['profile_id', 'profile_no'] },
    { tool: 'create-browser', mustInclude: ['group_id', 'category_id'] },
    { tool: 'update-browser', mustInclude: ['profile_id', 'launch_args'] },
    { tool: 'delete-browser', mustInclude: ['profile_id'] },
    { tool: 'get-browser-list', mustInclude: ['group_id', 'profile_id', 'profile_no', 'sort_type', 'sort_order'] },
    { tool: 'move-browser', mustInclude: ['user_ids', 'group_id'] },
    { tool: 'get-profile-cookies', mustInclude: ['profile_id'] },
    { tool: 'get-profile-ua', mustInclude: ['profile_id'] },
    { tool: 'new-fingerprint', mustInclude: ['profile_id'] },
    { tool: 'delete-cache-v2', mustInclude: ['profile_id', 'type'] },
    { tool: 'share-profile', mustInclude: ['profile_id', 'receiver', 'share_type'] },
    { tool: 'get-browser-active', mustInclude: ['profile_id'] },
    { tool: 'get-cloud-active', mustInclude: ['user_ids'] },
    { tool: 'create-group', mustInclude: ['group_name'] },
    { tool: 'update-group', mustInclude: ['group_id', 'group_name'] },
    { tool: 'get-group-list', mustInclude: ['group_name', 'page_size'] },
    { tool: 'get-application-list', mustInclude: ['category_id'] },
    { tool: 'create-proxy', mustInclude: ['proxies'] },
    { tool: 'update-proxy', mustInclude: ['proxy_id', 'proxy_url'] },
    { tool: 'get-proxy-list', mustInclude: ['proxy_id'] },
    { tool: 'delete-proxy', mustInclude: ['proxy_id'] },
];

describe('registerTools wires MCP input schemas with Postman external keys', () => {
    const registered = captureRegisteredTools();

    it('registers the expected Local API tools with callable handlers', () => {
        expect(registered['open-browser']?.handler).toBeTypeOf('function');
        expect(registered['get-application-list']?.handler).toBeTypeOf('function');
        expect(registered['update-proxy']?.handler).toBeTypeOf('function');
    });

    it.each(localApiToolExpectations)('$tool exposes Postman keys in the schema passed to McpServer.tool()', ({ tool, mustInclude }) => {
        const registration = registered[tool];
        expect(registration, `tool ${tool} should be registered by registerTools()`).toBeDefined();

        const keys = Object.keys(registration.inputSchema);
        for (const key of mustInclude) {
            expect(keys, `tool ${tool} must accept Postman key "${key}"`).toContain(key);
        }
    });

    it('describes get-application-list via buildMcpToolDescription (intent + Triggers)', () => {
        const desc = registered['get-application-list']?.description ?? '';
        expect(desc).toContain('Triggers');
        expect(desc).toMatch(/application|分页/);
    });

    it('describes open-browser with English and Chinese trigger phrases from metadata', () => {
        const desc = registered['open-browser']?.description ?? '';
        expect(desc).toMatch(/open browser|launch profile/i);
        expect(desc).toMatch(/打开浏览器|profile/);
    });

    it('describes get-browser-list with list/search semantics from metadata', () => {
        const desc = registered['get-browser-list']?.description ?? '';
        expect(desc).toMatch(/list|search/i);
        expect(desc).toMatch(/列表|查询|搜索/);
    });

    it('describes connect-browser-with-ws with ws / Playwright / automation from metadata', () => {
        const desc = registered['connect-browser-with-ws']?.description ?? '';
        expect(desc).toMatch(/ws|Playwright|automation/i);
        expect(desc).toMatch(/Playwright|自动化|ws/);
    });

    it('keeps create-proxy on the MCP compatibility wrapper until the SDK can expose root arrays safely', () => {
        const keys = Object.keys(registered['create-proxy']?.inputSchema ?? {});
        expect(keys).toContain('proxies');
        expect(keys).not.toContain('type');
        expect(keys).not.toContain('host');
    });

    it('unwraps the MCP compatibility wrapper before calling createProxy', async () => {
        const createProxy = vi.spyOn(proxyHandlers, 'createProxy').mockResolvedValue('ok');
        const payload = {
            proxies: [
                {
                    type: 'http',
                    host: '127.0.0.1',
                    port: '8080',
                },
            ],
        };

        await registered['create-proxy']?.handler(payload);

        expect(createProxy).toHaveBeenCalledWith(payload.proxies);
    });
});
