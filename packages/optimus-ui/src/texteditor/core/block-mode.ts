import type { TextEditorBlockMenuCommands } from '@openng/optimus-ui/types/texteditor';
import type { Node as ProseMirrorNode } from 'prosemirror-model';
import { NodeSelection, Plugin, PluginKey, TextSelection } from 'prosemirror-state';
import { Decoration, DecorationSet, EditorView } from 'prosemirror-view';
import { setTextStyle, toggleBlockType, toggleList, toggleWrap } from './commands';

export const blockModePluginKey = new PluginKey('optimusTextEditorBlockMode');

/**
 * The type name shown on the block handle: `text` for a paragraph, `heading:2` for an H2, the node
 * name for everything else.
 *
 * @group Function
 */
export function blockTypeAt(view: EditorView, index: number): string {
    const node = view.state.doc.maybeChild(index);

    if (!node) return 'text';

    if (node.type.name === 'paragraph') return 'text';

    if (node.type.name === 'heading') return `heading:${node.attrs['level']}`;

    return node.type.name;
}

/**
 * Options the block-mode plugin reads on every render.
 */
export interface BlockModeOptions {
    /**
     * Reports the block under the pointer, so the hover bar can follow it.
     */
    onHoverChange: (element: HTMLElement | null, index: number) => void;
    /**
     * Index the drop indicator is drawn above, or null while nothing is being dragged.
     */
    dropIndicatorIndex: () => number | null;
    /**
     * Index of the block being dragged, or null.
     */
    draggedIndex: () => number | null;
}

/**
 * Marks up the top-level blocks and drives the block-mode affordances: the hover bar's anchor, the
 * drag source's dimmed state, and the drop indicator line.
 *
 * @group Function
 */
export function blockModePlugin(options: BlockModeOptions): Plugin {
    let hoveredIndex = -1;

    return new Plugin({
        key: blockModePluginKey,
        props: {
            attributes: { 'data-block-mode': 'true' },
            decorations: (state) => {
                const decorations: Decoration[] = [];
                const dragged = options.draggedIndex();
                const dropIndex = options.dropIndicatorIndex();
                let index = 0;
                let pos = 0;

                state.doc.forEach((node) => {
                    const attrs: Record<string, string> = { class: 'p-text-editor-block', 'data-block-index': String(index) };

                    if (dragged === index) attrs['data-dragging'] = '';

                    decorations.push(Decoration.node(pos, pos + node.nodeSize, attrs));
                    pos += node.nodeSize;
                    index++;
                });

                if (dropIndex != null) {
                    const positions = [...blockPositionsOf(state.doc), state.doc.content.size];
                    const at = positions[Math.min(dropIndex, positions.length - 1)];

                    decorations.push(
                        Decoration.widget(at, (view) => {
                            const line = view.dom.ownerDocument.createElement('div');

                            line.className = 'p-text-editor-block-drop-indicator';

                            return line;
                        })
                    );
                }

                return DecorationSet.create(state.doc, decorations);
            },
            handleDOMEvents: {
                mousemove: (view, event) => {
                    const target = (event.target as HTMLElement | null)?.closest?.('[data-block-index]') as HTMLElement | null;

                    /* Crossing the gutter the hover bar lives in means the pointer is over the
                       content but over no block. Keeping the last block is what lets the user reach
                       the handle at all: clearing here made the bar vanish under the cursor. */
                    if (!target) return false;

                    const index = Number(target.getAttribute('data-block-index'));

                    if (index === hoveredIndex) return false;

                    hoveredIndex = index;
                    options.onHoverChange(target, index);

                    return false;
                },
                mouseleave: () => {
                    if (hoveredIndex === -1) return false;

                    hoveredIndex = -1;
                    options.onHoverChange(null, -1);

                    return false;
                }
            },
            handleKeyDown: (view, event) => {
                const isSelectAll = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'a';

                if (!isSelectAll) return false;

                const { selection, doc } = view.state;
                const $from = selection.$from;

                /* A gap cursor between blocks has no block of its own, and its index can sit one
                   past the last child; either one turns the lookup below into a throw. */
                if ($from.depth === 0 || $from.index(0) >= doc.childCount) return false;

                const blockStart = $from.before(1);
                const block = doc.child($from.index(0));
                const blockEnd = blockStart + block.nodeSize;
                const wholeBlockSelected = selection.from <= blockStart + 1 && selection.to >= blockEnd - 1;

                /* First press takes the block, second takes the document: the same escalation
                   Notion-style editors use, and the reason Mod-A is intercepted at all. */
                if (wholeBlockSelected) return false;

                view.dispatch(view.state.tr.setSelection(TextSelection.create(doc, blockStart + 1, blockEnd - 1)));

                return true;
            }
        }
    });
}

/**
 * Start position of every top-level block, which is all the index arithmetic in block mode needs.
 */
function blockPositionsOf(doc: ProseMirrorNode): number[] {
    const positions: number[] = [];
    let pos = 0;

    doc.forEach((node) => {
        positions.push(pos);
        pos += node.nodeSize;
    });

    return positions;
}

/**
 * Moves a block to another index, the drop half of block drag-and-drop.
 *
 * @group Function
 */
