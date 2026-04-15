/** Unique label for groups/profiles/proxies to avoid collisions across runs. */
export function uniqueLabel(prefix: string): string {
    return `mcp-e2e-${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
