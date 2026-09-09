import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { SelectButtonModule } from '@openng/optimus-ui/selectbutton';
import { ToggleSwitchModule } from '@openng/optimus-ui/toggleswitch';
import { TaskBoardModule } from '@openng/optimus-ui/taskboard';
import type { TaskBoardColumnModel, TaskBoardDensity, TaskBoardItem } from '@openng/optimus-ui/types/taskboard';
import { demoColumns, demoTasks } from './demo-data';

@Component({
    selector: 'appearance-doc',
    standalone: true,
    imports: [AppDocSectionText, FormsModule, SelectButtonModule, ToggleSwitchModule, TaskBoardModule, AppCode],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <app-docsectiontext>
            <p>
                <i>density</i> adds a class on the root and moves the column padding and the card gap with it. <i>columnWidth</i> and <i>cardGap</i> override the theme tokens for one board, which is what a page needs when the same board has to fit a
                narrow panel and a full page.
            </p>
            <p>
                <i>rtl</i> sets <i>dir</i> on the root and adds the direction classes, which is what every logical property in the stylesheet keys off. It is visual direction only: the ids, the column order, the payloads and the methods do not
                change.
            </p>
        </app-docsectiontext>
        <div class="card">
            <div class="flex flex-wrap items-center gap-4 mb-4">
                <p-selectbutton [options]="densities" [ngModel]="density()" (ngModelChange)="density.set($event)" [allowEmpty]="false" />
                <label class="flex items-center gap-2 text-sm">
                    <p-toggleswitch [ngModel]="rtl()" (ngModelChange)="rtl.set($event)" />
                    Right to left
                </label>
            </div>
            <div style="height: 26rem">
                <p-taskboard-root [tasks]="tasks()" (tasksChange)="tasks.set($event)" dataKey="id" columnField="columnId" [columns]="columns" [density]="density()" [rtl]="rtl()" [columnWidth]="260">
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
export class AppearanceDoc {
    readonly columns: TaskBoardColumnModel[] = demoColumns();

    readonly tasks = signal<TaskBoardItem[]>(demoTasks('a'));

    readonly densities: TaskBoardDensity[] = ['compact', 'standard', 'comfortable'];

    readonly density = signal<TaskBoardDensity>('standard');

    readonly rtl = signal(false);
}
