import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, contentChild, inject, signal } from '@angular/core';
import { BaseComponent } from '@openng/optimus-ui/basecomponent';
import type { TextEditorPartPassThrough } from '@openng/optimus-ui/types/texteditor';
import { TextEditorRoot } from './texteditor';
import { BLOCK_CONTROLS_CONTEXT, BLOCK_MENU_CONTEXT } from './texteditor-contexts';
import { TextEditorBlockControlsDef, TextEditorBlockMenuDef, TextEditorBlockSubmenuDef } from './texteditor-defs';
import { anchorStyle, createSubmenuController, useAnchorTick, usePopoverKeys } from './texteditor-popover';

/**
 * The block-mode hover bar. It teleports next to the block under the pointer and hands the host the
 * add button and the drag handle.
 *
 * @group Components
 */
@Component({
    selector: 'p-text-editor-block-controls',
    standalone: true,
    imports: [NgTemplateOutlet],
    template: `
        @if (blockControlsDef(); as def) {
            <ng-container *ngTemplateOutlet="def.template; context: slotContext()" />
        } @else {
            <ng-content />
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [
        {
            provide: BLOCK_CONTROLS_CONTEXT,
            useFactory: () => {
                const controls = inject(TextEditorBlockControls);

                return {
                    index: controls.index,
                    blockType: controls.blockType,
                    addBlock: (index: number) => controls.addBlock(index),
                    onDragStart: (index: number, event: DragEvent) => controls.onDragStart(index, event),
                    onDragEnd: () => controls.onDragEnd(),
                    onDragHandleClick: (index: number, event: MouseEvent) => controls.onDragHandleClick(index, event)
                };
            }
        }
    ],
    host: {
        class: 'p-text-editor-block-controls',
        'data-scope': 'texteditor',
        'data-part': 'block-controls',
        '[attr.data-block-type]': 'blockType()',
        '[hidden]': 'index() < 0',
        '[style]': 'anchor()',
        '(mouseenter)': 'root.setBlockControlsHovered(true)',
        '(mouseleave)': 'root.setBlockControlsHovered(false)'
    }
})
export class TextEditorBlockControls extends BaseComponent<TextEditorPartPassThrough> {
    componentName = 'TextEditorBlockControls';

    /**
     * The editor this bar belongs to.
     */
    readonly root = inject(TextEditorRoot);

    private unregister?: () => void;

    readonly blockControlsDef = contentChild(TextEditorBlockControlsDef);

    /**
     * Index of the hovered block.
     */
    readonly index = this.root.hoveredBlockIndex;

    /**
     * Type of the hovered block, such as `text` or `heading:2`.
     */
    readonly blockType = computed(() => {
        /* The type comes from the live document, which is not a signal: reading the format state
           here is what re-runs this after a Turn Into. */
        this.root.state();

        return this.index() < 0 ? 'text' : this.root.getBlockType(this.index());
    });

    /**
     * Where the bar sits: pinned to the inline start of the hovered block, in viewport coordinates.
     */
    private readonly tick = useAnchorTick(computed(() => this.index() >= 0));

    readonly anchor = computed(() => {
        this.tick();

        const element = this.root.hoveredBlockElement();

        if (!element) return { display: 'none' };

        const rect = element.getBoundingClientRect();

        return { position: 'fixed', top: `${rect.top}px`, left: `${rect.left}px` };
    });

    /**
     * The slot surface handed to `pTextEditorBlockControlsDef`.
     */
    readonly slotContext = computed(() => {
        const props = {
            index: this.index(),
            blockType: this.blockType(),
            addBlock: (index: number) => this.addBlock(index),
            onDragStart: (index: number, event: DragEvent) => this.onDragStart(index, event),
            onDragEnd: () => this.onDragEnd(),
            onDragHandleClick: (index: number, event: MouseEvent) => this.onDragHandleClick(index, event)
        };

        return { ...props, $implicit: props };
    });

    onInit(): void {
        this.unregister = this.root.registerPart('block-controls');
    }

    onDestroy(): void {
        this.unregister?.();
    }

    /**
     * Inserts an empty block after the given index.
     */
    addBlock(index: number): void {
        this.root.addBlockAfter(index);
    }

    /**
     * Starts a block drag.
     */
    onDragStart(index: number, event: DragEvent): void {
        this.root.onBlockDragStart(index, event);
    }

    /**
     * Ends a block drag, applying the move.
     */
    onDragEnd(): void {
        this.root.onBlockDragEnd();
    }

    /**
     * Opens the block menu from the drag handle.
     */
    onDragHandleClick(index: number, event: MouseEvent): void {
        event.preventDefault();
        event.stopPropagation();
        this.root.openBlockMenu(index, event.currentTarget as HTMLElement);
    }
}

/**
 * The per-block options popover, opened from the drag handle.
 *
 * @group Components
 */
@Component({
    selector: 'p-text-editor-block-menu',
    standalone: true,
    imports: [NgTemplateOutlet],
    template: `
        @if (blockMenuDef(); as def) {
            <ng-container *ngTemplateOutlet="def.template; context: slotContext()" />
        }
        <ng-content />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [
        {
            provide: BLOCK_MENU_CONTEXT,
            useFactory: () => {
                const menu = inject(TextEditorBlockMenu);

                return {
                    blockIndex: menu.blockIndex,
                    blockType: menu.blockType,
                    commands: menu.commands,
                    state: menu.state,
                    submenu: menu.submenu,
                    dismiss: () => menu.dismiss()
                };
            }
        }
    ],
    host: {
        class: 'p-text-editor-popover-menu',
        'data-scope': 'texteditor',
        'data-part': 'block-menu',
        role: 'menu',
        tabindex: '-1',
        '[hidden]': '!open()',
        '[style]': 'anchor()'
    }
})
export class TextEditorBlockMenu extends BaseComponent<TextEditorPartPassThrough> {
    componentName = 'TextEditorBlockMenu';

