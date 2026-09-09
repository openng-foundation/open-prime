import { defineTextEditorPlugin } from '@openng/optimus-ui/texteditor';
import { InputRule, inputRules } from 'prosemirror-inputrules';

/**
 * Smart typographic replacements while typing: dashes, ellipsis, arrows, fractions and symbols.
 *
 * The rules are ProseMirror input rules registered at runtime, which is the channel a plugin uses
 * for anything that has to react to typing rather than to a command.
 */
const REPLACEMENTS: [RegExp, string][] = [
    [/--$/, '–'],
    [/–-$/, '—'],
    [/\.\.\.$/, '…'],
    [/->$/, '→'],
    [/<-$/, '←'],
    [/=>$/, '⇒'],
    [/\(c\)$/i, '©'],
    [/\(r\)$/i, '®'],
    [/\(tm\)$/i, '™'],
    [/1\/2$/, '½'],
    [/1\/4$/, '¼'],
    [/3\/4$/, '¾'],
    [/\+-$/, '±'],
    [/!=$/, '≠']
];

export const typographyPlugin = defineTextEditorPlugin('typography', (ctx) => {
    const rules = REPLACEMENTS.map(([pattern, replacement]) => new InputRule(pattern, replacement));
    const remove = ctx.registerProseMirrorPlugin(inputRules({ rules }));

    ctx.onUnmounted(remove);

    return {
        commands: {
            list: () => REPLACEMENTS.map(([pattern, replacement]) => ({ pattern: pattern.source.replace(/\$$/, ''), replacement }))
        }
    };
});
