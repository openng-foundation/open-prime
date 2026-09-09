import type { MarkType, NodeType, Schema } from 'prosemirror-model';
import { InputRule, inputRules, textblockTypeInputRule, wrappingInputRule } from 'prosemirror-inputrules';
import type { Plugin } from 'prosemirror-state';

/**
 * Turns `**text**`-style syntax into a mark. The rule fires on the closing delimiter, replaces the
 * matched range with the captured text, and applies the mark to it.
 */
function markInputRule(pattern: RegExp, type: MarkType, getAttrs?: (match: RegExpMatchArray) => Record<string, unknown>, prefixLength: (match: RegExpMatchArray) => number = () => 0): InputRule {
    return new InputRule(pattern, (state, match, start, end) => {
        const text = match[match.length - 1];

        if (!text) return null;

        const transaction = state.tr;
        /* The italic patterns match the character before the delimiter, and `start` is the start of
           the whole match: without the prefix length the rule eats that character, and `indexOf`
           finds the wrong copy of the text in `t*t*`. */
        const open = start + prefixLength(match);
        const from = start + match[0].lastIndexOf(text);
        const to = from + text.length;

        if (to < end) transaction.delete(to, end);

        if (from > open) transaction.delete(open, from);

        transaction.addMark(open, open + text.length, type.create(getAttrs?.(match) ?? null));
        /* Without this the mark stays "on" and the delimiter the user typed next would be bold too. */
        transaction.removeStoredMark(type);

        return transaction;
    });
}

/**
 * The markdown input rules, enabled by the `markdown` input. They are added and removed live, so
 * flipping the input mid-session does not rebuild the editor state.
 *
 * @group Function
 */
export function markdownInputRules(schema: Schema, defaultHighlightColor: () => string): Plugin {
    const rules: InputRule[] = [];
    const node = (name: string): NodeType | undefined => schema.nodes[name];
    const mark = (name: string): MarkType | undefined => schema.marks[name];

    if (node('heading')) rules.push(textblockTypeInputRule(/^(#{1,6})\s$/, node('heading')!, (match) => ({ level: match[1].length })));

    if (node('blockquote')) rules.push(wrappingInputRule(/^\s*>\s$/, node('blockquote')!));

    if (node('bulletList')) rules.push(wrappingInputRule(/^\s*([-+*])\s$/, node('bulletList')!));

    if (node('orderedList'))
        rules.push(
            wrappingInputRule(
                /^(\d+)\.\s$/,
                node('orderedList')!,
                (match) => ({ start: Number(match[1]) }),
                (match, node) => node.childCount + node.attrs['start'] === Number(match[1])
            )
        );

    if (node('checkList')) rules.push(wrappingInputRule(/^\s*\[([ xX]?)\]\s$/, node('checkList')!));

    if (node('codeBlock')) rules.push(textblockTypeInputRule(/^```([a-z]*)?\s$/, node('codeBlock')!, (match) => ({ language: match[1] || null })));

    if (node('horizontalRule'))
        rules.push(
            new InputRule(/^(?:---|___|\*\*\*)\s$/, (state, _match, start, end) => {
                const type = node('horizontalRule')!;

                return state.tr.replaceRangeWith(start, end, type.create());
            })
        );

    if (mark('bold')) rules.push(markInputRule(/(?:\*\*)([^*]+)(?:\*\*)$/, mark('bold')!));

    if (mark('italic')) rules.push(markInputRule(/(^|[^*])\*([^*]+)\*$/, mark('italic')!, undefined, (match) => match[1].length));

    if (mark('italic')) rules.push(markInputRule(/(^|[^_])_([^_]+)_$/, mark('italic')!, undefined, (match) => match[1].length));

    if (mark('strikethrough')) rules.push(markInputRule(/(?:~~)([^~]+)(?:~~)$/, mark('strikethrough')!));

    if (mark('code')) rules.push(markInputRule(/(?:`)([^`]+)(?:`)$/, mark('code')!));

    if (mark('textStyle')) rules.push(markInputRule(/(?:==)([^=]+)(?:==)$/, mark('textStyle')!, () => ({ backgroundColor: defaultHighlightColor() })));

    return inputRules({ rules });
}
