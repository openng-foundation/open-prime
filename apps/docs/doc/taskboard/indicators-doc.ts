import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { TASKBOARD_DROP_INDICATOR_CONTEXT, TaskBoardModule, type TaskBoardDropIndicatorContext } from '@openng/optimus-ui/taskboard';
import type { TaskBoardColumnModel, TaskBoardItem } from '@openng/optimus-ui/types/taskboard';
import { demoColumns, demoTasks } from './demo-data';

/** A marker that says where the card would land. */
@Component({
    selector: 'taskboard-doc-marker',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: ` <div class="rounded-full bg-primary px-2 py-0.5 text-center text-[0.625rem] font-bold text-primary-contrast">Drop at {{ indicator.index() + 1 }}</div> `
})
export class TaskBoardDocMarker {
    readonly indicator = inject<TaskBoardDropIndicatorContext>(TASKBOARD_DROP_INDICATOR_CONTEXT);
}

@Component({
    selector: 'indicators-doc',
    standalone: true,
    imports: [AppDocSectionText, TaskBoardModule, TaskBoardDocMarker, AppCode],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <app-docsectiontext>
            <p>
                You do not need to declare indicators for the normal experience: a column with none gets a runtime line positioned from the measured card geometry. Declare <i>p-taskboard-drop-indicator</i> — one before every card and one after the
                last — only when the marker needs content of its own.
            </p>
            <p>
                A marker reveals itself by comparing its own index against the position the sensor proposes, so nothing writes to the DOM behind Angular's back. Projected content adds
                <i>p-taskboard-drop-indicator-custom</i>, which suppresses the preset line: the two appearances are mutually exclusive on purpose.
            </p>
            <p>The board still owns the decision. Persist the accepted position from <i>cardMove</i> or <i>cardReorder</i>, never from the marker.</p>
        </app-docsectiontext>
        <div class="card">
            <div style="height: 26rem">
                <p-taskboard-root [tasks]="tasks()" (tasksChange)="tasks.set($event)" dataKey="id" columnField="columnId" [columns]="columns">
                    <p-taskboard-content>
                        @for (column of columns; track column.id) {
                            <p-taskboard-column [column]="column" [value]="column.id" [label]="column.label">
                                <ng-template pTaskBoardColumnDef let-columnContext>
                                    <p-taskboard-column-header><p-taskboard-column-header-ui /></p-taskboard-column-header>
                                    <p-taskboard-column-content>
                                        @for (item of columnContext.visibleItems; track item.id; let index = $index) {
                                            <p-taskboard-drop-indicator [index]="index">
                                                @if (column.id === 'review') {
                                                    <taskboard-doc-marker />
                                                }
                                            </p-taskboard-drop-indicator>
                                            <p-taskboard-card [item]="item"><p-taskboard-card-ui /></p-taskboard-card>
                                        } @empty {
                                            <p-taskboard-column-empty />
                                        }
                                        <p-taskboard-drop-indicator [index]="columnContext.visibleItems.length">
                                            @if (column.id === 'review') {
                                                <taskboard-doc-marker />
                                            }
                                        </p-taskboard-drop-indicator>
                                    </p-taskboard-column-content>
                                </ng-template>
                            </p-taskboard-column>
                        }
                    </p-taskboard-content>
                    <p-taskboard-drag-preview />
                </p-taskboard-root>
            </div>
            <p class="mt-4 text-sm text-muted-color">The <b>Review</b> column authors its own marker; the rest use the runtime line.</p>
        </div>
        <app-code></app-code>
    `
})
export class IndicatorsDoc {
    readonly columns: TaskBoardColumnModel[] = demoColumns();

    readonly tasks = signal<TaskBoardItem[]>(demoTasks('i'));
}
