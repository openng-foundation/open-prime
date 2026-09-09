import type { TextEditorCommands } from '@openng/optimus-ui/types/texteditor';
import { lift, setBlockType, toggleMark, wrapIn } from 'prosemirror-commands';
import { redo, undo } from 'prosemirror-history';
import type { Attrs, MarkType, Node as ProseMirrorNode, NodeType, Schema } from 'prosemirror-model';
import { liftListItem, wrapInList } from 'prosemirror-schema-list';
import type { Command, EditorState, Transaction } from 'prosemirror-state';
import { TextSelection } from 'prosemirror-state';
import { Mapping } from 'prosemirror-transform';
import type { EditorView } from 'prosemirror-view';
import { isSafeLinkHref } from './sanitize';

/**
 * Everything the command set needs from the component that owns the view: the live view, the two
 * upload flows, and the handful of values that are configurable through inputs.
 */
export interface TextEditorCommandDeps {
    /**
     * The live editor view, or null before mount. Every command is a no-op until it resolves.
     */
    getView: () => EditorView | null;
    /**
     * Opens the image upload overlay.
     */
    requestImageUpload: () => void;
    /**
     * Opens the document upload overlay.
     */
    requestDocumentUpload: () => void;
    /**
     * Hands the serialized content to the browser print flow.
     */
    print: () => void;
    /**
     * Colour the one-click highlight toggle applies.
     */
    defaultHighlightColor: () => string;
    /**
     * Column width, in pixels, given to the columns of a freshly inserted table.
     */
    defaultTableColumnWidth: () => number;
}

function run(view: EditorView | null, command: Command): boolean {
    if (!view) return false;

    const applied = command(view.state, view.dispatch, view);

    view.focus();

    return applied;
}

/**
 * Whether the cursor sits inside a node of the given type.
 */
export function isInNode(state: EditorState, type: NodeType | undefined): boolean {
    if (!type) return false;

    const { $from } = state.selection;

    for (let depth = $from.depth; depth > 0; depth--) {
        if ($from.node(depth).type === type) return true;
    }

    return false;
}

/**
 * Depth of the closest ancestor of the given type, or -1.
 */
function depthOf(state: EditorState, type: NodeType | undefined): number {
    if (!type) return -1;

    const { $from } = state.selection;

    for (let depth = $from.depth; depth > 0; depth--) {
        if ($from.node(depth).type === type) return depth;
    }

    return -1;
}

/**
 * Toggles a list on the current block. Toggling the active list type lifts the items back out;
 * toggling a different one converts between list types in place, which is what a toolbar with three
 * mutually exclusive list buttons has to do.
 */
export function toggleList(listType: NodeType | undefined, itemType: NodeType | undefined): Command {
    return (state, dispatch, view) => {
        if (!listType || !itemType) return false;

        if (depthOf(state, listType) >= 0) return liftListItem(itemType)(state, dispatch, view);

        const otherLists = [state.schema.nodes['bulletList'], state.schema.nodes['orderedList'], state.schema.nodes['checkList']].filter((type) => type && type !== listType);
        const insideOther = otherLists.some((type) => depthOf(state, type) >= 0);

        if (!insideOther) return wrapInList(listType)(state, dispatch, view);

        /* Converting between list types is a lift followed by a wrap, and the two have to travel in
           ONE transaction: two of them are two undo steps, and the first one alone leaves a list
           the user never asked for. Probing (no dispatch) must not touch the document either. */
        const otherItem = depthOf(state, state.schema.nodes['checkList']) >= 0 ? state.schema.nodes['checkListItem'] : state.schema.nodes['listItem'];
        let lifted: Transaction | null = null;

        if (!liftListItem(otherItem)(state, (transaction) => (lifted = transaction))) return false;

        const liftedState = state.apply(lifted!);

        return wrapInList(listType)(liftedState, (transaction) => {
            const merged = state.tr;

            for (const step of lifted!.steps) merged.step(step);

            for (const step of transaction.steps) merged.step(step);

            /* The wrap transaction's selection is already in the final coordinate space - it only
               has to be resolved against the merged document, which is what an empty mapping does. */
            merged.setSelection(transaction.selection.map(merged.doc, new Mapping()));
            dispatch?.(merged.scrollIntoView());
        });
    };
}

/**
 * Toggles a textblock between the given type and a paragraph, the shape both the heading buttons
 * and the code-block button need.
 */
export function toggleBlockType(type: NodeType | undefined, attrs: Attrs | null, paragraph: NodeType | undefined): Command {
    return (state, dispatch, view) => {
        if (!type || !paragraph) return false;

        const { $from } = state.selection;
        const active = $from.parent.type === type && Object.entries(attrs ?? {}).every(([key, value]) => $from.parent.attrs[key] === value);

        return setBlockType(active ? paragraph : type, active ? null : attrs)(state, dispatch, view);
    };
}

/**
 * Toggles a wrapping node - the blockquote - on the current block.
 *
 * Inside a list the wrap is not legal, because a list item starts with a paragraph. Rather than
 * doing nothing, the item is lifted out of the list first: a user asking for a quote wants a quote,
 * not silence.
 */
