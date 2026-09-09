import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { Button } from '@openng/optimus-ui/button';
import { TaskBoardModule } from '@openng/optimus-ui/taskboard';
import type { TaskBoardCardDropBlockedPayload, TaskBoardColumnModel, TaskBoardItem } from '@openng/optimus-ui/types/taskboard';

@Component({
    selector: 'workflow-doc',
    standalone: true,
    imports: [AppDocSectionText, Button, TaskBoardModule, AppCode],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <app-docsectiontext>
            <p>
                Workflow rules live on the column. <i>allowedTransitionsFrom</i> and <i>allowedTransitionsTo</i> restrict where a card may come from and go to, <i>requiredFields</i> demands a value before a card may enter, <i>wipLimit</i> caps the
                lane, and <i>confirmOnEnter</i> asks before applying.
            </p>
            <p>
                They are checked in that order — transitions, capacity, required fields, then confirmation — and the order matters: a card that is not allowed into a column at all should say so, not complain first about a field it was never going to
                be asked for. A refused move leaves the data untouched and emits <i>cardDropBlocked</i>; a guarded one is held until <i>p-taskboard-drag-confirm</i> answers.
            </p>
            <p>Try it: <b>Review</b> only accepts cards from <b>In Progress</b> and needs an owner, <b>In Progress</b> holds two cards, and <b>Done</b> asks for confirmation.</p>
        </app-docsectiontext>
        <div class="card">
            <div style="height: 26rem">
                <p-taskboard-root [tasks]="tasks()" (tasksChange)="tasks.set($event)" dataKey="id" columnField="columnId" [columns]="columns" (cardDropBlocked)="onBlocked($event)">
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
                    <p-taskboard-drag-confirm #confirmation>
                        <div class="flex flex-col gap-3 rounded-md border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900 p-4 mt-4">
                            <span class="text-sm">{{ confirmation.message() }}</span>
                            <div class="flex gap-2">
                                <p-button size="small" label="Move" (onClick)="confirmation.confirm()" />
                                <p-button size="small" label="Cancel" severity="secondary" [outlined]="true" (onClick)="confirmation.cancel()" />
                            </div>
                        </div>
                    </p-taskboard-drag-confirm>
                </p-taskboard-root>
            </div>
            <p class="mt-4 text-sm text-muted-color">{{ blocked() }}</p>
        </div>
        <app-code></app-code>
    `
})
export class WorkflowDoc {
    readonly columns: TaskBoardColumnModel[] = [
        { id: 'todo', label: 'To Do', statusType: 'todo', order: 0, allowedTransitionsTo: ['in-progress'] },
        { id: 'in-progress', label: 'In Progress', statusType: 'in-progress', order: 1, wipLimit: 2 },
        { id: 'review', label: 'Review', statusType: 'in-progress', order: 2, allowedTransitionsFrom: ['in-progress'], requiredFields: ['assignee'] },
        { id: 'done', label: 'Done', statusType: 'done', order: 3, confirmOnEnter: 'Ship this card?' }
    ];

    readonly tasks = signal<TaskBoardItem[]>([
        { id: 'w1', title: 'Write the migration notes', columnId: 'todo', order: 0, tags: ['docs'] },
        { id: 'w2', title: 'Audit the query plan', columnId: 'todo', order: 1, assignee: 'Diana Park', tags: ['db'] },
        { id: 'w3', title: 'Split the bundle', columnId: 'in-progress', order: 0, assignee: 'Hank Wang', progress: 40 },
        { id: 'w4', title: 'Cache the avatars', columnId: 'in-progress', order: 1, progress: 15 },
        { id: 'w5', title: 'Ship the changelog', columnId: 'review', order: 0, assignee: 'Alice Chen' }
    ]);

    readonly blocked = signal('Drag a card into a guarded column to see the refusal.');

    onBlocked(payload: TaskBoardCardDropBlockedPayload): void {
        this.blocked.set(`${payload.reason}: ${payload.message}`);
    }
}
