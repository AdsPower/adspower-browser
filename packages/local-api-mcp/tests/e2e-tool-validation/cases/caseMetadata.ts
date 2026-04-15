/**
 * Declares which MCP tool each case exercises and which optional parameters are
 * validated on success (for aggregation / missingOptional reporting).
 */
export type CaseMetadata = {
    /** Primary MCP tool name (kebab-case). */
    tool: string;
    /** Optional parameter names covered when the case passes. */
    optionalParamsOnSuccess: string[];
};

export const caseMetadata: Record<string, CaseMetadata> = {
    'group.create.basic': { tool: 'create-group', optionalParamsOnSuccess: [] },
    'group.create.withRemark': { tool: 'create-group', optionalParamsOnSuccess: ['remark'] },
    'proxy.create.list.delete': {
        tool: 'create-proxy',
        optionalParamsOnSuccess: [],
    },
    'browser.open.headless': { tool: 'open-browser', optionalParamsOnSuccess: ['headless'] },

    'application.list.query': {
        tool: 'get-application-list',
        optionalParamsOnSuccess: ['category_id', 'page', 'limit'],
    },
    'tag.list.query': {
        tool: 'get-tag-list',
        optionalParamsOnSuccess: ['ids', 'limit', 'page'],
    },
    'kernel.list.chrome': {
        tool: 'get-kernel-list',
        optionalParamsOnSuccess: ['kernel_type'],
    },
    'patch.update.stable': {
        tool: 'update-patch',
        optionalParamsOnSuccess: ['version_type'],
    },
    'automation.getOpened': { tool: 'get-opened-browser', optionalParamsOnSuccess: [] },
    'automation.checkStatus': { tool: 'check-status', optionalParamsOnSuccess: [] },
};
