import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { TASKBOARD_CARD_CONTEXT, TaskBoardModule, type TaskBoardCardContext } from '@openng/optimus-ui/taskboard';
import type { TaskBoardColumnModel, TaskBoardItem } from '@openng/optimus-ui/types/taskboard';
import { demoColumns, demoTasks } from './demo-data';

/**
 * A product card that asks for the card context instead of taking inputs.
 *
 * Nothing is threaded down to it: it is inside a `p-taskboard-card`, so it can ask for that card's
 * item and interaction state and be reused under any board.
 */
@Component({
    selector: 'taskboard-doc-card',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <article
            class="flex flex-col gap-2 rounded-md border p-3 transition-colors"
            [class.border-primary]="card.isSelected()"
            [class.border-surface-200]="!card.isSelected()"
            [class.dark:border-surface-700]="!card.isSelected()"
            [attr.data-priority]="card.item().priority"
        >
            <div class="flex items-start justify-between gap-2">
                <span class="text-sm font-semibold">{{ card.item().title }}</span>
                @if (card.item().priority) {
                    <span class="text-[0.625rem] font-bold uppercase text-muted-color">{{ card.item().priority }}</span>
                }
            </div>
            @if (card.item().description) {
                <p class="m-0 text-xs text-muted-color line-clamp-2">{{ card.item().description }}</p>
            }
            <div class="flex items-center justify-between text-xs text-muted-color">
                <span>{{ card.column()?.label }}</span>
                @if (card.isFocused()) {
                    <span>focused</span>
                }
            </div>
        </article>
    `
})
export class TaskBoardDocCard {
    readonly card = inject<TaskBoardCardContext>(TASKBOARD_CARD_CONTEXT);
}

@Component({
    selector: 'cards-doc',
    standalone: true,
    imports: [AppDocSectionText, TaskBoardModule, TaskBoardDocCard, AppCode],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <app-docsectiontext>
            <p><i>p-taskboard-card</i> is the wrapper, not the card. It owns the focus target, the drag source, the hit-test rectangle, the state classes and the data attributes; whatever you project inside it is the visible card.</p>
            <p>
                A projected component injects <i>TASKBOARD_CARD_CONTEXT</i> for <i>item</i>, <i>column</i>, <i>isSelected</i>, <i>isFocused</i>, <i>isDisabled</i> and <i>isDragging</i> — all signals. Read them directly rather than mirroring them into
                state of your own.
            </p>
        </app-docsectiontext>
        <div class="card">
            <div style="height: 26rem">
                <p-taskboard-root [tasks]="tasks()" (tasksChange)="tasks.set($event)" dataKey="id" columnField="columnId" [columns]="columns" selectionMode="single">
                    <p-taskboard-content>
                        @for (column of columns; track column.id) {
                            <p-taskboard-column [column]="column" [value]="column.id" [label]="column.label">
                                <ng-template pTaskBoardColumnDef let-columnContext>
                                    <p-taskboard-column-header><p-taskboard-column-header-ui /></p-taskboard-column-header>
                                    <p-taskboard-column-content>
                                        @for (item of columnContext.visibleItems; track item.id) {
                                            <p-taskboard-card [item]="item"><taskboard-doc-card /></p-taskboard-card>
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
export class CardsDoc {
    readonly columns: TaskBoardColumnModel[] = demoColumns();

    readonly tasks = signal<TaskBoardItem[]>(demoTasks('cd'));
}
