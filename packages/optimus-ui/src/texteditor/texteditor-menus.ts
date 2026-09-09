import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, contentChild, inject, input } from '@angular/core';
import { BaseComponent } from '@openng/optimus-ui/basecomponent';
import type { TextEditorMentionHandler, TextEditorMentionTemplate, TextEditorPartPassThrough } from '@openng/optimus-ui/types/texteditor';
import { TextEditorRoot } from './texteditor';
import { MENTION_MENU_CONTEXT, SLASH_MENU_CONTEXT } from './texteditor-contexts';
import { TextEditorMentionMenuDef, TextEditorSlashMenuDef } from './texteditor-defs';
import { caretAnchorStyle, useAnchorTick, usePopoverKeys } from './texteditor-popover';

/**
 * The slash-command palette, opened by typing `/`.
 *
 * @group Components
 */
@Component({
    selector: 'p-text-editor-slash-menu',
    standalone: true,
    imports: [NgTemplateOutlet],
    template: `
        @if (slashMenuDef(); as def) {
            <ng-container *ngTemplateOutlet="def.template; context: slotContext()" />
        } @else {
            <ng-content />
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [
        {
            provide: SLASH_MENU_CONTEXT,
            useFactory: () => {
                const menu = inject(TextEditorSlashMenu);

                return {
                    commands: menu.commands,
                    state: menu.state,
                    filterText: menu.filterText,
                    position: menu.position,
                    dismiss: () => menu.dismiss()
                };
            }
        }
    ],
    host: {
        class: 'p-text-editor-popover-menu',
        'data-scope': 'texteditor',
        'data-part': 'slash-menu',
        role: 'listbox',
        tabindex: '-1',
        '[hidden]': '!open()',
        '[style]': 'anchor()'
    }
})
export class TextEditorSlashMenu extends BaseComponent<TextEditorPartPassThrough> {
    componentName = 'TextEditorSlashMenu';

    private readonly root = inject(TextEditorRoot);

    private unregister?: () => void;

    readonly slashMenuDef = contentChild(TextEditorSlashMenuDef);

    /**
     * Whether the palette is on screen.
     */
    readonly open = computed(() => {
        const typeahead = this.root.typeaheadState();

        return typeahead.active && typeahead.trigger === 'slash';
    });

    /**
     * Text typed after the `/`.
     */
    readonly filterText = computed(() => (this.open() ? this.root.typeaheadState().text : ''));

    /**
     * Caret the palette anchors to.
     */
    readonly position = computed(() => (this.open() ? this.root.typeaheadState().position : null));

    /**
     * The formatting snapshot at the current selection.
     */
    readonly state = this.root.state;

    /**
     * The insertion command set.
     */
    readonly commands = computed(() => this.root.getSlashMenuCommands(this.root.typeaheadBlockIndex(), () => this.dismiss()));

    /**
     * Where the palette sits, in viewport coordinates.
     */
    readonly anchor = computed(() => caretAnchorStyle(this.position()));

    /**
     * The slot surface handed to `pTextEditorSlashMenuDef`.
     */
    readonly slotContext = computed(() => {
        const props = { commands: this.commands(), state: this.state(), filterText: this.filterText(), position: this.position(), dismiss: () => this.dismiss() };

        return { ...props, $implicit: props };
    });

    constructor() {
        super();
        usePopoverKeys({
            open: this.open,
            onDismiss: () => this.dismiss(),
            onActiveDescendant: (id) => this.root.setComboboxActiveDescendant(id)
        });
    }

    onInit(): void {
        this.unregister = this.root.registerPart('slash-menu');
    }

    onDestroy(): void {
        this.unregister?.();
    }

    /**
     * Closes the palette, leaving the typed text alone.
     */
    dismiss(): void {
        this.root.dismissTypeahead();
    }
}

/**
 * The `@`-mention popover, backed by a handler that resolves candidates for the current query.
 *
 * @group Components
 */
@Component({
    selector: 'p-text-editor-mention-menu',
    standalone: true,
    imports: [NgTemplateOutlet],
    template: `
        @if (mentionMenuDef(); as def) {
            <ng-container *ngTemplateOutlet="def.template; context: slotContext()" />
        } @else {
            <ng-content />
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [
        {
            provide: MENTION_MENU_CONTEXT,
            useFactory: () => {
                const menu = inject(TextEditorMentionMenu);

                return {
                    items: menu.items,
                    commands: menu.commands,
                    filterText: menu.filterText,
                    position: menu.position,
                    dismiss: () => menu.dismiss()
                };
            }
        }
    ],
    host: {
        class: 'p-text-editor-popover-menu',
        'data-scope': 'texteditor',
        'data-part': 'mention-menu',
        role: 'listbox',
        tabindex: '-1',
        '[hidden]': '!open()',
        '[style]': 'anchor()'
    }
})
export class TextEditorMentionMenu<TItem = unknown> extends BaseComponent<TextEditorPartPassThrough> {
    componentName = 'TextEditorMentionMenu';

    private readonly root = inject(TextEditorRoot);

    private unregister?: () => void;

    /**
     * Resolves the candidates for the current `@...` query.
     * @group Props
     */
    readonly handler = input<TextEditorMentionHandler<TItem> | undefined>(undefined);
    /**
     * Field name the candidates are filtered on.
     * @group Props
     */
    readonly filterField = input<string | undefined>(undefined);
    /**
     * Renders the text inserted for a selected candidate.
     * @group Props
     */
    readonly template = input<TextEditorMentionTemplate<TItem> | undefined>(undefined);

    readonly mentionMenuDef = contentChild(TextEditorMentionMenuDef);

    /**
     * Whether the popover is on screen.
     */
    readonly open = computed(() => {
        const typeahead = this.root.typeaheadState();

        return typeahead.active && typeahead.trigger === 'mention';
    });

    /**
     * Candidates resolved for the current query.
     */
    readonly items = computed(() => this.root.mentionCandidates() as TItem[]);

    /**
     * Text typed after the `@`.
     */
    readonly filterText = computed(() => (this.open() ? this.root.typeaheadState().text : ''));

    /**
     * Caret the popover anchors to.
     */
    readonly position = computed(() => (this.open() ? this.root.typeaheadState().position : null));

    /**
     * The mention command set.
     */
    readonly commands = computed(() =>
        this.root.getMentionCommands(() => this.dismiss(), {
            filterField: this.filterField() ?? 'name',
            template: (data: unknown) => this.template()?.(data as TItem) ?? String((data as Record<string, unknown>)?.['name'] ?? data)
        })
    );

    /**
     * Where the popover sits, in viewport coordinates.
     */
    readonly anchor = computed(() => caretAnchorStyle(this.position()));

    /**
     * The slot surface handed to `pTextEditorMentionMenuDef`.
     */
    readonly slotContext = computed(() => {
        const props = { items: this.items(), commands: this.commands(), filterText: this.filterText(), position: this.position(), dismiss: () => this.dismiss() };

        return { ...props, $implicit: props };
    });

    constructor() {
        super();
        usePopoverKeys({
            open: this.open,
            onDismiss: () => this.dismiss(),
            onActiveDescendant: (id) => this.root.setComboboxActiveDescendant(id)
        });
    }

    onInit(): void {
        this.unregister = this.root.registerPart('mention-menu');
        this.root.registerMentionOptions({
            handler: () => this.handler() as TextEditorMentionHandler | undefined,
            filterField: () => this.filterField(),
            template: () => this.template() as TextEditorMentionTemplate | undefined
        });
    }

    onDestroy(): void {
        this.root.registerMentionOptions(null);
        this.unregister?.();
    }

    /**
     * Closes the popover, leaving the typed text alone.
     */
    dismiss(): void {
        this.root.dismissTypeahead();
    }
}
