import { describe, expect, it } from 'vitest';
import ThemeUtils from './themeUtils';

const defaults = {
    variable: {
        prefix: 'p',
        selector: ':root,:host',
        excludedKeyRegex: /^(primitive|semantic|components|directives|variables|colorscheme|light|dark|common|root|states|extend|css)$/gi
    },
    options: { prefix: 'p', darkModeSelector: 'system', cssLayer: false }
};

const noopSet = { layerNames: () => {} };

function callGetCommon(theme: any) {
    return ThemeUtils.getCommon({ name: 'test', theme, params: undefined, set: noopSet, defaults });
}

function callGetPreset(preset: any, options: any = {}) {
    return ThemeUtils.getPreset({ name: 'button', preset, options, params: undefined, set: noopSet, defaults, selector: undefined });
}

describe('ThemeUtils.getCommon', () => {
    // Regression coverage for https://github.com/openng-org/optimus-ui/issues/1555:
    // getCommon used to destructure `semantic`/`extend`/`colorScheme` via chained,
    // rest-parameter destructuring assignments (`const { colorScheme, ...rest } = semantic || {}`)
    // spread across a single statement. Any of those inputs being missing or null must
    // never throw, regardless of how a downstream bundler transforms the statement.
    describe('does not throw when preset branches are null/undefined (#1555 regression)', () => {
        const primitive = { blue: { 500: '#3B82F6' } };

        it.each([
            ['semantic and extend both undefined', { primitive }],
            ['semantic and extend both null', { primitive, semantic: null, extend: null }],
            ['semantic present without colorScheme', { primitive, semantic: { primary: 'x' } }],
            ['extend present without colorScheme', { primitive, extend: { foo: 'bar' } }],
            ['colorScheme present without dark', { primitive, semantic: { colorScheme: { light: { s: 1 } } } }],
            ['extend.colorScheme present without dark', { primitive, extend: { colorScheme: { light: { s: 1 } } } }],
            ['semantic.colorScheme explicitly null', { primitive, semantic: { colorScheme: null } }],
            ['extend.colorScheme explicitly null', { primitive, extend: { colorScheme: null } }]
        ])('%s', (_label, preset) => {
            expect(() => callGetCommon({ preset, options: {} })).not.toThrow();
        });

        it('empty preset object', () => {
            expect(() => callGetCommon({ preset: {}, options: {} })).not.toThrow();
        });

        it('no preset at all', () => {
            expect(() => callGetCommon({ options: {} })).not.toThrow();
        });

        it('no theme at all (defaults to {})', () => {
            expect(() => callGetCommon(undefined)).not.toThrow();
        });
    });

    it('skips the transform branch entirely when options.transform is "strict"', () => {
        const result = callGetCommon({
            preset: { primitive: { a: 1 }, semantic: { x: 1 } },
            options: { transform: 'strict' }
        });

        expect(result.primitive.css).toBeUndefined();
        expect(result.semantic.css).toBeUndefined();
        expect(result.global.css).toBeUndefined();
        expect(result.style).toBeUndefined();
    });

    it('returns an all-undefined shape when preset is empty', () => {
        const result = callGetCommon({ preset: {}, options: {} });

        expect(result).toEqual({
            primitive: { css: undefined, tokens: undefined },
            semantic: { css: undefined, tokens: undefined },
            global: { css: undefined, tokens: undefined },
            style: undefined
        });
    });

    it('produces the expected primitive/semantic/global css and tokens for a full preset', () => {
        const result = callGetCommon({
            preset: {
                primitive: { blue: { 500: '#3B82F6' } },
                semantic: {
                    primary: { color: '{blue.500}' },
                    colorScheme: {
                        light: { surface: { 0: '#ffffff' } },
                        dark: { surface: { 0: '#000000' } }
                    }
                },
                extend: {
                    somekey: 'val',
                    colorScheme: {
                        light: { extra: 'e1' },
                        dark: { extra: 'e2' }
                    }
                },
                css: () => 'body{}'
            },
            options: {}
        });

        expect(result.primitive.css).toContain('--p-blue-500:#3B82F6');
        expect(result.primitive.tokens).toEqual(['blue.500']);

        expect(result.semantic.css).toContain('--p-primary-color:var(--p-blue-500)');
        expect(result.semantic.css).toContain('--p-surface-0:#ffffff');
        expect(result.semantic.css.indexOf('--p-surface-0:#ffffff')).toBeLessThan(result.semantic.css.indexOf('--p-primary-color:var(--p-blue-500)'));
        expect(result.semantic.css).toContain('@media (prefers-color-scheme: dark)');
        expect(result.semantic.css).toContain('--p-surface-0:#000000');
        expect(result.semantic.tokens).toEqual(expect.arrayContaining(['primary.color', 'surface.0']));

        expect(result.global.css).toContain('--p-somekey:val');
        expect(result.global.css).toContain('--p-extra:e1');
        expect(result.global.css.indexOf('--p-extra:e1')).toBeLessThan(result.global.css.indexOf('--p-somekey:val'));
        expect(result.global.css).toContain('color-scheme:light');
        expect(result.global.css).toContain('--p-extra:e2');
        expect(result.global.css).toContain('color-scheme:dark');
        expect(result.global.tokens).toEqual(expect.arrayContaining(['somekey', 'extra']));

        expect(result.style).toBe('body{}');
    });

    it('handles a preset with primitive only (no semantic/extend at all)', () => {
        const result = callGetCommon({ preset: { primitive: { blue: { 500: '#3B82F6' } } }, options: {} });

        expect(result.primitive.css).toContain('--p-blue-500:#3B82F6');
        expect(result.primitive.tokens).toEqual(['blue.500']);
        // No semantic/colorScheme tokens contributed since semantic/extend were absent.
        expect(result.semantic.tokens).toEqual([]);
        expect(result.global.tokens).toEqual([]);
    });
});

