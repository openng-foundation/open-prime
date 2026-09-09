import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, inject } from '@angular/core';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';
import { BLOCK_CONTROLS_CONTEXT, BLOCK_MENU_CONTEXT, MENTION_MENU_CONTEXT, NAVIGATOR_CONTEXT, SLASH_MENU_CONTEXT, TABLE_CELL_MENU_CONTEXT, TABLE_COLUMN_MENU_CONTEXT, TABLE_ROW_MENU_CONTEXT, UPLOAD_CONTEXT } from '@openng/optimus-ui/texteditor';

const SWATCHES = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#64748b', '#0f172a', '#ffffff', 'transparent'];

/** The block-mode hover bar: an add button and a drag handle that opens the block menu. */
@Component({
    selector: 'block-controls-ui',
    standalone: true,
    template: `
        <div class="p-text-editor-ui-block-controls">
            <button type="button" class="p-text-editor-ui-handle" aria-label="Add block" (click)="ctx.addBlock(ctx.index())">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14" /></svg>
            </button>
            <button type="button" class="p-text-editor-ui-handle" aria-label="Block options" draggable="true" (dragstart)="ctx.onDragStart(ctx.index(), $event)" (dragend)="ctx.onDragEnd()" (click)="ctx.onDragHandleClick(ctx.index(), $event)">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                    <circle cx="9" cy="6" r="1.4" />
                    <circle cx="9" cy="12" r="1.4" />
                    <circle cx="9" cy="18" r="1.4" />
                    <circle cx="15" cy="6" r="1.4" />
                    <circle cx="15" cy="12" r="1.4" />
                    <circle cx="15" cy="18" r="1.4" />
                </svg>
            </button>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class BlockControlsUI {
    readonly ctx = inject(BLOCK_CONTROLS_CONTEXT);
}

/** The block options menu: duplicate, copy, turn into, colour and delete. */
@Component({
    selector: 'block-menu-ui',
    standalone: true,
    template: `
        <div class="p-text-editor-ui-menu">
            <button type="button" role="menuitem" class="p-text-editor-ui-menu-item" (click)="ctx.commands().duplicate()">Duplicate</button>
            <button type="button" role="menuitem" class="p-text-editor-ui-menu-item" (click)="ctx.commands().copyToClipboard()">Copy</button>
            <button type="button" role="menuitem" class="p-text-editor-ui-menu-item" (click)="ctx.submenu.open('turnInto', $any($event.currentTarget))">Turn into<span class="p-text-editor-ui-menu-shortcut">&rsaquo;</span></button>
            <button type="button" role="menuitem" class="p-text-editor-ui-menu-item" (click)="ctx.submenu.open('color', $any($event.currentTarget))">Color<span class="p-text-editor-ui-menu-shortcut">&rsaquo;</span></button>
            <button type="button" role="menuitem" class="p-text-editor-ui-menu-item" data-danger (click)="ctx.commands().deleteBlock()">Delete</button>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class BlockMenuUI {
    readonly ctx = inject(BLOCK_MENU_CONTEXT);
}

/** The Turn Into submenu of the block menu. */
@Component({
    selector: 'block-turn-into-submenu-ui',
    standalone: true,
    template: `
        <div class="p-text-editor-ui-menu">
            @for (option of options; track option.label) {
                <button type="button" role="menuitem" class="p-text-editor-ui-menu-item" (click)="run(option.key)">{{ option.label }}</button>
            }
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class BlockTurnIntoSubmenuUI {
    readonly ctx = inject(BLOCK_MENU_CONTEXT);

    readonly options = [
        { key: 'text', label: 'Text' },
        { key: 'heading1', label: 'Heading 1' },
        { key: 'heading2', label: 'Heading 2' },
        { key: 'heading3', label: 'Heading 3' },
        { key: 'bulletList', label: 'Bullet list' },
        { key: 'orderedList', label: 'Ordered list' },
        { key: 'checkList', label: 'Check list' },
        { key: 'blockquote', label: 'Quote' },
        { key: 'codeBlock', label: 'Code' }
    ] as const;

    run(key: (typeof this.options)[number]['key']): void {
        this.ctx.commands().turnInto[key]();
    }
}

/** The colour submenu of the block menu. */
@Component({
    selector: 'block-color-submenu-ui',
    standalone: true,
    template: `
        <div class="p-text-editor-ui-swatches">
            @for (color of swatches; track color) {
                <button type="button" role="menuitem" class="p-text-editor-ui-swatch" [style.background]="color" [attr.aria-label]="'Text color ' + color" (click)="ctx.commands().foregroundColor(color)"></button>
            }
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class BlockColorSubmenuUI {
    readonly ctx = inject(BLOCK_MENU_CONTEXT);

    readonly swatches = SWATCHES;
}

/** The slash palette: a filtered list of insertions. */
@Component({
    selector: 'slash-menu-ui',
    standalone: true,
    template: `
        <div class="p-text-editor-ui-menu">
            @for (item of visible(); track item.label) {
                <button type="button" role="option" class="p-text-editor-ui-menu-item" (click)="run(item.label)">
                    <span class="p-text-editor-ui-menu-icon" [innerHTML]="item.icon"></span>
                    <span>{{ item.label }}</span>
                </button>
            }
            @if (!visible().length) {
                <div class="p-text-editor-ui-menu-empty">No matches for "{{ ctx.filterText() }}"</div>
            }
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class SlashMenuUI {
    readonly ctx = inject(SLASH_MENU_CONTEXT);

    private readonly sanitizer = inject(DomSanitizer);

    /** The icons are inline SVG, trusted because this file is the one that wrote them. */
    private icon(paths: string): SafeHtml {
        return this.sanitizer.bypassSecurityTrustHtml(`<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">${paths}</svg>`);
    }

    readonly items = [
        { label: 'Text', icon: this.icon('<path d="M6 6h12M12 6v12" />'), run: () => this.ctx.commands().text() },
        { label: 'Heading 1', icon: this.icon('<path d="M4 6v12M12 6v12M4 12h8M17 18v-8l-2 1.5" />'), run: () => this.ctx.commands().heading(1) },
        { label: 'Heading 2', icon: this.icon('<path d="M4 6v12M12 6v12M4 12h8M15 11a2 2 0 1 1 4 0c0 2-4 3-4 7h4" />'), run: () => this.ctx.commands().heading(2) },
        { label: 'Heading 3', icon: this.icon('<path d="M4 6v12M12 6v12M4 12h8M15 10a2 2 0 1 1 3 3 2 2 0 1 1-3 3" />'), run: () => this.ctx.commands().heading(3) },
        { label: 'Bullet List', icon: this.icon('<path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01" />'), run: () => this.ctx.commands().bulletList() },
        { label: 'Numbered List', icon: this.icon('<path d="M10 6h10M10 12h10M10 18h10M4 6h2M4 12h2l-2 3h2M4 18h2" />'), run: () => this.ctx.commands().orderedList() },
        { label: 'Check List', icon: this.icon('<path d="M10 6h10M10 12h10M10 18h10M3 6.5 4.5 8 7 5M3 12.5 4.5 14 7 11M3 18.5 4.5 20 7 17" />'), run: () => this.ctx.commands().checkList() },
        {
            label: 'Blockquote',
            icon: this.icon('<path d="M9 7H5.5A2.5 2.5 0 0 0 3 9.5v2A2.5 2.5 0 0 0 5.5 14H7c0 2-1 3-2.5 3.5M20 7h-3.5A2.5 2.5 0 0 0 14 9.5v2a2.5 2.5 0 0 0 2.5 2.5H18c0 2-1 3-2.5 3.5" />'),
            run: () => this.ctx.commands().blockquote()
        },
        { label: 'Code Block', icon: this.icon('<path d="m9 8-5 4 5 4M15 8l5 4-5 4" />'), run: () => this.ctx.commands().code() },
        { label: 'Divider', icon: this.icon('<path d="M4 12h16" />'), run: () => this.ctx.commands().divider() },
        { label: 'Table', icon: this.icon('<rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 10h18M3 15h18M9 4v16M15 4v16" />'), run: () => this.ctx.commands().table() },
        { label: 'Image', icon: this.icon('<rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="8.5" cy="10" r="1.5" /><path d="m5 17 4.5-4.5L13 16l2.5-2.5L21 19" />'), run: () => this.ctx.commands().uploadImages() },
        { label: 'Document', icon: this.icon('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" />'), run: () => this.ctx.commands().uploadDocuments() }
    ];

    readonly visible = computed(() => {
        const query = this.ctx.filterText().toLowerCase();

        return this.items.filter((item) => item.label.toLowerCase().includes(query));
    });

    run(label: string): void {
        this.items.find((item) => item.label === label)?.run();
    }
}

/** The mention popover's list. */
@Component({
    selector: 'mention-list-ui',
    standalone: true,
    template: `
        <div class="p-text-editor-ui-menu">
            @for (item of $any(ctx.items()); track item.id) {
                <button type="button" role="option" class="p-text-editor-ui-menu-item" (click)="ctx.commands().select(item)">
                    <span class="p-text-editor-ui-mention">
                        @if (item.image) {
                            <img [src]="item.image" [alt]="item.name" />
                        }
                        <span>{{ item.name }}</span>
                    </span>
                </button>
            }
            @if (!ctx.items().length) {
                <div class="p-text-editor-ui-menu-empty">No matches for "{{ ctx.filterText() }}"</div>
            }
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class MentionListUI {
    readonly ctx = inject(MENTION_MENU_CONTEXT);
}

/** The image dropzone. */
@Component({
    selector: 'image-upload-dropzone-ui',
    standalone: true,
    template: `
        <div class="p-text-editor-ui-dropzone" (dragover)="$event.preventDefault()" (drop)="ctx.onDrop($event)">
            <span>Drop an image here</span>
            <button type="button" class="p-text-editor-ui-menu-item" (click)="ctx.selectFiles()">Choose image</button>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class ImageUploadDropzoneUI {
    readonly ctx = inject(UPLOAD_CONTEXT);
}

/** The document dropzone. */
@Component({
    selector: 'document-upload-dropzone-ui',
    standalone: true,
    template: `
        <div class="p-text-editor-ui-dropzone" (dragover)="$event.preventDefault()" (drop)="ctx.onDrop($event)">
            <span>Drop a document here</span>
            <button type="button" class="p-text-editor-ui-menu-item" (click)="ctx.selectFiles()">Choose file</button>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class DocumentUploadDropzoneUI {
    readonly ctx = inject(UPLOAD_CONTEXT);
}

/** Progress for both upload overlays; `kind` on the context is what a shared widget branches on. */
@Component({
    selector: 'upload-progress-ui',
    standalone: true,
    template: `
        <div class="p-text-editor-ui-upload-list">
            @for (upload of ctx.uploads(); track upload.id) {
                <div class="p-text-editor-ui-upload-row">
                    <span>{{ upload.fileName }}</span>
                    <span class="p-text-editor-ui-progress"><span [style.width.%]="upload.progress"></span></span>
                    <span>{{ upload.progress }}%</span>
                    <button type="button" class="p-text-editor-ui-button" aria-label="Cancel upload" (click)="upload.cancel()">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6 18 18M18 6 6 18" /></svg>
                    </button>
                </div>
            }
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class UploadProgressUI {
    readonly ctx = inject(UPLOAD_CONTEXT);
}

/** The column action menu. */
@Component({
    selector: 'table-column-options-ui',
    standalone: true,
    template: `
        <div class="p-text-editor-ui-menu">
            <button type="button" role="menuitem" class="p-text-editor-ui-menu-item" (click)="ctx.commands().insertBefore()">Insert left</button>
            <button type="button" role="menuitem" class="p-text-editor-ui-menu-item" (click)="ctx.commands().insertAfter()">Insert right</button>
            <button type="button" role="menuitem" class="p-text-editor-ui-menu-item" (click)="ctx.commands().moveLeft()">Move left</button>
            <button type="button" role="menuitem" class="p-text-editor-ui-menu-item" (click)="ctx.commands().moveRight()">Move right</button>
            <button type="button" role="menuitem" class="p-text-editor-ui-menu-item" (click)="ctx.commands().duplicate()">Duplicate</button>
            <button type="button" role="menuitem" class="p-text-editor-ui-menu-item" (click)="ctx.commands().toggleHeader()">Toggle header</button>
            <button type="button" role="menuitem" class="p-text-editor-ui-menu-item" (click)="ctx.submenu.open('align', $any($event.currentTarget))">Align<span class="p-text-editor-ui-menu-shortcut">&rsaquo;</span></button>
            <button type="button" role="menuitem" class="p-text-editor-ui-menu-item" data-danger (click)="ctx.commands().delete()">Delete column</button>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class TableColumnOptionsUI {
    readonly ctx = inject(TABLE_COLUMN_MENU_CONTEXT);
}

/** The column menu's alignment submenu. */
@Component({
    selector: 'table-column-options-submenu-ui',
    standalone: true,
    template: `
        <div class="p-text-editor-ui-menu">
            @for (option of options; track option) {
                <button type="button" role="menuitem" class="p-text-editor-ui-menu-item" (click)="ctx.commands().align(option)">{{ option }}</button>
            }
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class TableColumnOptionsSubmenuUI {
    readonly ctx = inject(TABLE_COLUMN_MENU_CONTEXT);

    readonly options = ['left', 'center', 'right'];
}

/** The row action menu. */
@Component({
    selector: 'table-row-options-ui',
    standalone: true,
    template: `
        <div class="p-text-editor-ui-menu">
            <button type="button" role="menuitem" class="p-text-editor-ui-menu-item" (click)="ctx.commands().insertBefore()">Insert above</button>
            <button type="button" role="menuitem" class="p-text-editor-ui-menu-item" (click)="ctx.commands().insertAfter()">Insert below</button>
            <button type="button" role="menuitem" class="p-text-editor-ui-menu-item" (click)="ctx.commands().moveUp()">Move up</button>
            <button type="button" role="menuitem" class="p-text-editor-ui-menu-item" (click)="ctx.commands().moveDown()">Move down</button>
            <button type="button" role="menuitem" class="p-text-editor-ui-menu-item" (click)="ctx.commands().duplicate()">Duplicate</button>
            <button type="button" role="menuitem" class="p-text-editor-ui-menu-item" (click)="ctx.commands().toggleHeader()">Toggle header</button>
            <button type="button" role="menuitem" class="p-text-editor-ui-menu-item" (click)="ctx.submenu.open('align', $any($event.currentTarget))">Align<span class="p-text-editor-ui-menu-shortcut">&rsaquo;</span></button>
            <button type="button" role="menuitem" class="p-text-editor-ui-menu-item" data-danger (click)="ctx.commands().delete()">Delete row</button>
            <button type="button" role="menuitem" class="p-text-editor-ui-menu-item" data-danger (click)="ctx.commands().deleteTable()">Delete table</button>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class TableRowOptionsUI {
    readonly ctx = inject(TABLE_ROW_MENU_CONTEXT);
}

/** The row menu's alignment submenu. */
@Component({
    selector: 'table-row-options-submenu-ui',
    standalone: true,
    template: `
        <div class="p-text-editor-ui-menu">
            @for (option of options; track option) {
                <button type="button" role="menuitem" class="p-text-editor-ui-menu-item" (click)="ctx.commands().align(option)">{{ option }}</button>
            }
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class TableRowOptionsSubmenuUI {
    readonly ctx = inject(TABLE_ROW_MENU_CONTEXT);

    readonly options = ['left', 'center', 'right'];
}

/** The cell action menu. */
@Component({
    selector: 'table-cell-options-ui',
    standalone: true,
    template: `
        <div class="p-text-editor-ui-menu">
            <button type="button" role="menuitem" class="p-text-editor-ui-menu-item" [disabled]="!ctx.isMultiCellSelected()" (click)="ctx.commands().mergeCells()">Merge cells</button>
            <button type="button" role="menuitem" class="p-text-editor-ui-menu-item" [disabled]="!ctx.isCellMerged()" (click)="ctx.commands().splitCell()">Split cell</button>
            <button type="button" role="menuitem" class="p-text-editor-ui-menu-item" (click)="ctx.commands().toggleHeader()">Toggle header</button>
            <button type="button" role="menuitem" class="p-text-editor-ui-menu-item" (click)="ctx.submenu.open('color', $any($event.currentTarget))">Color<span class="p-text-editor-ui-menu-shortcut">&rsaquo;</span></button>
            <button type="button" role="menuitem" class="p-text-editor-ui-menu-item" data-danger (click)="ctx.commands().clearContents()">Clear contents</button>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class TableCellOptionsUI {
    readonly ctx = inject(TABLE_CELL_MENU_CONTEXT);
}

/** The cell menu's colour submenu. */
@Component({
    selector: 'table-cell-options-submenu-ui',
    standalone: true,
    template: `
        <div class="p-text-editor-ui-swatches">
            @for (color of swatches; track color) {
                <button type="button" role="menuitem" class="p-text-editor-ui-swatch" [style.background]="color" [attr.aria-label]="'Cell color ' + color" (click)="ctx.commands().backgroundColor(color)"></button>
            }
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class TableCellOptionsSubmenuUI {
    readonly ctx = inject(TABLE_CELL_MENU_CONTEXT);

    readonly swatches = SWATCHES;
}

/** The navigator rail's widget: a compact outline summary. */
@Component({
    selector: 'navigator-trigger-ui',
    standalone: true,
    template: `<span class="p-text-editor-ui-menu-shortcut">{{ ctx.headings().length }} headings</span>`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class NavigatorTriggerUI {
    readonly ctx = inject(NAVIGATOR_CONTEXT);
}

/** The navigator popover's heading list. */
@Component({
    selector: 'navigator-menu-ui',
    standalone: true,
    template: `
        <div class="p-text-editor-ui-menu">
            @for (heading of ctx.headings(); track heading.pos; let index = $index) {
                <button
                    type="button"
                    role="menuitem"
                    class="p-text-editor-ui-navigator-item"
                    [style.padding-inline-start.rem]="0.5 + (heading.level - 1) * 0.5"
                    [attr.aria-current]="index === ctx.activeIndex() ? 'true' : null"
                    (click)="ctx.scrollTo(heading.pos)"
                >
                    {{ heading.text || 'Untitled' }}
                </button>
            }
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class NavigatorMenuUI {
    readonly ctx = inject(NAVIGATOR_CONTEXT);
}
