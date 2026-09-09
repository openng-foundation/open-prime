import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { TaskBoardModule } from '@openng/optimus-ui/taskboard';
import type { TaskBoardColumnModel, TaskBoardItem, TaskBoardSwimlane, TaskBoardSwimlaneCollapsePayload } from '@openng/optimus-ui/types/taskboard';
import { demoColumns, demoSwimlaneTasks, demoSwimlanes } from './demo-data';

@Component({
    selector: 'swimlanes-doc',
    standalone: true,
    imports: [AppDocSectionText, TaskBoardModule, AppCode],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <app-docsectiontext>
            <p>
                Swimlanes add a second grouping dimension over the same columns. Set <i>swimlaneField</i> and pass <i>swimlanes</i>, and card placement, move indexes and payloads all become cell-relative: a cross-row move reports both
                <i>newColumnId</i> and <i>newSwimlaneId</i>.
            </p>
            <p>
                The grid itself is yours to author. Angular content projection does not iterate, so the header row, the rows and the cells are written out explicitly with the public classes; the board keeps the grouping, the collapse state, the drop
                targets and the counts on the runtime wrappers.
            </p>
        </app-docsectiontext>
        <div class="card">
            <div style="height: 32rem">
                <p-taskboard-root [tasks]="tasks()" (tasksChange)="tasks.set($event)" dataKey="id" columnField="columnId" swimlaneField="swimlaneId" [columns]="columns" [swimlanes]="swimlanes" (swimlaneCollapse)="onSwimlaneCollapse($event)">
                    <p-taskboard-content>
                        <div class="p-taskboard-column-headers" [style.min-width]="trackMinWidth">
                            <div class="p-taskboard-column-headers-spacer"></div>
                            <div class="p-taskboard-column-headers-content">
                                @for (column of columns; track column.id) {
                                    <p-taskboard-swimlane-column-header [column]="column"><p-taskboard-swimlane-column-header-ui /></p-taskboard-swimlane-column-header>
                                }
                            </div>
                        </div>
                        @for (swimlane of swimlanes; track swimlane.id) {
                            <div
                                class="p-taskboard-swimlane-row"
                                [class.p-taskboard-swimlane-collapsed]="collapsed().includes(swimlane.id)"
                                [style.min-width]="trackMinWidth"
                                [attr.data-swimlane-id]="swimlane.id"
                                role="group"
                                [attr.aria-expanded]="!collapsed().includes(swimlane.id)"
                            >
                                <p-taskboard-swimlane-header [swimlane]="swimlane"><p-taskboard-swimlane-header-ui /></p-taskboard-swimlane-header>
                                <div class="p-taskboard-swimlane-body">
                                    @for (column of columns; track column.id) {
                                        <p-taskboard-column class="p-taskboard-swimlane-cell" [column]="column" [value]="column.id" [label]="column.label" [attr.data-swimlane-id]="swimlane.id">
                                            <ng-template pTaskBoardColumnDef let-columnContext>
                                                @for (item of columnContext.visibleItems; track item.id) {
                                                    <p-taskboard-card [item]="item"><p-taskboard-card-ui /></p-taskboard-card>
                                                }
                                            </ng-template>
                                        </p-taskboard-column>
                                    }
                                </div>
                            </div>
                        }
                    </p-taskboard-content>
                    <p-taskboard-drag-preview />
                </p-taskboard-root>
            </div>
        </div>
        <app-code></app-code>
    `
})
export class SwimlanesDoc {
    readonly columns: TaskBoardColumnModel[] = demoColumns();

    readonly swimlanes: TaskBoardSwimlane[] = demoSwimlanes();

    readonly tasks = signal<TaskBoardItem[]>(demoSwimlaneTasks());

    /**
     * Which rows are closed.
     *
     * Mirrored from the output rather than queried off the board: the row element is the
     * application's, so the class on it has to come from application state, and the output is the
     * one thing that changes exactly when the board's own collapse state does.
     */
    readonly collapsed = signal<(string | number)[]>([]);

    onSwimlaneCollapse(payload: TaskBoardSwimlaneCollapsePayload): void {
        this.collapsed.update((current) => (payload.collapsed ? [...current, payload.swimlane.id] : current.filter((id) => id !== payload.swimlane.id)));
    }

    /**
     * The grid has to be at least as wide as its columns, or the sticky header row and the rows
     * disagree about where a column starts. The arithmetic is the application's because only it
     * knows how many columns it rendered.
     */
    readonly trackMinWidth = `calc(var(--p-taskboard-swimlane-header-width) + (2 * var(--p-taskboard-columns-padding)) + (${this.columns.length} * var(--p-taskboard-column-min-width)) + (${this.columns.length * 2} * var(--p-taskboard-column-body-padding)) + (${this.columns.length - 1} * var(--p-taskboard-column-gap)))`;
}