    private readonly root = inject(TextEditorRoot);

    private unregister?: () => void;

    readonly blockMenuDef = contentChild(TextEditorBlockMenuDef);

    /**
     * The submenu controller both halves of the menu share.
     */
    readonly submenu = createSubmenuController();

    /**
     * Whether the menu is on screen.
     */
    readonly open = computed(() => !!this.root.blockMenuAnchor());

    /**
     * Index of the block the menu was opened from.
     */
    readonly blockIndex = computed(() => this.root.blockMenuAnchor()?.index ?? -1);

    /**
     * Type of that block.
     */
    readonly blockType = computed(() => {
        this.root.state();

        return this.blockIndex() < 0 ? 'text' : this.root.getBlockType(this.blockIndex());
    });

    /**
     * The formatting snapshot at the current selection.
     */
    readonly state = this.root.state;

    /**
     * The block command set, rebound whenever the menu opens on another block.
     */
    readonly commands = computed(() => this.root.getBlockMenuCommands(this.blockIndex(), () => this.dismiss()));

    /**
     * Where the menu sits, in viewport coordinates.
     */
    private readonly tick = useAnchorTick(this.open);

    readonly anchor = computed(() => {
        this.tick();

        return anchorStyle(this.root.blockMenuAnchor()?.anchor ?? null);
    });

    /**
     * The slot surface handed to `pTextEditorBlockMenuDef`.
     */
    readonly slotContext = computed(() => {
        const props = {
            blockIndex: this.blockIndex(),
            blockType: this.blockType(),
            commands: this.commands(),
            state: this.state(),
            submenu: this.submenu,
            dismiss: () => this.dismiss()
        };

        return { ...props, $implicit: props };
    });

    constructor() {
        super();
        usePopoverKeys({ open: this.open, onDismiss: () => this.dismiss() });
    }

    onInit(): void {
        this.unregister = this.root.registerPart('block-menu');
    }

    onDestroy(): void {
        this.unregister?.();
    }

    /**
     * Closes the menu and any submenu open under it.
     */
    dismiss(): void {
        this.submenu.close();
        this.root.closeBlockMenu();
    }
}

/**
 * The nested panel of the block menu, for actions such as Turn Into and Color.
 *
 * @group Components
 */
@Component({
    selector: 'p-text-editor-block-submenu',
    standalone: true,
    imports: [NgTemplateOutlet],
    template: `
        @if (blockSubmenuDef(); as def) {
            <ng-container *ngTemplateOutlet="def.template; context: slotContext()" />
        } @else {
            <ng-content />
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'p-text-editor-popover-submenu',
        'data-scope': 'texteditor',
        'data-part': 'block-submenu',
        role: 'menu',
        tabindex: '-1',
        '[hidden]': '!open()',
        '[style]': 'anchor()'
    }
})
export class TextEditorBlockSubmenu extends BaseComponent<TextEditorPartPassThrough> {
    componentName = 'TextEditorBlockSubmenu';

    private readonly menu = inject(TextEditorBlockMenu);

    readonly blockSubmenuDef = contentChild(TextEditorBlockSubmenuDef);

    /**
     * Whether a submenu key is open on the parent menu.
     */
    readonly open = computed(() => !!this.menu.submenu.activeSignal());

    /**
     * Where the panel sits, alongside the parent menu.
     */
    private readonly tick = useAnchorTick(this.open);

    readonly anchor = computed(() => {
        this.tick();

        return anchorStyle(this.menu.submenu.anchorSignal(), { width: 220, height: 240 });
    });

    /**
     * The slot surface handed to `pTextEditorBlockSubmenuDef`.
     */
    readonly slotContext = computed(() => {
        const props = {
            activeSubmenu: this.menu.submenu.activeSignal(),
            commands: this.menu.commands(),
            blockType: this.menu.blockType(),
            state: this.menu.state(),
            dismiss: () => this.menu.dismiss()
        };

        return { ...props, $implicit: props };
    });

    constructor() {
        super();
        usePopoverKeys({ open: this.open, onDismiss: () => this.menu.submenu.close() });
    }
}
