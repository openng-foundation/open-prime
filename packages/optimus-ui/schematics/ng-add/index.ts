import { Rule, SchematicContext, SchematicsException, Tree } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { addRootProvider, readWorkspace } from '@schematics/angular/utility';
import { isObservable, lastValueFrom } from 'rxjs';
import { addDefaultImport } from '../utils/app-config';
import { VERSIONS } from '../utils/mappings';
import { hasPrimeng, SKIP_DIRS } from '../utils/package-json';
import { Schema, Theme } from './schema';

const THEMES_PACKAGE = '@openng/optimus-ui-themes';
const DEFAULT_THEME: Theme = 'Aura';
const MIGRATE_COMMAND = 'ng generate @openng/optimus-ui@1:migrate-from-primeng';

function projectNotFound(name: string): string {
    return `Project "${name}" was not found in the workspace.`;
}

/**
 * Why ng-add refuses a PrimeNG workspace, and what the user is left holding. The Angular CLI has
 * already installed `@openng/optimus-ui` and written it into `dependencies` by the time the
 * factory runs (`ng-add.save` is `"dependencies"`, and the CLI only cleans the entry up when
 * `save` is `false`), so the message has to account for it rather than pretend nothing happened.
 */
function primengBailMessage(): string {
    return `primeng detected — ng add only sets up Optimus UI in new projects, so no changes were made and the theme preset was not configured.
To migrate this workspace, run: ${MIGRATE_COMMAND}
The Angular CLI has already added @openng/optimus-ui to your dependencies. The migration schematic needs it there, so keep it — or remove it with your package manager if you did not mean to add Optimus UI to this workspace.`;
}

/** The preset import name and its subpath module for the chosen theme (e.g. `Aura` → `@openng/optimus-ui-themes/aura`). */
function themeImport(theme: Theme): { preset: string; module: string } {
    return { preset: theme, module: `${THEMES_PACKAGE}/${theme.toLowerCase()}` };
}

function manualSteps(theme: Theme): string {
    const { preset, module } = themeImport(theme);
    return `  1. import { provideOptimus } from '@openng/optimus-ui/config';
  2. import ${preset} from '${module}';
  3. add provideOptimus({ theme: { preset: ${preset} } }) to your root providers
     (bootstrapApplication providers, or an NgModule's providers array).`;
}

function manualInstructions(theme: Theme): string {
    return `Could not find a providers array to update automatically. Finish the setup manually:\n${manualSteps(theme)}`;
}

/**
 * Sets up Optimus UI in a fresh (non-PrimeNG) project. Migrating an existing PrimeNG workspace is
 * a separate concern handled by the `migrate-from-primeng` schematic
 * (`ng generate @openng/optimus-ui@1:migrate-from-primeng`) — when primeng is detected, ng-add
 * makes no changes and throws, so the CLI reports the refusal as a failure (#1447). A warning was
 * not enough: the command exited 0 after asking for a theme preset it then discarded, which reads
 * as a successful setup, and the freshly-installed dependency in package.json reinforces that.
 */
export function ngAdd(options: Schema): Rule {
    return async (tree: Tree) => {
        if (!tree.read('/package.json')) {
            throw new SchematicsException('Could not read /package.json.');
        }
        // Before the primeng bail, so a mistyped --project reports the typo rather than being
        // masked by whichever check happens to run first (#1447).
        await assertProjectExists(tree, options);
        if (hasPrimeng(tree)) {
            throw new SchematicsException(primengBailMessage());
        }
        return freshSetup(options);
    };
}

/**
 * Hard-errors when an explicit `--project` names a project the workspace does not have. Anything
 * else unexpected about the workspace (missing or unreadable angular.json, …) is left to
 * `wireProvideOptimus`, which degrades to manual instructions rather than aborting.
 */
async function assertProjectExists(tree: Tree, options: Schema): Promise<void> {
    if (!options.project) {
        return;
    }
    try {
        const workspace = await readWorkspace(tree);
        if (!workspace.projects.has(options.project)) {
            throw new SchematicsException(projectNotFound(options.project));
        }
    } catch (err) {
        if (err instanceof SchematicsException) {
            throw err;
        }
        // Unreadable or missing angular.json — not this check's business.
    }
}

