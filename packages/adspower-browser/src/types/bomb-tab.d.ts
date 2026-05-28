declare module '@bomb.sh/tab/commander' {
    import type { Command } from 'commander';

    export default function tab(instance: Command): unknown;
}
