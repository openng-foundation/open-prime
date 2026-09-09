import { ChangeDetectionStrategy, Component, computed, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { Avatar } from '@openng/optimus-ui/avatar';
import { AvatarGroup } from '@openng/optimus-ui/avatargroup';
import { Button } from '@openng/optimus-ui/button';
import { BarsIcon, FilterIcon, PlusIcon, StarIcon, UndoIcon } from '@openng/optimus-ui/icons';
import { InputTextModule } from '@openng/optimus-ui/inputtext';
import { TASKBOARD_CONTEXT, TaskBoard, TaskBoardModule, type TaskBoardContext } from '@openng/optimus-ui/taskboard';
import type { TaskBoardColumnModel, TaskBoardItem } from '@openng/optimus-ui/types/taskboard';
import { demoColumns, demoTasks } from './demo-data';

/**
 * A product board header, built on the board context.
 *
 * It takes no inputs: the counts, the owners and the blocked total are all derived from
 * `TASKBOARD_CONTEXT`, so the header stays right after a drag without anything telling it. The
 * actions are the application's — the board owns no toolbar, which is exactly why this lives in the
 * demo and not in the package.
 */
@Component({
    selector: 'taskboard-doc-header',
    standalone: true,
    imports: [Avatar, AvatarGroup, BarsIcon, Button, FilterIcon, FormsModule, InputTextModule, PlusIcon, StarIcon, UndoIcon],
    changeDetection: ChangeDetectionStrategy.OnPush,
    styles: `
        /* A shade above the board ground, so the bar reads as chrome and not as the first column. */
        .taskboard-doc-header {
            background: var(--p-content-background, #fff);
        }

        /* The group's default overlap eats half of every set of initials; 0.375rem shows both letters
           and still reads as a stack. */
        .taskboard-doc-header-owners .p-avatar {
            width: 1.75rem;
            height: 1.75rem;
            font-size: 0.625rem;
        }

        .taskboard-doc-header-owners .p-avatar + .p-avatar {
            margin-left: -0.375rem;
        }
    `,
    template: `
        <header class="taskboard-doc-header flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-surface-200 px-4 py-3 dark:border-surface-700">
            <div class="flex min-w-[12rem] flex-1 items-center gap-3">
                <span class="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <svg data-p-icon="bars" aria-hidden="true" width="16" height="16"></svg>
                </span>
                <div class="min-w-0">
                    <div class="truncate text-base font-semibold leading-tight">{{ title }}</div>
                    <div class="truncate text-xs text-muted-color">{{ subtitle }}</div>
                </div>
            </div>

            <div class="flex flex-wrap items-center gap-2">
                <span class="rounded-full bg-surface-100 dark:bg-surface-800 px-2.5 py-1 text-xs font-medium">{{ total() }} initiatives</span>
                <span class="rounded-full bg-green-100 dark:bg-green-500/15 px-2.5 py-1 text-xs font-medium text-green-700 dark:text-green-300">{{ shipping() }} shipping</span>
                @if (blocked() > 0) {
                    <span class="rounded-full bg-red-100 dark:bg-red-500/15 px-2.5 py-1 text-xs font-medium text-red-700 dark:text-red-300">{{ blocked() }} blocked</span>
                }
            </div>

            <div class="ms-auto flex flex-wrap items-center gap-3">
                <p-avatargroup class="taskboard-doc-header-owners">
                    @for (owner of owners().visible; track owner) {
                        <p-avatar shape="circle" [label]="initials(owner)" [ariaLabel]="owner" />
                    }
                    @if (owners().extra > 0) {
                        <p-avatar shape="circle" [label]="'+' + owners().extra" />
                    }
                </p-avatargroup>

                <input pInputText type="text" class="w-40" placeholder="Filter cards" [ngModel]="query()" (ngModelChange)="query.set($event)" aria-label="Filter cards" />

                <div class="flex items-center gap-1">
                    <p-button size="small" [text]="true" severity="secondary" ariaLabel="Clear filter" (onClick)="query.set('')"><svg data-p-icon="filter" aria-hidden="true"></svg></p-button>
                    <p-button size="small" [text]="true" severity="secondary" ariaLabel="Undo" (onClick)="undo()"><svg data-p-icon="undo" aria-hidden="true"></svg></p-button>
                    <p-button size="small" [text]="true" severity="secondary" ariaLabel="Favourite"><svg data-p-icon="star" aria-hidden="true"></svg></p-button>
                    <p-button size="small" label="New card" (onClick)="create()"><svg data-p-icon="plus" aria-hidden="true"></svg></p-button>
                </div>
            </div>
        </header>
    `
})
export class TaskBoardDocHeader {
    /** The board this header belongs to, for the derived counts. */
    private readonly board = inject<TaskBoardContext>(TASKBOARD_CONTEXT);

    /** The title and the query are the demo's, and it hands the query back through these. */
    title = 'Horizon Roadmap';

    subtitle = 'Q3 launch command center';

    readonly query = signal('');

    readonly total = computed(() => this.board.items().length);

    readonly shipping = computed(() => this.board.items().filter((item) => this.board.columnOf(item) === 'done').length);

    readonly blocked = computed(() => this.board.items().filter((item) => item['priority'] === 'critical').length);

    /** The owners on the board, capped so the group does not grow with the data. */
    readonly owners = computed(() => {
        const names = [...new Set(this.board.items().flatMap((item) => item['assignees'] ?? (item['assignee'] ? [item['assignee']] : [])))] as string[];

        return { visible: names.slice(0, 4), extra: Math.max(0, names.length - 4) };
    });

    /** What the header asks the page to do. Wired by the section below. */
    onCreate?: () => void;

    onUndo?: () => void;

    initials(name: string): string {
        const parts = name.trim().split(/\s+/);
        return parts.length === 1 ? parts[0].charAt(0).toUpperCase() : `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
    }

    create(): void {
        this.onCreate?.();
    }

    undo(): void {
        this.onUndo?.();
    }
}

@Component({
    selector: 'header-doc',
    standalone: true,
    imports: [AppDocSectionText, TaskBoardModule, TaskBoardDocHeader, AppCode],
    changeDetection: ChangeDetectionStrategy.OnPush,
    styles: `
        .taskboard-doc-add {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.375rem;
            width: 100%;
            padding: 0.5rem;
            border: 0;
            border-radius: var(--p-taskboard-border-radius-sm);
            background: transparent;
            color: var(--p-taskboard-empty-color);
            font-size: 0.8125rem;
            cursor: pointer;
            transition:
                background 0.15s ease,
                color 0.15s ease;
        }

        .taskboard-doc-add:hover {
            background: var(--p-taskboard-hover-background);
            color: var(--p-taskboard-color);
        }

        .taskboard-doc-add-lane {
            margin-top: 0.5rem;
            border: 1px dashed var(--p-taskboard-swimlane-border-color);
        }
    `,
    template: `
        <app-docsectiontext>
            <p>
                <i>p-taskboard-header</i> is a surface, not a toolbar: the board ships no chrome of its own, because a title, a set of counters, an owner list and a row of actions are product decisions that differ on every board. What the board does
                give a header is the data — a component projected into it injects <i>TASKBOARD_CONTEXT</i> and derives its counts from the same array the columns render.
            </p>
            <p>
                That is why the counters below stay right after a drag with nothing telling them to: <i>total</i>, <i>shipping</i> and <i>blocked</i> are computed over <i>items()</i>. The filter box is the reverse direction — the header owns the
                query, the page derives the visible array from it, and the board renders what it is handed.
            </p>
            <p>
                This is also the section that puts the rest of the surfaces to work: the denser <i>p-taskboard-card-advanced-ui</i>, a per-column <i>p-taskboard-column-footer</i> with its own add action, the <i>p-taskboard-column-add</i> lane at the
                end of the track, and <i>p-taskboard-loading</i>, which stays out of the way until <i>loading</i> is on rather than needing to be conditionally rendered.
            </p>
        </app-docsectiontext>
        <div class="card">
            <div style="height: 30rem">
                <p-taskboard-root [tasks]="visible()" (tasksChange)="onTasksChange($event)" dataKey="id" columnField="columnId" [columns]="columnList()" selectionMode="multiple" [loading]="loading()">
                    <p-taskboard-header><taskboard-doc-header #boardHeader /></p-taskboard-header>
                    <p-taskboard-content>
                        @for (column of columnList(); track column.id) {
                            <p-taskboard-column [column]="column" [value]="column.id" [label]="column.label">
                                <ng-template pTaskBoardColumnDef let-columnContext>
                                    <p-taskboard-column-header><p-taskboard-column-header-ui /></p-taskboard-column-header>
                                    <p-taskboard-column-content>
                                        @for (item of columnContext.visibleItems; track item.id) {
                                            <p-taskboard-card [item]="item"><p-taskboard-card-advanced-ui /></p-taskboard-card>
                                        } @empty {
                                            <p-taskboard-column-empty />
                                        }
                                    </p-taskboard-column-content>
                                    <p-taskboard-column-footer>
                                        <p-taskboard-card-add>
                                            <button type="button" class="taskboard-doc-add" (click)="addTo(columnContext.value)">+ Add card</button>
                                        </p-taskboard-card-add>
                                    </p-taskboard-column-footer>
                                </ng-template>
                            </p-taskboard-column>
                        }
                        <p-taskboard-column-add>
                            <button type="button" class="taskboard-doc-add taskboard-doc-add-lane" (click)="addLane()">+ Add another list</button>
                        </p-taskboard-column-add>
                    </p-taskboard-content>
                    <p-taskboard-drag-preview />
                    <p-taskboard-loading><span class="text-sm text-muted-color">Loading the board…</span></p-taskboard-loading>
                </p-taskboard-root>
            </div>
        </div>
        <app-code></app-code>
    `
})
export class HeaderDoc {
    private readonly source = signal<TaskBoardItem[]>(demoTasks('hd'));

    /** The columns are app data, so the extra lane is added here and not asked of the board. */
    readonly columnList = signal<TaskBoardColumnModel[]>(demoColumns());

    readonly loading = signal(false);

    private readonly board = viewChild.required(TaskBoard);

    private readonly boardHeader = viewChild.required(TaskBoardDocHeader);

    private next = 1;

    /**
     * The array the board renders: the source narrowed by the header's own query.
     *
     * The filter runs here and not in the board because the board has no opinion about what a card
     * means. `order` is renumbered per column afterwards, since that is what the board renders by.
     */
    readonly visible = computed<TaskBoardItem[]>(() => {
        const needle = this.boardHeader().query().trim().toLowerCase();

        const matched = needle
            ? this.source().filter(
                  (item) =>
                      String(item['title'] ?? '')
                          .toLowerCase()
                          .includes(needle) || (item['tags'] ?? []).some((tag: string) => tag.toLowerCase().includes(needle))
              )
            : this.source();

        const perColumn = new Map<string, number>();

        return matched.map((item) => {
            const column = String(item['columnId']);
            const index = perColumn.get(column) ?? 0;

            perColumn.set(column, index + 1);

            return { ...item, order: index };
        });
    });

    constructor() {
        // The header asks and the page acts: the button lives where the user expects it while the
        // mutation stays with whoever owns the data.
        queueMicrotask(() => {
            const header = this.boardHeader();

            header.onCreate = () => this.source.update((items) => [...items, { id: `hd-new-${this.next++}`, title: `New initiative ${this.next}`, columnId: 'todo', priority: 'medium', tags: ['new'], order: items.length }]);
            header.onUndo = () => this.board().undo();
        });
    }

    /** Adds a card to one column, from that column's own footer. */
    addTo(columnId: string | number): void {
        this.source.update((items) => [...items, { id: `hd-new-${this.next++}`, title: `New initiative ${this.next}`, columnId, priority: 'medium', tags: ['new'], order: items.length }]);
    }

    /** Adds a lane. Columns are the application's array, so the board is simply handed a longer one. */
    addLane(): void {
        this.columnList.update((columns) => [...columns, { id: `lane-${columns.length}`, label: `Lane ${columns.length + 1}`, statusType: 'todo', order: columns.length }]);
    }

    onTasksChange(next: TaskBoardItem[]): void {
        // Cards the filter hides are not in the array the board hands back, so they are kept and only
        // the ones that were actually there get replaced.
        const changed = new Map(next.map((item) => [String(item['id']), item]));

        this.source.update((items) => items.map((item) => changed.get(String(item['id'])) ?? item));
    }
}
