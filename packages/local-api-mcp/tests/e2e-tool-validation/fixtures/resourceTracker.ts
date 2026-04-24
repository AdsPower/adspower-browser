/**
 * Tracks created resource IDs per kind for suite teardown (Task 5+ will register handlers).
 */
export class ResourceTracker {
    private readonly byKind = new Map<string, Set<string>>();

    track(kind: string, id: string): void {
        if (!this.byKind.has(kind)) {
            this.byKind.set(kind, new Set());
        }
        this.byKind.get(kind)!.add(id);
    }

    untrack(kind: string, id: string): void {
        this.byKind.get(kind)?.delete(id);
    }

    idsFor(kind: string): string[] {
        return [...(this.byKind.get(kind) ?? [])];
    }

    kinds(): string[] {
        return [...this.byKind.keys()];
    }

    clear(): void {
        this.byKind.clear();
    }
}
