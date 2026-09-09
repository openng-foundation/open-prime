import type { CaretPosition } from '@openng/optimus-ui/types/texteditor';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet, EditorView } from 'prosemirror-view';

/**
 * Which type-ahead is open. Both share one plugin because they share one rule: a trigger character,
 * the text typed after it, and a caret to anchor a popover to.
 */
export type TypeaheadTrigger = 'slash' | 'mention';

/**
 * What the runtime knows about an open type-ahead.
 */
export interface TypeaheadState {
    /**
     * Whether a type-ahead is currently open.
     */
    active: boolean;
    /**
     * Which trigger opened it.
     */
    trigger: TypeaheadTrigger | null;
    /**
     * Document position of the trigger character.
     */
    from: number;
    /**
     * Text typed after the trigger.
     */
    text: string;
    /**
     * Position of a trigger the user dismissed, so it does not reopen on the next keystroke.
     */
    dismissedAt: number | null;
}

const INACTIVE: TypeaheadState = { active: false, trigger: null, from: 0, text: '', dismissedAt: null };

export const typeaheadPluginKey = new PluginKey<TypeaheadState>('optimusTextEditorTypeahead');

/**
 * Reads the type-ahead the caret currently sits in. The trigger has to be preceded by the start of
 * the block or by whitespace, so an e-mail address never opens the mention popover, and the query
 * itself stops at the first space.
 */
function detect(text: string, offset: number, enabled: { slash: boolean; mention: boolean }): { trigger: TypeaheadTrigger; start: number; query: string } | null {
    for (let index = offset - 1; index >= 0; index--) {
        const character = text[index];

        if (/\s/.test(character)) return null;

        const isSlash = character === '/' && enabled.slash;
        const isMention = character === '@' && enabled.mention;

        if (!isSlash && !isMention) continue;

        const before = index === 0 ? '' : text[index - 1];

        if (before && !/\s/.test(before)) return null;

        return { trigger: isSlash ? 'slash' : 'mention', start: index, query: text.slice(index + 1, offset) };
    }

    return null;
}

/**
 * Options the plugin reads on every transaction, so mounting a menu part turns its trigger on
 * without rebuilding the editor state.
 */
export interface TypeaheadOptions {
    /**
     * Whether the slash menu part is mounted.
     */
    slashEnabled: () => boolean;
    /**
     * Whether the mention menu part is mounted.
     */
    mentionEnabled: () => boolean;
    /**
     * Reports the current state after every transaction, with the caret the popover anchors to.
     */
    onUpdate: (trigger: TypeaheadTrigger, active: boolean, text: string, position: CaretPosition | null) => void;
    /**
     * Lets the open menu answer Arrow/Enter/Escape before the editor does.
     */
    onKeyDown: (event: KeyboardEvent, state: TypeaheadState) => boolean;
}

/**
 * Reads the caret rectangle in viewport coordinates, the anchor every floating surface positions
 * itself against.
 *
 * @group Function
 */
export function caretPositionAt(view: EditorView, pos: number): CaretPosition {
    const coords = view.coordsAtPos(pos);

    return {
        top: coords.top,
        left: coords.left,
        bottom: coords.bottom,
        width: Math.max(coords.right - coords.left, 1),
        height: Math.max(coords.bottom - coords.top, 1)
    };
}

/**
 * Detects the `/` and `@` type-aheads, decorates the text being typed, and hands the state to the
 * component, which relays it to whichever menu part is mounted.
 *
 * @group Function
 */
export function typeaheadPlugin(options: TypeaheadOptions): Plugin<TypeaheadState> {
    return new Plugin<TypeaheadState>({
        key: typeaheadPluginKey,
        state: {
            init: () => INACTIVE,
            apply: (transaction, previous, _oldState, newState) => {
                const enabled = { slash: options.slashEnabled(), mention: options.mentionEnabled() };

                if (!enabled.slash && !enabled.mention) return INACTIVE;

                /* A dismissal outlives the transaction that carried it: Escape closes the menu for
                   that trigger, and it must not spring back open on the next character typed. */
                const dismissedAt = transaction.getMeta(typeaheadPluginKey) === 'dismiss' ? (previous.active ? previous.from : (previous.dismissedAt ?? null)) : previous.dismissedAt != null ? transaction.mapping.map(previous.dismissedAt) : null;
                const { selection } = newState;

                if (!selection.empty) return { ...INACTIVE, dismissedAt };

                const { $from } = selection;
                const textBefore = $from.parent.textBetween(0, $from.parentOffset, undefined, '\ufffc');
                const match = detect(textBefore, textBefore.length, enabled);

                if (!match) return INACTIVE;

                const from = $from.start() + match.start;

                if (dismissedAt === from) return { ...INACTIVE, dismissedAt };

                return { active: true, trigger: match.trigger, from, text: match.query, dismissedAt: null };
            }
        },
        props: {
            decorations: (state) => {
                const current = typeaheadPluginKey.getState(state);

                if (!current?.active) return null;

                const to = state.selection.from;
                const className = current.trigger === 'slash' ? 'p-text-editor-slash-typing' : 'p-text-editor-mention-typing';

                return DecorationSet.create(state.doc, [Decoration.inline(current.from, to, { class: className })]);
            },
            handleKeyDown: (view, event) => {
                const current = typeaheadPluginKey.getState(view.state);

                if (!current?.active) return false;

                return options.onKeyDown(event, current);
            }
        },
        view: (view) => {
            let previous: TypeaheadState = INACTIVE;

            const report = () => {
                const current = typeaheadPluginKey.getState(view.state) ?? INACTIVE;

                if (current.active === previous.active && current.text === previous.text && current.trigger === previous.trigger) return;

                previous = current;

                const trigger = current.trigger ?? previous.trigger;

                if (!trigger) {
                    options.onUpdate('slash', false, '', null);
                    options.onUpdate('mention', false, '', null);

                    return;
                }

                options.onUpdate(trigger, current.active, current.text, current.active ? caretPositionAt(view, view.state.selection.from) : null);
            };

            report();

            return { update: report };
        }
    });
}

/**
 * Removes the trigger and the query from the document, the step every menu takes before inserting
 * what the user picked.
 *
 * @group Function
 */
export function clearTypeahead(view: EditorView): { from: number; to: number } | null {
    const current = typeaheadPluginKey.getState(view.state);

    if (!current?.active) return null;

    const range = { from: current.from, to: view.state.selection.from };

    view.dispatch(view.state.tr.delete(range.from, range.to).setMeta(typeaheadPluginKey, 'dismiss'));

    return range;
}

/**
 * Closes an open type-ahead without touching the text, for Escape and click-outside.
 *
 * @group Function
 */
export function dismissTypeahead(view: EditorView): void {
    view.dispatch(view.state.tr.setMeta(typeaheadPluginKey, 'dismiss'));
}
