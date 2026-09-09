import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { SelectButtonModule } from '@openng/optimus-ui/selectbutton';
import { TaskBoardModule } from '@openng/optimus-ui/taskboard';
import type { TaskBoardColumnModel, TaskBoardItem } from '@openng/optimus-ui/types/taskboard';
import { demoColumnsWithLimit, demoTasks } from './demo-data';

@Component({
    selector: 'uiparts-doc',
    standalone: true,
    imports: [AppDocSectionText, FormsModule, SelectButtonModule, TaskBoardModule, AppCode],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <app-docsectiontext>
            <p>
                Five components in the package decide how anything LOOKS: <i>p-taskboard-card-ui</i>, <i>p-taskboard-card-advanced-ui</i>, <i>p-taskboard-column-header-ui</i>, <i>p-taskboard-swimlane-header-ui</i> and
                <i>p-taskboard-swimlane-column-header-ui</i>. Everything else is structural.
            </p>
            <p>
                They read their data from the nearest context, so <i>&lt;p-taskboard-card-ui /&gt;</i> with no bindings is a complete card. Every value can also be passed explicitly — <i>[task]</i>, <i>[column]</i>, <i>[taskCount]</i>,
                <i>[isCollapsed]</i>, <i>[toggleCollapse]</i>, <i>[collapsible]</i> — which is what a preview or a component test rendered outside a board needs.
            </p>
            <p>
                Use them while their visual language is close enough to the product, and write your own component when the data model is different enough that starting from a supplied card would cost more than it saves. Both render inside the same
                wrapper, so swapping one for the other changes nothing about movement, focus, selection or the payloads. The switch below does exactly that on a live board.
            </p>
            <p>What they must NOT do is calculate: drop placement, selected ids, the filtered list, collapse state and workflow validity all come from the board.</p>
        </app-docsectiontext>
        <div class="card">
            <p-selectbutton [options]="variants" [ngModel]="variant()" (ngModelChange)="variant.set($event)" [allowEmpty]="false" class="mb-4" />
            <div style="height: 26rem">
                <p-taskboard-root [tasks]="tasks()" (tasksChange)="tasks.set($event)" dataKey="id" columnField="columnId" [columns]="columns" selectionMode="single">
                    <p-taskboard-content>
                        @for (column of columns; track column.id) {
                            <p-taskboard-column [column]="column" [value]="column.id" [label]="column.label">
                                <ng-template pTaskBoardColumnDef let-columnContext>
                                    <p-taskboard-column-header><p-taskboard-column-header-ui /></p-taskboard-column-header>
                                    <p-taskboard-column-content>
                                        @for (item of columnContext.visibleItems; track item.id) {
                                            <p-taskboard-card [item]="item">
                                                @if (variant() === 'advanced') {
                                                    <p-taskboard-card-advanced-ui />
                                                } @else if (variant() === 'custom') {
                                                    <article class="rounded-md border-l-4 border-primary bg-surface-0 p-3 dark:bg-surface-900">
                                                        <span class="text-sm font-semibold">{{ item.title }}</span>
                                                        <div class="mt-1 text-xs text-muted-color">{{ item.assignee ?? 'Unassigned' }}</div>
                                                    </article>
                                                } @else {
                                                    <p-taskboard-card-ui />
                                                }
                                            </p-taskboard-card>
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
export class UiPartsDoc {
    readonly columns: TaskBoardColumnModel[] = demoColumnsWithLimit();

    readonly tasks = signal<TaskBoardItem[]>(demoTasks('up'));

    readonly variants = ['card', 'advanced', 'custom'];

    readonly variant = signal('card');
}
