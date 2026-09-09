import { defineTextEditorPlugin } from '@openng/optimus-ui/texteditor';
import { Plugin } from 'prosemirror-state';

/**
 * Live character and word counts, with an optional limit that is reported rather than enforced:
 * truncating what someone is typing is worse than telling them they went over.
 */
export interface CharacterCountStats {
    /**
     * Number of characters in the document.
     */
    characters: number;
    /**
     * Number of whitespace-separated words.
     */
    words: number;
    /**
     * The configured limit, or null when there is none.
     */
    limit: number | null;
    /**
     * Whether the count is over the limit.
     */
    over: boolean;
}

export const characterCountPlugin = defineTextEditorPlugin<{ limit?: number }>('characterCount', (ctx) => {
    const limit = ctx.options?.limit ?? null;
    const listeners = new Set<(stats: CharacterCountStats) => void>();

    const read = (): CharacterCountStats => {
        const text = ctx.getState()?.doc.textBetween(0, ctx.getState()!.doc.content.size, ' ', ' ') ?? '';
        const characters = text.length;

        return { characters, words: text.split(/\s+/).filter(Boolean).length, limit, over: limit != null && characters > limit };
    };

    const remove = ctx.registerProseMirrorPlugin(
        new Plugin({
            view: () => ({
                update: () => {
                    const stats = read();

                    listeners.forEach((listener) => listener(stats));
                }
            })
        })
    );

    ctx.onUnmounted(() => {
        listeners.clear();
        remove();
    });

    return {
        commands: {
            stats: () => read(),
            subscribe: (listener: (stats: CharacterCountStats) => void) => {
                listeners.add(listener);
                listener(read());

                return () => listeners.delete(listener);
            }
        }
    };
});
