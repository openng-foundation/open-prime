import { NgTemplateOutlet, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, contentChild, inject, signal } from '@angular/core';
import { BaseComponent } from '@openng/optimus-ui/basecomponent';
import type { TextEditorPartPassThrough } from '@openng/optimus-ui/types/texteditor';
import { TextEditorRoot } from './texteditor';
import { NAVIGATOR_CONTEXT } from './texteditor-contexts';
import { TextEditorNavigatorMenuDef, TextEditorNavigatorTriggerDef } from './texteditor-defs';
import { anchorStyle, useAnchorTick, usePopoverKeys } from './texteditor-popover';

/**
 * The heading-outline minimap. Renderless itself: mounting it turns heading tracking on and hands
 * the outline to the trigger and the menu.
 *
 * @group Components
 */
@Component({
    selector: 'p-text-editor-navigator',
    standalone: true,
    template: `<ng-content />`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [
        {
            provide: NAVIGATOR_CONTEXT,
            useFactory: () => {
                const navigator = inject(TextEditorNavigator);

                return {
                    headings: navigator.headings,
                    activeIndex: navigator.activeIndex,
                    menuOpen: navigator.menuOpen,
                    triggerEl: navigator.triggerEl,
                    openMenu: () => navigator.openMenu(),
                    closeMenu: () => navigator.closeMenu(),
                    scrollTo: (pos: number) => navigator.scrollTo(pos)
                };
            }
        }
    ],
    host: { class: 'p-text-editor-navigator-host', 'data-scope': 'texteditor' }
})
export class TextEditorNavigator extends BaseComponent<TextEditorPartPassThrough> {
    componentName = 'TextEditorNavigator';

    private readonly root = inject(TextEditorRoot);

    private unregister?: () => void;

    private readonly open = signal(false);

    private readonly trigger = signal<HTMLElement | null>(null);

    private scrollTarget: HTMLElement | null = null;

    private readonly onScroll = () => this.root.onNavigatorScroll(this.root.headings());

    /**
     * The document's heading outline.
     */
    readonly headings = this.root.headings;

    /**
     * Index of the heading currently in view.
     */
    readonly activeIndex = this.root.activeHeadingIndex;

    /**
     * Whether the heading list is open.
     */
    readonly menuOpen = this.open.asReadonly();

    /**
     * The rail element the list anchors to.
     */
    readonly triggerEl = this.trigger.asReadonly();

    onInit(): void {
        this.unregister = this.root.registerPart('navigator');
    }

    onAfterViewInit(): void {
        if (!isPlatformBrowser(this.platformId)) return;

        /* The active heading follows the scroll container the content actually lives in, which is
           the body part when it has a height and the page otherwise. */
        this.scrollTarget = this.root.getEditorElement()?.closest('.p-text-editor-body') ?? null;
        this.scrollTarget?.addEventListener('scroll', this.onScroll, { passive: true });
        this.document.defaultView?.addEventListener('scroll', this.onScroll, { passive: true });
    }

    onDestroy(): void {
        this.scrollTarget?.removeEventListener('scroll', this.onScroll);
        this.document.defaultView?.removeEventListener('scroll', this.onScroll);
        this.unregister?.();
    }

    /**
     * Registers the rail element the popover anchors to.
     *
     * @internal
     */
    setTrigger(element: HTMLElement | null): void {
        this.trigger.set(element);
    }

    /**
     * Opens the heading list.
     */
    openMenu(): void {
        this.open.set(true);
    }

    /**
     * Closes the heading list.
     */
    closeMenu(): void {
        this.open.set(false);
    }

    /**
     * Scrolls the heading at the given position into view.
     */
    scrollTo(pos: number): void {
        this.root.scrollToHeading(pos);
        this.closeMenu();
    }
}

/**
 * The navigator rail: focusable, opens the heading list on hover, focus, Enter, Space or ArrowDown.
 *
 * @group Components
 */
@Component({
    selector: 'p-text-editor-navigator-trigger',
    standalone: true,
    imports: [NgTemplateOutlet],
    template: `
        @if (triggerDef(); as def) {
            <ng-container *ngTemplateOutlet="def.template; context: slotContext()" />
        } @else {
            <ng-content />
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'p-text-editor-navigator',
        'data-scope': 'texteditor',
        role: 'button',
        tabindex: '0',
        'aria-haspopup': 'menu',
        '[attr.aria-expanded]': 'navigator.menuOpen()',
        '(mouseenter)': 'navigator.openMenu()',
        '(focus)': 'navigator.openMenu()',
        '(keydown)': 'onKeyDown($event)'
    }
})
export class TextEditorNavigatorTrigger extends BaseComponent<TextEditorPartPassThrough> {
    componentName = 'TextEditorNavigatorTrigger';

    /**
     * The navigator this rail belongs to.
     */
    readonly navigator = inject(TextEditorNavigator);

    readonly triggerDef = contentChild(TextEditorNavigatorTriggerDef);

    /**
     * The slot surface handed to `pTextEditorNavigatorTriggerDef`.
     */
    readonly slotContext = computed(() => {
        const props = { headings: this.navigator.headings(), activeIndex: this.navigator.activeIndex() };

        return { ...props, $implicit: props };
    });

    onAfterViewInit(): void {
        this.navigator.setTrigger(this.el.nativeElement);
    }

    onDestroy(): void {
        this.navigator.setTrigger(null);
    }

    /**
     * Opens the heading list from the keyboard.
     */
    onKeyDown(event: KeyboardEvent): void {
        if (event.key !== 'Enter' && event.key !== ' ' && event.key !== 'ArrowDown') return;

        event.preventDefault();
        this.navigator.openMenu();
    }
}

/**
 * The heading list popover, anchored to the rail.
 *
 * @group Components
 */
@Component({
    selector: 'p-text-editor-navigator-menu',
    standalone: true,
    imports: [NgTemplateOutlet],
    template: `
        @if (menuDef(); as def) {
            <ng-container *ngTemplateOutlet="def.template; context: slotContext()" />
        } @else {
            <ng-content />
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'p-text-editor-navigator-popover',
        'data-scope': 'texteditor',
        'data-part': 'navigator-menu',
        role: 'menu',
        tabindex: '-1',
        '[hidden]': '!navigator.menuOpen()',
        '[style]': 'anchor()',
        '(mouseleave)': 'navigator.closeMenu()'
    }
})
export class TextEditorNavigatorMenu extends BaseComponent<TextEditorPartPassThrough> {
    componentName = 'TextEditorNavigatorMenu';

    /**
     * The navigator this popover belongs to.
     */
    readonly navigator = inject(TextEditorNavigator);

    readonly menuDef = contentChild(TextEditorNavigatorMenuDef);

    /**
     * Where the popover sits, next to the rail.
     */
    private readonly tick = useAnchorTick(this.navigator.menuOpen);

    readonly anchor = computed(() => {
        this.tick();

        return anchorStyle(this.navigator.triggerEl(), { width: 240, height: 320 });
    });

    /**
     * The slot surface handed to `pTextEditorNavigatorMenuDef`.
     */
    readonly slotContext = computed(() => {
        const props = { headings: this.navigator.headings(), activeIndex: this.navigator.activeIndex(), scrollTo: (pos: number) => this.navigator.scrollTo(pos) };

        return { ...props, $implicit: props };
    });

    constructor() {
        super();
        usePopoverKeys({ open: this.navigator.menuOpen, onDismiss: () => this.navigator.closeMenu() });
    }
}
