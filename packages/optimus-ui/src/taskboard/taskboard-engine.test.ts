import { computed, signal } from '@angular/core';
import type { TaskBoardColumnModel, TaskBoardItem, TaskBoardSwimlane } from '@openng/optimus-ui/types/taskboard';
import { beforeEach, describe, expect, it } from 'vitest';
import { TASKBOARD_DEFAULT_LABELS, TaskBoardState, taskBoardIdKey, type TaskBoardStateConfig } from './taskboard-state';

// The engine is exercised without a DOM: it is a class that takes nothing but signals, so plain
// signals go in and what it decides comes out. What this protects is what looking at a board does
// not show:
//   - that the move rules fire in the order the docs promise,
//   - that an accepted move renumbers the source and target cells and nothing else,
//   - that range selection is local to the cell,
//   - that external mode never writes and still emits,
//   - that the virtual window is the whole list while it is off.

interface Card extends TaskBoardItem {
    id: string;
    title: string;
    columnId: string;
    swimlaneId?: string;
    order: number;
    owner?: string;
}

const COLUMNS: TaskBoardColumnModel[] = [
    { id: 'backlog', label: 'Backlog', statusType: 'todo', order: 0 },
    { id: 'active', label: 'Active', statusType: 'in-progress', wipLimit: 2, order: 1 },
    { id: 'review', label: 'Review', statusType: 'in-progress', order: 2, allowedTransitionsFrom: ['active'], requiredFields: ['owner'] },
    { id: 'done', label: 'Done', statusType: 'done', order: 3, confirmOnEnter: 'Ship it?' }
];

const SWIMLANES: TaskBoardSwimlane[] = [
    { id: 'growth', label: 'Growth', order: 0 },
    { id: 'platform', label: 'Platform', order: 1 }
];

function cards(): Card[] {
    return [
        { id: 'a', title: 'A', columnId: 'backlog', swimlaneId: 'growth', order: 0 },
        { id: 'b', title: 'B', columnId: 'backlog', swimlaneId: 'growth', order: 1 },
        // `order` is per column, not per cell: on an ungrouped board backlog is a, b, c, and once
        // grouped 'c' is alone in its cell, so 2 works for both cases.
        { id: 'c', title: 'C', columnId: 'backlog', swimlaneId: 'platform', order: 2 },
        { id: 'd', title: 'D', columnId: 'active', swimlaneId: 'growth', order: 0, owner: 'Ana' },
        { id: 'e', title: 'E', columnId: 'active', swimlaneId: 'platform', order: 1 }
    ];
}

/** The engine's configuration, with whatever a given test needs to change. */
function makeConfig(overrides: Partial<TaskBoardStateConfig<Card>> = {}) {
    const tasks = signal<Card[]>(cards());
    const emitted: Record<string, any[]> = {};

    const record = (name: string) => (payload: any) => {
        emitted[name] = emitted[name] ?? [];
        emitted[name].push(payload);
    };

    const config: TaskBoardStateConfig<Card> = {
        tasks,
        items: signal<Card[] | undefined>(undefined),
        setTasks: (value) => tasks.set(value),
        columns: signal(COLUMNS),
        swimlanes: signal([]),
        columnGroups: signal([]),
        dataKey: signal('id'),
        columnField: signal('columnId'),
        swimlaneField: signal<string | undefined>(undefined),
        draggable: signal(true),
        dragMinDistance: signal(5),
        columnCollapsible: signal(true),
        columnReorderable: signal(true),
        contextMenu: signal(true),
        scrollable: signal(true),
        selectionMode: signal('multiple'),
        density: signal('standard'),
        features: signal(undefined),
        access: signal(undefined),
        rtl: signal(false),
        disabled: signal(false),
        readonly: signal(false),
        loading: signal(false),
        virtualScroll: signal(false),
        virtualScrollItemHeight: signal(100),
        virtualScrollBuffer: signal(2),
        labels: computed(() => TASKBOARD_DEFAULT_LABELS),
        emitTasksChange: record('tasksChange'),
        emitCardMove: record('cardMove'),
        emitCardReorder: record('cardReorder'),
        emitCardDropBlocked: record('cardDropBlocked'),
        emitCardSelect: record('cardSelect'),
        emitSelectionChange: record('selectionChange'),
        emitCardCreate: record('cardCreate'),
        emitCardUpdate: record('cardUpdate'),
        emitCardDelete: record('cardDelete'),
        emitColumnCollapse: record('columnCollapse'),
        emitColumnReorder: record('columnReorder'),
        emitSwimlaneCollapse: record('swimlaneCollapse'),
        emitCardActivate: record('cardActivate'),
        emitDragStart: record('dragStart'),
        emitDragEnd: record('dragEnd'),
        emitDragCancel: record('dragCancel'),
        emitCardClick: record('cardClick'),
        emitCardDblclick: record('cardDblclick'),
        emitCardContextMenu: record('cardContextMenu'),
        hasDeclaredColumns: signal(true),
        registerColumn: () => undefined,
        unregisterColumn: () => undefined,
        ...overrides
    };

    // `tasks` can be overridden, and then the default writer would point at the wrong array; it is
    // rebound to whichever one ended up in the config unless a writer came with it.
    const model = config.tasks as ReturnType<typeof signal<Card[]>>;
    if (!overrides.setTasks) config.setTasks = (value) => model.set(value);
    if (!overrides.emitTasksChange) config.emitTasksChange = record('tasksChange');

    return { config, tasks: model, emitted };
}

