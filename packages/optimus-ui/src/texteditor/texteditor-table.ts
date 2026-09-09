import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, contentChild, inject } from '@angular/core';
import { BaseComponent } from '@openng/optimus-ui/basecomponent';
import type { TextEditorPartPassThrough } from '@openng/optimus-ui/types/texteditor';
import { createTableControlsCommands } from './core/tables';
import { TextEditorRoot } from './texteditor';
import { TABLE_CELL_MENU_CONTEXT, TABLE_COLUMN_MENU_CONTEXT, TABLE_CONTROLS_CONTEXT, TABLE_ROW_MENU_CONTEXT } from './texteditor-contexts';
import { TextEditorTableCellMenuDef, TextEditorTableCellSubmenuDef, TextEditorTableColumnMenuDef, TextEditorTableColumnSubmenuDef, TextEditorTableControlsDef, TextEditorTableRowMenuDef, TextEditorTableRowSubmenuDef } from './texteditor-defs';
import { anchorStyle, createSubmenuController, useAnchorTick, usePopoverKeys } from './texteditor-popover';

/**
 * The floating add-row and add-column controls pinned to the active table. Renderless: it hands the
 * geometry and the two commands to the widget the host projects.
 *
 * @group Components
 */
@Component({
    selector: 'p-text-editor-table-controls',
    standalone: true,
    imports: [NgTemplateOutlet],
    template: `
        @if (tableControlsDef(); as def) {
            <ng-container *ngTemplateOutlet="def.template; context: slotContext()" />
        } @else {
            <ng-content />
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [
        {
            provide: TABLE_CONTROLS_CONTEXT,
            useFactory: () => {
                const controls = inject(TextEditorTableControls);

                return { position: controls.position, commands: controls.commands };
            }
        }
    ],
    host: { class: 'p-text-editor-table-controls-host', 'data-scope': 'texteditor' }
})
export class TextEditorTableControls extends BaseComponent<TextEditorPartPassThrough> {
    componentName = 'TextEditorTableControls';

    private readonly root = inject(TextEditorRoot);

    private unregister?: () => void;

    readonly tableControlsDef = contentChild(TextEditorTableControlsDef);

    /**
     * Geometry of the active table, or null when the cursor is outside one.
     */
    readonly position = this.root.tableRect;

    /**
     * The add-row and add-column commands.
     */
    readonly commands = computed(() => createTableControlsCommands(() => this.root.getView()));

    /**
     * The slot surface handed to `pTextEditorTableControlsDef`.
     */
    readonly slotContext = computed(() => {
        const props = { position: this.position(), commands: this.commands() };

        return { ...props, $implicit: props };
    });

    onInit(): void {
        this.unregister = this.root.registerPart('table-controls');
    }

    onDestroy(): void {
        this.unregister?.();
    }
}

/**
 * The column action popover, opened from the column trigger.
 *
 * @group Components
 */
@Component({
    selector: 'p-text-editor-table-column-menu',
    standalone: true,
    imports: [NgTemplateOutlet],
    template: `
        @if (columnMenuDef(); as def) {
            <ng-container *ngTemplateOutlet="def.template; context: slotContext()" />
        }
        <ng-content />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [
        {
            provide: TABLE_COLUMN_MENU_CONTEXT,
            useFactory: () => {
                const menu = inject(TextEditorTableColumnMenu);

                return { colIndex: menu.colIndex, colCount: menu.colCount, commands: menu.commands, submenu: menu.submenu, dismiss: () => menu.dismiss() };
            }
        }
    ],
    host: {
        class: 'p-text-editor-popover-menu',
        'data-scope': 'texteditor',
        'data-part': 'table-column-menu',
        role: 'menu',
        tabindex: '-1',
        '[hidden]': '!open()',
        '[style]': 'anchor()'
    }
})
export class TextEditorTableColumnMenu extends BaseComponent<TextEditorPartPassThrough> {
    componentName = 'TextEditorTableColumnMenu';

    private readonly root = inject(TextEditorRoot);

    readonly columnMenuDef = contentChild(TextEditorTableColumnMenuDef);

