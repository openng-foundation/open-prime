import { Tree } from '@angular-devkit/schematics';
import { MODULE_MAP, VERSIONS } from './mappings';
import { visitWorkspaceFiles } from './workspace-files';

export const SKIP_DIRS = /(^|\/)(node_modules|dist|\.angular|\.git|out-tsc)(\/|$)/;

// Sections where a package can be declared as a direct dependency of some kind.
const DIRECT_DEPENDENCY_SECTIONS = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'] as const;

export interface SwapResult {
    changed: boolean;
    added: string[];
    removed: string[];
}

export function swapDependencies(pkg: Record<string, any>): SwapResult {
    const result: SwapResult = { changed: false, added: [], removed: [] };
    for (const section of DIRECT_DEPENDENCY_SECTIONS) {
        const deps = pkg[section];
        if (!deps) {
            continue;
        }
        for (const [from, to] of MODULE_MAP) {
            if (!(from in deps)) {
                continue;
            }
            delete deps[from];
            deps[to] = VERSIONS[to];
            result.changed = true;
            result.removed.push(from);
            result.added.push(to);
        }
    }
    return result;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * True when an override-style key (yarn `resolutions`, npm `overrides`, `pnpm.overrides`) targets
 * `name`: an exact match (`primeng`), a version selector (`primeng@^20`), or the last segment of a
 * yarn resolutions path (`**\/primeng`, `some-pkg/primeng`).
 */
function overrideKeyTargets(key: string, name: string): boolean {
    if (key === name || key.startsWith(`${name}@`)) {
        return true;
    }
    if (!key.endsWith(`/${name}`)) {
        return false;
    }
    // Avoid false positives for scoped packages like "@scope/primeng" when matching an unscoped name.
    if (!name.includes('/')) {
        const prevSegment = key.slice(0, -`/${name}`.length).split('/').pop() ?? '';
        if (prevSegment.startsWith('@')) {
            return false;
        }
    }
    return true;
}

/**
 * True when an override-style section declares `name` at any depth (npm `overrides` nest child
 * overrides as objects, e.g. `{ "some-pkg": { "primeng": "…" } }`).
 */
function overridesDeclare(section: unknown, name: string): boolean {
    if (!isRecord(section)) {
        return false;
    }
    return Object.entries(section).some(([key, value]) => overrideKeyTargets(key, name) || overridesDeclare(value, name));
}

/**
 * Collects into `out` every version spec an override-style section declares for `name`, descending
 * into npm's nested override objects (where the package's own version may sit under a `"."` key).
 */
function collectOverrideRanges(section: unknown, name: string, out: string[]): void {
    if (!isRecord(section)) {
        return;
    }
    for (const [key, value] of Object.entries(section)) {
        if (overrideKeyTargets(key, name)) {
            if (typeof value === 'string') {
                out.push(value);
            } else if (isRecord(value) && typeof value['.'] === 'string') {
                out.push(value['.']);
            }
        }
        collectOverrideRanges(value, name, out);
    }
}

function overrideSections(pkg: Record<string, any>): unknown[] {
    return [pkg.resolutions, pkg.overrides, pkg.pnpm?.overrides];
}

/**
 * Returns true when `name` is declared anywhere in this package.json: in any direct dependency
 * section (dependencies/devDependencies/peerDependencies/optionalDependencies) or targeted by a
 * yarn `resolutions`, npm `overrides`, or `pnpm.overrides` entry.
 */
export function declaresPackage(pkg: Record<string, any>, name: string): boolean {
    for (const section of DIRECT_DEPENDENCY_SECTIONS) {
        const deps = pkg[section];
        if (isRecord(deps) && name in deps) {
            return true;
        }
    }
    return overrideSections(pkg).some((section) => overridesDeclare(section, name));
}

/**
 * Extracts the highest primeng major declared in this package.json — across all direct dependency
 * sections plus resolutions/overrides/pnpm.overrides — or null when primeng is absent or no
 * declared range contains a parseable major (e.g. `"latest"` or a tag).
 */
export function getPrimengMajor(pkg: Record<string, any>): number | null {
    const ranges: string[] = [];
    for (const section of DIRECT_DEPENDENCY_SECTIONS) {
        const deps = pkg[section];
        const range = isRecord(deps) ? deps['primeng'] : undefined;
        if (typeof range === 'string') {
            ranges.push(range);
        }
    }
    for (const section of overrideSections(pkg)) {
        collectOverrideRanges(section, 'primeng', ranges);
    }
    let max: number | null = null;
    for (const range of ranges) {
        const match = range.match(/(\d+)/);
        if (!match) {
            continue;
        }
        const major = parseInt(match[1], 10);
        if (max === null || major > max) {
            max = major;
        }
    }
    return max;
}

/**
 * Scans every package.json in the workspace tree (skipping node_modules/dist/.angular/.git/out-tsc)
 * and returns the highest primeng major found across all of them, or null if primeng is nowhere.
 */
export function findPrimengMajor(tree: Tree): number | null {
    let max: number | null = null;
    visitWorkspacePackageJsons(tree, (pkg) => {
        const major = getPrimengMajor(pkg);
        if (major !== null && (max === null || major > max)) {
            max = major;
        }
    });
    return max;
}

/**
 * Scans every package.json in the workspace tree (skipping node_modules/dist/.angular/.git/out-tsc)
 * and returns true if any of them declares `primeng` — in any direct dependency section or via
 * resolutions/overrides/pnpm.overrides — regardless of whether its version spec is parseable
 * (e.g. `"latest"`, a tag, a git URL, …).
 */
export function hasPrimeng(tree: Tree): boolean {
    let found = false;
    visitWorkspacePackageJsons(tree, (pkg) => {
        if (found) {
            return;
        }
        if (declaresPackage(pkg, 'primeng')) {
            found = true;
        }
    });
    return found;
}

/**
 * Scans every package.json in the workspace tree (skipping node_modules/dist/.angular/.git/out-tsc)
 * and returns true if any of them declares `primeflex` — in any direct dependency section or via
 * resolutions/overrides/pnpm.overrides. Used to nudge users toward the `migrate-from-primeflex`
 * schematic.
 */
export function hasPrimeflex(tree: Tree): boolean {
    let found = false;
    visitWorkspacePackageJsons(tree, (pkg) => {
        if (found) {
            return;
        }
        if (declaresPackage(pkg, 'primeflex')) {
            found = true;
        }
    });
    return found;
}

/**
 * Walks every package.json in the workspace tree (skipping node_modules/dist/.angular/.git/out-tsc),
 * invoking `visitor` with each successfully-parsed package.json contents.
 */
function visitWorkspacePackageJsons(tree: Tree, visitor: (pkg: Record<string, any>) => void): void {
    visitWorkspaceFiles(
        tree,
        (path, read) => {
            const content = read();
            if (content === undefined) {
                return;
            }
            let pkg: Record<string, any>;
            try {
                pkg = JSON.parse(content);
            } catch {
                return;
            }
            visitor(pkg);
        },
        {
            shouldDescend: (path) => !SKIP_DIRS.test(path),
            shouldVisitFile: (path) => !SKIP_DIRS.test(path) && path.endsWith('/package.json')
        }
    );
}
