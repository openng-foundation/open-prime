import type { Node as ProseMirrorNode } from 'prosemirror-model';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

/**
 * The four placeholder texts, read through getters so changing an input updates the decoration on
 * the next transaction instead of rebuilding the editor state.
 */
export interface PlaceholderOptions {
    /**
     * Placeholder for the empty document, or for every empty block in block mode.
     */
    placeholder: () => string | null;
    /**
     * Placeholder shown inside empty checklist items.
     */
    checklistPlaceholder: () => string | null;
    /**
     * Placeholder shown after a lone `/` while the slash menu is open.
     */
    slashPlaceholder: () => string | null;
    /**
     * Whether the editor is in block mode, where every empty block carries a placeholder rather
     * than only the empty document.
     */
    blockMode: () => boolean;
}

export const placeholderPluginKey = new PluginKey('optimusTextEditorPlaceholder');

function isEmptyTextblock(node: ProseMirrorNode): boolean {
    return node.isTextblock && node.content.size === 0;
}

/**
 * Renders the placeholder as a decoration rather than as text, so it never enters the document and
 * cannot be selected, copied or serialized into the value.
 *
 * @group Function
 */
export function placeholderPlugin(options: PlaceholderOptions): Plugin {
    return new Plugin({
        key: placeholderPluginKey,
        props: {
            decorations: (state) => {
                const decorations: Decoration[] = [];
                const { doc, selection } = state;
                const documentIsEmpty = doc.childCount === 1 && isEmptyTextblock(doc.firstChild!);
                /* A gap cursor sits at depth 0 - between two block nodes - where there is no block
                   to take the start of, and asking for one throws. */
                const cursorBlockStart = selection.empty && selection.$from.depth > 0 ? selection.$from.before(selection.$from.depth) : -1;

                doc.descendants((node, pos) => {
                    if (!node.isTextblock) return true;

                    if (!isEmptyTextblock(node)) return false;

                    const parent = doc.resolve(pos).parent;
                    const inChecklist = parent.type.name === 'checkListItem';
                    const isCursorHere = pos === cursorBlockStart;
                    const text = inChecklist ? options.checklistPlaceholder() : options.blockMode() || documentIsEmpty ? options.placeholder() : null;

                    /* In block mode every empty block advertises itself; in classic mode only the
                       empty document does, otherwise the placeholder chases the caret down the page. */
                    if (!text || (!documentIsEmpty && !options.blockMode() && !inChecklist)) return false;

                    if (inChecklist && !isCursorHere && !text) return false;

                    decorations.push(
                        Decoration.node(pos, pos + node.nodeSize, {
                            'data-placeholder': text,
                            class: options.blockMode() ? 'p-text-editor-placeholder p-text-editor-block-placeholder' : 'p-text-editor-placeholder'
                        })
                    );

                    return false;
                });

                const slashText = options.slashPlaceholder();

                if (slashText && selection.empty && selection.$from.depth > 0) {
                    const block = selection.$from.parent;

                    if (block.isTextblock && block.textContent === '/') {
                        const start = selection.$from.before(selection.$from.depth);

                        decorations.push(Decoration.node(start, start + block.nodeSize, { 'data-placeholder': slashText, class: 'p-text-editor-placeholder' }));
                    }
                }

                return DecorationSet.create(doc, decorations);
            }
        }
    });
}
