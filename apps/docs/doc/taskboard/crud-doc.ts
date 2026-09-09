import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { Button } from '@openng/optimus-ui/button';
import { TaskBoard, TaskBoardModule } from '@openng/optimus-ui/taskboard';
import type { TaskBoardCardActivatePayload, TaskBoardColumnModel, TaskBoardItem } from '@openng/optimus-ui/types/taskboard';
import { demoColumns, demoTasks } from './demo-data';

@Component({
    selector: 'crud-doc',
    standalone: true,
    imports: [AppDocSectionText, Button, TaskBoardModule, AppCode],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <app-docsectiontext>
            <p>
                The board owns placement, selection, movement and the mutation outputs. The FORM is yours: open a dialog, a drawer or a route from <i>cardActivate</i>, then call <i>addTask</i>, <i>updateTask</i> or <i>removeTask</i> on the queried
                root when the user saves.
            </p>
            <p>
                In managed mode the array changes before <i>cardCreate</i>, <i>cardUpdate</i> and <i>cardDelete</i> are emitted, so a handler that reads the signal it just wrote already sees the change. With <i>items</i> the same outputs are
                requests.
            </p>
        </app-docsectiontext>
        <div class="card">
            <div class="flex flex-wrap gap-2 mb-4">
                <p-button size="small" label="Add card" (onClick)="addCard()" />
                <p-button size="small" label="Rename last" severity="secondary" [outlined]="true" (onClick)="renameLast()" />
                <p-button size="small" label="Delete last" severity="danger" [outlined]="true" (onClick)="deleteLast()" />
            </div>
            <div style="height: 26rem">
                <p-taskboard-root [tasks]="tasks()" (tasksChange)="tasks.set($event)" dataKey="id" columnField="columnId" [columns]="columns" (cardActivate)="onActivate($event)">
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
                                    <p-taskboard-column-footer>
                                        <p-button size="small" [text]="true" label="Add card" (onClick)="addCard(columnContext.value)" />
                                    </p-taskboard-column-footer>
                                </ng-template>
                            </p-taskboard-column>
                        }
                    </p-taskboard-content>
                    <p-taskboard-drag-preview />
                </p-taskboard-root>
            </div>
            <p class="mt-4 text-sm text-muted-color">{{ activated() }}</p>
        </div>
        <app-code></app-code>
    `
})
export class CrudDoc {
    readonly columns: TaskBoardColumnModel[] = demoColumns();

    readonly tasks = signal<TaskBoardItem[]>(demoTasks('cr'));

    readonly activated = signal('Double-click a card, or press Enter on it, to see cardActivate.');

    private readonly board = viewChild.required(TaskBoard);

    private next = 1;

    addCard(columnId: string | number = 'todo'): void {
        this.board().addTask({ id: `new-${this.next++}`, title: `New card ${this.next}`, columnId, tags: ['new'] });
    }

    renameLast(): void {
        const last = this.tasks()[this.tasks().length - 1];
        if (!last) return;

        this.board().updateTask({ ...last, title: `${last['title']} (edited)` });
    }

    deleteLast(): void {
        const last = this.tasks()[this.tasks().length - 1];
        if (!last) return;

        this.board().removeTask(last['id'] as string);
    }

    onActivate(payload: TaskBoardCardActivatePayload): void {
        this.activated.set(`Opened ${payload.card['title']} from ${payload.origin}`);
    }
}