export function toggleWrap(type: NodeType | undefined): Command {
    return (state, dispatch, view) => {
        if (!type) return false;

        if (isInNode(state, type)) return lift(state, dispatch);

        if (wrapIn(type)(state, dispatch, view)) return true;

        const itemType = depthOf(state, state.schema.nodes['checkList']) >= 0 ? state.schema.nodes['checkListItem'] : state.schema.nodes['listItem'];

        if (!itemType || depthOf(state, itemType) < 0) return false;

        /* Same shape as the list conversion: lift out of the item and wrap, in one transaction. */
        let lifted: Transaction | null = null;

        if (!liftListItem(itemType)(state, (transaction) => (lifted = transaction))) return false;

        const liftedState = state.apply(lifted!);

        return wrapIn(type)(liftedState, (transaction) => {
            const merged = state.tr;

            for (const step of lifted!.steps) merged.step(step);

            for (const step of transaction.steps) merged.step(step);

            dispatch?.(merged.scrollIntoView());
        });
    };
}

/**
 * Sets `textAlign` on every textblock touched by the selection. Setting the alignment already in
 * force clears it, so the alignment buttons behave as toggles like every other block control.
 */
export function setTextAlign(alignment: string | null): Command {
    return (state, dispatch) => {
        const { from, to } = state.selection;
        let transaction: Transaction | null = null;

        state.doc.nodesBetween(from, to, (node, pos) => {
            if (!node.isTextblock || !('textAlign' in (node.type.spec.attrs ?? {}))) return;

            const next = node.attrs['textAlign'] === alignment ? null : alignment;

            transaction = (transaction ?? state.tr).setNodeMarkup(pos, undefined, { ...node.attrs, textAlign: next });
        });

        if (!transaction) return false;

        dispatch?.(transaction);

        return true;
    };
}

/**
 * Applies one or more `textStyle` attributes to the selection, merging with whatever the selection
 * already carries: setting a colour must not wipe the font size set a moment earlier.
 */
export function setTextStyle(attributes: Record<string, string | null>): Command {
    return (state, dispatch) => {
        const type = state.schema.marks['textStyle'];

        if (!type) return false;

        const { empty, from, to, $from } = state.selection;
        const current = type.isInSet(state.storedMarks || $from.marks());
        const attrs = { ...(current?.attrs ?? {}), ...attributes };
        const cleared = Object.values(attrs).every((value) => value == null);
        const transaction = state.tr;

        if (empty) {
            if (cleared) transaction.removeStoredMark(type);
            else transaction.addStoredMark(type.create(attrs));

            dispatch?.(transaction);

            return true;
        }

        state.doc.nodesBetween(from, to, (node, pos) => {
            if (!node.isText) return;

            const start = Math.max(pos, from);
            const end = Math.min(pos + node.nodeSize, to);
            const existing = type.isInSet(node.marks);
            const merged = { ...(existing?.attrs ?? {}), ...attributes };

            transaction.removeMark(start, end, type);

            if (!Object.values(merged).every((value) => value == null)) transaction.addMark(start, end, type.create(merged));
        });

        dispatch?.(transaction);

        return true;
    };
}

/**
 * Expands a collapsed cursor to the whole link around it, so `updateLink` and `removeLink` work
 * from a caret sitting anywhere inside the link rather than only from a full selection.
 */
function linkRange(state: EditorState, type: MarkType): { from: number; to: number } | null {
    const { $from, empty, from, to } = state.selection;

    if (!empty) return { from, to };

    const mark = type.isInSet($from.marks());

    if (!mark) return null;

    /* The whole run, not the text node under the caret: a link whose middle word is bold is three
       text nodes, and unlinking only one of them leaves half a link behind. */
    const parentStart = $from.start();
    const children: { start: number; end: number; linked: boolean }[] = [];

    $from.parent.forEach((child, offset) => {
        const childStart = parentStart + offset;
        const childMark = type.isInSet(child.marks);

        children.push({ start: childStart, end: childStart + child.nodeSize, linked: !!childMark && childMark.attrs['href'] === mark.attrs['href'] });
    });

    const index = children.findIndex((child) => child.linked && child.start <= $from.pos && $from.pos <= child.end);

    if (index === -1) return null;

    let first = index;
    let last = index;

    while (first > 0 && children[first - 1].linked) first--;

    while (last < children.length - 1 && children[last + 1].linked) last++;

    return { from: children[first].start, to: children[last].end };
}

/**
 * Builds a table of the given size, with a header row and every column at the configured width.
 */
export function createTable(schema: Schema, rows: number, cols: number, columnWidth: number): ProseMirrorNode | null {
    const { table, tableRow, tableCell, tableHeader, paragraph } = schema.nodes;

    if (!table || !tableRow || !tableCell || !tableHeader || !paragraph) return null;

    const colwidth = [columnWidth];
    const buildRow = (type: NodeType) =>
        tableRow.create(
            null,
            Array.from({ length: cols }, () => type.create({ colwidth }, paragraph.create()))
        );

    return table.create(null, [buildRow(tableHeader), ...Array.from({ length: Math.max(rows - 1, 0) }, () => buildRow(tableCell))]);
}

