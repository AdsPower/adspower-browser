import { expect, it } from 'vitest';
import { rpaLocalTools, rpaRemoteTools } from '@adspower/local-api-core';
import { createMcpClient } from './e2e-tool-validation/runner/mcpClient';
import { getRequiredFieldsForTool, getZodSchemaForTool } from './e2e-tool-validation/config/schemaIntrospector';
import { toolMatrix } from './e2e-tool-validation/config/toolMatrix';
import { toolValidationStrategy } from './e2e-tool-validation/config/toolValidationStrategy';
import { listRegisteredCaseIds } from './e2e-tool-validation/cases/registry';
import { caseMetadata } from './e2e-tool-validation/cases/caseMetadata';

it('covers every RPA tool in the E2E configuration and conditional minimum input metadata', () => {
    for (const tool of [...rpaLocalTools, ...rpaRemoteTools]) {
        const name = `rpa-${tool.name}`;
        expect(getZodSchemaForTool(name)).toBe(tool.schema);
        expect(toolMatrix[name].requiredMin).toEqual(getRequiredFieldsForTool(name));
        expect(toolValidationStrategy[name]).toBeDefined();
        const caseId = `rpa.validation.${tool.name}.reject-unknown-field`;
        expect(listRegisteredCaseIds()).toContain(caseId);
        expect(caseMetadata[caseId]).toEqual({ tool: name, optionalParamsOnSuccess: [] });
    }
    expect(toolMatrix['rpa-cancel-task'].requiredMin).toContain('record_id');
    expect(toolMatrix['rpa-get-task-execute-items'].requiredMin).toContain('task_id');
});

it('lists and validates all 52 RPA tools over real MCP stdio without business execution', async () => {
    const client = await createMcpClient();
    try {
        const tools = await client.listTools();
        expect(tools.filter(tool => tool.name.startsWith('rpa-'))).toHaveLength(52);
        for (const tool of [...rpaLocalTools, ...rpaRemoteTools]) {
            const listed = tools.find(item => item.name === `rpa-${tool.name}`)!;
            expect(listed.inputSchema.required ?? []).toEqual(tool.schema.toJSONSchema({ io: 'input' }).required ?? []);
            await expect(client.callTool(`rpa-${tool.name}`, { __unsupported_rpa_field__: true }))
                .rejects.toThrow('__unsupported_rpa_field__');
        }
    } finally {
        await client.close();
    }
});
