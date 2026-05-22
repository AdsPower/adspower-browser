import tab from '@bomb.sh/tab/commander';
import type { Command } from 'commander';

const CLI_BIN_ALIASES = ['ads', 'adspower', 'adspower-browser'] as const;

export function patchShellCompletionScript(shell: string, script: string): string {
    if (shell === 'zsh') {
        return script
            .replace(/^#compdef .+$/m, `#compdef ${CLI_BIN_ALIASES.join(' ')}`)
            .replace(/^compdef _ads ads$/m, `compdef _ads ${CLI_BIN_ALIASES.join(' ')}`);
    }

    if (shell === 'bash') {
        return script.replace(
            /^complete -F __ads_complete ads$/m,
            `complete -F __ads_complete ${CLI_BIN_ALIASES.join(' ')}`
        );
    }

    return script;
}

export function setupShellCompletion(program: Command): void {
    program.name('ads');
    tab(program);
}

export function isShellCompletionRequest(argv: string[] = process.argv): boolean {
    const completionIndex = argv.indexOf('complete');
    const dashDashIndex = argv.indexOf('--');
    return completionIndex !== -1 && dashDashIndex !== -1 && dashDashIndex > completionIndex;
}

export function wrapShellScriptOutput(shell: string | undefined): () => void {
    if (shell !== 'zsh' && shell !== 'bash') {
        return () => {};
    }

    const originalWrite = process.stdout.write.bind(process.stdout);

    process.stdout.write = ((chunk, encoding?, callback?) => {
        const text = typeof chunk === 'string'
            ? chunk
            : Buffer.from(chunk).toString(typeof encoding === 'string' ? encoding : 'utf8');
        const patched = patchShellCompletionScript(shell, text);

        if (typeof encoding === 'function') {
            return originalWrite(patched, encoding);
        }

        return originalWrite(
            patched,
            encoding as BufferEncoding | undefined,
            callback as ((err?: Error | null) => void) | undefined
        );
    }) as typeof process.stdout.write;

    return () => {
        process.stdout.write = originalWrite;
    };
}
