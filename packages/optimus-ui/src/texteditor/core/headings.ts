import type { TextEditorHeadingEntry } from '@openng/optimus-ui/types/texteditor';
import type { Node as ProseMirrorNode } from 'prosemirror-model';
import { Plugin, PluginKey } from 'prosemirror-state';

export const headingsPluginKey = new PluginKey('optimusTextEditorHeadings');

/**
 * Every heading in the document, in document order. The `pos` is what the navigator scrolls to and
 * what `focusHeading` moves the caret to.
 *
 * @group Function
 */
export function collectHeadings(doc: ProseMirrorNode): TextEditorHeadingEntry[] {
    const headings: TextEditorHeadingEntry[] = [];

    doc.descendants((node, pos) => {
        if (node.type.name !== 'heading') return true;

        headings.push({ level: node.attrs['level'] as number, text: node.textContent, pos });

        return false;
    });

    return headings;
}

function sameHeadings(a: TextEditorHeadingEntry[], b: TextEditorHeadingEntry[]): boolean {
    return a.length === b.length && a.every((entry, index) => entry.pos === b[index].pos && entry.level === b[index].level && entry.text === b[index].text);
}

/**
 * Tracks the heading outline and reports it only when it actually changed - typing inside a
 * paragraph must not re-render the navigator on every keystroke.
 *
 * @group Function
 */
export function headingsPlugin(onChange: (headings: TextEditorHeadingEntry[]) => void): Plugin {
    return new Plugin({
        key: headingsPluginKey,
        view: (view) => {
            let previous = collectHeadings(view.state.doc);

            onChange(previous);

            return {
                update: (updatedView, previousState) => {
                    if (previousState.doc.eq(updatedView.state.doc)) return;

                    const next = collectHeadings(updatedView.state.doc);

                    if (sameHeadings(previous, next)) return;

                    previous = next;
                    onChange(next);
                }
            };
        }
    });
}
