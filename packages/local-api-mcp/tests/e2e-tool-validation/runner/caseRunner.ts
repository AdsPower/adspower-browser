export interface RunCaseDefinition {
    name: string;
    prepare: () => Promise<Record<string, unknown>>;
    invoke: (ctx: Record<string, unknown>) => Promise<unknown>;
    assertState: (
        result: unknown,
        ctx: Record<string, unknown>,
    ) => Promise<{ passed: boolean; details: string[] }>;
    cleanup: (ctx: Record<string, unknown>) => Promise<void>;
}

/**
 * Single case pipeline: prepare → invoke → assert → cleanup (cleanup always runs).
 */
export async function runCase(
    def: RunCaseDefinition,
): Promise<{ passed: boolean; details: string[] }> {
    const ctx = await def.prepare();
    try {
        const invokeResult = await def.invoke(ctx);
        return await def.assertState(invokeResult, ctx);
    } finally {
        await def.cleanup(ctx);
    }
}
