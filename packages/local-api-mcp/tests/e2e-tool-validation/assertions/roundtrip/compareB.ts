import { compareCookieContains } from './cookieMatcher.js';
import { normalizeForCompare } from './normalizers.js';

export type CompareBStatus = 'passed' | 'failed' | 'skipped';

export type CompareBRow = {
    inputPath: string;
    actualPath: string;
    status: CompareBStatus;
    reason?: string;
    expected?: unknown;
    actual?: unknown;
};

export type CompareBResult = {
    rows: CompareBRow[];
    passed: number;
    failed: number;
    skipped: number;
};

export type CompareBMapping = {
    actualPath?: string;
    matcher?: 'cookie_contains';
};

function hasOwn(obj: unknown, key: string): boolean {
    return Object.prototype.hasOwnProperty.call(obj, key);
}

function getByPath(root: unknown, path: string): { found: boolean; value: unknown } {
    if (!path) {
        return { found: true, value: root };
    }
    const parts = path.split('.');
    let cur: unknown = root;
    for (const part of parts) {
        if (typeof cur !== 'object' || cur === null || !hasOwn(cur, part)) {
            return { found: false, value: undefined };
        }
        cur = (cur as Record<string, unknown>)[part];
    }
    return { found: true, value: cur };
}

function rowStatusCount(rows: CompareBRow[]): CompareBResult {
    return {
        rows,
        passed: rows.filter((r) => r.status === 'passed').length,
        failed: rows.filter((r) => r.status === 'failed').length,
        skipped: rows.filter((r) => r.status === 'skipped').length,
    };
}

/**
 * Rule B:
 * - path missing in readback => skipped
 * - path present but mismatch => failed
 * - path present and equal (after normalization) => passed
 */
export function compareInputAgainstReadbackB(
    input: Record<string, unknown>,
    readback: unknown,
    mapping: Record<string, CompareBMapping> = {},
): CompareBResult {
    const rows: CompareBRow[] = [];
    for (const inputPath of Object.keys(input)) {
        const map = mapping[inputPath];
        const actualPath = map?.actualPath ?? inputPath;
        const expected = input[inputPath];
        const actualNode = getByPath(readback, actualPath);
        if (!actualNode.found) {
            rows.push({
                inputPath,
                actualPath,
                status: 'skipped',
                reason: 'readback_path_missing',
                expected,
            });
            continue;
        }

        if (map?.matcher === 'cookie_contains') {
            const cookieRes = compareCookieContains(expected, actualNode.value);
            rows.push({
                inputPath,
                actualPath,
                status: cookieRes.status,
                reason: cookieRes.reason,
                expected,
                actual: actualNode.value,
            });
            continue;
        }

        const normalizedExpected = normalizeForCompare(expected);
        const normalizedActual = normalizeForCompare(actualNode.value);
        if (JSON.stringify(normalizedExpected) === JSON.stringify(normalizedActual)) {
            rows.push({
                inputPath,
                actualPath,
                status: 'passed',
                expected: normalizedExpected,
                actual: normalizedActual,
            });
        } else {
            rows.push({
                inputPath,
                actualPath,
                status: 'failed',
                reason: 'value_mismatch',
                expected: normalizedExpected,
                actual: normalizedActual,
            });
        }
    }
    return rowStatusCount(rows);
}
