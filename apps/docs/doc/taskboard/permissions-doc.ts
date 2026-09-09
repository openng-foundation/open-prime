import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { SelectButtonModule } from '@openng/optimus-ui/selectbutton';
import { TaskBoardModule } from '@openng/optimus-ui/taskboard';
import type { TaskBoardAccess, TaskBoardColumnModel, TaskBoardItem } from '@openng/optimus-ui/types/taskboard';
import { demoColumns, demoTasks } from './demo-data';

@Component({
    selector: 'permissions-doc',
    standalone: true,
    imports: [AppDocSectionText, FormsModule, SelectButtonModule, TaskBoardModule, AppCode],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <app-docsectiontext>
            <p>
                <i>access</i> decides what the board OFFERS. Board-level flags cover dragging, editing, creating and deleting; <i>columnAccess</i> hides a column with <i>canView</i> and guards movement with <i>canMoveIn</i> and <i>canMoveOut</i>. A
                hidden column keeps its cards in the data — they are simply not rendered until the column becomes viewable again.
            </p>
            <p>This is an interaction guard, not authorisation. Persist only what the server also accepts.</p>
        </app-docsectiontext>
        <div class="card">
            <p-selectbutton [options]="roles" [ngModel]="role()" (ngModelChange)="role.set($event)" [allowEmpty]="false" class="mb-4" />
            <div style="height: 26rem">
                <p-taskboard-root [tasks]="tasks()" (tasksChange)="tasks.set($event)" dataKey="id" columnField="columnId" [columns]="columns" [access]="access()">
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
export class PermissionsDoc {
    readonly columns: TaskBoardColumnModel[] = demoColumns();

    readonly tasks = signal<TaskBoardItem[]>(demoTasks('p'));

    readonly roles = ['owner', 'reviewer', 'viewer'];

    readonly role = signal('reviewer');

    readonly access = computed<TaskBoardAccess>(() => {
        const role = this.role();

        if (role === 'owner') return { role, canDrag: true, canEdit: true, canCreate: true, canDelete: true };
        if (role === 'viewer') return { role, canDrag: false, canEdit: false, canCreate: false, canDelete: false };

        return { role, canDrag: true, canEdit: true, canCreate: true, canDelete: false, columnAccess: { done: { canMoveIn: false } } };
    });
}
