import { Component, signal } from '@angular/core';
import { TextEditorModule } from '@openng/optimus-ui/texteditor';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { TableCellOptionsSubmenuUI, TableCellOptionsUI, TableColumnOptionsSubmenuUI, TableColumnOptionsUI, TableRowOptionsSubmenuUI, TableRowOptionsUI, ToolbarTableInsertUI } from '@/components/texteditor';

@Component({
    selector: 'table-doc',
    standalone: true,
    imports: [TextEditorModule, ToolbarTableInsertUI, TableColumnOptionsUI, TableColumnOptionsSubmenuUI, TableRowOptionsUI, TableRowOptionsSubmenuUI, TableCellOptionsUI, TableCellOptionsSubmenuUI, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                <i>commands.table(rows?, cols?)</i> inserts a grid at the cursor. Put the cursor in a cell and the runtime draws the selection outline and three trigger dots; each one opens the matching menu part -
                <i>p-text-editor-table-column-menu</i>, <i>-row-menu</i> and <i>-cell-menu</i> - and each of those pairs with a <i>-submenu</i> sibling that shares one submenu controller.
            </p>
            <p>
                Column sizing is configured on the root through <i>minTableColumnWidth</i> and <i>defaultTableColumnWidth</i>. Header cells carry a <i>scope</i> so screen readers can associate data cells with their headers, and <i>Tab</i>/<i
                    >Shift + Tab</i
                >
                move between cells.
            </p>
        </app-docsectiontext>
        <div class="card">
            <p-text-editor-root [(value)]="value" ariaLabel="Tables example">
                <p-text-editor-toolbar>
                    <div class="p-text-editor-ui-toolbar">
                        <table-insert-ui />
                    </div>
                </p-text-editor-toolbar>
                <p-text-editor-table-column-menu>
                    <table-column-options-ui />
                    <p-text-editor-table-column-submenu>
                        <table-column-options-submenu-ui />
                    </p-text-editor-table-column-submenu>
                </p-text-editor-table-column-menu>
                <p-text-editor-table-row-menu>
                    <table-row-options-ui />
                    <p-text-editor-table-row-submenu>
                        <table-row-options-submenu-ui />
                    </p-text-editor-table-row-submenu>
                </p-text-editor-table-row-menu>
                <p-text-editor-table-cell-menu>
                    <table-cell-options-ui />
                    <p-text-editor-table-cell-submenu>
                        <table-cell-options-submenu-ui />
                    </p-text-editor-table-cell-submenu>
                </p-text-editor-table-cell-menu>
                <p-text-editor-content height="18rem" />
            </p-text-editor-root>
        </div>
        <app-code></app-code>
    `
})
export class TableDoc {
    readonly value = signal<string | undefined>(
        '<p>Click inside the table to reveal its controls.</p>' +
            '<table><tbody>' +
            '<tr><th><p>Feature</p></th><th><p>Classic</p></th><th><p>Block</p></th></tr>' +
            '<tr><td><p>Toolbar</p></td><td><p>Yes</p></td><td><p>Context</p></td></tr>' +
            '<tr><td><p>Slash commands</p></td><td><p>&mdash;</p></td><td><p>Yes</p></td></tr>' +
            '</tbody></table>'
    );
}
