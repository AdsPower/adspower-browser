import type { ResourceTracker } from './resourceTracker.js';

/**
 * Global/suite cleanup hook. Domain-specific delete logic is wired in later tasks.
 * Call at end of suite to attempt teardown of everything still in `tracker`.
 */
export async function runGlobalCleanup(_tracker: ResourceTracker): Promise<void> {
    // Intentionally empty until Task 5+ registers per-kind cleanup.
}
