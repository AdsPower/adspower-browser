import { describe, expect, it } from 'vitest';
import { resolveStartApiKey } from '../src/startConfig';

describe('start command API key resolution', () => {
    it('falls back to ADS_API_KEY when --api-key is omitted', () => {
        const result = resolveStartApiKey(undefined, {
            ADS_API_KEY: 'env-key',
        });

        expect(result).toEqual({
            ok: true,
            apiKey: 'env-key',
        });
    });

    it('prefers --api-key over ADS_API_KEY', () => {
        const result = resolveStartApiKey('flag-key', {
            ADS_API_KEY: 'env-key',
        });

        expect(result).toEqual({
            ok: true,
            apiKey: 'flag-key',
        });
    });

    it('returns the current CLI error when no API key is available', () => {
        const result = resolveStartApiKey(undefined, {});

        expect(result).toEqual({
            ok: false,
            error: "error: required option '-k, --api-key <apiKey>' not specified",
        });
    });
});