/** A bench around the engine, with the emissions collected so they can be inspected. */
function bench(options: { external?: boolean; swimlanes?: boolean } = {}) {
    const { config, tasks, emitted } = makeConfig({
        items: signal<Card[] | undefined>(options.external ? cards() : undefined),
        swimlanes: signal(options.swimlanes ? SWIMLANES : []),
        swimlaneField: signal<string | undefined>(options.swimlanes ? 'swimlaneId' : undefined)
    });

    return { state: new TaskBoardState<Card>(config), tasks, emitted };
}

describe('the board index', () => {
    it('groups by column and, when there are rows, by cell', () => {
        const plain = bench();
        expect(plain.state.itemsOf('backlog').map((item) => item.id)).toEqual(['a', 'b', 'c']);

        const grouped = bench({ swimlanes: true });
        expect(grouped.state.itemsOf('backlog', 'growth').map((item) => item.id)).toEqual(['a', 'b']);
        expect(grouped.state.itemsOf('backlog', 'platform').map((item) => item.id)).toEqual(['c']);
    });

    it('the column and row counts cross the other dimension', () => {
        const { state } = bench({ swimlanes: true });

        expect(state.countOfColumn('backlog')).toBe(3);
        expect(state.countOfSwimlane('growth')).toBe(3);
    });

    it('sorts the columns by order', () => {
        const { state } = bench();
        expect(state.columns().map((column) => column.id)).toEqual(['backlog', 'active', 'review', 'done']);
    });

    it('an id key does not confuse the number 1 with the string "1"', () => {
        expect(taskBoardIdKey(1)).not.toBe(taskBoardIdKey('1'));
    });
});