    /**
     * The submenu controller both halves of the menu share.
     */
    readonly submenu = createSubmenuController();

    /**
     * Whether the menu is on screen.
     */
    readonly open = computed(() => !!this.root.columnMenuAnchor());

    /**
     * Index of the column the menu was opened from.
     */
    readonly colIndex = computed(() => this.root.columnMenuAnchor()?.colIndex ?? 0);

    /**
     * Number of columns in the table.
     */
    readonly colCount = computed(() => this.root.activeTable()?.colCount ?? 0);

    /**
     * The column command set.
     */
    readonly commands = computed(() => this.root.getTableColumnCommands(this.colIndex(), () => this.dismiss()));

    /**
     * Where the menu sits, in viewport coordinates.
     */
    private readonly tick = useAnchorTick(this.open);

    readonly anchor = computed(() => {
        this.tick();

        return anchorStyle(this.root.columnMenuAnchor()?.anchor ?? null);
    });

    /**
     * The slot surface handed to `pTextEditorTableColumnMenuDef`.
     */
    readonly slotContext = computed(() => {
        const props = { colIndex: this.colIndex(), colCount: this.colCount(), commands: this.commands(), submenu: this.submenu, dismiss: () => this.dismiss() };

        return { ...props, $implicit: props };
    });

    constructor() {
        super();
        usePopoverKeys({ open: this.open, onDismiss: () => this.dismiss() });
    }

    /**
     * Closes the menu and any submenu open under it.
     */
    dismiss(): void {
        this.submenu.close();
        this.root.closeTableMenus();
    }
}

/**
 * The nested panel of the column menu.
 *
 * @group Components
 */
@Component({
    selector: 'p-text-editor-table-column-submenu',
    standalone: true,
    imports: [NgTemplateOutlet],
    template: `
        @if (columnSubmenuDef(); as def) {
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
        'data-part': 'table-column-submenu',
        role: 'menu',
        tabindex: '-1',
        '[hidden]': '!open()',
        '[style]': 'anchor()'
    }
})
export class TextEditorTableColumnSubmenu extends BaseComponent<TextEditorPartPassThrough> {
    componentName = 'TextEditorTableColumnSubmenu';

    private readonly menu = inject(TextEditorTableColumnMenu);

    readonly columnSubmenuDef = contentChild(TextEditorTableColumnSubmenuDef);

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

        return anchorStyle(this.menu.submenu.anchorSignal(), { width: 200, height: 200 });
    });

    /**
     * The slot surface handed to `pTextEditorTableColumnSubmenuDef`.
     */
    readonly slotContext = computed(() => {
        const props = {
            activeSubmenu: this.menu.submenu.activeSignal(),
            colIndex: this.menu.colIndex(),
            colCount: this.menu.colCount(),
            commands: this.menu.commands(),
            dismiss: () => this.menu.dismiss()
        };

        return { ...props, $implicit: props };
    });

    constructor() {
        super();
        usePopoverKeys({ open: this.open, onDismiss: () => this.menu.submenu.close() });
    }
}

/**
 * The row action popover, opened from the row trigger.
 *
 * @group Components
 */
@Component({
    selector: 'p-text-editor-table-row-menu',
    standalone: true,
    imports: [NgTemplateOutlet],
    template: `
        @if (rowMenuDef(); as def) {
            <ng-container *ngTemplateOutlet="def.template; context: slotContext()" />
        }
        <ng-content />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [
        {
            provide: TABLE_ROW_MENU_CONTEXT,
            useFactory: () => {
                const menu = inject(TextEditorTableRowMenu);

                return { rowIndex: menu.rowIndex, rowCount: menu.rowCount, commands: menu.commands, submenu: menu.submenu, dismiss: () => menu.dismiss() };
            }
        }
    ],
    host: {
        class: 'p-text-editor-popover-menu',
        'data-scope': 'texteditor',
        'data-part': 'table-row-menu',
        role: 'menu',
        tabindex: '-1',
        '[hidden]': '!open()',
        '[style]': 'anchor()'
    }
})
export class TextEditorTableRowMenu extends BaseComponent<TextEditorPartPassThrough> {
    componentName = 'TextEditorTableRowMenu';