/**
 * The imperative command surface. Every entry is a plain function so a host widget can wire it to a
 * button, a shortcut or an agent without reaching for the editor instance.
 *
 * @group Function
 */
export function createTextEditorCommands(deps: TextEditorCommandDeps): TextEditorCommands {
    const view = () => deps.getView();
    const schema = () => deps.getView()?.state.schema;
    const mark = (name: string) => schema()?.marks[name];
    const node = (name: string) => schema()?.nodes[name];
    const dispatch = (command: Command) => run(view(), command);

    return {
        bold: () => dispatch(toggleMark(mark('bold')!)),
        italic: () => dispatch(toggleMark(mark('italic')!)),
        underline: () => dispatch(toggleMark(mark('underline')!)),
        strikethrough: () => dispatch(toggleMark(mark('strikethrough')!)),
        code: () => dispatch(toggleMark(mark('code')!)),
        subscript: () => dispatch(toggleMark(mark('subscript')!)),
        superscript: () => dispatch(toggleMark(mark('superscript')!)),
        highlight: () => {
            const current = view()?.state;

            if (!current) return;

            const type = current.schema.marks['textStyle'];
            const active = type?.isInSet(current.storedMarks || current.selection.$from.marks())?.attrs['backgroundColor'];

            dispatch(setTextStyle({ backgroundColor: active ? null : deps.defaultHighlightColor() }));
        },
        heading: (level: number) => dispatch(toggleBlockType(node('heading'), { level }, node('paragraph'))),
        paragraph: () => dispatch(setBlockType(node('paragraph')!)),
        blockquote: () => dispatch(toggleWrap(node('blockquote'))),
        codeBlock: () => dispatch(toggleBlockType(node('codeBlock'), null, node('paragraph'))),
        bulletList: () => dispatch(toggleList(node('bulletList'), node('listItem'))),
        orderedList: () => dispatch(toggleList(node('orderedList'), node('listItem'))),
        checkList: () => dispatch(toggleList(node('checkList'), node('checkListItem'))),
        textAlign: (alignment: string) => dispatch(setTextAlign(alignment)),
        foregroundColor: (color: string) => dispatch(setTextStyle({ color: color || null })),
        backgroundColor: (color: string) => dispatch(setTextStyle({ backgroundColor: color || null })),
        fontFamily: (family: string) => dispatch(setTextStyle({ fontFamily: family || null })),
        fontSize: (size: string) => dispatch(setTextStyle({ fontSize: size || null })),
        insertLink: (url: string, text?: string) => {
            const current = view();

            if (!current || !isSafeLinkHref(url)) return;

            const type = current.state.schema.marks['link'];
            const { empty, from, to } = current.state.selection;
            const transaction = current.state.tr;

            if (empty) {
                const label = text || url;

                transaction.insertText(label, from);
                transaction.addMark(from, from + label.length, type.create({ href: url }));
            } else {
                transaction.addMark(from, to, type.create({ href: url }));
            }

            current.dispatch(transaction);
            current.focus();
        },
        updateLink: (url: string) => {
            const current = view();

            if (!current || !isSafeLinkHref(url)) return;

            const type = current.state.schema.marks['link'];
            const range = linkRange(current.state, type);

            if (!range) return;

            current.dispatch(current.state.tr.removeMark(range.from, range.to, type).addMark(range.from, range.to, type.create({ href: url })));
            current.focus();
        },
        removeLink: () => {
            const current = view();

            if (!current) return;

            const type = current.state.schema.marks['link'];
            const range = linkRange(current.state, type);

            if (!range) return;

            current.dispatch(current.state.tr.removeMark(range.from, range.to, type));
            current.focus();
        },
        insertImage: (src: string, attrs?: Record<string, unknown>) => {
            const current = view();
            const type = node('image');

            if (!current || !type) return;

            const image = type.createAndFill({ ...(attrs ?? {}), src });

            if (!image) return;

            current.dispatch(current.state.tr.replaceSelectionWith(image).scrollIntoView());
            current.focus();
        },
        uploadImages: () => deps.requestImageUpload(),
        uploadDocuments: () => deps.requestDocumentUpload(),
        table: (rows = 3, cols = 3) => {
            const current = view();

            if (!current) return;

            const table = createTable(current.state.schema, rows, cols, deps.defaultTableColumnWidth());

            if (!table) return;

            const transaction = current.state.tr.replaceSelectionWith(table);
            const inside = TextSelection.near(transaction.doc.resolve(current.state.selection.from));

            current.dispatch(transaction.setSelection(inside).scrollIntoView());
            current.focus();
        },
        insertHorizontalRule: () => {
            const current = view();
            const type = node('horizontalRule');

            if (!current || !type) return;

            current.dispatch(current.state.tr.replaceSelectionWith(type.create()).scrollIntoView());
            current.focus();
        },
        undo: () => dispatch(undo),
        redo: () => dispatch(redo),
        print: () => deps.print()
    };
}
