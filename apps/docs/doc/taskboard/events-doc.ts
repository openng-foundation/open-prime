import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { Button } from '@openng/optimus-ui/button';
import { TaskBoardModule } from '@openng/optimus-ui/taskboard';
import type { TaskBoardColumnModel, TaskBoardItem } from '@openng/optimus-ui/types/taskboard';
import { demoColumnsWithLimit, demoTasks } from './demo-data';

@Component({
    selector: 'events-doc',
    standalone: true,
    imports: [AppDocSectionText, Button, TaskBoardModule, AppCode],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <app-docsectiontext>
            <p>
                The ordering is part of the contract, not an accident of implementation. In managed mode <i>tasksChange</i> is emitted BEFORE the matching domain output, so a handler that reads the signal it just wrote already sees the change. An
                output handler's return value cancels nothing — the decision was taken before it ran.
            </p>
            <p>
                A move inside the same cell emits <i>cardMove</i> and then <i>cardReorder</i>; a move between columns emits only <i>cardMove</i>. A refused move emits only <i>cardDropBlocked</i> and leaves the data untouched. A double-click emits
                <i>cardDblclick</i> and then <i>cardActivate</i>; Enter emits <i>cardActivate</i> alone. For one card, <i>cardSelect</i> comes before <i>selectionChange</i>; selecting or clearing a whole lane emits only <i>selectionChange</i>.
            </p>
            <p>
                Persist from <i>cardMove</i> and not from <i>dragEnd</i>. The lifecycle outputs — <i>dragStart</i>, <i>dragEnd</i>, <i>dragCancel</i> — describe the GESTURE and fire whatever the board then decided; a drop the workflow refused still
                ends in <i>dragEnd</i>.
            </p>
            <p>Drag a card, select a few, right-click one, or push it into the full <b>In Progress</b> lane, and watch the order the log fills in.</p>
        </app-docsectiontext>
        <div class="card">
            <div class="mb-4 flex flex-wrap gap-2">
                <p-button size="small" label="Clear log" severity="secondary" [outlined]="true" (onClick)="log.set([])" />
            </div>
            <div style="height: 24rem">
                <p-taskboard-root
                    [tasks]="tasks()"
                    (tasksChange)="onTasksChange($event)"
                    dataKey="id"
                    columnField="columnId"
                    [columns]="columns"
                    selectionMode="multiple"
                    [contextMenu]="true"
                    (cardMove)="record('cardMove', $event.card.title + ': ' + $event.oldColumnId + ' -> ' + $event.newColumnId)"
                    (cardReorder)="record('cardReorder', $event.card.title + ' at ' + $event.newIndex)"
                    (cardDropBlocked)="record('cardDropBlocked', $event.reason)"
                    (cardClick)="record('cardClick', $event.card.title)"
                    (cardDblclick)="record('cardDblclick', $event.card.title)"
                    (cardActivate)="record('cardActivate', $event.card.title + ' via ' + $event.origin)"
                    (cardSelect)="record('cardSelect', $event.card.title + ' = ' + $event.selected)"
                    (selectionChange)="record('selectionChange', $event.selectedIds.length + ' selected')"
                    (columnCollapse)="record('columnCollapse', $event.column.label + ' = ' + $event.collapsed)"
                    (cardContextMenu)="record('cardContextMenu', $event.card?.title ?? '(no card)')"
                    (dragStart)="record('dragStart', $event.card.title)"
                    (dragEnd)="record('dragEnd', $event.card.title)"
                    (dragCancel)="record('dragCancel', $event.card.title)"
                >
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
            <ol class="mt-4 max-h-56 overflow-auto rounded-md border border-surface-200 p-3 text-xs dark:border-surface-700">
                @for (entry of log(); track $index) {
                    <li class="py-0.5">
                        <span class="font-mono font-semibold">{{ entry.name }}</span> <span class="text-muted-color">{{ entry.detail }}</span>
                    </li>
                } @empty {
                    <li class="text-muted-color">Interact with the board to fill the log.</li>
                }
            </ol>
        </div>
        <app-code></app-code>
    `
})
export class EventsDoc {
    readonly columns: TaskBoardColumnModel[] = demoColumnsWithLimit();

    readonly tasks = signal<TaskBoardItem[]>(demoTasks('ev'));

    readonly log = signal<{ name: string; detail: string }[]>([]);

    /** Newest last, capped: the point is the ORDER, so the log has to read top to bottom. */
    record(name: string, detail: string): void {
        this.log.update((entries) => [...entries.slice(-40), { name, detail }]);
    }

    onTasksChange(next: TaskBoardItem[]): void {
        this.tasks.set(next);
        this.record('tasksChange', `${next.length} cards`);
    }
}
