import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { TASKBOARD_COLUMN_CONTEXT, TaskBoardModule, type TaskBoardColumnContext } from '@openng/optimus-ui/taskboard';
import type { TaskBoardColumnModel, TaskBoardItem } from '@openng/optimus-ui/types/taskboard';
import { demoColumnsWithLimit, demoTasks } from './demo-data';

/**
 * A product column header that asks for the column context.
 *
 * The collapse control stops `pointerdown` because the header surface is also the reorder handle: a
 * press that travels far enough there picks the column up, and a button that must not do that has to
 * say so.
 */
@Component({
    selector: 'taskboard-doc-column-header',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <header class="flex items-center justify-between gap-2 rounded-t-lg border-b border-surface-200 bg-surface-100 px-3 py-2 dark:border-surface-700 dark:bg-surface-900">
            <div class="flex min-w-0 items-center gap-2">
                <span class="truncate text-sm font-semibold">{{ column.label() }}</span>
                <span class="rounded-full bg-surface-200 px-1.5 text-[0.625rem] font-bold dark:bg-surface-700">{{ column.itemCount() }}</span>
                @if (limit()) {
                    <span class="text-[0.625rem] font-bold uppercase text-muted-color">cap {{ limit() }}</span>
                }
            </div>
            <button
                type="button"
                class="rounded px-1.5 text-xs text-muted-color hover:text-color"
                [attr.aria-expanded]="!column.isCollapsed()"
                [attr.aria-label]="(column.isCollapsed() ? 'Expand ' : 'Collapse ') + column.label()"
                (pointerdown)="$event.stopPropagation()"
                (click)="column.toggleCollapse()"
            >
                {{ column.isCollapsed() ? '+' : '−' }}
            </button>
        </header>
    `
})
export class TaskBoardDocColumnHeader {
    readonly column = inject<TaskBoardColumnContext>(TASKBOARD_COLUMN_CONTEXT);

    limit(): number | undefined {
        return this.column.columnData()?.wipLimit;
    }
}

@Component({
    selector: 'columnslots-doc',
    standalone: true,
    imports: [AppDocSectionText, TaskBoardModule, TaskBoardDocColumnHeader, AppCode],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <app-docsectiontext>
            <p>
                A column is five surfaces, and each one takes your markup: <i>p-taskboard-column-header</i> for the title, the count and the collapse control, <i>p-taskboard-column-content</i> for the card loop and the insertion markers,
                <i>p-taskboard-column-empty</i> for the empty state, <i>p-taskboard-column-footer</i> for a create control or a total, and <i>p-taskboard-column-add</i> for a lane that adds lanes.
            </p>
            <p>
                Render from the definition's <i>visibleItems</i> rather than filtering the original array in the template: it already carries the board's ordering and its virtual window. A projected component reads the same values as signals through
                <i>TASKBOARD_COLUMN_CONTEXT</i>.
            </p>
            <p>Keep the wrappers. They are what own the layout, the data attributes, the collapse semantics, the drop targets and the keyboard behaviour — replacing one with plain markup also drops its half of that contract.</p>
        </app-docsectiontext>
        <div class="card">
            <div style="height: 26rem">
                <p-taskboard-root [tasks]="tasks()" (tasksChange)="tasks.set($event)" dataKey="id" columnField="columnId" [columns]="columns">
                    <p-taskboard-content>
                        @for (column of columns; track column.id) {
                            <p-taskboard-column [column]="column" [value]="column.id" [label]="column.label">
                                <ng-template pTaskBoardColumnDef let-columnContext let-itemCount="itemCount">
                                    <p-taskboard-column-header><taskboard-doc-column-header /></p-taskboard-column-header>
                                    <p-taskboard-column-content>
                                        @for (item of columnContext.visibleItems; track item.id; let index = $index) {
                                            <p-taskboard-drop-indicator [index]="index" />
                                            <p-taskboard-card [item]="item"><p-taskboard-card-ui /></p-taskboard-card>
                                        } @empty {
                                            <p-taskboard-column-empty>Ready for the next item.</p-taskboard-column-empty>
                                        }
                                        <p-taskboard-drop-indicator [index]="columnContext.visibleItems.length" />
                                    </p-taskboard-column-content>
                                    <p-taskboard-column-footer>
                                        <span class="text-xs text-muted-color">{{ itemCount }} in this lane</span>
                                    </p-taskboard-column-footer>
                                </ng-template>
                            </p-taskboard-column>
                        }
                    </p-taskboard-content>
                    <p-taskboard-drag-preview />
                </p-taskboard-root>
            </div>
        </div>
        <app-code></app-code>
    `
})
export class ColumnSlotsDoc {
    readonly columns: TaskBoardColumnModel[] = demoColumnsWithLimit();

    readonly tasks = signal<TaskBoardItem[]>(demoTasks('cs'));
}
