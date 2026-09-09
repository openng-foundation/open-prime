import { NgTemplateOutlet, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, contentChild, inject, input, signal } from '@angular/core';
import { BaseComponent } from '@openng/optimus-ui/basecomponent';
import type { TextEditorPartPassThrough } from '@openng/optimus-ui/types/texteditor';
import { TextEditorRoot } from './texteditor';
import { CONTEXT_TOOLBAR_CONTEXT } from './texteditor-contexts';
import { TextEditorContextToolbarDef, TextEditorContextToolbarMoreDef, TextEditorToolbarDef } from './texteditor-defs';
import { anchorStyle, caretAnchorStyle, useAnchorTick, usePopoverKeys } from './texteditor-popover';

/**
 * The static toolbar surface: a persistent `role="toolbar"` region above the content that the host
 * application fills with its own widgets.
 *
 * @group Components
 */
@Component({
    selector: 'p-text-editor-toolbar',
    standalone: true,
    imports: [NgTemplateOutlet],
    template: `
        @if (toolbarDef(); as def) {
            <ng-container *ngTemplateOutlet="def.template; context: slotContext()" />
        } @else {
            <ng-content />
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'p-text-editor-toolbar',
        'data-scope': 'texteditor',
        'data-part': 'toolbar',
        role: 'toolbar',
        'aria-orientation': 'horizontal',
        '[attr.aria-label]': 'ariaLabel()'
    }
})
export class TextEditorToolbar extends BaseComponent<TextEditorPartPassThrough> {
    componentName = 'TextEditorToolbar';

    private readonly root = inject(TextEditorRoot);

    private unregister?: () => void;

    private resizeObserver?: ResizeObserver;

    /**
     * Accessible name of the toolbar region.
     * @defaultValue 'Formatting'
     * @group Props
     */
    readonly ariaLabel = input<string>('Formatting');

    readonly toolbarDef = contentChild(TextEditorToolbarDef);

    /**
     * The slot surface handed to `pTextEditorToolbarDef`, already unwrapped.
     */
    readonly slotContext = computed(() => {
        const props = { commands: this.root.commands(), state: this.root.state(), plugins: this.root.pluginCommands(), pluginCommands: this.root.pluginCommands() };

        return { ...props, $implicit: props };
    });

    onInit(): void {
        this.unregister = this.root.registerPart('toolbar');
    }

    onAfterViewInit(): void {
        if (!isPlatformBrowser(this.platformId)) return;

        /* Published on the root rather than measured by each sibling: the navigator and the block
           controls have to clear the toolbar without depending on where they sit in source order. */
        const publish = () => this.root.el.nativeElement.style.setProperty('--p-text-editor-toolbar-height', `${this.el.nativeElement.offsetHeight}px`);

        publish();
        this.resizeObserver = new ResizeObserver(publish);
        this.resizeObserver.observe(this.el.nativeElement);
    }

    onDestroy(): void {
        this.resizeObserver?.disconnect();
        this.unregister?.();
    }
}

/**
 * The floating toolbar anchored to the selection. It opens when text is selected and closes on the
 * first document edit.
 *
 * @group Components
 */
@Component({
    selector: 'p-text-editor-context-toolbar',
    standalone: true,
    imports: [NgTemplateOutlet],
    template: `
        @if (contextToolbarDef(); as def) {
            <ng-container *ngTemplateOutlet="def.template; context: slotContext()" />
        } @else {
            <ng-content />
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [
        {
            provide: CONTEXT_TOOLBAR_CONTEXT,
            useFactory: () => {
                const toolbar = inject(TextEditorContextToolbar);

                return {
                    commands: toolbar.commands,
                    state: toolbar.state,
                    pluginCommands: toolbar.pluginCommands,
                    moreActive: toolbar.moreActive,
                    moreTrigger: toolbar.moreTrigger,
                    toggleMore: (event?: Event) => toolbar.toggleMore(event),
                    setMoreTrigger: (element: HTMLElement | null) => toolbar.setMoreTrigger(element),
                    dismiss: () => toolbar.dismiss()
                };
            }
        }
    ],
    host: {
        class: 'p-text-editor-context-toolbar',
        'data-scope': 'texteditor',
        'data-part': 'context-toolbar',
        role: 'toolbar',
        'aria-orientation': 'horizontal',
        '[attr.aria-label]': 'ariaLabel()',
        '[hidden]': '!open()',
        '[style]': 'anchor()'
    }
})
export class TextEditorContextToolbar extends BaseComponent<TextEditorPartPassThrough> {
    componentName = 'TextEditorContextToolbar';

    private readonly root = inject(TextEditorRoot);

    private unregister?: () => void;

    private readonly dismissedFor = signal<string | null>(null);

    private readonly more = signal(false);

    private readonly moreAnchor = signal<HTMLElement | null>(null);

    /**
     * Accessible name of the floating toolbar.
     * @defaultValue 'Selection formatting'
     * @group Props
     */
    readonly ariaLabel = input<string>('Selection formatting');

    readonly contextToolbarDef = contentChild(TextEditorContextToolbarDef);

    /**
     * The imperative command surface.
     */
    readonly commands = this.root.commands;

    /**
     * The formatting snapshot at the current selection.
     */
    readonly state = this.root.state;

    /**
     * Commands contributed by plugins.
     */
    readonly pluginCommands = this.root.pluginCommands;

    /**
     * Whether the overflow panel is open.
     */
    readonly moreActive = this.more.asReadonly();

    /**
     * The element the overflow panel anchors to.
     */
    readonly moreTrigger = this.moreAnchor.asReadonly();

    /**
     * Whether the toolbar is on screen.
     */
    /* Dismissal is remembered against the caret it was dismissed for, so Escape hides the toolbar
       for this selection and the next selection brings it back. */
    readonly open = computed(() => {
        const caret = this.root.contextToolbarPosition();

        return !!caret && this.root.contextSelectionKey() !== this.dismissedFor();
    });

    /**
     * Where the toolbar sits, in viewport coordinates.
     */
    readonly anchor = computed(() => caretAnchorStyle(this.root.contextToolbarPosition(), { width: 320, height: 44 }));

    /**
     * The slot surface handed to `pTextEditorContextToolbarDef`.
     */
    readonly slotContext = computed(() => {
        const props = {
            commands: this.commands(),
            state: this.state(),
            plugins: this.pluginCommands(),
            pluginCommands: this.pluginCommands(),
            moreActive: this.more(),
            toggleMore: (event?: Event) => this.toggleMore(event),
            dismiss: () => this.dismiss()
        };

        return { ...props, $implicit: props };
    });

    constructor() {
        super();
        usePopoverKeys({ open: this.open, onDismiss: () => this.dismiss(), navigable: false });
    }

    onInit(): void {
        this.unregister = this.root.registerPart('context-toolbar');
    }

    onDestroy(): void {
        this.unregister?.();
    }

    /**
     * Opens or closes the overflow panel.
     */
    toggleMore(event?: Event): void {
        const target = event?.currentTarget as HTMLElement | null;

        if (target) this.moreAnchor.set(target);

        this.more.update((open) => !open);
    }

    /**
     * Registers the element the overflow panel anchors to.
     */
    setMoreTrigger(element: HTMLElement | null): void {
        this.moreAnchor.set(element);
    }

    /**
     * Closes the toolbar until the next selection.
     */
    dismiss(): void {
        this.more.set(false);
        this.dismissedFor.set(this.root.contextSelectionKey());
    }
}

/**
 * The overflow panel of the context toolbar, opened from a "more" trigger inside it.
 *
 * @group Components
 */
@Component({
    selector: 'p-text-editor-context-toolbar-more',
    standalone: true,
    imports: [NgTemplateOutlet],
    template: `
        @if (moreDef(); as def) {
            <ng-container *ngTemplateOutlet="def.template; context: slotContext()" />
        } @else {
            <ng-content />
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'p-text-editor-context-toolbar-more',
        'data-scope': 'texteditor',
        'data-part': 'context-toolbar-more',
        role: 'menu',
        '[hidden]': '!toolbar.moreActive()',
        '[style]': 'anchor()'
    }
})
export class TextEditorContextToolbarMore extends BaseComponent<TextEditorPartPassThrough> {
    componentName = 'TextEditorContextToolbarMore';

    /**
     * The floating toolbar this panel belongs to.
     */
    readonly toolbar = inject(TextEditorContextToolbar);

    readonly moreDef = contentChild(TextEditorContextToolbarMoreDef);

    /**
     * Where the panel sits, in viewport coordinates.
     */
    private readonly tick = useAnchorTick(this.toolbar.moreActive);

    readonly anchor = computed(() => {
        this.tick();

        return anchorStyle(this.toolbar.moreTrigger(), { width: 220, height: 240 });
    });

    /**
     * The slot surface handed to `pTextEditorContextToolbarMoreDef`.
     */
    readonly slotContext = computed(() => {
        const props = { commands: this.toolbar.commands(), state: this.toolbar.state(), dismiss: () => this.toolbar.toggleMore() };

        return { ...props, $implicit: props };
    });

    constructor() {
        super();
        usePopoverKeys({ open: this.toolbar.moreActive, onDismiss: () => this.toolbar.toggleMore() });
    }
}
