import type { TableActiveState, TableOverlayRect, TextEditorTableCellCommands, TextEditorTableColumnCommands, TextEditorTableControlsCommands, TextEditorTableRowCommands } from '@openng/optimus-ui/types/texteditor';
import type { Node as ProseMirrorNode } from 'prosemirror-model';
import type { Command, EditorState } from 'prosemirror-state';
import { TextSelection } from 'prosemirror-state';
import {
    CellSelection,
    addColumnAfter,
    addColumnBefore,
    addRowAfter,
    addRowBefore,
    deleteColumn,
    deleteRow,
    deleteTable,
    isInTable,
    mergeCells,
    selectedRect,
    setCellAttr,
    splitCell,
    toggleHeaderCell,
    toggleHeaderColumn,
    toggleHeaderRow
} from 'prosemirror-tables';
import type { EditorView } from 'prosemirror-view';

/**
 * Row/column geometry of the cell the cursor is in, the payload the table triggers and menus are
 * positioned and labelled from.
 *
 * @group Function
 */
export function tableActiveState(view: EditorView): TableActiveState | null {
    if (!isInTable(view.state)) return null;

    const rect = selectedRect(view.state);
    const cell = view.domAtPos(view.state.selection.from).node as HTMLElement;
    const table = (cell.nodeType === 1 ? cell : cell.parentElement)?.closest('table');

    if (!table) return null;

    return {
        table: table as HTMLTableElement,
        rowIndex: rect.top,
        colIndex: rect.left,
        rowCount: rect.map.height,
        colCount: rect.map.width
    };
}

/**
 * Geometry the overlay needs: the table box, the active cell box, the column borders the resize
 * handles sit on, and whether the cell is on the last row or column - which is what decides where
 * the add-row and add-column buttons go.
 *
 * @group Function
 */
export function tableOverlayRect(view: EditorView): TableOverlayRect | null {
    const active = tableActiveState(view);

    if (!active) return null;

    const tableRect = active.table.getBoundingClientRect();
    const row = active.table.rows[active.rowIndex];
    const cellElement = row?.cells[Math.min(active.colIndex, row.cells.length - 1)];

    if (!cellElement) return null;

    const columnBorders: number[] = [];
    let offset = 0;

    for (const cell of Array.from(active.table.rows[0]?.cells ?? [])) {
        offset += cell.getBoundingClientRect().width;
        columnBorders.push(offset);
    }

    return {
        tableRect,
        cellRect: cellElement.getBoundingClientRect(),
        columnBorders,
        isLastRow: active.rowIndex === active.rowCount - 1,
        isLastColumn: active.colIndex === active.colCount - 1
    };
}

/**
 * Whether more than one cell is selected.
 *
 * @group Function
 */
export function isMultiCellSelected(state: EditorState): boolean {
    if (!(state.selection instanceof CellSelection)) return false;

    const rect = selectedRect(state);

    return rect.right - rect.left > 1 || rect.bottom - rect.top > 1;
}

/**
 * Whether the active cell spans more than one row or column.
 *
 * @group Function
 */
export function isCellMerged(state: EditorState): boolean {
    if (!isInTable(state)) return false;

    const { $from } = state.selection;

    for (let depth = $from.depth; depth > 0; depth--) {
        const node = $from.node(depth);

        if (node.type.name !== 'tableCell' && node.type.name !== 'tableHeader') continue;

        return (node.attrs['colspan'] ?? 1) > 1 || (node.attrs['rowspan'] ?? 1) > 1;
    }

    return false;
}

/**
 * Puts the caret in the first cell of the given row or column, so a menu action taken from a
 * trigger dot applies to the row or column the dot belongs to.
 */
function focusCell(view: EditorView, row: number, col: number): boolean {
    if (!isInTable(view.state)) return false;

    const rect = selectedRect(view.state);
    const index = Math.min(row, rect.map.height - 1) * rect.map.width + Math.min(col, rect.map.width - 1);
    const cellPos = rect.map.map[index];

    if (cellPos == null) return false;

    view.dispatch(view.state.tr.setSelection(TextSelection.near(view.state.doc.resolve(rect.tableStart + cellPos + 1))));

    return true;
}

