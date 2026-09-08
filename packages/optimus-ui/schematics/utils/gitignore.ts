import { Tree } from '@angular-devkit/schematics';
import { SKIP_DIRS } from './package-json';
import { visitWorkspaceFiles } from './workspace-files';

/**
 * Minimal `.gitignore` matcher.
 *
 * The schematic walks the whole workspace tree, which also contains files git never sees —
 * coverage reports, build output, editor scratch files. Those are the bulk of the "could not be
 * migrated" noise, so every pass filters them out through this matcher.
 *
 * Only the pattern syntax that appears in real `.gitignore` files is supported: comments, blank
 * lines, negation (`!`), directory-only patterns (trailing `/`), anchoring (a leading or embedded
 * `/`), `*`, `**`, `?` and character classes. Patterns from `.git/info/exclude` and the user's
 * global excludes file are out of reach — the schematic only sees the workspace tree.
 */
export type IgnoreMatcher = (path: string) => boolean;

interface IgnoreRule {
    re: RegExp;
    negated: boolean;
    dirOnly: boolean;
}

interface IgnoreFile {
    /** Directory the rules are relative to, with a trailing slash (e.g. `/` or `/libs/app/`). */
    base: string;
    rules: IgnoreRule[];
}

const GITIGNORE_NAME = '.gitignore';
const REGEXP_SPECIALS = /[.+^${}()|[\]\\]/g;

export function createIgnoreMatcher(tree: Tree): IgnoreMatcher {
    const files: IgnoreFile[] = [];
    visitWorkspaceFiles(
        tree,
        (path, read) => {
            const content = read();
            if (content === undefined) {
                return;
            }
            const rules = parseGitignore(content);
            if (rules.length > 0) {
                files.push({ base: path.slice(0, path.lastIndexOf('/') + 1), rules });
            }
        },
        {
            shouldDescend: (path) => !SKIP_DIRS.test(path),
            shouldVisitFile: (path) => path.slice(path.lastIndexOf('/') + 1) === GITIGNORE_NAME
        }
    );
    if (files.length === 0) {
        return () => false;
    }
    // Shallowest first: a nested .gitignore has the last word over the ones above it.
    files.sort((a, b) => a.base.length - b.base.length);

    const cache = new Map<string, boolean>();
    return (path: string) => {
        const segments = path.split('/').filter(Boolean);
        let current = '';
        for (let i = 0; i < segments.length; i++) {
            current += `/${segments[i]}`;
            // Everything but the last segment is a directory on the way to the file. Git stops
            // descending into an ignored directory, so a file below one is ignored as well.
            const isDirectory = i < segments.length - 1;
            const key = `${isDirectory ? 'd' : 'f'}:${current}`;
            let ignored = cache.get(key);
            if (ignored === undefined) {
                ignored = matches(files, current, isDirectory);
                cache.set(key, ignored);
            }
            if (ignored) {
                return true;
            }
        }
        return false;
    };
}

function matches(files: IgnoreFile[], candidate: string, isDirectory: boolean): boolean {
    let ignored = false;
    for (const file of files) {
        if (!candidate.startsWith(file.base)) {
            continue;
        }
        const relative = candidate.slice(file.base.length);
        if (relative === '') {
            continue;
        }
        for (const rule of file.rules) {
            if (rule.dirOnly && !isDirectory) {
                continue;
            }
            if (rule.re.test(relative)) {
                ignored = !rule.negated;
            }
        }
    }
    return ignored;
}

export function parseGitignore(content: string): IgnoreRule[] {
    const rules: IgnoreRule[] = [];
    for (const rawLine of content.split('\n')) {
        let pattern = stripTrailingWhitespace(rawLine.replace(/\r$/, ''));
        if (pattern === '' || pattern.startsWith('#')) {
            continue;
        }
        const negated = pattern.startsWith('!');
        if (negated) {
            pattern = pattern.slice(1);
        } else if (pattern.startsWith('\\')) {
            // `\#foo` / `\!foo` escape a literal leading marker.
            pattern = pattern.slice(1);
        }
        const dirOnly = pattern.endsWith('/');
        if (dirOnly) {
            pattern = pattern.slice(0, -1);
        }
        if (pattern === '') {
            continue;
        }
        // A separator anywhere but the (already stripped) end anchors the pattern to the
        // .gitignore's own directory; otherwise it matches at any depth below it.
        const anchored = pattern.includes('/');
        if (pattern.startsWith('/')) {
            pattern = pattern.slice(1);
        }
        rules.push({ re: toRegExp(pattern, anchored), negated, dirOnly });
    }
    return rules;
}

function stripTrailingWhitespace(line: string): string {
    let end = line.length;
    while (end > 0 && (line[end - 1] === ' ' || line[end - 1] === '\t')) {
        // A backslash keeps the space it escapes.
        if (line[end - 2] === '\\') {
            break;
        }
        end--;
    }
    return line.slice(0, end);
}

function toRegExp(pattern: string, anchored: boolean): RegExp {
    let source = '';
    let i = 0;
    while (i < pattern.length) {
        const char = pattern[i];
        if (char === '\\' && i + 1 < pattern.length) {
            source += escapeLiteral(pattern[i + 1]);
            i += 2;
        } else if (char === '*' && pattern[i + 1] === '*') {
            if (pattern[i + 2] === '/') {
                source += '(?:.*/)?';
                i += 3;
            } else {
                source += '.*';
                i += 2;
            }
        } else if (char === '*') {
            source += '[^/]*';
            i++;
        } else if (char === '?') {
            source += '[^/]';
            i++;
        } else if (char === '[') {
            const close = pattern.indexOf(']', i + 1);
            if (close === -1) {
                source += '\\[';
                i++;
            } else {
                const body = pattern.slice(i + 1, close);
                source += `[${body.startsWith('!') ? `^${body.slice(1)}` : body}]`;
                i = close + 1;
            }
        } else {
            source += escapeLiteral(char);
            i++;
        }
    }
    // A directory pattern also covers everything below it, e.g. `coverage/` hides `coverage/a/b.js`.
    return new RegExp(`^${anchored ? '' : '(?:.*/)?'}${source}(?:/.*)?$`);
}

function escapeLiteral(char: string): string {
    return char.replace(REGEXP_SPECIALS, '\\$&');
}