describe('the move rules', () => {
    it('the transition rules are checked before the required fields', () => {
        const { state } = bench();
        const card = state.itemById('a')!;

        // 'a' is in backlog, and review only accepts from active. It is also missing `owner`, which is
        // the other reason it would be refused: the one that wins has to be the transition.
        const refusal = state.validateMove(card, 'review');

        expect(refusal?.reason).toBe('transition-rule');
    });

    it('the WIP limit refuses an entry and leaves the data untouched', () => {
        const { state, tasks, emitted } = bench();
        const card = state.itemById('a')!;

        // `active` has a wipLimit of 2 and already holds two cards.
        state.requestMove(card, { id: 'a', columnValue: 'active', index: 0 });

        expect(emitted['cardDropBlocked']?.[0].reason).toBe('wip-limit');
        expect(emitted['cardMove']).toBeUndefined();
        expect(tasks().find((item) => item.id === 'a')!.columnId).toBe('backlog');
    });

    it('the required fields refuse and say which are missing', () => {
        const { state } = bench();
        const card = state.itemById('e')!;

        const refusal = state.validateMove(card, 'review');

        expect(refusal?.reason).toBe('validation');
        expect(refusal?.failedFields).toEqual(['owner']);
    });

    it('a column asking for confirmation holds the move and emits no refusal', () => {
        const { state, tasks, emitted } = bench();
        const card = state.itemById('a')!;

        state.requestMove(card, { id: 'a', columnValue: 'done', index: 0 });

        expect(state.pendingMove()?.message).toBe('Ship it?');
        expect(emitted['cardDropBlocked']).toBeUndefined();
        expect(tasks().find((item) => item.id === 'a')!.columnId).toBe('backlog');

        state.confirmPendingMove();

        expect(state.pendingMove()).toBeNull();
        expect(tasks().find((item) => item.id === 'a')!.columnId).toBe('done');
    });

    it('cancelling the confirmation leaves the board untouched', () => {
        const { state, tasks } = bench();

        state.requestMove(state.itemById('a')!, { id: 'a', columnValue: 'done', index: 0 });
        state.cancelPendingMove();

        expect(state.pendingMove()).toBeNull();
        expect(tasks().find((item) => item.id === 'a')!.columnId).toBe('backlog');
    });

    it('access can forbid leaving one column and entering another', () => {
        const { config } = makeConfig({
            access: signal({ columnAccess: { backlog: { canMoveOut: false }, done: { canMoveIn: false } } })
        });

        const local = new TaskBoardState<Card>(config);

        // 'a' leaves backlog and 'd' enters done: both sides of the guard.
        expect(local.validateMove(local.itemById('a')!, 'done')?.reason).toBe('access');
        expect(local.validateMove(local.itemById('d')!, 'done')?.reason).toBe('access');
    });

    it('a column hidden by access disappears from the visible columns', () => {
        const { config } = makeConfig({ access: signal({ columnAccess: { done: { canView: false } } }) });
        const local = new TaskBoardState<Card>(config);

        expect(local.columns().map((column) => column.id)).toEqual(['backlog', 'active', 'review']);
    });
});

describe('an accepted move', () => {
    let harness: ReturnType<typeof bench>;

    beforeEach(() => {
        harness = bench();
    });

    it('emits the next array BEFORE the move', () => {
        const order: string[] = [];
        const { config } = makeConfig({
            emitTasksChange: () => order.push('tasksChange'),
            emitCardMove: () => order.push('cardMove'),
            emitCardReorder: () => order.push('cardReorder')
        });

        const local = new TaskBoardState<Card>(config);

        local.requestMove(local.itemById('a')!, { id: 'a', columnValue: 'backlog', index: 2 });

        expect(order).toEqual(['tasksChange', 'cardMove', 'cardReorder']);
    });

    it('a move inside the same cell emits cardMove and then cardReorder', () => {
        const { state, emitted } = harness;

        state.requestMove(state.itemById('a')!, { id: 'a', columnValue: 'backlog', index: 2 });

        expect(emitted['cardMove']).toHaveLength(1);
        expect(emitted['cardReorder']).toHaveLength(1);
        expect(emitted['cardReorder'][0]).toMatchObject({ columnValue: 'backlog', oldIndex: 0, newIndex: 2 });
    });

    it('a move between columns does NOT emit cardReorder', () => {
        const { state, emitted } = harness;

        state.requestMove(state.itemById('a')!, { id: 'a', columnValue: 'review', index: 0 });

        // review refuses from backlog, so a column with no rules is used.
        expect(emitted['cardReorder']).toBeUndefined();
    });

    it('renumbers the target cell and closes the gap in the source one', () => {
        const { state, tasks } = harness;

        state.requestMove(state.itemById('a')!, { id: 'a', columnValue: 'backlog', index: 2 });

        const backlog = tasks()
            .filter((item) => item.columnId === 'backlog')
            .sort((left, right) => left.order - right.order);

        expect(backlog.map((item) => item.id)).toEqual(['b', 'c', 'a']);
        expect(backlog.map((item) => item.order)).toEqual([0, 1, 2]);
    });

    it('crossing a row rewrites both configured fields', () => {
        const grouped = bench({ swimlanes: true });

        grouped.state.requestMove(grouped.state.itemById('a')!, { id: 'a', columnValue: 'backlog', index: 0, swimlaneValue: 'platform' });

        const moved = grouped.tasks().find((item) => item.id === 'a')!;

        expect(moved.columnId).toBe('backlog');
        expect(moved.swimlaneId).toBe('platform');
        expect(grouped.state.itemsOf('backlog', 'growth').map((item) => item.id)).toEqual(['b']);
    });

    it('a group of cards travels in the order it was rendered', () => {
        const { state, tasks } = harness;

        state.setSelection(['b', 'a']);
        state.requestMove(state.itemById('a')!, { id: 'a', columnValue: 'backlog', index: 3 }, ['a', 'b']);

        const backlog = tasks()
            .filter((item) => item.columnId === 'backlog')
            .sort((left, right) => left.order - right.order);

        expect(backlog.map((item) => item.id)).toEqual(['c', 'a', 'b']);
    });
});