function dispatchTable(view: EditorView | null, command: Command): void {
    if (!view) return;

    command(view.state, view.dispatch, view);
    view.focus();
}

/**
 * Whether every row holds one cell per column. Reordering and duplicating work on the row's children
 * directly, and a merged cell makes that indexing wrong - the safe answer there is to do nothing
 * rather than to build a broken table.
 */
function isRectangular(rect: ReturnType<typeof selectedRect>): boolean {
    let rectangular = true;

    rect.table.forEach((row) => {
        if (row.childCount !== rect.map.width) rectangular = false;
    });

    return rectangular;
}

/**
 * Moves a row or a column one step in the given direction by deleting it and re-inserting it on the
 * other side of its neighbour, which is the only reorder prosemirror-tables leaves room for.
 */
function moveLine(view: EditorView, kind: 'row' | 'column', delta: number): void {
    const rect = selectedRect(view.state);

    if (!isRectangular(rect)) return;
    const table: ProseMirrorNode = rect.table;
    const transaction = view.state.tr;

    if (kind === 'row') {
        const from = rect.top;
        const to = from + delta;

        if (to < 0 || to >= rect.map.height) return;

        const rows: ProseMirrorNode[] = [];

        table.forEach((row) => rows.push(row));
        rows.splice(to, 0, ...rows.splice(from, 1));
        transaction.replaceWith(rect.tableStart, rect.tableStart + table.content.size, rows);
        view.dispatch(transaction);

        return;
    }

    const from = rect.left;
    const to = from + delta;

    if (to < 0 || to >= rect.map.width) return;

    const rows: ProseMirrorNode[] = [];

    table.forEach((row) => {
        const cells: ProseMirrorNode[] = [];

        row.forEach((cell) => cells.push(cell));
        cells.splice(to, 0, ...cells.splice(from, 1));
        rows.push(row.type.create(row.attrs, cells));
    });

    transaction.replaceWith(rect.tableStart, rect.tableStart + table.content.size, rows);
    view.dispatch(transaction);
}

/**
 * Duplicates the active row or column, inserting the copy right after the original.
 */
function duplicateLine(view: EditorView, kind: 'row' | 'column'): void {
    const rect = selectedRect(view.state);

    if (!isRectangular(rect)) return;
    const table: ProseMirrorNode = rect.table;
    const transaction = view.state.tr;

    if (kind === 'row') {
        const rows: ProseMirrorNode[] = [];

        table.forEach((row) => rows.push(row));

        const copy = rows[rect.top];

        rows.splice(rect.top + 1, 0, copy.type.create(copy.attrs, copy.content));
        transaction.replaceWith(rect.tableStart, rect.tableStart + table.content.size, rows);
        view.dispatch(transaction);

        return;
    }

    const rows: ProseMirrorNode[] = [];

    table.forEach((row) => {
        const cells: ProseMirrorNode[] = [];

        row.forEach((cell) => cells.push(cell));

        const copy = cells[rect.left];

        cells.splice(rect.left + 1, 0, copy.type.create(copy.attrs, copy.content));
        rows.push(row.type.create(row.attrs, cells));
    });

    transaction.replaceWith(rect.tableStart, rect.tableStart + table.content.size, rows);
    view.dispatch(transaction);
}

/**
 * The floating add-row / add-column controls pinned to the active table.
 *
 * @group Function
 */
export function createTableControlsCommands(getView: () => EditorView | null): TextEditorTableControlsCommands {
    return {
        addRow: () => dispatchTable(getView(), addRowAfter),
        addColumn: () => dispatchTable(getView(), addColumnAfter)
    };
}

/**
 * The column action menu's command set.
 *
 * @group Function
 */