    private readonly root = inject(TextEditorRoot);

    readonly rowMenuDef = contentChild(TextEditorTableRowMenuDef);

    /**
     * The submenu controller both halves of the menu share.
     */
    readonly submenu = createSubmenuController();

    /**
     * Whether the menu is on screen.
     */
    readonly open = computed(() => !!this.root.rowMenuAnchor());

    /**
     * Index of the row the menu was opened from.
     */
    readonly rowIndex = computed(() => this.root.rowMenuAnchor()?.rowIndex ?? 0);

    /**
     * Number of rows in the table.
     */
    readonly rowCount = computed(() => this.root.activeTable()?.rowCount ?? 0);

    /**
     * The row command set.
     */
    readonly commands = computed(() => this.root.getTableRowCommands(this.rowIndex(), () => this.dismiss()));

    /**
     * Where the menu sits, in viewport coordinates.
     */
    private readonly tick = useAnchorTick(this.open);

    readonly anchor = computed(() => {
        this.tick();

        return anchorStyle(this.root.rowMenuAnchor()?.anchor ?? null);
    });

    /**
     * The slot surface handed to `pTextEditorTableRowMenuDef`.
     */
    readonly slotContext = computed(() => {
        const props = { rowIndex: this.rowIndex(), rowCount: this.rowCount(), commands: this.commands(), submenu: this.submenu, dismiss: () => this.dismiss() };

        return { ...props, $implicit: props };
    });

    constructor() {
        super();
        usePopoverKeys({ open: this.open, onDismiss: () => this.dismiss() });
    }

    /**
     * Closes the menu and any submenu open under it.
     */
    dismiss(): void {
        this.submenu.close();
        this.root.closeTableMenus();
    }
}

/**
 * The nested panel of the row menu.
 *
 * @group Components
 */
@Component({
    selector: 'p-text-editor-table-row-submenu',
    standalone: true,
    imports: [NgTemplateOutlet],
    template: `
        @if (rowSubmenuDef(); as def) {
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
        'data-part': 'table-row-submenu',
        role: 'menu',
        tabindex: '-1',
        '[hidden]': '!open()',
        '[style]': 'anchor()'
    }
})
export class TextEditorTableRowSubmenu extends BaseComponent<TextEditorPartPassThrough> {
    componentName = 'TextEditorTableRowSubmenu';

    private readonly menu = inject(TextEditorTableRowMenu);

    readonly rowSubmenuDef = contentChild(TextEditorTableRowSubmenuDef);

    /**
     * Whether a submenu key is open on the parent menu.
     */
    readonly open = computed(() => !!this.menu.submenu.activeSignal());

    /**
     * Where the panel sits, alongside the parent menu.
     */
    readonly anchor = computed(() => anchorStyle(this.menu.submenu.anchorSignal(), { width: 200, height: 200 }));

    /**
     * The slot surface handed to `pTextEditorTableRowSubmenuDef`.
     */
    readonly slotContext = computed(() => {
        const props = {
            activeSubmenu: this.menu.submenu.activeSignal(),
            rowIndex: this.menu.rowIndex(),
            rowCount: this.menu.rowCount(),
            commands: this.menu.commands(),
            dismiss: () => this.menu.dismiss()
        };

        return { ...props, $implicit: props };
    });

    constructor() {
        super();
        usePopoverKeys({ open: this.open, onDismiss: () => this.menu.submenu.close() });
    }
}

/**
 * The cell action popover, opened from the cell trigger. Acts on the whole multi-cell selection
 * when there is one.
 *
 * @group Components
 */
@Component({
    selector: 'p-text-editor-table-cell-menu',
    standalone: true,
    imports: [NgTemplateOutlet],
    template: `
        @if (cellMenuDef(); as def) {
            <ng-container *ngTemplateOutlet="def.template; context: slotContext()" />
        }
        <ng-content />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [
        {
            provide: TABLE_CELL_MENU_CONTEXT,
            useFactory: () => {
                const menu = inject(TextEditorTableCellMenu);

                return { isMultiCellSelected: menu.isMultiCellSelected, isCellMerged: menu.isCellMerged, commands: menu.commands, submenu: menu.submenu, dismiss: () => menu.dismiss() };
            }
        }
    ],
    host: {
        class: 'p-text-editor-popover-menu',
        'data-scope': 'texteditor',
        'data-part': 'table-cell-menu',
        role: 'menu',
        tabindex: '-1',
        '[hidden]': '!open()',
        '[style]': 'anchor()'
    }
})
export class TextEditorTableCellMenu extends BaseComponent<TextEditorPartPassThrough> {
    componentName = 'TextEditorTableCellMenu';