describe('external mode', () => {
    it('never writes, but still emits the move', () => {
        const { state, tasks, emitted } = bench({ external: true });
        const before = tasks();

        state.requestMove(state.itemById('a')!, { id: 'a', columnValue: 'backlog', index: 2 });

        expect(tasks()).toBe(before);
        expect(emitted['tasksChange']).toBeUndefined();
        expect(emitted['cardMove']).toHaveLength(1);
    });

    it('records no history: undo belongs to whoever owns the data', () => {
        const { state } = bench({ external: true });

        state.requestMove(state.itemById('a')!, { id: 'a', columnValue: 'backlog', index: 2 });

        expect(state.canUndo()).toBe(false);
    });
});

describe('the selection', () => {
    it('a plain click replaces and a modifier click toggles', () => {
        const { state } = bench();

        state.selectFromPointer(state.itemById('a')!);
        expect(state.selectedIds()).toEqual(['a']);

        state.selectFromPointer(state.itemById('b')!, { toggle: true });
        expect(state.selectedIds()).toEqual(['a', 'b']);

        state.selectFromPointer(state.itemById('b')!, { toggle: true });
        expect(state.selectedIds()).toEqual(['a']);
    });

    it('a range is local to the cell: a target in another column selects only itself', () => {
        const { state } = bench();

        state.selectFromPointer(state.itemById('a')!);
        state.selectFromPointer(state.itemById('c')!, { range: true });
        expect(state.selectedIds()).toEqual(['a', 'b', 'c']);

        state.selectFromPointer(state.itemById('a')!);
        state.selectFromPointer(state.itemById('d')!, { range: true });
        expect(state.selectedIds()).toEqual(['d']);
    });

    it('cardSelect describes one card and selectionChange the whole selection', () => {
        const { state, emitted } = bench();

        state.selectFromPointer(state.itemById('a')!);

        expect(emitted['cardSelect'][0]).toMatchObject({ selected: true });
        expect(emitted['selectionChange'][0].selectedIds).toEqual(['a']);
    });

    it('selecting a whole cell emits only selectionChange', () => {
        const { state, emitted } = bench();

        state.selectCell('backlog');

        expect(state.selectedIds()).toEqual(['a', 'b', 'c']);
        expect(emitted['cardSelect']).toBeUndefined();
    });

    it('deleting a card takes it out of the selection', () => {
        const { state } = bench();

        state.setSelection(['a', 'b']);
        state.removeItem('a');

        expect(state.selectedIds()).toEqual(['b']);
    });
});

describe('collapsing', () => {
    it('the metadata seed is read once and never overrides the user again', () => {
        const columns = signal<TaskBoardColumnModel[]>([{ id: 'backlog', label: 'Backlog', collapsed: true }]);
        const { config } = makeConfig({ columns });
        const local = new TaskBoardState<Card>(config);

        expect(local.isColumnCollapsed('backlog')).toBe(true);

        local.setColumnCollapsed('backlog', false);

        // The array arrives again with `collapsed: true`, as after a data refresh: the column has to
        // stay open.
        columns.set([{ id: 'backlog', label: 'Backlog', collapsed: true }]);

        expect(local.isColumnCollapsed('backlog')).toBe(false);
    });

    it('the WIP state is a warning one card short of the limit and exceeded at it', () => {
        const { state, tasks } = bench();

        expect(state.wipStateOf('active')).toBe('exceeded');

        tasks.update((items) => items.filter((item) => item.id !== 'e'));
        expect(state.wipStateOf('active')).toBe('warning');
    });
});