export function createTableColumnCommands(getView: () => EditorView | null, colIndex: () => number, onDismiss: () => void): TextEditorTableColumnCommands {
    const withColumn = (action: (view: EditorView) => void) => () => {
        const view = getView();

        if (!view || !focusCell(view, 0, colIndex())) return;

        action(view);
        onDismiss();
        view.focus();
    };

    return {
        insertBefore: withColumn((view) => addColumnBefore(view.state, view.dispatch)),
        insertAfter: withColumn((view) => addColumnAfter(view.state, view.dispatch)),
        delete: withColumn((view) => deleteColumn(view.state, view.dispatch)),
        duplicate: withColumn((view) => duplicateLine(view, 'column')),
        moveLeft: withColumn((view) => moveLine(view, 'column', -1)),
        moveRight: withColumn((view) => moveLine(view, 'column', 1)),
        toggleHeader: withColumn((view) => toggleHeaderColumn(view.state, view.dispatch)),
        align: (value: string) => withColumn((view) => setCellAttr('align', value)(view.state, view.dispatch))(),
        foregroundColor: (color: string) => withColumn((view) => setCellAttr('color', color)(view.state, view.dispatch))(),
        backgroundColor: (color: string) => withColumn((view) => setCellAttr('background', color)(view.state, view.dispatch))()
    };
}

/**
 * The row action menu's command set.
 *
 * @group Function
 */
export function createTableRowCommands(getView: () => EditorView | null, rowIndex: () => number, onDismiss: () => void): TextEditorTableRowCommands {
    const withRow = (action: (view: EditorView) => void) => () => {
        const view = getView();

        if (!view || !focusCell(view, rowIndex(), 0)) return;

        action(view);
        onDismiss();
        view.focus();
    };

    return {
        insertBefore: withRow((view) => addRowBefore(view.state, view.dispatch)),
        insertAfter: withRow((view) => addRowAfter(view.state, view.dispatch)),
        delete: withRow((view) => deleteRow(view.state, view.dispatch)),
        deleteTable: withRow((view) => deleteTable(view.state, view.dispatch)),
        duplicate: withRow((view) => duplicateLine(view, 'row')),
        moveUp: withRow((view) => moveLine(view, 'row', -1)),
        moveDown: withRow((view) => moveLine(view, 'row', 1)),
        toggleHeader: withRow((view) => toggleHeaderRow(view.state, view.dispatch)),
        align: (value: string) => withRow((view) => setCellAttr('align', value)(view.state, view.dispatch))(),
        foregroundColor: (color: string) => withRow((view) => setCellAttr('color', color)(view.state, view.dispatch))(),
        backgroundColor: (color: string) => withRow((view) => setCellAttr('background', color)(view.state, view.dispatch))()
    };
}

/**
 * The cell action menu's command set. Acts on the whole multi-cell selection when there is one.
 *
 * @group Function
 */
export function createTableCellCommands(getView: () => EditorView | null, onDismiss: () => void): TextEditorTableCellCommands {
    const withCell = (action: (view: EditorView) => void) => () => {
        const view = getView();

        if (!view || !isInTable(view.state)) return;

        action(view);
        onDismiss();
        view.focus();
    };

    return {
        clearContents: withCell((view) => {
            const transaction = view.state.tr;
            const rect = selectedRect(view.state);

            /* Every replacement shifts the positions after it, so each cell is looked up in the
               transaction's own document rather than in the one the rect was measured from. */
            for (const pos of rect.map.cellsInRect(rect)) {
                const cellPos = transaction.mapping.map(rect.tableStart + pos);
                const cell = transaction.doc.nodeAt(cellPos);
                const empty = cell?.type.createAndFill();

                if (cell && empty) transaction.replaceWith(cellPos + 1, cellPos + cell.nodeSize - 1, empty.content);
            }

            view.dispatch(transaction);
        }),
        mergeCells: withCell((view) => mergeCells(view.state, view.dispatch)),
        splitCell: withCell((view) => splitCell(view.state, view.dispatch)),
        toggleHeader: withCell((view) => toggleHeaderCell(view.state, view.dispatch)),
        align: (value: string) => withCell((view) => setCellAttr('align', value)(view.state, view.dispatch))(),
        foregroundColor: (color: string) => withCell((view) => setCellAttr('color', color)(view.state, view.dispatch))(),
        backgroundColor: (color: string) => withCell((view) => setCellAttr('background', color)(view.state, view.dispatch))()
    };
}