    private readonly root = inject(TextEditorRoot);

    readonly cellMenuDef = contentChild(TextEditorTableCellMenuDef);

    /**
     * The submenu controller both halves of the menu share.
     */
    readonly submenu = createSubmenuController();

    /**
     * Whether the menu is on screen.
     */
    readonly open = computed(() => !!this.root.cellMenuAnchor());

    /**
     * Whether more than one cell is selected.
     */
    readonly isMultiCellSelected = computed(() => {
        this.root.state();

        return this.root.getIsMultiCellSelected();
    });

    /**
     * Whether the active cell is merged.
     */
    readonly isCellMerged = computed(() => {
        this.root.state();

        return this.root.getIsCellMerged();
    });

    /**
     * The cell command set.
     */
    readonly commands = computed(() => this.root.getTableCellCommands(() => this.dismiss()));

    /**
     * Where the menu sits, in viewport coordinates.
     */
    private readonly tick = useAnchorTick(this.open);

    readonly anchor = computed(() => {
        this.tick();

        return anchorStyle(this.root.cellMenuAnchor()?.anchor ?? null);
    });

    /**
     * The slot surface handed to `pTextEditorTableCellMenuDef`.
     */
    readonly slotContext = computed(() => {
        const props = { isMultiCellSelected: this.isMultiCellSelected(), isCellMerged: this.isCellMerged(), commands: this.commands(), submenu: this.submenu, dismiss: () => this.dismiss() };

        return { ...props, $implicit: props };
    });

    constructor() {
        super();
        usePopoverKeys({ open: this.open, onDismiss: () => this.dismiss() });
    }

    /**
     * Closes the menu and any submenu open under it.
     */
    dismiss(): void {
        this.submenu.close();
        this.root.closeTableMenus();
    }
}

/**
 * The nested panel of the cell menu.
 *
 * @group Components
 */
@Component({
    selector: 'p-text-editor-table-cell-submenu',
    standalone: true,
    imports: [NgTemplateOutlet],
    template: `
        @if (cellSubmenuDef(); as def) {
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
        'data-part': 'table-cell-submenu',
        role: 'menu',
        tabindex: '-1',
        '[hidden]': '!open()',
        '[style]': 'anchor()'
    }
})
export class TextEditorTableCellSubmenu extends BaseComponent<TextEditorPartPassThrough> {
    componentName = 'TextEditorTableCellSubmenu';

    private readonly menu = inject(TextEditorTableCellMenu);

    readonly cellSubmenuDef = contentChild(TextEditorTableCellSubmenuDef);

    /**
     * Whether a submenu key is open on the parent menu.
     */
    readonly open = computed(() => !!this.menu.submenu.activeSignal());

    /**
     * Where the panel sits, alongside the parent menu.
     */
    readonly anchor = computed(() => anchorStyle(this.menu.submenu.anchorSignal(), { width: 200, height: 200 }));

    /**
     * The slot surface handed to `pTextEditorTableCellSubmenuDef`.
     */
    readonly slotContext = computed(() => {
        const props = {
            activeSubmenu: this.menu.submenu.activeSignal(),
            isMultiCellSelected: this.menu.isMultiCellSelected(),
            isCellMerged: this.menu.isCellMerged(),
            commands: this.menu.commands(),
            dismiss: () => this.menu.dismiss()
        };

        return { ...props, $implicit: props };
    });

    constructor() {
        super();
        usePopoverKeys({ open: this.open, onDismiss: () => this.menu.submenu.close() });
    }
}