describe('reordering the columns', () => {
    it('refuses whole a reorder that would displace a locked column', () => {
        const tasks = signal<Card[]>(cards());
        const locked: TaskBoardColumnModel[] = [
            { id: 'backlog', label: 'Backlog', order: 0 },
            { id: 'active', label: 'Active', order: 1 },
            { id: 'done', label: 'Done', order: 2, locked: true }
        ];

        const emitted: any[] = [];
        const { config } = makeConfig({ tasks, columns: signal(locked), emitColumnReorder: (payload) => emitted.push(payload) });
        const local = new TaskBoardState<Card>(config);

        local.reorderColumns(0, 2);
        expect(emitted).toHaveLength(0);

        local.reorderColumns(0, 1);
        expect(emitted[0].columns.map((column: TaskBoardColumnModel) => column.id)).toEqual(['active', 'backlog', 'done']);
    });
});

describe('the history', () => {
    it('undo returns the previous array and redo applies it again', () => {
        const { state, tasks } = bench();

        state.requestMove(state.itemById('a')!, { id: 'a', columnValue: 'backlog', index: 2 });
        expect(tasks().find((item) => item.id === 'a')!.order).toBe(2);

        state.undo();
        expect(tasks().find((item) => item.id === 'a')!.order).toBe(0);

        state.redo();
        expect(tasks().find((item) => item.id === 'a')!.order).toBe(2);
    });
});

describe('exporting', () => {
    it('the JSON carries the columns, the cards, the rows and the instant', () => {
        const { state } = bench({ swimlanes: true });
        const payload = JSON.parse(state.exportToJSON());

        expect(payload.columns).toHaveLength(4);
        expect(payload.tasks).toHaveLength(5);
        expect(payload.swimlanes).toHaveLength(2);
        expect(typeof payload.exportedAt).toBe('string');
    });

    it('the CSV escapes the delimiter and flattens the arrays', () => {
        const tasks = signal<Card[]>([{ id: 'x', title: 'One, two', columnId: 'backlog', order: 0, tags: ['a', 'b'] } as Card]);
        const { config } = makeConfig({ tasks });
        const local = new TaskBoardState<Card>(config);

        const csv = local.exportToCSV({ fields: ['id', 'title', 'tags'] });

        expect(csv.split('\n')[0]).toBe('id,title,tags');
        expect(csv.split('\n')[1]).toBe('x,"One, two",a;b');
    });

    it('the snapshot saves UI state only and restores in parts', () => {
        const { state } = bench();

        state.setSelection(['a']);
        state.setColumnCollapsed('backlog', true);

        const snapshot = state.serializeState();
        expect(snapshot.selectedCardIds).toEqual(['a']);
        expect(snapshot.collapsedColumnIds).toEqual(['backlog']);

        state.clearSelection();
        state.setColumnCollapsed('backlog', false);

        state.restoreState({ collapsedColumnIds: ['active'] });
        expect(state.isColumnCollapsed('active')).toBe(true);
        expect(state.selectedIds()).toEqual([]);
    });
});

describe('the virtual window', () => {
    it('off, the window is the whole list and reserves no space', () => {
        const { state } = bench();

        expect(state.windowOf('s:backlog|', 40)).toEqual({ start: 0, end: 40, paddingTop: 0, paddingBottom: 0 });
    });

    it('on, it follows the viewport and reserves what it leaves out', () => {
        const { config } = makeConfig({ virtualScroll: signal(true), virtualScrollItemHeight: signal(100), virtualScrollBuffer: signal(1) });
        const local = new TaskBoardState<Card>(config);

        local.setViewport('cell', 300, 400);

        const range = local.windowOf('cell', 100);

        expect(range.start).toBe(2);
        expect(range.paddingTop).toBe(200);
        expect(range.end).toBeGreaterThan(range.start);
        expect(range.paddingBottom).toBeGreaterThan(0);
    });
});
