function isPlainObject(v: unknown): v is Record<string, unknown> {
    return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/**
 * Normalize values before comparison to reduce API shape noise.
 * - number/boolean => string
 * - string => trimmed string
 * - array/object => recursive normalization
 */
export function normalizeForCompare(v: unknown): unknown {
    if (typeof v === 'number' || typeof v === 'boolean') {
        return String(v);
    }
    if (typeof v === 'string') {
        return v.trim();
    }
    if (Array.isArray(v)) {
        return v.map((x) => normalizeForCompare(x));
    }
    if (!isPlainObject(v)) {
        return v;
    }
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(v).sort()) {
        out[key] = normalizeForCompare(v[key]);
    }
    return out;
}
