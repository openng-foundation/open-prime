import * as ts from 'typescript';
import { mapModuleSpecifier } from './mappings';

export interface DefaultImportResult {
    text: string;
    /** The local name the module's default export is bound to — `name` itself, an existing binding, or a collision-free alias. */
    bindingName: string;
}

interface DefaultImportInfo {
    literal: ts.StringLiteral;
    module: string;
    bindingName: string;
}

/**
 * Ensures the default export of `module` is imported, preferring the binding name `name`, and
 * reports the name actually bound via `bindingName` so callers can reference it.
 *
 * - If `module` already has a default import (under any name), the file is left untouched and the
 *   existing binding is reported.
 * - If a default import of the legacy module that `module` replaces is present (per
 *   `mapModuleSpecifier`, e.g. `@primeuix/themes/aura` → `@openng/optimus-ui-themes/aura`), that
 *   import is retargeted in place, keeping its binding name — no alias, no duplicate.
 * - Otherwise `import <name> from '<module>';` is inserted after the last top-level import
 *   statement (or at the very top of the file if there are no imports). When `name` is already
 *   taken by another import or top-level declaration, a collision-free alias is used instead
 *   (`Optimus<name>`, then `Optimus<name>2`, …) to avoid emitting a duplicate identifier.
 */
export function addDefaultImport(text: string, name: string, module: string): DefaultImportResult {
    const sourceFile = ts.createSourceFile('file.ts', text, ts.ScriptTarget.Latest, true);
    const defaultImports = collectDefaultImports(sourceFile);

    const existing = defaultImports.find((candidate) => candidate.module === module);
    if (existing) {
        return { text, bindingName: existing.bindingName };
    }

    const legacy = defaultImports.find((candidate) => mapModuleSpecifier(candidate.module) === module);
    if (legacy) {
        const quote = text[legacy.literal.getStart()];
        return { text: text.slice(0, legacy.literal.getStart()) + quote + module + quote + text.slice(legacy.literal.getEnd()), bindingName: legacy.bindingName };
    }

    const taken = collectTopLevelNames(sourceFile);
    let bindingName = name;
    if (taken.has(bindingName)) {
        bindingName = `Optimus${name}`;
        for (let counter = 2; taken.has(bindingName); counter++) {
            bindingName = `Optimus${name}${counter}`;
        }
    }

    const importStatement = `import ${bindingName} from '${module}';`;

    let lastImportEnd = 0;
    for (const statement of sourceFile.statements) {
        if (ts.isImportDeclaration(statement)) {
            lastImportEnd = statement.getEnd();
        }
    }

    if (lastImportEnd > 0) {
        return { text: text.slice(0, lastImportEnd) + '\n' + importStatement + text.slice(lastImportEnd), bindingName };
    }
    return { text: importStatement + '\n' + text, bindingName };
}

/** Every top-level `import <name> from '<module>'` in the file, with the specifier literal for in-place edits. */
function collectDefaultImports(sourceFile: ts.SourceFile): DefaultImportInfo[] {
    const imports: DefaultImportInfo[] = [];
    for (const statement of sourceFile.statements) {
        if (ts.isImportDeclaration(statement) && ts.isStringLiteral(statement.moduleSpecifier) && statement.importClause?.name) {
            imports.push({ literal: statement.moduleSpecifier, module: statement.moduleSpecifier.text, bindingName: statement.importClause.name.text });
        }
    }
    return imports;
}

/**
 * Every name bound at the top level of the file: import bindings (default, named, namespace) and
 * top-level variable/function/class/interface/type-alias/enum declarations. These are the bindings
 * a new top-level import can collide with.
 */
function collectTopLevelNames(sourceFile: ts.SourceFile): Set<string> {
    const names = new Set<string>();
    for (const statement of sourceFile.statements) {
        if (ts.isImportDeclaration(statement)) {
            const clause = statement.importClause;
            if (!clause) {
                continue;
            }
            if (clause.name) {
                names.add(clause.name.text);
            }
            if (clause.namedBindings) {
                if (ts.isNamespaceImport(clause.namedBindings)) {
                    names.add(clause.namedBindings.name.text);
                } else {
                    for (const element of clause.namedBindings.elements) {
                        names.add(element.name.text);
                    }
                }
            }
        } else if (ts.isVariableStatement(statement)) {
            for (const declaration of statement.declarationList.declarations) {
                collectBindingNames(declaration.name, names);
            }
        } else if ((ts.isFunctionDeclaration(statement) || ts.isClassDeclaration(statement) || ts.isInterfaceDeclaration(statement) || ts.isTypeAliasDeclaration(statement) || ts.isEnumDeclaration(statement)) && statement.name) {
            names.add(statement.name.text);
        }
    }
    return names;
}

function collectBindingNames(node: ts.BindingName, names: Set<string>): void {
    if (ts.isIdentifier(node)) {
        names.add(node.text);
        return;
    }
    for (const element of node.elements) {
        if (ts.isBindingElement(element)) {
            collectBindingNames(element.name, names);
        }
    }
}
