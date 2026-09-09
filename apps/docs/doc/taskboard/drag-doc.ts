import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { TASKBOARD_CONTEXT, TaskBoardModule, type TaskBoardContext } from '@openng/optimus-ui/taskboard';
import type { TaskBoardColumnModel, TaskBoardItem } from '@openng/optimus-ui/types/taskboard';
import { demoColumns, demoTasks } from './demo-data';

/** A compact summary shown while cards travel. */
@Component({
    selector: 'taskboard-doc-preview',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="rounded-md border border-primary bg-surface-0 dark:bg-surface-900 p-3 shadow-lg">
            <span class="text-sm font-semibold">{{ board.draggingItem()?.title }}</span>
            @if (board.draggingIds().length > 1) {
                <span class="ml-2 text-xs text-muted-color">+{{ board.draggingIds().length - 1 }} more</span>
            }
        </div>
    `
})
export class TaskBoardDocPreview {
    readonly board = inject<TaskBoardContext>(TASKBOARD_CONTEXT);
}

@Component({
    selector: 'drag-doc',
    standalone: true,
    imports: [AppDocSectionText, TaskBoardModule, TaskBoardDocPreview, AppCode],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <app-docsectiontext>
            <p>Drag is on by default. Nothing moves until the pointer has travelled <i>dragMinDistance</i> pixels, which is what keeps a tap on a touch screen a tap: below the threshold the gesture stays a click and goes to the selection.</p>
            <p>
                The board snapshots the column, cell and card geometry when the drag starts and re-measures after a scroll, so the marker and the accepted index always agree — including after an edge auto-scroll, which stops at the real bounds
                instead of overshooting.
            </p>
            <p>
                In multiple selection mode, dragging a card that is part of the selection moves the whole group in its rendered order; dragging one that is not moves only that card and leaves the selection alone.
                <i>p-taskboard-drag-preview</i> replaces the visible preview and nothing else.
            </p>
        </app-docsectiontext>
        <div class="card">
            <div style="height: 26rem">
                <p-taskboard-root [tasks]="tasks()" (tasksChange)="tasks.set($event)" dataKey="id" columnField="columnId" [columns]="columns" selectionMode="multiple" [dragMinDistance]="5">
                    <p-taskboard-content>
                        @for (column of columns; track column.id) {
                            <p-taskboard-column [column]="column" [value]="column.id" [label]="column.label">
                                <ng-template pTaskBoardColumnDef let-columnContext>
                                    <p-taskboard-column-header><p-taskboard-column-header-ui /></p-taskboard-column-header>
                                    <p-taskboard-column-content>
                                        @for (item of columnContext.visibleItems; track item.id) {
                                            <p-taskboard-card [item]="item"><p-taskboard-card-ui /></p-taskboard-card>
                                        } @empty {
                                            <p-taskboard-column-empty />
                                        }
                                    </p-taskboard-column-content>
                                </ng-template>
                            </p-taskboard-column>
                        }
                    </p-taskboard-content>
                    <p-taskboard-drag-preview><taskboard-doc-preview /></p-taskboard-drag-preview>
                </p-taskboard-root>
            </div>
        </div>
        <app-code></app-code>
    `
})
export class DragDoc {
    readonly columns: TaskBoardColumnModel[] = demoColumns();

    readonly tasks = signal<TaskBoardItem[]>(demoTasks('d'));
}
