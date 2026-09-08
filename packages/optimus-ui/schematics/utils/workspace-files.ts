import { Tree } from '@angular-devkit/schematics';

export interface WorkspaceFileVisitOptions {
    shouldDescend?: (path: string) => boolean;
    shouldVisitFile?: (path: string) => boolean;
}

export type WorkspaceFileReader = () => string | undefined;

export function visitWorkspaceFiles(tree: Tree, visitor: (path: string, read: WorkspaceFileReader) => void, options: WorkspaceFileVisitOptions = {}): void {
    visitDirectory(tree, '/', visitor, options);
}

function visitDirectory(tree: Tree, dirPath: string, visitor: (path: string, read: WorkspaceFileReader) => void, options: WorkspaceFileVisitOptions): void {
    const dir = tree.getDir(dirPath);
    for (const name of dir.subdirs) {
        const path = joinWorkspacePath(dirPath, name);
        if (options.shouldDescend && !options.shouldDescend(path)) {
            continue;
        }
        visitDirectory(tree, path, visitor, options);
    }
    for (const name of dir.subfiles) {
        const path = joinWorkspacePath(dirPath, name);
        if (options.shouldVisitFile && !options.shouldVisitFile(path)) {
            continue;
        }
        visitor(path, () => tree.read(path)?.toString());
    }
}

function joinWorkspacePath(parent: string, name: string): string {
    return parent === '/' ? `/${name}` : `${parent}/${name}`;
}
