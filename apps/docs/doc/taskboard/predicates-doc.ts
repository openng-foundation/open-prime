import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { SelectButtonModule } from '@openng/optimus-ui/selectbutton';
import { TaskBoardModule } from '@openng/optimus-ui/taskboard';
import type { TaskBoardColumnModel, TaskBoardItem } from '@openng/optimus-ui/types/taskboard';
import { demoColumns, demoTasks } from './demo-data';

/** A named predicate over a card. The unit an app-side query is built from. */
type CardPredicate = (item: TaskBoardItem) => boolean;

@Component({
    selector: 'predicates-doc',
    standalone: true,
    imports: [AppDocSectionText, FormsModule, SelectButtonModule, TaskBoardModule, AppCode],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <app-docsectiontext>
            <p>
                The board has no filter API, and that is the design rather than an omission: a predicate over a card is product logic. "Overdue" needs to know which field carries the date and what a working day is; "at risk" needs to know that
                critical outranks high. The board reads three fields and would have to guess at all of it.
            </p>
            <p>
                So a predicate is an ordinary function, composed in application code and applied before the array reaches the board. Keep them pure and name them: a named predicate is testable on its own, reusable between a board and a report, and
                readable in a filter bar.
            </p>
            <p>Compose with <i>every</i> and <i>some</i> rather than growing one condition, and derive the result in a <i>computed()</i> so the work happens once per change and not once per render.</p>
        </app-docsectiontext>
        <div class="card">
            <p-selectbutton [options]="filters" [ngModel]="active()" (ngModelChange)="active.set($event)" [allowEmpty]="false" class="mb-4" />
            <div style="height: 26rem">
                <p-taskboard-root [items]="visible()" dataKey="id" columnField="columnId" [columns]="columns">
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
                </p-taskboard-root>
            </div>
            <p class="mt-4 text-sm text-muted-color">{{ visible().length }} of {{ source().length }} cards match.</p>
        </div>
        <app-code></app-code>
    `
})
export class PredicatesDoc {
    readonly columns: TaskBoardColumnModel[] = demoColumns();

    readonly source = signal<TaskBoardItem[]>(demoTasks('pr'));

    readonly filters = ['all', 'unassigned', 'at risk', 'in flight'];

    readonly active = signal('at risk');

    /** Named predicates: each one is a sentence about a card, testable on its own. */
    private readonly unassigned: CardPredicate = (item) => !item['assignee'] && !(item['assignees'] ?? []).length;

    private readonly highPriority: CardPredicate = (item) => item['priority'] === 'critical' || item['priority'] === 'high';

    private readonly notFinished: CardPredicate = (item) => item['columnId'] !== 'done';

    private readonly started: CardPredicate = (item) => (item['progress'] ?? 0) > 0 && (item['progress'] ?? 0) < 100;

    private readonly predicates: Record<string, CardPredicate[]> = {
        all: [],
        unassigned: [this.unassigned],
        'at risk': [this.highPriority, this.notFinished],
        'in flight': [this.started]
    };

    /**
     * The visible array.
     *
     * Composed with `every`, so adding a condition is adding a predicate to the list rather than
     * editing an expression — and `order` is renumbered per column, because that is what the board
     * renders by.
     */
    readonly visible = computed<TaskBoardItem[]>(() => {
        const conditions = this.predicates[this.active()] ?? [];
        const matched = this.source().filter((item) => conditions.every((predicate) => predicate(item)));
        const perColumn = new Map<string, number>();

        return matched.map((item) => {
            const column = String(item['columnId']);
            const index = perColumn.get(column) ?? 0;

            perColumn.set(column, index + 1);

            return { ...item, order: index };
        });
    });
}