describe('ThemeUtils.getPreset', () => {
    // Same regression as getCommon: getPreset used a chained rest-destructure of
    // preset/extend/colorScheme, each guarded only by `|| {}`.
    describe('does not throw when preset branches are null/undefined (#1555 regression)', () => {
        it.each([
            ['minimal preset with no colorScheme/extend/css', { foo: 'bar' }],
            ['empty preset', {}],
            ['colorScheme null, extend undefined, css undefined', { colorScheme: null, extend: undefined, css: undefined, foo: 1 }],
            ['extend present without colorScheme', { extend: { other: 1 }, foo: 1 }],
            ['colorScheme present without dark', { colorScheme: { light: { s: 1 } }, foo: 1 }],
            ['extend.colorScheme present without dark', { extend: { colorScheme: { light: { s: 1 } } }, foo: 1 }]
        ])('%s', (_label, preset) => {
            expect(() => callGetPreset(preset)).not.toThrow();
        });

        it('preset is undefined (uses the {} default parameter)', () => {
            expect(() => callGetPreset(undefined)).not.toThrow();
        });
    });

    it('skips the transform branch entirely when options.transform is "strict"', () => {
        const result = callGetPreset({ foo: 'bar' }, { transform: 'strict' });

        expect(result.css).toBeUndefined();
        expect(result.tokens).toBeUndefined();
        expect(result.style).toBeUndefined();
    });

    it('returns an all-undefined shape when preset is empty', () => {
        const result = callGetPreset({});

        expect(result).toEqual({ css: undefined, tokens: undefined, style: undefined });
    });

    it('produces the expected css and tokens for a full component preset, merging extend', () => {
        const result = callGetPreset({
            colorScheme: { light: { bg: '1' }, dark: { bg: '2' } },
            extend: { colorScheme: { light: { x: '1' }, dark: { x: '2' } } },
            css: () => '.p-button{}',
            foo: 'bar'
        });

        expect(result.css).toContain('--p-button-foo:bar');
        expect(result.css).toContain('--p-button-x:1');
        expect(result.css.indexOf('--p-button-x:1')).toBeLessThan(result.css.indexOf('--p-button-foo:bar'));
        expect(result.css).toContain('@media (prefers-color-scheme: dark)');
        expect(result.css).toContain('--p-button-bg:2');
        expect(result.css).toContain('--p-button-x:2');
        expect(result.tokens).toEqual(expect.arrayContaining(['button.foo', 'button.x', 'button.bg']));

        expect(result.style).toBe('.p-button{}');
    });
});
