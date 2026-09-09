import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { TaskBoardModule } from '@openng/optimus-ui/taskboard';
import type { TaskBoardColumnModel, TaskBoardItem } from '@openng/optimus-ui/types/taskboard';
import { demoColumns } from './demo-data';

@Component({
    selector: 'virtualscroll-doc',
    standalone: true,
    imports: [AppDocSectionText, TaskBoardModule, AppCode],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <app-docsectiontext>
            <p>
                <i>virtualScroll</i> keeps the mounted range close to the viewport. <i>virtualScrollItemHeight</i> is the estimate used until a real card height has been measured, and <i>virtualScrollBuffer</i> is how many extra cards stay mounted
                either side, so a fast scroll does not expose a blank edge.
            </p>
            <p>
                It changes how many cards are mounted, not what the board owns: filtering, sorting, selection, drag state and the move payloads still operate against the full collection. Loop over the column definition's <i>visibleItems</i> and not
                over <i>items</i>, or the window has no effect.
            </p>
        </app-docsectiontext>
        <div class="card">
            <div style="height: 26rem">
                <p-taskboard-root [tasks]="tasks()" (tasksChange)="tasks.set($event)" dataKey="id" columnField="columnId" [columns]="columns" [virtualScroll]="true" [virtualScrollItemHeight]="92" [virtualScrollBuffer]="4">
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
            <p class="mt-4 text-sm text-muted-color">{{ tasks().length }} cards across {{ columns.length }} columns.</p>
        </div>
        <app-code></app-code>
    `
})
export class VirtualScrollDoc {
    readonly columns: TaskBoardColumnModel[] = demoColumns();

    readonly tasks = signal<TaskBoardItem[]>(
        Array.from({ length: 600 }, (_value, index) => {
            const column = this.columns[index % this.columns.length];

            return {
                id: `v${index}`,
                title: `Work item ${index + 1}`,
                description: 'Generated so the column has more cards than fit on screen.',
                columnId: column.id,
                order: Math.floor(index / this.columns.length),
                tags: [String(column.id)]
            } satisfies TaskBoardItem;
        })
    );
}
