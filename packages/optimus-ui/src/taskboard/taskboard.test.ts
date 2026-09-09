import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import type { TaskBoardColumnGroup, TaskBoardColumnModel, TaskBoardItem, TaskBoardSwimlane } from '@openng/optimus-ui/types/taskboard';
import { beforeEach, describe, expect, it } from 'vitest';
import { TaskBoard } from './taskboard';
import { TaskBoardModule } from './taskboard.module';

// The compound tree is mounted EXACTLY as a consumer writes it: root -> content -> column with its
// definition -> supplied header and supplied cards. What this protects:
//   - that the composition compiles and renders the columns, the cards and their data attributes,
//   - that a column definition wins over projected content, and the fallback when there is none,
//   - that the supplied parts read their context without receiving a single input,
//   - that collapse, selection and focus reach the DOM,
//   - that the phase headers are sized by runs of consecutive columns.

interface Card extends TaskBoardItem {
    id: string;
    title: string;
    columnId: string;
    order: number;
}

const COLUMNS: TaskBoardColumnModel[] = [
    { id: 'backlog', label: 'Backlog', statusType: 'todo', order: 0 },
    { id: 'active', label: 'Active', statusType: 'in-progress', wipLimit: 2, order: 1 },
    { id: 'done', label: 'Done', statusType: 'done', order: 2, locked: true }
];

const GROUPS: TaskBoardColumnGroup[] = [
    { label: 'Intake', columns: ['backlog'], color: '#3b82f6' },
    { label: 'Delivery', columns: ['active', 'done'], color: '#10b981' }
];

const SWIMLANES: TaskBoardSwimlane[] = [{ id: 'growth', label: 'Growth', order: 0 }];

function cards(): Card[] {
    return [
        { id: 'a', title: 'Alpha', columnId: 'backlog', order: 0, description: 'Primera', tags: ['design'], assignee: 'Ana Ruiz' },
        { id: 'b', title: 'Beta', columnId: 'backlog', order: 1, progress: 40 },
        { id: 'c', title: 'Gamma', columnId: 'active', order: 0 },
        { id: 'd', title: 'Delta', columnId: 'active', order: 1 }
    ];
}

@Component({
    standalone: false,
    changeDetection: ChangeDetectionStrategy.Eager,
    template: `
        <p-taskboard-root
            [tasks]="tasks()"
            (tasksChange)="tasks.set($event)"
            dataKey="id"
            columnField="columnId"
            [columns]="columns"
            [columnGroups]="groups()"
            [swimlanes]="swimlanes()"
            [swimlaneField]="swimlaneField()"
            [selectionMode]="'multiple'"
            [density]="density()"
            [loading]="loading()"
        >
            <p-taskboard-header><span class="toolbar">Toolbar</span></p-taskboard-header>
            <p-taskboard-content>
                @for (column of columns; track column.id) {
                    <p-taskboard-column [column]="column" [value]="column.id" [label]="column.label">
                        <ng-template pTaskBoardColumnDef let-columnContext let-itemCount="itemCount">
                            <p-taskboard-column-header>
                                <p-taskboard-column-header-ui />
                            </p-taskboard-column-header>
                            <p-taskboard-column-content>
                                @for (item of columnContext.visibleItems; track item.id; let index = $index) {
                                    <p-taskboard-drop-indicator [index]="index" />
                                    <p-taskboard-card [item]="item"><p-taskboard-card-ui /></p-taskboard-card>
                                } @empty {
                                    <p-taskboard-column-empty />
                                }
                                <p-taskboard-drop-indicator [index]="columnContext.visibleItems.length" />
                            </p-taskboard-column-content>
                            <p-taskboard-column-footer
                                ><span class="footer-count">{{ itemCount }}</span></p-taskboard-column-footer
                            >
                        </ng-template>
                    </p-taskboard-column>
                }
            </p-taskboard-content>
            <p-taskboard-drag-preview />
            <p-taskboard-drag-confirm />
            <p-taskboard-loading><span class="loading-copy">Loading</span></p-taskboard-loading>
        </p-taskboard-root>
    `
})
class TestHost {
    readonly board = viewChild.required(TaskBoard);

    readonly columns = COLUMNS;
    readonly tasks = signal<Card[]>(cards());
    readonly groups = signal<TaskBoardColumnGroup[]>([]);
    readonly swimlanes = signal<TaskBoardSwimlane[]>([]);
    readonly swimlaneField = signal<string | undefined>(undefined);
    readonly density = signal<'compact' | 'standard' | 'comfortable'>('standard');
    readonly loading = signal(false);
}

