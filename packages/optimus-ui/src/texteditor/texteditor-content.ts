import { ChangeDetectionStrategy, Component, ElementRef, ViewEncapsulation, computed, inject, input, viewChild } from '@angular/core';
import { BaseComponent } from '@openng/optimus-ui/basecomponent';
import type { TextEditorPartPassThrough } from '@openng/optimus-ui/types/texteditor';
import { createTableControlsCommands } from './core/tables';
import { TextEditorRoot } from './texteditor';

/**
 * The editable region, plus the two overlays the runtime owns rather than the host: the table
 * triggers and the heading minimap.
 *
 * Both are runtime surfaces because they are positioned from geometry only the editor has - the
 * active cell's box and the heading offsets - and because the events they raise
 * (`tableColumnMenuRequest` and friends) are what open the host's own menus.
 *
 * @group Components
 */
@Component({
    selector: 'p-text-editor-content',
    standalone: true,
    template: `
        <div #mount class="p-text-editor-mount"></div>
        @if (tableOverlay(); as overlay) {
            <div class="p-text-editor-table-overlay" data-scope="texteditor">
                <div class="p-text-editor-table-selection-outline" [style]="overlay.outline"></div>
                <button type="button" class="p-text-editor-table-trigger p-text-editor-table-trigger-col" aria-label="Column options" [style]="overlay.columnTrigger" (click)="root.openTableColumnMenu(overlay.colIndex, $event)"></button>
                <button type="button" class="p-text-editor-table-trigger p-text-editor-table-trigger-row" aria-label="Row options" [style]="overlay.rowTrigger" (click)="root.openTableRowMenu(overlay.rowIndex, $event)"></button>
                <button type="button" class="p-text-editor-table-trigger p-text-editor-table-trigger-cell" aria-label="Cell options" [style]="overlay.cellTrigger" (click)="root.openTableCellMenu($event)"></button>
                <button type="button" class="p-text-editor-table-add p-text-editor-table-add-col" aria-label="Add column" [style]="overlay.addColumn" (click)="addColumn()">+</button>
                <button type="button" class="p-text-editor-table-add p-text-editor-table-add-row" aria-label="Add row" [style]="overlay.addRow" (click)="addRow()">+</button>
            </div>
        }
        @if (root.navigator() && root.headings().length) {
            <div class="p-text-editor-navigator" data-scope="texteditor" data-part="navigator" aria-hidden="true">
                @for (heading of root.headings(); track heading.pos) {
                    <span class="p-text-editor-navigator-bar" [attr.data-level]="heading.level" [attr.data-active]="$index === root.activeHeadingIndex() ? '' : null"></span>
                }
            </div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'p-text-editor-body',
        'data-scope': 'texteditor',
        'data-part': 'body',
        '[style.height]': 'height()',
        '[style.max-height]': 'maxHeight()'
    }
})
export class TextEditorContent extends BaseComponent<TextEditorPartPassThrough> {
    componentName = 'TextEditorContent';

    /**
     * The editor this region belongs to.
     */
    readonly root = inject(TextEditorRoot);

    private unregister?: () => void;

    private readonly mount = viewChild.required<ElementRef<HTMLElement>>('mount');

    /**
     * Height of the editable region, as a CSS length.
     * @group Props
     */
    readonly height = input<string | undefined>(undefined);
    /**
     * Maximum height of the editable region, as a CSS length.
     * @group Props
     */
    readonly maxHeight = input<string | undefined>(undefined);
    /**
     * Placeholder text displayed inside an empty editor. Overrides the root's own input.
     * @group Props
     */
    readonly placeholder = input<string | null>(null);
    /**
     * Placeholder text displayed inside empty checklist items. Overrides the root's own input.
     * @group Props
     */
    readonly checklistPlaceholder = input<string | null>(null);

    /**
     * Geometry of the table triggers, in coordinates relative to this region.
     */
    readonly tableOverlay = computed(() => {
        const rect = this.root.tableRect();
        const table = this.root.activeTable();

        if (!rect || !table) return null;

        const host = this.el.nativeElement.getBoundingClientRect();
        const top = (value: number) => value - host.top + this.el.nativeElement.scrollTop;
        const left = (value: number) => value - host.left + this.el.nativeElement.scrollLeft;

        return {
            colIndex: table.colIndex,
            rowIndex: table.rowIndex,
            outline: { top: `${top(rect.cellRect.top)}px`, left: `${left(rect.cellRect.left)}px`, width: `${rect.cellRect.width}px`, height: `${rect.cellRect.height}px` },
            columnTrigger: { top: `${top(rect.tableRect.top) - 12}px`, left: `${left(rect.cellRect.left + rect.cellRect.width / 2) - 8}px` },
            rowTrigger: { top: `${top(rect.cellRect.top + rect.cellRect.height / 2) - 8}px`, left: `${left(rect.tableRect.left) - 12}px` },
            cellTrigger: { top: `${top(rect.cellRect.top) + 2}px`, left: `${left(rect.cellRect.left + rect.cellRect.width) - 12}px` },
            addColumn: { top: `${top(rect.tableRect.top)}px`, left: `${left(rect.tableRect.right) + 4}px`, height: `${rect.tableRect.height}px` },
            addRow: { top: `${top(rect.tableRect.bottom) + 4}px`, left: `${left(rect.tableRect.left)}px`, width: `${rect.tableRect.width}px` }
        };
    });

    onInit(): void {
        this.unregister = this.root.registerPart('content');
    }

    onAfterViewInit(): void {
        /* The view is created here rather than in the root, because the root has no DOM of its own
           to mount ProseMirror in. It gets a dedicated child so ProseMirror's DOM and the overlays
           Angular renders never fight over the same parent. */
        this.root.registerContentElement(this.mount().nativeElement, {
            placeholder: () => this.placeholder(),
            checklistPlaceholder: () => this.checklistPlaceholder()
        });
    }

    onDestroy(): void {
        this.root.registerContentElement(null);
        this.unregister?.();
    }

    /**
     * Appends a column to the active table.
     */
    addColumn(): void {
        createTableControlsCommands(() => this.root.getView()).addColumn();
    }

    /**
     * Appends a row to the active table.
     */
    addRow(): void {
        createTableControlsCommands(() => this.root.getView()).addRow();
    }
}
