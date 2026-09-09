import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { Button } from '@openng/optimus-ui/button';
import { TaskBoard, TaskBoardModule } from '@openng/optimus-ui/taskboard';
import type { TaskBoardColumnModel, TaskBoardItem } from '@openng/optimus-ui/types/taskboard';
import { demoColumns, demoTasks } from './demo-data';

@Component({
    selector: 'history-doc',
    standalone: true,
    imports: [AppDocSectionText, Button, TaskBoardModule, AppCode],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <app-docsectiontext>
            <p>
                The board records the mutations it applies itself, so <i>undo</i>, <i>redo</i>, <i>canUndo</i>, <i>canRedo</i> and <i>clearHistory</i> work on a managed board without any wiring. <i>Ctrl</i> or <i>Cmd</i> <i>Z</i> undoes and
                <i>Ctrl</i> or <i>Cmd</i> <i>Y</i> — or <i>Shift</i> <i>Z</i> — redoes.
            </p>
            <p>With <i>items</i> the history stays empty on purpose: the board is not the one writing, so it has nothing to walk back. An external store keeps its own stack.</p>
        </app-docsectiontext>
        <div class="card">
            <div class="flex flex-wrap gap-2 mb-4">
                <p-button size="small" label="Undo" [outlined]="true" (onClick)="board().undo()" />
                <p-button size="small" label="Redo" [outlined]="true" (onClick)="board().redo()" />
                <p-button size="small" label="Clear history" severity="secondary" [outlined]="true" (onClick)="board().clearHistory()" />
            </div>
            <div style="height: 26rem">
                <p-taskboard-root [tasks]="tasks()" (tasksChange)="tasks.set($event)" dataKey="id" columnField="columnId" [columns]="columns">
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
                    <p-taskboard-drag-preview />
                </p-taskboard-root>
            </div>
        </div>
        <app-code></app-code>
    `
})
export class HistoryDoc {
    readonly columns: TaskBoardColumnModel[] = demoColumns();

    readonly tasks = signal<TaskBoardItem[]>(demoTasks('h'));

    readonly board = viewChild.required(TaskBoard);
}
