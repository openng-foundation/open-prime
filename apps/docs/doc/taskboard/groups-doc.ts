import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { TaskBoardModule } from '@openng/optimus-ui/taskboard';
import type { TaskBoardColumnGroup, TaskBoardColumnModel, TaskBoardItem } from '@openng/optimus-ui/types/taskboard';
import { demoColumns, demoGroups, demoTasks } from './demo-data';

@Component({
    selector: 'groups-doc',
    standalone: true,
    imports: [AppDocSectionText, TaskBoardModule, AppCode],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <app-docsectiontext>
            <p>
                <i>columnGroups</i> draws a phase header over a run of columns. The header walks the visible column order and opens a new segment whenever the group changes, so a group whose columns are no longer adjacent — because of <i>order</i>,
                or because access hid one of them — renders as two labelled runs instead of one label stretched over a lane it does not own.
            </p>
            <p>Phase headers are visual. They do not change movement rules, payloads, WIP limits or what gets persisted; those stay on the columns.</p>
        </app-docsectiontext>
        <div class="card">
            <div style="height: 26rem">
                <p-taskboard-root [tasks]="tasks()" (tasksChange)="tasks.set($event)" dataKey="id" columnField="columnId" [columns]="columns" [columnGroups]="groups">
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
export class GroupsDoc {
    readonly columns: TaskBoardColumnModel[] = demoColumns();

    readonly groups: TaskBoardColumnGroup[] = demoGroups();

    readonly tasks = signal<TaskBoardItem[]>(demoTasks('g'));
}
