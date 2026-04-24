export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

/**
 * Poll until `fn` returns a truthy value or attempts are exhausted (final-consistency window).
 */
export async function pollUntil<T>(
    fn: () => Promise<T | undefined | null | false>,
    options: { maxAttempts: number; delayMs: number },
): Promise<T | undefined> {
    for (let i = 0; i < options.maxAttempts; i++) {
        const value = await fn();
        if (value !== undefined && value !== null && value !== false) {
            return value as T;
        }
        await sleep(options.delayMs);
    }
    return undefined;
}
