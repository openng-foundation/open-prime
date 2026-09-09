import { baseKeymap, chainCommands, exitCode, toggleMark } from 'prosemirror-commands';
import { redo, undo } from 'prosemirror-history';
import { keymap } from 'prosemirror-keymap';
import type { Schema } from 'prosemirror-model';
import { liftListItem, sinkListItem, splitListItem } from 'prosemirror-schema-list';
import type { Command, Plugin } from 'prosemirror-state';
import { TextSelection } from 'prosemirror-state';
import { CellSelection, goToNextCell, isInTable } from 'prosemirror-tables';
import { setTextAlign, setTextStyle, toggleBlockType, toggleList, toggleWrap } from './commands';

/**
 * Runs the first command that applies. Used where one key has to serve two structures - Tab moves
 * between table cells inside a table and indents a list item everywhere else.
 */
function first(...commands: Command[]): Command {
    return (state, dispatch, view) => commands.some((command) => command(state, dispatch, view));
}

/**
 * Splits the list item the cursor is in, whichever of the two item types it is.
 */
function splitAnyListItem(schema: Schema): Command {
    return (state, dispatch, view) => {
        const { listItem, checkListItem } = schema.nodes;

        return (!!listItem && splitListItem(listItem)(state, dispatch, view)) || (!!checkListItem && splitListItem(checkListItem)(state, dispatch, view));
    };
}

function liftAnyListItem(schema: Schema): Command {
    return (state, dispatch, view) => {
        const { listItem, checkListItem } = schema.nodes;

        return (!!listItem && liftListItem(listItem)(state, dispatch, view)) || (!!checkListItem && liftListItem(checkListItem)(state, dispatch, view));
    };
}

function sinkAnyListItem(schema: Schema): Command {
    return (state, dispatch, view) => {
        const { listItem, checkListItem } = schema.nodes;

        return (!!listItem && sinkListItem(listItem)(state, dispatch, view)) || (!!checkListItem && sinkListItem(checkListItem)(state, dispatch, view));
    };
}

/**
 * Backspace at the start of an empty list item lifts it out of the list rather than merging it into
 * the item above, which is what every editor with lists does and what the docs promise.
 */
function liftEmptyListItem(schema: Schema): Command {
    return (state, dispatch, view) => {
        const { $from, empty } = state.selection;

        if (!empty || $from.parentOffset > 0 || $from.parent.content.size > 0) return false;

        return liftAnyListItem(schema)(state, dispatch, view);
    };
}

/**
 * Escape clears a multi-cell selection back to a caret, so the next keystroke types instead of
 * replacing half the table.
 */
const clearCellSelection: Command = (state, dispatch) => {
    if (!(state.selection instanceof CellSelection)) return false;

    dispatch?.(state.tr.setSelection(TextSelection.create(state.doc, state.selection.$headCell.pos + 1)));

    return true;
};

/**
 * Delete and Backspace on a multi-cell selection clear the cells rather than removing them, which
 * is what keeps the table's shape stable under the keyboard.
 */
const clearSelectedCells: Command = (state, dispatch) => {
    if (!(state.selection instanceof CellSelection)) return false;

    const transaction = state.tr;

    /* Positions come from the state document and each replacement moves the ones after it, so both
       boundaries are mapped through the transaction before they are used. */
    state.selection.forEachCell((cell, pos) => {
        const empty = cell.type.createAndFill();

        if (!empty) return;

        transaction.replaceWith(transaction.mapping.map(pos + 1), transaction.mapping.map(pos + cell.nodeSize - 1), empty.content);
    });

    dispatch?.(transaction);

    return true;
};

/**
 * The editor keymap. Platform-aware through ProseMirror's `Mod-`, so Cmd on macOS and Ctrl
 * elsewhere without branching here.
 *
 * @group Function
 */
export function textEditorKeymap(schema: Schema, defaultHighlightColor: () => string): Plugin[] {
    const { marks, nodes } = schema;
    const bindings: Record<string, Command> = {
        'Mod-z': undo,
        'Shift-Mod-z': redo,
        'Mod-y': redo,
        Escape: clearCellSelection,
        Backspace: first(clearSelectedCells, liftEmptyListItem(schema)),
        Delete: clearSelectedCells,
        Enter: first(splitAnyListItem(schema)),
        'Shift-Enter': chainCommands(exitCode, (state, dispatch) => {
            const hardBreak = nodes['hardBreak'];

            if (!hardBreak) return false;

            dispatch?.(state.tr.replaceSelectionWith(hardBreak.create()).scrollIntoView());

            return true;
        }),
        Tab: first((state, dispatch, view) => (isInTable(state) ? goToNextCell(1)(state, dispatch, view) : false), sinkAnyListItem(schema)),
        'Shift-Tab': first((state, dispatch, view) => (isInTable(state) ? goToNextCell(-1)(state, dispatch, view) : false), liftAnyListItem(schema))
    };

    if (marks['bold']) bindings['Mod-b'] = toggleMark(marks['bold']);

    if (marks['italic']) bindings['Mod-i'] = toggleMark(marks['italic']);

    if (marks['underline']) bindings['Mod-u'] = toggleMark(marks['underline']);

    if (marks['code']) bindings['Mod-e'] = toggleMark(marks['code']);

    if (marks['strikethrough']) bindings['Shift-Mod-x'] = toggleMark(marks['strikethrough']);

    if (marks['textStyle'])
        bindings['Shift-Mod-h'] = (state, dispatch, view) => {
            const type = marks['textStyle'];
            const active = type.isInSet(state.storedMarks || state.selection.$from.marks())?.attrs['backgroundColor'];

            /* The same path the toolbar's highlight takes: toggleMark would replace the whole text
               style and take the colour, family and size with it. */
            return setTextStyle({ backgroundColor: active ? null : defaultHighlightColor() })(state, dispatch, view);
        };

    for (const level of [1, 2, 3, 4, 5, 6]) {
        if (nodes['heading']) bindings[`Shift-Mod-${level}`] = toggleBlockType(nodes['heading'], { level }, nodes['paragraph']);
    }

    if (nodes['blockquote']) bindings['Mod-Shift-b'] = toggleWrap(nodes['blockquote']);

    if (nodes['bulletList']) bindings['Mod-Shift-8'] = toggleList(nodes['bulletList'], nodes['listItem']);

    if (nodes['orderedList']) bindings['Mod-Shift-9'] = toggleList(nodes['orderedList'], nodes['listItem']);

    if (nodes['checkList']) bindings['Mod-Shift-7'] = toggleList(nodes['checkList'], nodes['checkListItem']);

    bindings['Mod-Shift-l'] = setTextAlign('left');
    bindings['Mod-Shift-e'] = setTextAlign('center');
    bindings['Mod-Shift-r'] = setTextAlign('right');
    bindings['Mod-Shift-j'] = setTextAlign('justify');

    return [keymap(bindings), keymap(baseKeymap)];
}
