import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { Button } from '@openng/optimus-ui/button';
import { TaskBoard, TaskBoardModule } from '@openng/optimus-ui/taskboard';
import type { TaskBoardColumnModel, TaskBoardItem, TaskBoardStateSnapshot } from '@openng/optimus-ui/types/taskboard';
import { demoColumns, demoTasks } from './demo-data';

@Component({
    selector: 'export-doc',
    standalone: true,
    imports: [AppDocSectionText, Button, TaskBoardModule, AppCode],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <app-docsectiontext>
            <p>
                <i>exportToJSON</i> and <i>exportToCSV</i> read the bound source, not the current filtered or collapsed view: they are a dump of what the board was given. Pass <i>fields</i>, <i>delimiter</i>, <i>includeHeader</i> and
                <i>arrayJoiner</i> to shape the CSV; <i>downloadJSON</i> and <i>downloadCSV</i> do the same and hand the file to the browser.
            </p>
            <p>
                <i>print</i> marks this board as the print target and unclips its ancestors, which is why it exists at all: a board inside a scroll panel or a drawer is clipped by boxes it does not own, and <i>window.print()</i> on its own comes out
                as the one visible screenful.
            </p>
            <p>
                <i>serializeState</i> saves UI state only — the collapsed ids, the selected ids and the focused id. The cards, the query and the workflow rules stay with the application: a snapshot that carried them would go stale the moment the data
                moved on. <i>restoreState</i> applies whichever fields a snapshot has, so a partial one is a valid saved view.
            </p>
        </app-docsectiontext>
        <div class="card">
            <div class="flex flex-wrap gap-2 mb-4">
                <p-button size="small" label="Preview JSON" [outlined]="true" (onClick)="preview('json')" />
                <p-button size="small" label="Preview CSV" [outlined]="true" (onClick)="preview('csv')" />
                <p-button size="small" label="Download CSV" severity="secondary" [outlined]="true" (onClick)="board().downloadCSV()" />
                <p-button size="small" label="Print" severity="secondary" [outlined]="true" (onClick)="board().print()" />
                <p-button size="small" label="Save view" severity="secondary" [outlined]="true" (onClick)="save()" />
                <p-button size="small" label="Restore view" severity="secondary" [outlined]="true" [disabled]="!snapshot()" (onClick)="restore()" />
            </div>
            <div style="height: 24rem">
                <p-taskboard-root [tasks]="tasks()" (tasksChange)="tasks.set($event)" dataKey="id" columnField="columnId" [columns]="columns" selectionMode="multiple">
                    <p-taskboard-header><span class="text-sm font-semibold">Delivery board</span></p-taskboard-header>
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
            @if (output()) {
                <pre class="mt-4 max-h-64 overflow-auto rounded-md border border-surface-200 dark:border-surface-700 p-3 text-xs">{{ output() }}</pre>
            }
        </div>
        <app-code></app-code>
    `
})
export class ExportDoc {
    readonly columns: TaskBoardColumnModel[] = demoColumns();

    readonly tasks = signal<TaskBoardItem[]>(demoTasks('e'));

    readonly board = viewChild.required(TaskBoard);

    readonly output = signal('');

    readonly snapshot = signal<TaskBoardStateSnapshot | null>(null);

    preview(format: 'json' | 'csv'): void {
        this.output.set(format === 'json' ? this.board().exportToJSON() : this.board().exportToCSV({ fields: ['id', 'title', 'columnId', 'priority', 'assignee', 'tags'] }));
    }

    save(): void {
        this.snapshot.set(this.board().serializeState());
    }

    restore(): void {
        const saved = this.snapshot();
        if (saved) this.board().restoreState(saved);
    }
}
