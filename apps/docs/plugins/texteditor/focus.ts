import { defineTextEditorPlugin } from '@openng/optimus-ui/texteditor';
import { Plugin } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

/**
 * Dims every block except the one the caret is in, for distraction-free writing.
 *
 * The dimming is a decoration rather than a class written into the document: focus mode is a view
 * concern, and nothing it does should reach the serialized value.
 */
export const focusPlugin = defineTextEditorPlugin('focus', (ctx) => {
    let enabled = false;

    const plugin = new Plugin({
        props: {
            decorations: (state) => {
                if (!enabled) return null;

                const decorations: Decoration[] = [];
                const active = state.selection.$from.depth > 0 ? state.selection.$from.before(1) : -1;
                let pos = 0;

                state.doc.forEach((node) => {
                    if (pos !== active) decorations.push(Decoration.node(pos, pos + node.nodeSize, { class: 'p-text-editor-focus-dimmed' }));

                    pos += node.nodeSize;
                });

                return DecorationSet.create(state.doc, decorations);
            }
        }
    });

    const remove = ctx.registerProseMirrorPlugin(plugin);

    ctx.onUnmounted(remove);

    /** Re-runs the decoration pass after the flag flips. */
    const refresh = () => {
        const view = ctx.getView();

        view?.dispatch(view.state.tr);
    };

    return {
        commands: {
            toggle: () => {
                enabled = !enabled;
                refresh();

                return enabled;
            },
            enabled: () => enabled
        }
    };
});
