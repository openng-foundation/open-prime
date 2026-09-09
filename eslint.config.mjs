import angular from '@angular-eslint/eslint-plugin';
import angularTemplate from '@angular-eslint/eslint-plugin-template';
import templateParser from '@angular-eslint/template-parser';
import js from '@eslint/js';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettierConfig from 'eslint-config-prettier';
import prettier from 'eslint-plugin-prettier';

const SCRIPTS = ['**/*.js', '**/*.mjs', '**/*.ts', '**/*.mts'];

export default defineConfig([
    // Flat config has no --ignore-path, so the build output and generated sources that
    // .gitignore keeps out of the repository have to be listed here as well.
    globalIgnores([
        // Bare names in .gitignore match at any depth, so these need the **/ prefix:
        // every package gets its own .angular cache and reports directory.
        '**/.angular/**',
        '**/.nx/**',
        '**/.vercel/**',
        '**/.vitest-attachments/**',
        '**/__screenshots__/**',
        '**/coverage/**',
        '**/dist/**',
        '**/reports/**',
        // Leading-slash entries in .gitignore, so root-anchored here too.
        'out-tsc/**',
        'tmp/**',
        // Generated sources.
        'apps/docs/doc/apidoc/**',
        'apps/docs/public/llms/**',
        'packages/optimus-ui/schematics/.esm-scope-fixture/**',
        'packages/optimus-ui-themes/tokens/**',
        'packages/optimus-ui-themes/umd/**'
    ]),
    {
        name: 'optimus-ui/base',
        files: SCRIPTS,
        extends: [prettierConfig],
        plugins: { prettier },
        rules: {
            'padding-line-between-statements': [
                'error',
                { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
                { blankLine: 'any', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var'] },
                { blankLine: 'any', prev: ['case', 'default'], next: 'break' },
                { blankLine: 'any', prev: 'case', next: 'case' },
                { blankLine: 'always', prev: '*', next: 'return' },
                { blankLine: 'always', prev: 'block', next: '*' },
                { blankLine: 'always', prev: '*', next: 'block' },
                { blankLine: 'always', prev: 'block-like', next: '*' },
                { blankLine: 'always', prev: '*', next: 'block-like' },
                { blankLine: 'always', prev: ['import'], next: ['const', 'let', 'var'] }
            ]
        }
    },
    {
        name: 'optimus-ui/javascript',
        files: ['**/*.js', '**/*.mjs'],
        languageOptions: {
            parserOptions: { allowImportExportEverywhere: true }
        }
    },
    {
        name: 'optimus-ui/typescript',
        files: ['**/*.ts', '**/*.mts'],
        extends: [js.configs.recommended, typescriptEslint.configs['flat/recommended'], prettierConfig],
        languageOptions: {
            parser: typescriptParser,
            sourceType: 'module'
        },
        // Lints the inline `template:` of a component as if it were an .html file, so the
        // optimus-ui/template rules below apply to it too.
        processor: angularTemplate.processors['extract-inline-html'],
        plugins: { '@angular-eslint': angular },
        rules: {
            // @angular-eslint recommended. The plugin ships rules only; the flat presets
            // live in the `angular-eslint` umbrella package, which this repository does
            // not depend on, so the set is spelled out here.
            '@angular-eslint/contextual-lifecycle': 'error',
            '@angular-eslint/no-empty-lifecycle-method': 'error',
            '@angular-eslint/no-input-rename': 'error',
            '@angular-eslint/no-inputs-metadata-property': 'error',
            '@angular-eslint/no-output-native': 'error',
            '@angular-eslint/no-output-rename': 'error',
            '@angular-eslint/no-outputs-metadata-property': 'error',
            '@angular-eslint/prefer-inject': 'error',
            '@angular-eslint/prefer-on-push-component-change-detection': 'error',
            '@angular-eslint/prefer-standalone': 'error',
            '@angular-eslint/use-lifecycle-interface': 'warn',
            '@angular-eslint/use-pipe-transform-interface': 'error',

            // Repository overrides.
            '@angular-eslint/component-selector': ['error', { type: 'element', prefix: 'p', style: 'kebab-case' }],
            '@angular-eslint/directive-selector': ['error', { type: 'attribute', prefix: 'p', style: 'camelCase' }],
            '@angular-eslint/component-class-suffix': ['error', { suffixes: [''] }],
            '@angular-eslint/no-output-on-prefix': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-inferrable-types': 'off',
            '@typescript-eslint/member-ordering': ['error', { default: ['public-static-field', 'static-field', 'instance-field', 'public-instance-method', 'public-static-field'] }],
            'arrow-body-style': ['error', 'as-needed'],
            curly: 'off',
            'no-console': 'off',
            'prefer-const': 'off'
        }
    },
    {
        name: 'optimus-ui/template',
        files: ['**/*.html'],
        languageOptions: { parser: templateParser },
        plugins: { '@angular-eslint/template': angularTemplate },
        rules: {
            // @angular-eslint/template recommended, with the repository's eqeqeq options.
            '@angular-eslint/template/banana-in-box': 'error',
            '@angular-eslint/template/eqeqeq': ['error', { allowNullOrUndefined: true }],
            '@angular-eslint/template/no-negated-async': 'error',
            '@angular-eslint/template/prefer-control-flow': 'error'
        }
    }
]);