export function moveBlock(view: EditorView, fromIndex: number, toIndex: number): void {
    const { doc } = view.state;

    if (fromIndex === toIndex || fromIndex < 0 || fromIndex >= doc.childCount) return;

    const positions = blockPositionsOf(doc);
    const node = doc.child(fromIndex);
    const from = positions[fromIndex];
    const transaction = view.state.tr.delete(from, from + node.nodeSize);
    const target = toIndex > fromIndex ? toIndex - 1 : toIndex;
    const remaining = blockPositionsOf(transaction.doc);
    const insertAt = target >= remaining.length ? transaction.doc.content.size : remaining[target];

    view.dispatch(transaction.insert(insertAt, node));
}

/**
 * Inserts an empty paragraph after the given block and puts the caret in it, the add button on the
 * hover bar.
 *
 * @group Function
 */
export function addBlockAfter(view: EditorView, index: number): void {
    const paragraph = view.state.schema.nodes['paragraph'];

    if (!paragraph) return;

    const positions = blockPositionsOf(view.state.doc);
    const node = view.state.doc.maybeChild(index);
    const at = node ? positions[index] + node.nodeSize : view.state.doc.content.size;
    const transaction = view.state.tr.insert(at, paragraph.create());

    view.dispatch(transaction.setSelection(TextSelection.near(transaction.doc.resolve(at + 1))).scrollIntoView());
    view.focus();
}

/**
 * Puts the selection inside the given block, so a command dispatched from the block menu acts on
 * that block and not on wherever the caret happened to be.
 */
function selectBlock(view: EditorView, index: number, whole = false): boolean {
    const positions = blockPositionsOf(view.state.doc);

    if (index < 0 || index >= positions.length) return false;

    const pos = positions[index];
    const node = view.state.doc.child(index);

    if (!node.isTextblock) {
        view.dispatch(view.state.tr.setSelection(NodeSelection.create(view.state.doc, pos)));

        return true;
    }

    /* Colours act on a selection, so a command that recolours the block has to select its text
       first: with a caret the mark would only be stored for the next character typed. */
    const selection = whole && node.content.size ? TextSelection.create(view.state.doc, pos + 1, pos + node.nodeSize - 1) : TextSelection.near(view.state.doc.resolve(pos + 1));

    view.dispatch(view.state.tr.setSelection(selection));

    return true;
}

/**
 * The command set behind the block handle menu. Every entry re-selects the block first, so the menu
 * acts on the block it was opened from even after the caret moved.
 *
 * @group Function
 */
export function createBlockMenuCommands(getView: () => EditorView | null, blockIndex: () => number, onDismiss: () => void): TextEditorBlockMenuCommands {
    const withBlock =
        (action: (view: EditorView, index: number) => void, whole = false) =>
        () => {
            const view = getView();
            const index = blockIndex();

            if (!view || !selectBlock(view, index, whole)) return;

            action(view, index);
            onDismiss();
            view.focus();
        };

    const convert = (run: (view: EditorView) => void) => withBlock((view) => run(view));

    return {
        duplicate: withBlock((view, index) => {
            const positions = blockPositionsOf(view.state.doc);
            const node = view.state.doc.child(index);

            view.dispatch(view.state.tr.insert(positions[index] + node.nodeSize, node.copy(node.content)));
        }),
        copyToClipboard: withBlock((view, index) => {
            const node = view.state.doc.child(index);

            void view.dom.ownerDocument.defaultView?.navigator.clipboard?.writeText(node.textContent);
        }),
        deleteBlock: withBlock((view, index) => {
            const positions = blockPositionsOf(view.state.doc);
            const node = view.state.doc.child(index);

            view.dispatch(view.state.tr.delete(positions[index], positions[index] + node.nodeSize));
        }),
        foregroundColor: (color: string) => withBlock((view) => setTextStyle({ color: color || null })(view.state, view.dispatch), true)(),
        backgroundColor: (color: string) => withBlock((view) => setTextStyle({ backgroundColor: color || null })(view.state, view.dispatch), true)(),
        turnInto: {
            text: convert((view) => toggleBlockType(view.state.schema.nodes['paragraph'], null, view.state.schema.nodes['paragraph'])(view.state, view.dispatch, view)),
            heading1: convert((view) => toggleBlockType(view.state.schema.nodes['heading'], { level: 1 }, view.state.schema.nodes['paragraph'])(view.state, view.dispatch, view)),
            heading2: convert((view) => toggleBlockType(view.state.schema.nodes['heading'], { level: 2 }, view.state.schema.nodes['paragraph'])(view.state, view.dispatch, view)),
            heading3: convert((view) => toggleBlockType(view.state.schema.nodes['heading'], { level: 3 }, view.state.schema.nodes['paragraph'])(view.state, view.dispatch, view)),
            bulletList: convert((view) => toggleList(view.state.schema.nodes['bulletList'], view.state.schema.nodes['listItem'])(view.state, view.dispatch, view)),
            orderedList: convert((view) => toggleList(view.state.schema.nodes['orderedList'], view.state.schema.nodes['listItem'])(view.state, view.dispatch, view)),
            checkList: convert((view) => toggleList(view.state.schema.nodes['checkList'], view.state.schema.nodes['checkListItem'])(view.state, view.dispatch, view)),
            blockquote: convert((view) => toggleWrap(view.state.schema.nodes['blockquote'])(view.state, view.dispatch, view)),
            codeBlock: convert((view) => toggleBlockType(view.state.schema.nodes['codeBlock'], null, view.state.schema.nodes['paragraph'])(view.state, view.dispatch, view))
        }
    };
}
