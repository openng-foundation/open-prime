import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { Button } from '@openng/optimus-ui/button';
import { TaskBoard, TaskBoardModule } from '@openng/optimus-ui/taskboard';
import type { TaskBoardColumnModel, TaskBoardColumnReorderPayload, TaskBoardItem } from '@openng/optimus-ui/types/taskboard';
import { demoTasks } from './demo-data';

@Component({
    selector: 'columns-doc',
    standalone: true,
    imports: [AppDocSectionText, Button, TaskBoardModule, AppCode],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <app-docsectiontext>
            <p>
                A column carries its own metadata: <i>statusType</i> paints the strip above its header, <i>wipLimit</i> drives the capacity badge and the move validation, <i>locked</i> refuses to be dragged or displaced, and <i>pinned</i>
                sticks it to the leading edge while the rest of the board scrolls.
            </p>
            <p>
                Collapse is on by default; turn it off with <i>columnCollapsible</i>. Reorder is opt-in with <i>columnReorderable</i> and starts from the column header. The board does not own the <i>columns</i> array: write the order emitted by
                <i>columnReorder</i> back yourself.
            </p>
        </app-docsectiontext>
        <div class="card">
            <div class="flex flex-wrap gap-2 mb-4">
                <p-button size="small" [outlined]="true" label="Expand all" (onClick)="setAll(false)" />
                <p-button size="small" [outlined]="true" severity="secondary" label="Collapse all" (onClick)="setAll(true)" />
            </div>
            <div style="height: 26rem">
                <p-taskboard-root [tasks]="tasks()" (tasksChange)="tasks.set($event)" dataKey="id" columnField="columnId" [columns]="columns()" [columnReorderable]="true" (columnReorder)="onColumnReorder($event)">
                    <p-taskboard-content>
                        @for (column of columns(); track column.id) {
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
                    <p-taskboard-drag-preview />
                </p-taskboard-root>
            </div>
        </div>
        <app-code></app-code>
    `
})
export class ColumnsDoc {
    readonly columns = signal<TaskBoardColumnModel[]>([
        { id: 'todo', label: 'To Do', statusType: 'todo', order: 0, pinned: true },
        { id: 'in-progress', label: 'In Progress', statusType: 'in-progress', wipLimit: 4, order: 1 },
        { id: 'review', label: 'Review', statusType: 'in-progress', order: 2 },
        { id: 'done', label: 'Done', statusType: 'done', order: 3, locked: true }
    ]);

    readonly tasks = signal<TaskBoardItem[]>(demoTasks('c'));

    private readonly board = viewChild.required(TaskBoard);

    onColumnReorder(payload: TaskBoardColumnReorderPayload): void {
        this.columns.set(payload.columns);
    }

    setAll(collapsed: boolean): void {
        for (const column of this.columns()) {
            if (collapsed) this.board().collapseColumn(column.id);
            else this.board().expandColumn(column.id);
        }
    }
}
