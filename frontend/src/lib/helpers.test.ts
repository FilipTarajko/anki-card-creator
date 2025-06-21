import { sanitize } from './helpers';
import { describe, it, expect } from 'vitest';

describe('sanitize', () => {
    it('doesn\'t break simple values', () => {
        expect(sanitize('some value')).toBe('some value');
    })

    it('handles value with semicolon(s)', () => {
        expect(sanitize('te;xt')).toBe('"te;xt"');
    })

    it('handles value with quote(s)', () => {
        expect(sanitize('te"xt')).toBe('"te&quot;xt"');
    })

    it('sanitizes field value surrounded with quotes', () => {
        expect(sanitize('"quoted text"')).toBe('"&quot;quoted text&quot;"');
    })

    it('sanitizes field value surrounded with semicolons', () => {
        expect(sanitize(';text with semis;')).toBe('";text with semis;"');
    })
})