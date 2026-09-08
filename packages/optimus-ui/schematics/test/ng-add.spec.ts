import { SchematicsException } from '@angular-devkit/schematics';
import { UnitTestTree } from '@angular-devkit/schematics/testing';
import { describe, expect, it } from 'vitest';
import { restoreSourceFiles, snapshotSourceFiles } from '../ng-add/index';
import { VERSIONS } from '../utils/mappings';
import { createAppTree, createRealAppTree, createRunner, DEFAULT_PKG } from './helpers';

function findFileContaining(tree: UnitTestTree, substring: string): string {
    const path = tree.files.find((file) => file.endsWith('.ts') && tree.readContent(file).includes(substring));
    if (!path) {
        throw new Error(`No file in the tree contains "${substring}". Files: ${tree.files.join(', ')}`);
    }
    return path;
}

describe('ng-add', () => {
    it('fresh standalone project (real CLI tree): adds the themes dependency and wires provideOptimus', async () => {
        const runner = createRunner();
        const appTree = await createRealAppTree(runner, { standalone: true });
        const result = await runner.runSchematic('ng-add', { skipInstall: true }, appTree);

        const pkg = JSON.parse(result.readContent('/package.json'));
        expect(pkg.dependencies['@openng/optimus-ui-themes']).toBe(VERSIONS['@openng/optimus-ui-themes']);

        const appConfigPath = findFileContaining(result, 'provideOptimus');
        expect(appConfigPath).toBe('/src/app/app.config.ts');
        const appConfig = result.readContent(appConfigPath);
        expect(appConfig).toContain(`import { provideOptimus } from '@openng/optimus-ui/config';`);
        expect(appConfig).toContain(`import Aura from '@openng/optimus-ui-themes/aura';`);
        expect(appConfig).toContain(`provideOptimus({ theme: { preset: Aura } })`);
    });

    it.each([
        ['Lara', 'lara'],
        ['Material', 'material'],
        ['Nora', 'nora']
    ] as const)('fresh standalone project with --theme %s: wires the chosen preset', async (theme, module) => {
        const runner = createRunner();
        const appTree = await createRealAppTree(runner, { standalone: true });
        const result = await runner.runSchematic('ng-add', { skipInstall: true, theme }, appTree);

        const appConfig = result.readContent('/src/app/app.config.ts');
        expect(appConfig).toContain(`import ${theme} from '@openng/optimus-ui-themes/${module}';`);
        expect(appConfig).toContain(`provideOptimus({ theme: { preset: ${theme} } })`);
        expect(appConfig).not.toContain('Aura');
    });

    it('fresh NgModule project (real CLI tree, standalone: false): wires provideOptimus into the AppModule providers', async () => {
        const runner = createRunner();
        const appTree = await createRealAppTree(runner, { standalone: false });
        const result = await runner.runSchematic('ng-add', { skipInstall: true }, appTree);

        const pkg = JSON.parse(result.readContent('/package.json'));
        expect(pkg.dependencies['@openng/optimus-ui-themes']).toBe(VERSIONS['@openng/optimus-ui-themes']);

        const modulePath = findFileContaining(result, 'provideOptimus');
        expect(modulePath).toBe('/src/app/app-module.ts');
        const moduleSource = result.readContent(modulePath);
        expect(moduleSource).toContain(`import { provideOptimus } from '@openng/optimus-ui/config';`);
        expect(moduleSource).toContain(`import Aura from '@openng/optimus-ui-themes/aura';`);
        expect(moduleSource).toMatch(/providers:\s*\[[\s\S]*provideOptimus\(\{ theme: \{ preset: Aura \} \}\)/);
    });

    it('nonexistent --project rejects with SchematicsException (real CLI tree)', async () => {
        const runner = createRunner();
        const appTree = await createRealAppTree(runner);
        await expect(runner.runSchematic('ng-add', { skipInstall: true, project: 'does-not-exist' }, appTree)).rejects.toThrow(SchematicsException);
    });

    it('re-running on an already-configured project (real CLI tree) logs an informational message and leaves the file untouched', async () => {
        const runner = createRunner();
        const appTree = await createRealAppTree(runner);
        const first = await runner.runSchematic('ng-add', { skipInstall: true }, appTree);

        const logs: string[] = [];
        runner.logger.subscribe((entry) => logs.push(entry.message));
        const second = await runner.runSchematic('ng-add', { skipInstall: true }, first);

        expect(logs.join('\n')).toContain('provideOptimus already configured in');
        expect(logs.join('\n')).not.toContain('Added provideOptimus');
        expect(second.readContent('/src/app/app.config.ts')).toBe(first.readContent('/src/app/app.config.ts'));
    });

    it('fresh project on a minimal hand-built tree (no build target): leaves files alone and logs instructions', async () => {
        // createAppTree's angular.json has no `architect`/`build` target, so addRootProvider can't
        // locate a main file — this exercises the degrade-to-manual-instructions path.
        const runner = createRunner();
        const tree = createAppTree();
        const logs: string[] = [];
        runner.logger.subscribe((entry) => logs.push(entry.message));

        const result = await runner.runSchematic('ng-add', { skipInstall: true }, tree);
        expect(logs.join('\n')).toContain('provideOptimus');
        expect(JSON.parse(result.readContent('/package.json')).dependencies['@openng/optimus-ui-themes']).toBe(VERSIONS['@openng/optimus-ui-themes']);
        expect(result.readContent('/src/app/app.config.ts')).not.toContain('provideOptimus');
    });

    it('primeng project: rejects with SchematicsException, points to migrate-from-primeng, and makes no changes (#1447)', async () => {
        const runner = createRunner();
        const appConfig = `import { providePrimeNG } from 'primeng/config';\nexport const appConfig = { providers: [providePrimeNG()] };\n`;
        const pkgRaw = JSON.stringify({ ...DEFAULT_PKG, dependencies: { '@angular/core': '^21.0.0', primeng: '^21.0.2' } }, null, 2) + '\n';
        const tree = createAppTree({ '/src/app/app.config.ts': appConfig, '/package.json': pkgRaw });

        await expect(runner.runSchematic('ng-add', { skipInstall: true }, tree)).rejects.toThrow(SchematicsException);

        // A failed schematic never commits its tree, so the workspace is left exactly as it was.
        expect(tree.readContent('/package.json')).toBe(pkgRaw);
        expect(tree.readContent('/src/app/app.config.ts')).toBe(appConfig);
    });

    it('primeng project: the failure explains the state the CLI left behind (#1447)', async () => {
        const runner = createRunner();
        const tree = createAppTree({}, { ...DEFAULT_PKG, dependencies: { '@angular/core': '^21.0.0', primeng: '^21.0.2' } });

        const error = await runner.runSchematic('ng-add', { skipInstall: true }, tree).then(
            () => null,
            (err: Error) => err
        );

        expect(error).toBeInstanceOf(SchematicsException);
        expect(error!.message).toContain('primeng detected');
        expect(error!.message).toContain('no changes were made');
        expect(error!.message).toContain('ng generate @openng/optimus-ui@1:migrate-from-primeng');
        expect(error!.message).toContain('already added @openng/optimus-ui to your dependencies');
    });

    it('primeng project with a nonexistent --project: reports the bad project name, not the primeng bail (#1447)', async () => {
        const runner = createRunner();
        const tree = createAppTree({}, { ...DEFAULT_PKG, dependencies: { '@angular/core': '^21.0.0', primeng: '^21.0.2' } });

        await expect(runner.runSchematic('ng-add', { skipInstall: true, project: 'does-not-exist' }, tree)).rejects.toThrow('Project "does-not-exist" was not found in the workspace.');
    });

    it('schedules an install task unless skipInstall is set', async () => {
        const runner = createRunner();
        await runner.runSchematic('ng-add', {}, createAppTree());
        expect(runner.tasks.some((t) => t.name === 'node-package')).toBe(true);
    });

    it('primeng project: schedules no install task', async () => {
        const runner = createRunner();
        const tree = createAppTree({}, { ...DEFAULT_PKG, dependencies: { '@angular/core': '^21.0.0', primeng: '^21.0.2' } });
        await expect(runner.runSchematic('ng-add', {}, tree)).rejects.toThrow(SchematicsException);
        expect(runner.tasks.some((t) => t.name === 'node-package')).toBe(false);
    });

    it('primeng only in a workspace sub-package: still rejects and makes no changes', async () => {
        const runner = createRunner();
        const libPkgRaw = JSON.stringify({ name: 'app-lib', dependencies: { primeng: '^21.0.2' } }, null, 2) + '\n';
        const tree = createAppTree({ '/libs/app/package.json': libPkgRaw });

        await expect(runner.runSchematic('ng-add', { skipInstall: true }, tree)).rejects.toThrow('primeng detected');

        expect(tree.readContent('/libs/app/package.json')).toBe(libPkgRaw);
        expect(JSON.parse(tree.readContent('/package.json')).dependencies?.['@openng/optimus-ui-themes']).toBeUndefined();
    });

    it('primeng declared only in peerDependencies: still rejects and makes no changes (#1448)', async () => {
        const runner = createRunner();
        const appConfig = `import { providePrimeNG } from 'primeng/config';\nexport const appConfig = { providers: [providePrimeNG()] };\n`;
        const tree = createAppTree({ '/src/app/app.config.ts': appConfig }, { ...DEFAULT_PKG, peerDependencies: { primeng: '^21.0.0' } });

        await expect(runner.runSchematic('ng-add', { skipInstall: true }, tree)).rejects.toThrow('primeng detected');

        const pkg = JSON.parse(tree.readContent('/package.json'));
        expect(pkg.peerDependencies.primeng).toBe('^21.0.0');
        expect(pkg.dependencies['@openng/optimus-ui-themes']).toBeUndefined();
        expect(tree.readContent('/src/app/app.config.ts')).toBe(appConfig);
    });

    it.each([
        ['optionalDependencies', { optionalDependencies: { primeng: '^21.0.0' } }],
        ['resolutions', { resolutions: { '**/primeng': '21.0.2' } }],
        ['overrides', { overrides: { primeng: '21.0.2' } }],
        ['pnpm.overrides', { pnpm: { overrides: { primeng: '21.0.2' } } }]
    ] as const)('primeng declared only in %s: still rejects and makes no changes (#1448)', async (_section, extra) => {
        const runner = createRunner();
        const tree = createAppTree({}, { ...DEFAULT_PKG, ...extra });

        await expect(runner.runSchematic('ng-add', { skipInstall: true }, tree)).rejects.toThrow('primeng detected');

        expect(JSON.parse(tree.readContent('/package.json')).dependencies['@openng/optimus-ui-themes']).toBeUndefined();
    });

    it('pre-existing Aura binding (real CLI tree): imports the preset under an alias and retargets the provider call (#1448)', async () => {
        const runner = createRunner();
        const appTree = await createRealAppTree(runner, { standalone: true });
        appTree.overwrite('/src/app/app.config.ts', `import Aura from './my-aura-theme';\n` + appTree.readContent('/src/app/app.config.ts'));
        const logs: string[] = [];
        runner.logger.subscribe((entry) => logs.push(entry.message));

        const result = await runner.runSchematic('ng-add', { skipInstall: true }, appTree);

        const appConfig = result.readContent('/src/app/app.config.ts');
        expect(appConfig).toContain(`import Aura from './my-aura-theme';`);
        expect(appConfig).toContain(`import OptimusAura from '@openng/optimus-ui-themes/aura';`);
        expect(appConfig).toContain(`provideOptimus({ theme: { preset: OptimusAura } })`);
        expect(appConfig).not.toContain(`import Aura from '@openng/optimus-ui-themes/aura';`);
        expect(appConfig).not.toContain(`preset: Aura `);
        expect(logs.join('\n')).toContain('bound as OptimusAura');
    });

    it('pre-existing legacy @primeuix Aura import (real CLI tree): retargets it in place — no alias, no duplicate (#1448)', async () => {
        const runner = createRunner();
        const appTree = await createRealAppTree(runner, { standalone: true });
        appTree.overwrite('/src/app/app.config.ts', `import Aura from '@primeuix/themes/aura';\n` + appTree.readContent('/src/app/app.config.ts'));

        const result = await runner.runSchematic('ng-add', { skipInstall: true }, appTree);

        const appConfig = result.readContent('/src/app/app.config.ts');
        expect(appConfig).toContain(`import Aura from '@openng/optimus-ui-themes/aura';`);
        expect(appConfig).toContain(`provideOptimus({ theme: { preset: Aura } })`);
        expect(appConfig).not.toContain('@primeuix');
        expect(appConfig).not.toContain('OptimusAura');
        expect(appConfig.match(/import Aura /g)).toHaveLength(1);
    });

    it('live PrimeNG app that slipped detection (providePrimeNG in sources, no primeng in package.json): skips wiring, keeps the legacy import, and warns (#1448)', async () => {
        // Simulates the detection gaps from #1448 (primeng installed but undeclared, or declared
        // in a package.json the detection can't see): hasPrimeng returns false, freshSetup runs,
        // but the app still has a live providePrimeNG({ theme: { preset: Aura } }) call. The
        // legacy `@primeuix/themes/aura` import must NOT be retargeted in place — that would
        // silently hand providePrimeNG an Optimus preset without a compile error.
        const runner = createRunner();
        const appTree = await createRealAppTree(runner, { standalone: true });
        const primengConfig =
            `import Aura from '@primeuix/themes/aura';\n` + `import { providePrimeNG } from 'primeng/config';\n` + appTree.readContent('/src/app/app.config.ts').replace('providers: [', 'providers: [providePrimeNG({ theme: { preset: Aura } }), ');
        expect(primengConfig).toContain('providePrimeNG({ theme: { preset: Aura } })');
        appTree.overwrite('/src/app/app.config.ts', primengConfig);
        const logs: string[] = [];
        runner.logger.subscribe((entry) => logs.push(entry.message));

        const result = await runner.runSchematic('ng-add', { skipInstall: true }, appTree);

        expect(result.readContent('/src/app/app.config.ts')).toBe(primengConfig);
        const log = logs.join('\n');
        expect(log).toContain('Found a providePrimeNG call in /src/app/app.config.ts');
        expect(log).toContain('ng generate @openng/optimus-ui@1:migrate-from-primeng');
        expect(log).toContain('provideOptimus({ theme: { preset: Aura } })');
        expect(log).not.toContain('Added provideOptimus');
    });

    it('providePrimeNG in a different source file than the one addRootProvider would wire: still skips wiring (#1448)', async () => {
        const runner = createRunner();
        const appTree = await createRealAppTree(runner, { standalone: true });
        const before = appTree.readContent('/src/app/app.config.ts');
        appTree.create('/src/app/primeng.providers.ts', `import { providePrimeNG } from 'primeng/config';\nexport const primeng = providePrimeNG();\n`);
        const logs: string[] = [];
        runner.logger.subscribe((entry) => logs.push(entry.message));

        const result = await runner.runSchematic('ng-add', { skipInstall: true }, appTree);

        expect(result.readContent('/src/app/app.config.ts')).toBe(before);
        expect(logs.join('\n')).toContain('Found a providePrimeNG call in /src/app/primeng.providers.ts');
    });
});

describe('wiring rollback (snapshotSourceFiles/restoreSourceFiles)', () => {
    it('restores modified source files and leaves untouched ones alone', () => {
        const tree = createAppTree({ '/src/other.ts': 'export const untouched = true;\n' });
        const before = tree.readContent('/src/app/app.config.ts');
        const snapshot = snapshotSourceFiles(tree, 'src');

        tree.overwrite('/src/app/app.config.ts', `${before}providers.push(provideOptimus({ theme: { preset: Aura } }));\n`);
        restoreSourceFiles(tree, snapshot);

        expect(tree.readContent('/src/app/app.config.ts')).toBe(before);
        expect(tree.readContent('/src/other.ts')).toBe('export const untouched = true;\n');
    });

    it('only snapshots .ts files under the source root', () => {
        const tree = createAppTree({ '/README.md': 'docs', '/tools/script.ts': 'export {};\n' });
        const snapshot = snapshotSourceFiles(tree, 'src');
        expect([...snapshot.keys()].every((path) => path.startsWith('/src/') && path.endsWith('.ts'))).toBe(true);
        expect(snapshot.has('/src/app/app.config.ts')).toBe(true);
    });
});
