import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ContextMenu } from '@openng/optimus-ui/contextmenu';
import { TaskBoard, TaskBoardModule } from '@openng/optimus-ui/taskboard';
import type { MenuItem } from '@openng/optimus-ui/api';
import type { TaskBoardCardContextMenuPayload, TaskBoardColumnModel, TaskBoardItem } from '@openng/optimus-ui/types/taskboard';
import { demoColumns, demoTasks } from './demo-data';

@Component({
    selector: 'contextmenu-doc',
    standalone: true,
    imports: [AppDocSectionText, ContextMenu, TaskBoardModule, AppCode],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <app-docsectiontext>
            <p>
                Set <i>[contextMenu]="true"</i> when cards should open an action menu. The board suppresses the browser menu and emits <i>cardContextMenu</i> with the card, its column, the pointer position and the original event; whether that payload
                opens a menu, a popover, a drawer or a route is the application's decision.
            </p>
            <p>
                The board owns no overlay on purpose. A menu has to know the product — which actions exist, which are allowed for this viewer, what a duplicate means — and none of that is knowable from a card's placement. Build the model from the
                emitted card and your own permission state, then call the board's methods or your store when a command commits.
            </p>
            <p>Right-click a card below.</p>
        </app-docsectiontext>
        <div class="card">
            <div style="height: 26rem">
                <p-taskboard-root [tasks]="tasks()" (tasksChange)="tasks.set($event)" dataKey="id" columnField="columnId" [columns]="columns" [contextMenu]="true" (cardContextMenu)="onCardContextMenu($event)">
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
            <p-contextmenu #cardMenu [model]="menuItems()" [global]="false" />
            <p class="mt-4 text-sm text-muted-color">{{ lastAction() }}</p>
        </div>
        <app-code></app-code>
    `
})
export class ContextMenuDoc {
    readonly columns: TaskBoardColumnModel[] = demoColumns();

    readonly tasks = signal<TaskBoardItem[]>(demoTasks('cm'));

    readonly lastAction = signal('Right-click a card to open its menu.');

    private readonly board = viewChild.required(TaskBoard);

    private readonly menu = viewChild.required<ContextMenu>('cardMenu');

    private readonly active = signal<TaskBoardItem | undefined>(undefined);

    /**
     * The menu model, built from the card the payload named.
     *
     * A signal and not a fixed array: the move targets are every column except the one the card is
     * already in, so the model has to be derived from the active card rather than written once.
     */
    readonly menuItems = signal<MenuItem[]>([]);

    onCardContextMenu(event: TaskBoardCardContextMenuPayload): void {
        if (!event.card) return;

        this.active.set(event.card);
        this.menuItems.set([
            {
                label: 'Move to',
                items: this.columns
                    .filter((column) => column.id !== event.column?.id)
                    .map((column) => ({
                        label: column.label,
                        command: () => this.move(column.id)
                    }))
            },
            { separator: true },
            { label: 'Duplicate', command: () => this.duplicate() },
            { label: 'Delete', command: () => this.remove() }
        ]);

        this.menu().show(event.jsEvent);
    }

    private move(columnId: string | number): void {
        const card = this.active();
        if (!card) return;

        this.board().moveTask(card['id'] as string, columnId);
        this.lastAction.set(`Moved ${card['title']} to ${columnId}`);
    }

    private duplicate(): void {
        const card = this.active();
        if (!card) return;

        this.board().addTask({ ...card, id: `${card['id']}-copy`, title: `${card['title']} (copy)` });
        this.lastAction.set(`Duplicated ${card['title']}`);
    }

    private remove(): void {
        const card = this.active();
        if (!card) return;

        this.board().removeTask(card['id'] as string);
        this.lastAction.set(`Deleted ${card['title']}`);
    }
}
