import { defineTextEditorPlugin } from '@openng/optimus-ui/texteditor';
import { Plugin } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

/**
 * Toggles visible markers for spaces and paragraph breaks, for spotting double spaces and stray
 * whitespace.
 */
export const invisibleCharactersPlugin = defineTextEditorPlugin('invisibleCharacters', (ctx) => {
    let enabled = false;

    const marker = (className: string, text: string) => (view: { dom: HTMLElement }) => {
        const span = view.dom.ownerDocument.createElement('span');

        span.className = className;
        span.textContent = text;
        span.setAttribute('aria-hidden', 'true');

        return span;
    };

    const plugin = new Plugin({
        props: {
            decorations: (state) => {
                if (!enabled) return null;

                const decorations: Decoration[] = [];

                state.doc.descendants((node, pos) => {
                    if (node.isText) {
                        const text = node.text ?? '';

                        for (let index = 0; index < text.length; index++) {
                            if (text[index] === ' ') decorations.push(Decoration.widget(pos + index + 1, marker('p-text-editor-invisible', '·'), { side: -1 }));
                        }

                        return false;
                    }

                    if (node.isTextblock) decorations.push(Decoration.widget(pos + node.nodeSize - 1, marker('p-text-editor-invisible', '¶')));

                    return true;
                });

                return DecorationSet.create(state.doc, decorations);
            }
        }
    });

    const remove = ctx.registerProseMirrorPlugin(plugin);

    ctx.onUnmounted(remove);

    return {
        commands: {
            toggle: () => {
                enabled = !enabled;

                const view = ctx.getView();

                view?.dispatch(view.state.tr);

                return enabled;
            },
            enabled: () => enabled
        }
    };
});
