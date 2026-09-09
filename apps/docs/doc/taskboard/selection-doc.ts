import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { TaskBoardModule } from '@openng/optimus-ui/taskboard';
import type { TaskBoardColumnModel, TaskBoardItem, TaskBoardSelectionChangePayload, TaskBoardSelectionMode } from '@openng/optimus-ui/types/taskboard';
import { FormsModule } from '@angular/forms';
import { SelectButtonModule } from '@openng/optimus-ui/selectbutton';
import { demoColumns, demoTasks } from './demo-data';

@Component({
    selector: 'selection-doc',
    standalone: true,
    imports: [AppDocSectionText, FormsModule, SelectButtonModule, TaskBoardModule, AppCode],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <app-docsectiontext>
            <p>
                <i>selectionMode</i> decides what a click does. A plain click replaces the selection, <i>Ctrl</i> or <i>Cmd</i> click toggles one card, and <i>Shift</i> click extends a range. A range is local to the cell: if the Shift target sits in
                another column or row, only that card is selected and the anchor moves there, because the order inside each column is independent.
            </p>
            <p>
                <i>cardSelect</i> describes the one card that changed; <i>selectionChange</i> carries the whole selection and is the output a toolbar wants. Dragging a selected card in multiple mode moves the whole group, in the order it was
                rendered.
            </p>
        </app-docsectiontext>
        <div class="card">
            <p-selectbutton [options]="modes" [ngModel]="mode()" (ngModelChange)="mode.set($event)" [allowEmpty]="false" class="mb-4" />
            <div style="height: 26rem">
                <p-taskboard-root [tasks]="tasks()" (tasksChange)="tasks.set($event)" dataKey="id" columnField="columnId" [columns]="columns" [selectionMode]="mode()" (selectionChange)="onSelectionChange($event)">
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
            <p class="mt-4 text-sm text-muted-color">Selected: {{ selected().length ? selected().join(', ') : 'nothing' }}</p>
        </div>
        <app-code></app-code>
    `
})
export class SelectionDoc {
    readonly columns: TaskBoardColumnModel[] = demoColumns();

    readonly tasks = signal<TaskBoardItem[]>(demoTasks('sel'));

    readonly modes: TaskBoardSelectionMode[] = ['none', 'single', 'multiple'];

    readonly mode = signal<TaskBoardSelectionMode>('multiple');

    readonly selected = signal<(string | number)[]>([]);

    onSelectionChange(payload: TaskBoardSelectionChangePayload): void {
        this.selected.set(payload.selectedIds);
    }
}
