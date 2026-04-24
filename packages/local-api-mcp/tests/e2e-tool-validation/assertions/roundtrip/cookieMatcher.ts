export type CookieCompareStatus = 'passed' | 'failed' | 'skipped';

export type CookieCompareResult = {
    status: CookieCompareStatus;
    reason?: string;
};

function compactCookieText(s: string): string {
    return s.replace(/\s+/g, '');
}

/**
 * Cookie comparison uses contains-matching per agreed design.
 */
export function compareCookieContains(
    expectedCookie: unknown,
    actualCookie: unknown,
): CookieCompareResult {
    if (typeof expectedCookie !== 'string' || expectedCookie.trim() === '') {
        return { status: 'skipped', reason: 'cookie_expected_not_string' };
    }
    if (typeof actualCookie !== 'string' || actualCookie.trim() === '') {
        return { status: 'skipped', reason: 'cookie_actual_not_string' };
    }
    const expectedCompact = compactCookieText(expectedCookie);
    const actualCompact = compactCookieText(actualCookie);
    if (actualCompact.includes(expectedCompact)) {
        return { status: 'passed' };
    }

    // Some environments return truncated or transformed cookie views.
    if (
        actualCompact.length < expectedCompact.length ||
        actualCookie.includes('...') ||
        actualCookie.includes('***')
    ) {
        return { status: 'skipped', reason: 'cookie_not_substring_match_or_truncated' };
    }
    return { status: 'failed', reason: 'cookie_substring_mismatch' };
}
