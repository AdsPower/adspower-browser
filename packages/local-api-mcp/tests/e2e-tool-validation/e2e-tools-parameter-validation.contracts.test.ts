import { describe, expect, it } from 'vitest';
import { readE2EEnv } from './config/env';
import { getOptionalFieldsFromSchema } from './config/schemaIntrospector';
import { toolMatrix } from './config/toolMatrix';
import { createMcpClient } from './runner/mcpClient';

describe('readE2EEnv', () => {
    it('missing required env should throw readable error', () => {
        expect(() =>
            readE2EEnv({
                ADSP_LOCAL_API_BASE_URL: '',
                ADSP_MCP_E2E_ENABLED: '1',
            } as NodeJS.ProcessEnv),
        ).toThrow(/ADSP_LOCAL_API_BASE_URL/);
    });
});

describe('mcpClient', () => {
    it('lists tools from stdio server', async () => {
        const client = await createMcpClient();
        const tools = await client.listTools();
        expect(tools.length).toBeGreaterThan(0);
        await client.close();
    });
});

describe('toolMatrix', () => {
    it('has exactly one matrix entry per registered MCP tool', async () => {
        const client = await createMcpClient();
        const tools = await client.listTools();
        const namesFromServer = tools.map((t) => t.name).sort();
        await client.close();

        for (const name of namesFromServer) {
            expect(toolMatrix[name], `missing matrix for ${name}`).toBeDefined();
        }

        const matrixKeys = Object.keys(toolMatrix).sort();
        expect(matrixKeys).toEqual(namesFromServer);
    });

    it('optionalAll matches full optional field set from Zod for each tool', () => {
        for (const [tool, entry] of Object.entries(toolMatrix)) {
            const optionalFromSchema = getOptionalFieldsFromSchema(tool);
            expect(new Set(entry.optionalAll)).toEqual(new Set(optionalFromSchema));
        }
    });
});