@Component({
    standalone: false,
    changeDetection: ChangeDetectionStrategy.Eager,
    template: `
        <p-taskboard-root [tasks]="tasks()" dataKey="id" columnField="columnId">
            <p-taskboard-content>
                <p-taskboard-column value="backlog" label="Backlog">
                    <span class="projected">No definition</span>
                </p-taskboard-column>
            </p-taskboard-content>
        </p-taskboard-root>
    `
})
class FallbackHost {
    readonly tasks = signal<Card[]>(cards());
}

describe('TaskBoard', () => {
    let fixture: ComponentFixture<TestHost>;
    let host: TestHost;

    const q = (selector: string) => fixture.debugElement.queryAll(By.css(selector));
    const one = (selector: string) => q(selector)[0]?.nativeElement as HTMLElement | undefined;
    const text = (selector: string) => q(selector).map((el) => (el.nativeElement as HTMLElement).textContent?.trim());

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TaskBoardModule],
            declarations: [TestHost, FallbackHost],
            providers: [provideZonelessChangeDetection()]
        }).compileComponents();

        fixture = TestBed.createComponent(TestHost);
        host = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('mounts the compound tree and renders the columns', () => {
        expect(q('[data-part="root"]').length).toBe(1);
        expect(one('[data-part="root"]')?.className).toContain('p-taskboard-density-standard');
        expect(q('[data-part="content"] [data-part="columns"]').length).toBe(1);
        expect(q('[data-part="column"]').length).toBe(3);
        expect(text('.toolbar')).toEqual(['Toolbar']);
    });

    it('a column carries its identity, its status family and an accessible count', () => {
        const backlog = one('[data-part="column"][data-column-id="backlog"]')!;

        expect(backlog.className).toContain('p-taskboard-column-todo');
        expect(backlog.getAttribute('role')).toBe('list');
        expect(backlog.getAttribute('data-taskboard-id-key')).toBe('s:backlog');
        expect(backlog.getAttribute('aria-label')).toBe('Backlog, 2 items');
        expect(backlog.getAttribute('aria-expanded')).toBe('true');
    });

    it('a locked column says so in its class', () => {
        expect(one('[data-column-id="done"]')?.className).toContain('p-taskboard-column-locked');
    });

    it('a card is the focus and drag target, with its data attributes', () => {
        const card = one('[data-part="card"][data-task-id="a"]')!;

        expect(card.getAttribute('role')).toBe('listitem');
        expect(card.getAttribute('data-taskboard-id-key')).toBe('s:a');
        expect(card.getAttribute('data-task-index')).toBe('0');
        expect(card.getAttribute('aria-label')).toBe('Alpha');
        expect(card.getAttribute('tabindex')).toBe('-1');
        expect(card.className).toContain('p-taskboard-card-draggable');
    });

    it('the column definition wins, and without one the projected content is used', async () => {
        expect(q('.footer-count').length).toBe(3);
        expect(text('.footer-count')).toEqual(['2', '2', '0']);

        const fallback = TestBed.createComponent(FallbackHost);
        await fallback.whenStable();

        expect(fallback.debugElement.queryAll(By.css('.projected')).length).toBe(1);
    });

    it('the supplied parts read their context without receiving a single input', () => {
        expect(text('.taskboard-column-header-title')).toEqual(['Backlog', 'Active', 'Done']);
        expect(text('.taskboard-card-title')).toEqual(['Alpha', 'Beta', 'Gamma', 'Delta']);
        expect(text('.taskboard-card-description')).toEqual(['Primera']);
        expect(one('.taskboard-card-progress-label')?.textContent?.trim()).toBe('40%');
    });

    it('the WIP badge appears only on the column that has a limit, and tones with how full it is', () => {
        const badges = q('.taskboard-column-header-meta');

        expect(badges.length).toBe(1);
        expect((badges[0].nativeElement as HTMLElement).textContent?.trim()).toBe('WIP 2/2');
        expect((badges[0].nativeElement as HTMLElement).className).toContain('taskboard-column-header-meta--danger');
    });

    it('an empty column renders its empty surface', () => {
        expect(q('[data-column-id="done"] [data-part="column-empty"]').length).toBe(1);
    });

    it('the markers are declared and all hidden while nothing is being dragged', () => {
        const markers = q('[data-part="drop-indicator"]');

        // One before every card plus one at the end, per column: 3 + 3 + 1.
        expect(markers.length).toBe(7);
        expect(markers.every((marker) => (marker.nativeElement as HTMLElement).hasAttribute('hidden'))).toBe(true);
    });

    it('collapsing a column shows in the class, in aria-expanded and in the control label', async () => {
        host.board().collapseColumn('backlog');
        await fixture.whenStable();

        const backlog = one('[data-column-id="backlog"]')!;

        expect(backlog.className).toContain('p-taskboard-column-collapsed');
        expect(backlog.getAttribute('aria-expanded')).toBe('false');
        expect(one('.taskboard-column-header-collapse-toggle')?.getAttribute('aria-label')).toBe('Expand Backlog column');
    });

    it('selecting marks the cards and reports the whole selection', async () => {
        host.board().setSelectedCards(['a', 'b']);
        await fixture.whenStable();

        expect(q('.p-taskboard-card-selected').length).toBe(2);
        expect(host.board().getSelectedCardIds()).toEqual(['a', 'b']);
    });

    it('a click on a card selects it', async () => {
        (one('[data-task-id="c"]') as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await fixture.whenStable();

        expect(host.board().getSelectedCardIds()).toEqual(['c']);
        expect(one('[data-task-id="c"]')?.className).toContain('p-taskboard-card-selected');
    });

    it('the density reaches the root class', async () => {
        host.density.set('compact');
        await fixture.whenStable();

        expect(one('[data-part="root"]')?.className).toContain('p-taskboard-density-compact');
    });

    it('the phase headers group by runs of consecutive columns', async () => {
        host.groups.set(GROUPS);
        await fixture.whenStable();

        const headers = q('.p-taskboard-column-group-header');

        expect(text('.p-taskboard-column-group-header')).toEqual(['Intake', 'Delivery']);
        expect((headers[1].nativeElement as HTMLElement).style.getPropertyValue('--p-taskboard-group-span')).toBe('2');
        expect(one('[data-part="columns"]')?.className).toContain('p-taskboard-columns-with-groups');

        // The narrow band repeats the label once per column.
        expect(text('.p-taskboard-column-group-mobile-header')).toEqual(['Intake', 'Delivery', 'Delivery']);
    });

    it('a grouped board switches container and leaves the grid to the application', async () => {
        // Both are needed: the rows AND the field that names them. Without the field the board cannot
        // tell which row a card belongs to, so it is not grouped.
        host.swimlanes.set(SWIMLANES);
        host.swimlaneField.set('swimlaneId');
        await fixture.whenStable();

        expect(one('[data-part="columns"]')?.className).toContain('p-taskboard-swimlane-grid');
    });

    it('the root carries the live regions and the shortcuts it claims', () => {
        const root = one('[data-part="root"]')!;

        expect(root.getAttribute('aria-label')).toBe('Task board');
        expect(root.getAttribute('aria-keyshortcuts')).toContain('Alt+ArrowLeft');
        expect(q('.p-taskboard-live-region').length).toBe(1);
        expect(q('.p-taskboard-live-region-assertive').length).toBe(1);
    });

    it('an imperative move rewrites the column, and a refused one changes nothing', async () => {
        host.board().moveTask('a', 'active', 0);
        await fixture.whenStable();

        // `active` has a wipLimit of 2 and is already full, so the move is refused.
        expect(host.tasks().find((card) => card.id === 'a')!.columnId).toBe('backlog');

        host.board().moveTask('a', 'done', 0);
        await fixture.whenStable();

        expect(host.tasks().find((card) => card.id === 'a')!.columnId).toBe('done');
        expect(q('[data-column-id="done"] [data-part="card"]').length).toBe(1);
    });

    it('the keyboard moves the focus across the cards of a cell', async () => {
        const root = one('[data-part="root"]')!;

        // DOM focus is what starts the navigation, exactly as clicking does in a browser: the card's
        // focusin is what puts the board's roving focus on it.
        (one('[data-task-id="a"]') as HTMLElement).focus();
        await fixture.whenStable();

        root.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
        await fixture.whenStable();

        expect(one('[data-task-id="b"]')?.className).toContain('p-taskboard-card-focused');
    });

    it('Escape unwinds the selection before the focus', async () => {
        const root = one('[data-part="root"]')!;

        host.board().setSelectedCards(['a']);
        await fixture.whenStable();

        root.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        await fixture.whenStable();

        expect(host.board().getSelectedCardIds()).toEqual([]);
    });

    it('the drag surfaces exist and are hidden at rest', () => {
        expect(one('[data-part="drag-preview"]')?.hasAttribute('hidden')).toBe(true);
        expect(one('[data-part="drag-confirm"]')?.hasAttribute('hidden')).toBe(true);
    });

    it('dragging suppresses text selection from the press, not from the drag', async () => {
        const card = one('[data-task-id="a"]')!;
        const root = one('[data-part="root"]')!;

        card.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1, button: 0, clientX: 10, clientY: 10 }));
        await fixture.whenStable();

        // Suppression has to be on before the threshold is crossed: the browser starts selecting text
        // the moment the pointer moves with the button down.
        expect(root.className).toContain('p-taskboard-pressing');
        expect(root.className).not.toContain('p-taskboard-dragging');

        document.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, pointerId: 1, clientX: 10, clientY: 60 }));
        await fixture.whenStable();

        expect(root.className).toContain('p-taskboard-dragging');

        document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 1, clientX: 10, clientY: 60 }));
        await fixture.whenStable();

        expect(root.className).not.toContain('p-taskboard-pressing');
        expect(root.className).not.toContain('p-taskboard-dragging');
    });

    it('a preview with no body of its own shows a copy of the travelling card', async () => {
        const card = one('[data-task-id="a"]')!;

        card.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 2, button: 0, clientX: 10, clientY: 10 }));
        document.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, pointerId: 2, clientX: 10, clientY: 80 }));
        await fixture.whenStable();

        const preview = one('[data-part="drag-preview"]')!;

        expect(preview.hasAttribute('hidden')).toBe(false);
        // A copy, not the card itself: the original stays in its column, dimmed.
        expect(preview.textContent).toContain('Alpha');
        expect(q('[data-task-id="a"]').length).toBe(1);

        document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 2, clientX: 10, clientY: 80 }));
        await fixture.whenStable();

        expect(one('[data-part="drag-preview"]')?.hasAttribute('hidden')).toBe(true);
    });

    it('the loading surface is always declared and only visible while loading is set', async () => {
        const surface = one('[data-part="loading"]')!;

        expect(surface.hasAttribute('hidden')).toBe(true);
        expect(one('[data-part="root"]')?.getAttribute('aria-busy')).toBeNull();

        host.loading.set(true);
        await fixture.whenStable();

        expect(one('[data-part="loading"]')?.hasAttribute('hidden')).toBe(false);
        expect(one('[data-part="root"]')?.getAttribute('aria-busy')).toBe('true');
        // aria-busy on the root is what announces it; saying it twice is worse than saying it once.
        expect(one('[data-part="loading"]')?.getAttribute('aria-hidden')).toBe('true');
    });

    it('print marks the board and the body BEFORE opening the dialog, and cleans up', () => {
        const seen: { target: boolean; printing: boolean; body: boolean; ancestors: number }[] = [];
        const view = fixture.nativeElement.ownerDocument.defaultView!;
        const original = view.print;

        // The print sheet hides everything that is not the marked board, so the hooks have to be in
        // place at the instant the browser snapshots the page. An attribute waiting for the next
        // change-detection pass would print blank.
        view.print = () => {
            const root = fixture.nativeElement.querySelector('[data-part="root"]') as HTMLElement;

            seen.push({
                target: root.getAttribute('data-print-target') === 'true',
                printing: root.classList.contains('p-taskboard-printing'),
                body: document.body.classList.contains('p-taskboard-print-active'),
                ancestors: document.querySelectorAll('.p-taskboard-print-ancestor').length
            });
        };

        try {
            host.board().print();
        } finally {
            view.print = original;
        }

        expect(seen).toHaveLength(1);
        expect(seen[0].target).toBe(true);
        expect(seen[0].printing).toBe(true);
        expect(seen[0].body).toBe(true);
        expect(seen[0].ancestors).toBeGreaterThan(0);

        // And it cleans up even if the browser never emits afterprint: the stub does not fire
        // beforeprint, so print mode was never entered and there is nothing to wait for.
        const root = one('[data-part="root"]')!;

        expect(root.hasAttribute('data-print-target')).toBe(false);
        expect(root.classList.contains('p-taskboard-printing')).toBe(false);
        expect(document.body.classList.contains('p-taskboard-print-active')).toBe(false);
        expect(document.querySelectorAll('.p-taskboard-print-ancestor').length).toBe(0);
    });

    it('when the browser DOES enter print mode, the hooks wait for afterprint', () => {
        const view = fixture.nativeElement.ownerDocument.defaultView!;
        const original = view.print;

        // A print() that does not block: stripping the hooks when the call returns would print a blank
        // sheet, so while the browser is printing they have to stay put.
        view.print = () => view.dispatchEvent(new Event('beforeprint'));

        try {
            host.board().print();
        } finally {
            view.print = original;
        }

        const root = one('[data-part="root"]')!;

        expect(root.getAttribute('data-print-target')).toBe('true');
        expect(document.body.classList.contains('p-taskboard-print-active')).toBe(true);

        view.dispatchEvent(new Event('afterprint'));

        expect(root.hasAttribute('data-print-target')).toBe(false);
        expect(document.body.classList.contains('p-taskboard-print-active')).toBe(false);
        expect(document.querySelectorAll('.p-taskboard-print-ancestor').length).toBe(0);
    });
});
