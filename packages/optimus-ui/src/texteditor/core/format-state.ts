import type { TextEditorFormatState } from '@openng/optimus-ui/types/texteditor';
import { redoDepth, undoDepth } from 'prosemirror-history';
import type { MarkType, ResolvedPos } from 'prosemirror-model';
import type { EditorState } from 'prosemirror-state';
import { CellSelection, isInTable, selectedRect } from 'prosemirror-tables';

/**
 * Whether a mark is on the selection. A collapsed cursor reads the stored marks - the marks the
 * next character will get - so a toolbar button lights up the moment it is pressed, before anything
 * is typed.
 */
function isMarkActive(state: EditorState, type: MarkType | undefined): boolean {
    if (!type) return false;

    const { from, $from, to, empty } = state.selection;

    if (empty) return !!type.isInSet(state.storedMarks || $from.marks());

    return state.doc.rangeHasMark(from, to, type);
}

/**
 * Reads one attribute off the `textStyle` mark around the selection, so a colour picker shows the
 * colour actually in force rather than the last one clicked.
 */
function textStyleAttr(state: EditorState, attribute: string): string | null {
    const type = state.schema.marks['textStyle'];

    if (!type) return null;

    const { $from, empty, from, to } = state.selection;

    if (empty) {
        const mark = type.isInSet(state.storedMarks || $from.marks());

        return (mark?.attrs[attribute] as string) ?? null;
    }

    let value: string | null = null;
    let mixed = false;

    state.doc.nodesBetween(from, to, (node) => {
        if (!node.isText) return;

        const mark = type.isInSet(node.marks);
        const attributeValue = (mark?.attrs[attribute] as string) ?? null;

        if (value === null) value = attributeValue;
        else if (value !== attributeValue) mixed = true;
    });

    return mixed ? null : value;
}

/**
 * Walks up from the cursor looking for an ancestor of the given type, the way every block-level
 * toolbar flag is answered.
 */
function findParent($pos: ResolvedPos, name: string): { node: import('prosemirror-model').Node; depth: number } | null {
    for (let depth = $pos.depth; depth > 0; depth--) {
        const node = $pos.node(depth);

        if (node.type.name === name) return { node, depth };
    }

    return null;
}

function linkAt(state: EditorState): string | null {
    const type = state.schema.marks['link'];

    if (!type) return null;

    const { $from, empty, from, to } = state.selection;

    if (empty) {
        const mark = type.isInSet(state.storedMarks || $from.marks());

        return (mark?.attrs['href'] as string) ?? null;
    }

    let href: string | null = null;

    state.doc.nodesBetween(from, to, (node) => {
        if (href) return false;

        const mark = type.isInSet(node.marks);

        if (mark) href = mark.attrs['href'] as string;

        return true;
    });

    return href;
}

function hasNode(state: EditorState, name: string): boolean {
    if (!state.schema.nodes[name]) return false;

    let found = false;

    state.doc.descendants((node) => {
        if (found) return false;

        if (node.type.name === name) found = true;

        return !found;
    });

    return found;
}

/**
 * The snapshot every toolbar reads. Derived from the editor state on each transaction, so a widget
 * renders its pressed state without ever touching ProseMirror itself.
 *
 * @group Function
 */
export function deriveFormatState(state: EditorState, hasFocus: boolean): TextEditorFormatState {
    const { marks, nodes } = state.schema;
    const { $from, empty } = state.selection;
    const heading = findParent($from, 'heading');
    const textBlock = $from.parent;
    const backgroundColor = textStyleAttr(state, 'backgroundColor');
    const inTable = !!nodes['table'] && isInTable(state);
    let isMultiCellSelected = false;
    let isCellMerged = false;

    if (inTable) {
        const selection = state.selection as CellSelection;

        if (selection instanceof CellSelection) {
            const rect = selectedRect(state);

            isMultiCellSelected = rect.right - rect.left > 1 || rect.bottom - rect.top > 1;
        }

        const cell = findParent($from, 'tableCell') ?? findParent($from, 'tableHeader');

        isCellMerged = !!cell && ((cell.node.attrs['colspan'] ?? 1) > 1 || (cell.node.attrs['rowspan'] ?? 1) > 1);
    }

    return {
        bold: isMarkActive(state, marks['bold']),
        italic: isMarkActive(state, marks['italic']),
        underline: isMarkActive(state, marks['underline']),
        strikethrough: isMarkActive(state, marks['strikethrough']),
        code: isMarkActive(state, marks['code']),
        subscript: isMarkActive(state, marks['subscript']),
        superscript: isMarkActive(state, marks['superscript']),
        highlight: !!backgroundColor,
        heading: heading ? (heading.node.attrs['level'] as number) : null,
        blockquote: !!findParent($from, 'blockquote'),
        codeBlock: !!findParent($from, 'codeBlock'),
        bulletList: !!findParent($from, 'bulletList'),
        orderedList: !!findParent($from, 'orderedList'),
        checkList: !!findParent($from, 'checkList'),
        textAlign: (textBlock.attrs['textAlign'] as string) ?? null,
        foregroundColor: textStyleAttr(state, 'color'),
        backgroundColor,
        fontFamily: textStyleAttr(state, 'fontFamily'),
        fontSize: textStyleAttr(state, 'fontSize'),
        link: !!linkAt(state),
        linkUrl: linkAt(state),
        canUndo: undoDepth(state) > 0,
        canRedo: redoDepth(state) > 0,
        hasSelection: !empty,
        hasFocus,
        inTable,
        isMultiCellSelected,
        isCellMerged,
        hasImageUploadPlaceholder: hasNode(state, 'imageUploadPlaceholder'),
        hasDocumentUploadPlaceholder: hasNode(state, 'documentUploadPlaceholder')
    };
}
