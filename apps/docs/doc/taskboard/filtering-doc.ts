import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { InputTextModule } from '@openng/optimus-ui/inputtext';
import { SelectButtonModule } from '@openng/optimus-ui/selectbutton';
import { TaskBoardModule } from '@openng/optimus-ui/taskboard';
import type { TaskBoardColumnModel, TaskBoardItem } from '@openng/optimus-ui/types/taskboard';
import { demoColumns, demoTasks } from './demo-data';

@Component({
    selector: 'filtering-doc',
    standalone: true,
    imports: [AppDocSectionText, FormsModule, InputTextModule, SelectButtonModule, TaskBoardModule, AppCode],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <app-docsectiontext>
            <p>
                Search, filter and sort are the application's, and deliberately so: the board has no opinion about what a card means, so it cannot know that "critical" outranks "low" or which fields a query should look at. Derive the visible array
                with <i>computed()</i>, normalise <i>order</i> per column, and hand the result to <i>tasks</i>.
            </p>
            <p>Filtering changes what the board is given, not what it owns. Selection, focus, collapse state and the move payloads keep working against whatever array it currently holds.</p>
        </app-docsectiontext>
        <div class="card">
            <div class="flex flex-wrap items-center gap-3 mb-4">
                <input pInputText type="text" placeholder="Search title or tag" [ngModel]="query()" (ngModelChange)="query.set($event)" />
                <p-selectbutton [options]="orders" [ngModel]="sort()" (ngModelChange)="sort.set($event)" [allowEmpty]="false" />
            </div>
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
        </div>
        <app-code></app-code>
    `
})
export class FilteringDoc {
    readonly columns: TaskBoardColumnModel[] = demoColumns();

    private readonly source = signal<TaskBoardItem[]>(demoTasks('f'));

    readonly query = signal('');

    readonly orders = ['board order', 'priority'];

    readonly sort = signal('board order');

    /** How heavy each priority is, so "critical first" has something to sort by. */
    private readonly weight: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };

    /**
     * The visible array: filtered, sorted, and renumbered per column.
     *
     * `order` is rewritten after sorting because it is what the board renders by — leaving the old
     * values in place would sort the cards and then have the board put them back.
     */
    readonly visible = computed<TaskBoardItem[]>(() => {
        const needle = this.query().trim().toLowerCase();

        const matched = needle
            ? this.source().filter(
                  (item) =>
                      String(item['title'] ?? '')
                          .toLowerCase()
                          .includes(needle) || (item['tags'] ?? []).some((tag: string) => tag.toLowerCase().includes(needle))
              )
            : this.source();

        const sorted = this.sort() === 'priority' ? [...matched].sort((left, right) => (this.weight[String(left['priority'])] ?? 9) - (this.weight[String(right['priority'])] ?? 9)) : matched;

        const perColumn = new Map<string, number>();

        return sorted.map((item) => {
            const column = String(item['columnId']);
            const index = perColumn.get(column) ?? 0;

            perColumn.set(column, index + 1);

            return { ...item, order: index };
        });
    });
}
