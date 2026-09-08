import { describe, expect, it } from 'vitest';
import { addDefaultImport } from './app-config';

describe('addDefaultImport', () => {
    it('inserts after the last import statement', () => {
        const input = `import { ApplicationConfig } from '@angular/core';\n` + `import { provideRouter } from '@angular/router';\n\n` + `export const appConfig: ApplicationConfig = {\n` + `    providers: [provideRouter([])]\n` + `};\n`;
        const { text, bindingName } = addDefaultImport(input, 'Aura', '@openng/optimus-ui-themes/aura');
        expect(bindingName).toBe('Aura');
        expect(text).toContain(`import Aura from '@openng/optimus-ui-themes/aura';`);
        // inserted after the last import, before the blank line / export statement
        const lines = text.split('\n');
        const auraIndex = lines.findIndex((line) => line.includes('Aura'));
        const routerIndex = lines.findIndex((line) => line.includes('provideRouter'));
        expect(auraIndex).toBeGreaterThan(routerIndex);
        expect(text).toContain(`export const appConfig`);
    });

    it('prepends the import when the file has no imports', () => {
        const input = `export const appConfig = {\n    providers: []\n};\n`;
        const { text, bindingName } = addDefaultImport(input, 'Aura', '@openng/optimus-ui-themes/aura');
        expect(bindingName).toBe('Aura');
        expect(text.startsWith(`import Aura from '@openng/optimus-ui-themes/aura';\n`)).toBe(true);
        expect(text).toContain(`export const appConfig`);
    });

    it('is idempotent when the default import is already present', () => {
        const input = `import Aura from '@openng/optimus-ui-themes/aura';\nexport const appConfig = { providers: [] };\n`;
        const { text, bindingName } = addDefaultImport(input, 'Aura', '@openng/optimus-ui-themes/aura');
        expect(text).toBe(input);
        expect(bindingName).toBe('Aura');
    });

    it('reuses an existing default import of the module under a different name', () => {
        const input = `import MyTheme from '@openng/optimus-ui-themes/aura';\nexport const appConfig = { providers: [] };\n`;
        const { text, bindingName } = addDefaultImport(input, 'Aura', '@openng/optimus-ui-themes/aura');
        expect(text).toBe(input);
        expect(bindingName).toBe('MyTheme');
    });

    it('retargets a default import of the legacy module in place instead of aliasing (#1448)', () => {
        const input = `import Aura from '@primeuix/themes/aura';\nexport const appConfig = { providers: [] };\n`;
        const { text, bindingName } = addDefaultImport(input, 'Aura', '@openng/optimus-ui-themes/aura');
        expect(bindingName).toBe('Aura');
        expect(text).toContain(`import Aura from '@openng/optimus-ui-themes/aura';`);
        expect(text).not.toContain('@primeuix');
        expect(text).not.toContain('OptimusAura');
    });

    it('retargets the legacy import keeping its binding name and quote style', () => {
        const input = `import MyAura from "@primeuix/themes/aura";\nexport const appConfig = { providers: [] };\n`;
        const { text, bindingName } = addDefaultImport(input, 'Aura', '@openng/optimus-ui-themes/aura');
        expect(bindingName).toBe('MyAura');
        expect(text).toContain(`import MyAura from "@openng/optimus-ui-themes/aura";`);
        expect(text).not.toContain('@primeuix');
    });

    it('aliases when the name is already default-imported from an unrelated module', () => {
        const input = `import Aura from 'some-other-package/aura';\nexport const appConfig = { providers: [] };\n`;
        const { text, bindingName } = addDefaultImport(input, 'Aura', '@openng/optimus-ui-themes/aura');
        expect(bindingName).toBe('OptimusAura');
        expect(text).toContain(`import OptimusAura from '@openng/optimus-ui-themes/aura';`);
        expect(text).toContain(`import Aura from 'some-other-package/aura';`);
        expect(text).not.toContain(`import Aura from '@openng/optimus-ui-themes/aura';`);
    });

    it('aliases when the name is taken by a named import or a top-level declaration', () => {
        const named = addDefaultImport(`import { Aura } from './themes';\nexport const appConfig = { providers: [] };\n`, 'Aura', '@openng/optimus-ui-themes/aura');
        expect(named.bindingName).toBe('OptimusAura');
        expect(named.text).toContain(`import OptimusAura from '@openng/optimus-ui-themes/aura';`);

        const declared = addDefaultImport(`const Aura = { primary: 'blue' };\nexport const appConfig = { providers: [] };\n`, 'Aura', '@openng/optimus-ui-themes/aura');
        expect(declared.bindingName).toBe('OptimusAura');
        expect(declared.text.startsWith(`import OptimusAura from '@openng/optimus-ui-themes/aura';\n`)).toBe(true);
    });

    it('falls back to a numbered alias when the aliased name is taken too', () => {
        const input = `import Aura from 'some-other-package/aura';\nimport { OptimusAura } from './custom';\nexport const appConfig = { providers: [] };\n`;
        const { text, bindingName } = addDefaultImport(input, 'Aura', '@openng/optimus-ui-themes/aura');
        expect(bindingName).toBe('OptimusAura2');
        expect(text).toContain(`import OptimusAura2 from '@openng/optimus-ui-themes/aura';`);
    });
});
