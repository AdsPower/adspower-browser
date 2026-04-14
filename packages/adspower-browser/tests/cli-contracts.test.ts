import { describe, expect, it } from 'vitest';
import {
    resolveStatelessCommandArgs,
    SINGLE_PROFILE_ID_ARRAY_COMMANDS,
    SINGLE_PROFILE_ID_COMMANDS,
    STATELESS_HANDLERS
} from '../src/cli';

/**
 * CLI contract: shorthand expansion and SINGLE_PROFILE_ID_COMMANDS must use Postman external names
 * (profile_id, profile_no), matching JSON users would send to the Local API.
 */

describe('SINGLE_PROFILE_ID_COMMANDS targets profile_id for string-token shorthand', () => {
    it('documents shorthand-only commands separately from JSON-only commands', () => {
        expect(SINGLE_PROFILE_ID_COMMANDS).toEqual({
            'open-browser': 'profile_id',
            'close-browser': 'profile_id',
            'get-profile-cookies': 'profile_id',
            'get-browser-active': 'profile_id',
        });

        expect(SINGLE_PROFILE_ID_ARRAY_COMMANDS).toEqual(['get-profile-ua', 'new-fingerprint']);
    });

    it('maps each command to the Postman query/body key profile_id', () => {
        for (const [cmd, key] of Object.entries(SINGLE_PROFILE_ID_COMMANDS)) {
            expect(key, `command ${cmd} must use Postman key profile_id`).toBe('profile_id');
        }
    });
});

describe('CLI shorthand resolution uses Postman parameter names', () => {
    it('uses profile_id for non-numeric single token', () => {
        const result = resolveStatelessCommandArgs('open-browser', 'abc123');
        expect(result.ok).toBe(true);
        expect(result.ok && result.args, 'string shorthand should resolve to profile_id').toEqual({
            profile_id: 'abc123'
        });
    });

    it('uses profile_no string for numeric single token', () => {
        const result = resolveStatelessCommandArgs('open-browser', '123');
        expect(result.ok).toBe(true);
        expect(result.ok && result.args, 'numeric shorthand should resolve to profile_no string').toEqual({
            profile_no: '123'
        });
    });

    it('preserves numeric shorthand text when mapping to profile_no', () => {
        const result = resolveStatelessCommandArgs('open-browser', '00123');
        expect(result.ok).toBe(true);
        expect(result.ok && result.args, 'numeric shorthand should preserve the original profile_no text').toEqual({
            profile_no: '00123'
        });
    });

    it('array shorthand uses profile_id list for profile list commands', () => {
        const result = resolveStatelessCommandArgs('get-profile-ua', 'abc123');
        expect(result.ok).toBe(true);
        expect(result.ok && result.args, 'array shorthand should resolve to profile_id[]').toEqual({
            profile_id: ['abc123']
        });
    });

    it('array shorthand uses profile_no list for numeric token', () => {
        const result = resolveStatelessCommandArgs('get-profile-ua', '123');
        expect(result.ok).toBe(true);
        expect(result.ok && result.args, 'numeric array shorthand should resolve to profile_no[]').toEqual({
            profile_no: ['123']
        });
    });

    it('array shorthand preserves numeric text when mapping to profile_no list', () => {
        const result = resolveStatelessCommandArgs('new-fingerprint', '00123');
        expect(result.ok).toBe(true);
        expect(result.ok && result.args, 'numeric array shorthand should preserve profile_no text').toEqual({
            profile_no: ['00123']
        });
    });
});

describe('Local API commands remain registered for CLI', () => {
    it('open-browser CLI description includes Chinese intent from metadata (打开 or 环境)', () => {
        const desc = STATELESS_HANDLERS['open-browser'].description;
        expect(desc).toMatch(/打开|环境/);
    });

    it('includes handlers that the contract matrix tracks', () => {
        expect(STATELESS_HANDLERS['open-browser']).toBeDefined();
        expect(STATELESS_HANDLERS['update-proxy']).toBeDefined();
        expect(STATELESS_HANDLERS['get-proxy-list']).toBeDefined();
        expect(STATELESS_HANDLERS['delete-proxy']).toBeDefined();
        expect(STATELESS_HANDLERS['create-group']).toBeDefined();
        expect(STATELESS_HANDLERS['get-group-list']).toBeDefined();
    });

    it('array shorthand command list is stable', () => {
        expect([...SINGLE_PROFILE_ID_ARRAY_COMMANDS].sort()).toEqual([...['get-profile-ua', 'new-fingerprint']].sort());
    });
});
