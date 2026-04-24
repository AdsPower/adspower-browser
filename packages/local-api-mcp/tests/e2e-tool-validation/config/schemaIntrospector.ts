import { schemas } from '@adspower/local-api-core';
import type { z } from 'zod';

/**
 * Mirrors `getSchemaShape` in `packages/local-api-mcp/src/utils/toolRegister.ts`
 * so MCP input shapes match what we introspect here.
 */
export function getSchemaShape(schema: z.ZodTypeAny): Record<string, z.ZodTypeAny> {
    if ('shape' in schema && typeof schema.shape === 'object' && schema.shape !== null) {
        return schema.shape as Record<string, z.ZodTypeAny>;
    }

    if ('_def' in schema) {
        const def = (schema as { _def?: { schema?: z.ZodTypeAny } })._def;
        if (def && 'schema' in def && def.schema) {
            return getSchemaShape(def.schema);
        }
    }

    throw new Error(
        `Cannot extract shape from schema. Schema type: ${(schema as { _def?: { typeName?: string } })._def?.typeName || 'unknown'}`,
    );
}

/** Maps MCP tool name (kebab) to `schemas` export key on `@adspower/local-api-core`. */
export const toolNameToSchemaKey: Record<string, keyof typeof schemas> = {
    'open-browser': 'openBrowserSchema',
    'close-browser': 'closeBrowserSchema',
    'create-browser': 'createBrowserSchema',
    'update-browser': 'updateBrowserSchema',
    'delete-browser': 'deleteBrowserSchema',
    'get-browser-list': 'getBrowserListSchema',
    'get-opened-browser': 'emptySchema',
    'move-browser': 'moveBrowserSchema',
    'get-profile-cookies': 'getProfileCookiesSchema',
    'get-profile-ua': 'getProfileUaSchema',
    'close-all-profiles': 'closeAllProfilesSchema',
    'new-fingerprint': 'newFingerprintSchema',
    'delete-cache-v2': 'deleteCacheV2Schema',
    'share-profile': 'shareProfileSchema',
    'get-browser-active': 'getBrowserActiveSchema',
    'get-cloud-active': 'getCloudActiveSchema',
    'create-group': 'createGroupSchema',
    'update-group': 'updateGroupSchema',
    'get-group-list': 'getGroupListSchema',
    'check-status': 'emptySchema',
    'get-application-list': 'getApplicationListSchema',
    'create-proxy': 'createProxyMcpSchema',
    'update-proxy': 'updateProxySchema',
    'get-proxy-list': 'getProxyListSchema',
    'delete-proxy': 'deleteProxySchema',
    'get-tag-list': 'getTagListSchema',
    'create-tag': 'createTagSchema',
    'update-tag': 'updateTagSchema',
    'delete-tag': 'deleteTagSchema',
    'download-kernel': 'downloadKernelSchema',
    'get-kernel-list': 'getKernelListSchema',
    'update-patch': 'updatePatchSchema',
    'connect-browser-with-ws': 'createAutomationSchema',
    'open-new-page': 'emptySchema',
    'navigate': 'navigateSchema',
    'screenshot': 'screenshotSchema',
    'get-page-visible-text': 'emptySchema',
    'get-page-html': 'emptySchema',
    'click-element': 'clickElementSchema',
    'fill-input': 'fillInputSchema',
    'select-option': 'selectOptionSchema',
    'hover-element': 'hoverElementSchema',
    'scroll-element': 'scrollElementSchema',
    'press-key': 'pressKeySchema',
    'evaluate-script': 'evaluateScriptSchema',
    'drag-element': 'dragElementSchema',
    'iframe-click-element': 'iframeClickElementSchema',
};

export function getZodSchemaForTool(toolName: string): z.ZodTypeAny {
    const key = toolNameToSchemaKey[toolName];
    if (!key) {
        throw new Error(`Unknown MCP tool name for schema mapping: ${toolName}`);
    }
    return schemas[key] as z.ZodTypeAny;
}

/** All input keys that are optional at the Zod object level (`z.*.optional()`, defaults, etc.). */
export function getOptionalFieldsFromSchema(toolName: string): string[] {
    const schema = getZodSchemaForTool(toolName);
    const shape = getSchemaShape(schema);
    return Object.entries(shape)
        .filter(([, fieldSchema]) => fieldSchema.isOptional())
        .map(([name]) => name)
        .sort();
}