function freshSetup(options: Schema): Rule {
    return async (tree: Tree, context: SchematicContext) => {
        addThemesDependency(tree);
        await wireProvideOptimus(tree, context, options);

        if (!options.skipInstall) {
            context.addTask(new NodePackageInstallTask());
        }
        return tree;
    };
}

function addThemesDependency(tree: Tree): void {
    const pkgBuffer = tree.read('/package.json');
    if (!pkgBuffer) {
        throw new SchematicsException('Could not read /package.json.');
    }
    const raw = pkgBuffer.toString();
    const pkg = JSON.parse(raw);
    pkg.dependencies = pkg.dependencies ?? {};
    if (!pkg.dependencies[THEMES_PACKAGE]) {
        pkg.dependencies[THEMES_PACKAGE] = VERSIONS[THEMES_PACKAGE];
        const indent = raw.match(/^\{\r?\n(\s+)/)?.[1] ?? '    ';
        tree.overwrite('/package.json', JSON.stringify(pkg, null, indent) + '\n');
    }
}

/**
 * Resolves the target project and wires `provideOptimus` into its root providers via the
 * official `addRootProvider` utility (handles both standalone `app.config.ts` and NgModule
 * apps). An explicit but nonexistent `--project` is a hard error; anything else unexpected about
 * the app's shape (no application project, no `build` target, an app.config.ts/main.ts that
 * addRootProvider can't statically analyze, …) degrades to the manual-instructions warning
 * rather than aborting the rest of ng-add. Whenever wiring degrades after addRootProvider has
 * already edited the tree, those edits are rolled back first so the user never inherits a
 * half-wired provideOptimus call (e.g. one referencing a conflicting `Aura` binding).
 */
async function wireProvideOptimus(tree: Tree, context: SchematicContext, options: Schema): Promise<void> {
    const theme = options.theme ?? DEFAULT_THEME;
    const { preset, module } = themeImport(theme);
    const instructions = manualInstructions(theme);

    let projectName: string;
    let sourceRoot: string;
    try {
        const workspace = await readWorkspace(tree);

        if (options.project) {
            if (!workspace.projects.has(options.project)) {
                throw new SchematicsException(projectNotFound(options.project));
            }
            projectName = options.project;
        } else {
            const application = [...workspace.projects].find(([, project]) => project.extensions['projectType'] === 'application');
            if (!application) {
                context.logger.warn(instructions);
                return;
            }
            projectName = application[0];
        }

        const project = workspace.projects.get(projectName)!;
        sourceRoot = project.sourceRoot ?? (project.root ? `${project.root}/src` : 'src');
    } catch (err) {
        // An explicitly-requested project that doesn't exist is a hard error — everything else
        // (missing angular.json, no application project, …) degrades to manual instructions.
        if (err instanceof SchematicsException && options.project) {
            throw err;
        }
        context.logger.warn(instructions);
        return;
    }

    if (findProvideOptimusFile(tree, sourceRoot)) {
        context.logger.info(`provideOptimus already configured in ${projectName}.`);
        return;
    }

    // A providePrimeNG call in the sources means this is a live PrimeNG app that slipped past the
    // package.json detection in ngAdd (#1448: primeng installed but undeclared, or declared only
    // in a package.json the detection can't see). Wiring anyway would retarget a legacy
    // `@primeuix/themes/*` import in place and silently hand providePrimeNG an Optimus preset —
    // it compiles, so nothing would surface the breakage. Skip the automatic wiring instead.
    const primengFile = findSourceFileContaining(tree, sourceRoot, 'providePrimeNG(');
    if (primengFile) {
        context.logger.warn(`Found a providePrimeNG call in ${primengFile} — this workspace still uses PrimeNG, so provideOptimus was not wired automatically.
To migrate this workspace, run: ${MIGRATE_COMMAND}
Or finish the setup manually:
${manualSteps(theme)}`);
        return;
    }

    // addRootProvider edits the tree before we can validate the result, so keep a snapshot of the
    // source files to roll those edits back if wiring has to degrade to manual instructions.
    const snapshot = snapshotSourceFiles(tree, sourceRoot);
    try {
        const rule = addRootProvider(projectName, ({ code, external }) => code`${external('provideOptimus', '@openng/optimus-ui/config')}({ theme: { preset: ${preset} } })`);
        await applyRule(rule, tree, context);

        const wiredFile = findProvideOptimusFile(tree, sourceRoot);
        if (!wiredFile) {
            restoreSourceFiles(tree, snapshot);
            context.logger.warn(instructions);
            return;
        }

        // `external()` only emits named imports, and `@openng/optimus-ui-themes/aura` only has a
        // default export — add it ourselves.
        const original = tree.read(wiredFile)!.toString();
        const imported = addDefaultImport(original, preset, module);
        let updated = imported.text;
        if (imported.bindingName !== preset) {
            // The preset name is already taken in this file (e.g. `Aura` imported from another
            // theme package), so the import went in under a different binding — retarget the
            // `preset:` reference in the provider call addRootProvider just inserted. `external()`
            // may itself have aliased the provideOptimus binding (provideOptimus_1, …), hence `\w*`.
            const providerCall = new RegExp(`(provideOptimus\\w*\\(\\{\\s*theme:\\s*\\{\\s*preset:\\s*)${preset}(\\s*\\}\\s*\\}\\s*\\))`);
            if (!providerCall.test(updated)) {
                // Never leave the inserted call referencing the conflicting binding — undo the
                // wiring so the manual instructions start from an untouched file.
                restoreSourceFiles(tree, snapshot);
                context.logger.warn(instructions);
                return;
            }
            updated = updated.replace(providerCall, `$1${imported.bindingName}$2`);
        }
        if (updated !== original) {
            tree.overwrite(wiredFile, updated);
        }
        const bindingNote = imported.bindingName === preset ? '' : ` (bound as ${imported.bindingName})`;
        context.logger.info(`Added provideOptimus with the ${preset} preset to ${wiredFile}${bindingNote}.`);
    } catch {
        restoreSourceFiles(tree, snapshot);
        context.logger.warn(instructions);
    }
}

/**
 * Content of every `.ts` file under `sourceRoot` (skipping node_modules/dist/…) before wiring —
 * the scope addRootProvider edits and findProvideOptimusFile searches. Exported for testing.
 */
export function snapshotSourceFiles(tree: Tree, sourceRoot: string): Map<string, string> {
    const prefix = `/${sourceRoot}/`;
    const snapshot = new Map<string, string>();
    tree.visit((path, entry) => {
        if (SKIP_DIRS.test(path) || !path.startsWith(prefix) || !path.endsWith('.ts') || !entry) {
            return;
        }
        snapshot.set(path, entry.content.toString());
    });
    return snapshot;
}

/**
 * Restores every snapshotted file whose content has changed, undoing a partially-applied wiring.
 * Exported for testing.
 */
export function restoreSourceFiles(tree: Tree, snapshot: ReadonlyMap<string, string>): void {
    for (const [path, content] of snapshot) {
        if (tree.read(path)?.toString() !== content) {
            tree.overwrite(path, content);
        }
    }
}

/** Finds the first `.ts` file under `sourceRoot` (skipping node_modules/dist/…) whose content contains `needle`. */
function findSourceFileContaining(tree: Tree, sourceRoot: string, needle: string): string | null {
    const prefix = `/${sourceRoot}/`;
    let found: string | null = null;
    tree.visit((path) => {
        if (found || SKIP_DIRS.test(path) || !path.startsWith(prefix) || !path.endsWith('.ts')) {
            return;
        }
        if (tree.read(path)?.toString().includes(needle)) {
            found = path;
        }
    });
    return found;
}

/** Finds the first `.ts` file under `sourceRoot` (skipping node_modules/dist/…) containing a `provideOptimus(` call. */
function findProvideOptimusFile(tree: Tree, sourceRoot: string): string | null {
    return findSourceFileContaining(tree, sourceRoot, 'provideOptimus(');
}

/**
 * Fully resolves a Rule to completion (including the async/nested-Rule/Observable chains that
 * `@schematics/angular`'s standalone utilities return) so its effects — and any error it throws —
 * are observed synchronously by the caller, rather than deferred until the schematics engine gets
 * around to applying it.
 */
async function applyRule(rule: Rule, tree: Tree, context: SchematicContext): Promise<void> {
    let result: unknown = await rule(tree, context);
    while (typeof result === 'function') {
        result = await (result as Rule)(tree, context);
    }
    if (result !== undefined && isObservable(result)) {
        await lastValueFrom(result);
    }
}
