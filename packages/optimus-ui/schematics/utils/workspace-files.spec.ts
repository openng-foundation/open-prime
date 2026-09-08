import { HostTree } from '@angular-devkit/schematics';
import { UnitTestTree } from '@angular-devkit/schematics/testing';
import { describe, expect, it, vi } from 'vitest';
import { SKIP_DIRS } from './package-json';
import { visitWorkspaceFiles } from './workspace-files';

function tree(files: Record<string, string>): UnitTestTree {
    const result = new UnitTestTree(new HostTree());
    for (const [path, content] of Object.entries(files)) {
        result.create(path, content);
    }
    return result;
}

describe('visitWorkspaceFiles', () => {
    it('does not descend into pruned directories', () => {
        const visited: string[] = [];
        visitWorkspaceFiles(
            tree({
                '/src/app.ts': '',
                '/src/nested/component.ts': '',
                '/dist/main.js': '',
                '/node_modules/pkg/index.ts': '',
                '/libs/ui/package.json': '{}\n'
            }),
            (path) => visited.push(path),
            {
                shouldDescend: (path) => !SKIP_DIRS.test(path),
                // Keep the file filter aligned with production callers: skipped paths must not be read.
                shouldVisitFile: (path) => !SKIP_DIRS.test(path) && (path.endsWith('.ts') || path.endsWith('/package.json'))
            }
        );

        expect(visited).toContain('/src/app.ts');
        expect(visited).toContain('/src/nested/component.ts');
        expect(visited).toContain('/libs/ui/package.json');
        expect(visited).not.toContain('/dist/main.js');
        expect(visited).not.toContain('/node_modules/pkg/index.ts');
    });

    it('does not read files until the visitor requests their contents', () => {
        const workspace = tree({ '/src/app.ts': 'const app = true;' });
        const readFile = vi.spyOn(workspace, 'read');
        let read: (() => string | undefined) | undefined;

        visitWorkspaceFiles(workspace, (_path, fileRead) => {
            read = fileRead;
        });

        expect(read).toBeDefined();
        expect(readFile).not.toHaveBeenCalled();
        expect(read!()).toBe('const app = true;');
        expect(readFile).toHaveBeenCalledOnce();
    });
});
