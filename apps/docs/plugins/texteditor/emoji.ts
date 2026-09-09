import { defineTextEditorPlugin } from '@openng/optimus-ui/texteditor';
import { InputRule, inputRules } from 'prosemirror-inputrules';

/**
 * Converts `:shortcode:` to an emoji while typing, and exposes an insert command for picker UIs.
 */
const DEFAULT_MAP: Record<string, string> = {
    fire: '🔥',
    rocket: '🚀',
    tada: '🎉',
    sparkles: '✨',
    bug: '🐛',
    heart: '❤️',
    thumbsup: '👍',
    eyes: '👀'
};

export const emojiPlugin = defineTextEditorPlugin<{ map?: Record<string, string> }>('emoji', (ctx) => {
    const map = { ...DEFAULT_MAP, ...ctx.options?.map };
    const rule = new InputRule(/:([a-z0-9_+-]+):$/, (state, match, start, end) => {
        const emoji = map[match[1]];

        return emoji ? state.tr.insertText(emoji, start, end) : null;
    });
    const remove = ctx.registerProseMirrorPlugin(inputRules({ rules: [rule] }));

    ctx.onUnmounted(remove);

    return {
        commands: {
            insert: (code: string) => ctx.replaceSelection(map[code.replace(/:/g, '')] ?? code),
            list: () => Object.entries(map).map(([shortcode, emoji]) => ({ shortcode, emoji }))
        }
    };
});
