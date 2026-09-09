import { InjectionToken, type Signal, type WritableSignal, computed, signal } from '@angular/core';
import type {
    TaskBoardAccess,
    TaskBoardAuditEntry,
    TaskBoardBlockedReason,
    TaskBoardColumnGroup,
    TaskBoardColumnModel,
    TaskBoardCsvExportOptions,
    TaskBoardDensity,
    TaskBoardFeatures,
    TaskBoardItem,
    TaskBoardJsonExport,
    TaskBoardSelectionMode,
    TaskBoardStateSnapshot,
    TaskBoardSwimlane
} from '@openng/optimus-ui/types/taskboard';

/**
 * The shared board runtime: everything the parts read and everything the root commands.
 *
 * One class and not a service, because a page may hold several boards and each one owns its own
 * indexing, selection, collapse state and history. The root instantiates it and provides it through
 * {@link TASKBOARD_STATE}, so a part never has to know which board it belongs to.
 *
 * The class takes SIGNALS, not values: the root hands over its own inputs, so the state recomputes
 * when the application changes the data without anything having to push it in.
 *
 * @module taskboard-state
 */

/** How a card's placement is asked to change. @internal */
export interface TaskBoardMoveRequest {
    /** Id of the card. */
    id: string | number;
    /** Column it should end up in. */
    columnValue: string | number;
    /** Position it should end up at, inside the target cell. */
    index: number;
    /** Swimlane it should end up in, on a grouped board. */
    swimlaneValue?: string | number;
}

/** Why a proposed move was refused, and what to say about it. @internal */
export interface TaskBoardMoveRefusal {
    /** The category of refusal. */
    reason: TaskBoardBlockedReason;
    /** Message meant for the user. */
    message: string;
    /** Fields that were missing, when the reason is `validation`. */
    failedFields?: string[];
}

/** A move held back until the confirmation surface answers. @internal */
export interface TaskBoardPendingMove<T extends TaskBoardItem = TaskBoardItem> {
    /** The card waiting. */
    item: T;
    /** Where it would go. */
    request: TaskBoardMoveRequest;
    /** Column it would leave. */
    sourceColumn?: TaskBoardColumnModel;
    /** Column it would enter. */
    targetColumn?: TaskBoardColumnModel;
    /** The message to show. */
    message: string;
    /** Ids travelling with it, on a multi-card move. */
    ids: (string | number)[];
}

/** The chrome and assistive strings, all of them overridable. @internal */
export interface TaskBoardLabels {
    /** Accessible name of the board. */
    board: string;
    /** Accessible name of a column, as `{0}, {1} items`. */
    column: string;
    /** Accessible name of a column header, as `{0} column header`. */
    columnHeader: string;
    /** Accessible name of the collapse control, as `Collapse {0} column`. */
    collapseColumn: string;
    /** Accessible name of the expand control, as `Expand {0} column`. */
    expandColumn: string;
    /** Accessible name of a swimlane row, as `{0}, {1} items`. */
    swimlane: string;
    /** Accessible name of the row collapse control, as `Collapse {0} swimlane`. */
    collapseSwimlane: string;
    /** Accessible name of the row expand control, as `Expand {0} swimlane`. */
    expandSwimlane: string;
    /** Copy of an empty column. */
    empty: string;
    /** Copy of the add-card control. */
    addCard: string;
    /** Copy of the add-column control. */
    addColumn: string;
    /** Announcement of an accepted move, as `{0} moved to {1}`. */
    moved: string;
    /** Announcement of a refused move, as `{0} could not be moved: {1}`. */
    blocked: string;
    /** Message when a WIP limit refuses a card, as `{0} is at its limit of {1} cards`. */
    wipLimit: string;
    /** Message when the transition rules refuse a card, as `{0} cannot move to {1}`. */
    transitionRule: string;
    /** Message when required fields are missing, as `{0} requires {1}`. */
    validation: string;
    /** Message when access refuses a card, as `You cannot move cards into {0}`. */
    access: string;
    /** Default confirmation message, as `Move {0} to {1}?`. */
    confirm: string;
}

/** A partial {@link TaskBoardLabels}, as the root's `labels` input accepts it. @internal */
export type TaskBoardLabelOverrides = Partial<TaskBoardLabels>;

/** Everything the root hands the state. @internal */
export interface TaskBoardStateConfig<T extends TaskBoardItem = TaskBoardItem> {
    /** The managed model. */
    tasks: Signal<T[]>;
    /** The external read source, which takes precedence. */
    items: Signal<T[] | undefined>;
    /** Writes the managed model back. */
    setTasks: (value: T[]) => void;
    /** The declared columns. */
    columns: Signal<TaskBoardColumnModel[]>;
    /** The declared swimlanes. */
    swimlanes: Signal<TaskBoardSwimlane[]>;
    /** The phase headers. */
    columnGroups: Signal<TaskBoardColumnGroup[]>;
    /** Field holding the card id. */
    dataKey: Signal<string>;
    /** Field holding the card's column. */
    columnField: Signal<string>;
    /** Field holding the card's swimlane. */
    swimlaneField: Signal<string | undefined>;
    /** Whether cards can be dragged. */
    draggable: Signal<boolean>;
    /** How far the pointer must travel before a press becomes a drag. */
    dragMinDistance: Signal<number>;
    /** Whether columns can be collapsed. */
    columnCollapsible: Signal<boolean>;
    /** Whether columns can be reordered. */
    columnReorderable: Signal<boolean>;
    /** Whether the context-menu payload is emitted. */
    contextMenu: Signal<boolean>;
    /** Whether the board scrolls inside itself. */
    scrollable: Signal<boolean>;
    /** How a click builds the selection. */
    selectionMode: Signal<TaskBoardSelectionMode>;
    /** How tightly the board is packed. */
    density: Signal<TaskBoardDensity>;
    /** The feature switches. */
    features: Signal<TaskBoardFeatures | undefined>;
    /** What the viewer is allowed to do. */
    access: Signal<TaskBoardAccess | undefined>;
    /** Whether the board lays out right to left. */
    rtl: Signal<boolean>;
    /** Whether the board is disabled. */
    disabled: Signal<boolean>;
    /** Whether the board is read-only. */
    readonly: Signal<boolean>;
    /** Whether the board is showing a loading state. */
    loading: Signal<boolean>;
    /** Whether only the cards near the viewport are mounted. */
    virtualScroll: Signal<boolean>;
    /** Estimated card height, until one has been measured. */
    virtualScrollItemHeight: Signal<number>;
    /** Extra cards kept mounted either side of the window. */
    virtualScrollBuffer: Signal<number>;
    /** The merged chrome strings. */
    labels: Signal<TaskBoardLabels>;
    /** Announces an accepted move. */
    emitTasksChange: (value: T[]) => void;
    /** Announces a card that changed cell. */
    emitCardMove: (payload: { card: T; oldColumnId: string | number; newColumnId: string | number; oldIndex: number; newIndex: number; oldSwimlaneId?: string | number; newSwimlaneId?: string | number }) => void;
    /** Announces a card that changed position inside its cell. */
    emitCardReorder: (payload: { card: T; columnValue: string | number; oldIndex: number; newIndex: number; swimlaneId?: string | number }) => void;
    /** Announces a refused move. */
    emitCardDropBlocked: (payload: { task: T; targetColumn?: TaskBoardColumnModel; reason: TaskBoardBlockedReason; message: string; failedFields?: string[] }) => void;
    /** Announces one card whose selection state changed. */
    emitCardSelect: (payload: { card: T; selected: boolean }) => void;
    /** Announces the whole selection. */
    emitSelectionChange: (payload: { selectedIds: (string | number)[]; cards: T[] }) => void;
    /** Announces a new card. */
    emitCardCreate: (payload: { card: T; column?: TaskBoardColumnModel }) => void;
    /** Announces a changed card. */
    emitCardUpdate: (payload: { card: T; oldCard: T }) => void;
    /** Announces a removed card. */
    emitCardDelete: (payload: { card: T; column?: TaskBoardColumnModel }) => void;
    /** Announces a toggled column. */
    emitColumnCollapse: (payload: { column: TaskBoardColumnModel; collapsed: boolean }) => void;
    /** Announces a reordered column set. */
    emitColumnReorder: (payload: { columns: TaskBoardColumnModel[]; oldIndex: number; newIndex: number }) => void;
    /** Announces a toggled swimlane. */
    emitSwimlaneCollapse: (payload: { swimlane: TaskBoardSwimlane; collapsed: boolean }) => void;
    /** Announces an opened card. */
    emitCardActivate: (payload: { card: T; column?: TaskBoardColumnModel; origin: 'pointer' | 'keyboard'; jsEvent?: Event }) => void;
    /** Announces the start of a drag. */
    emitDragStart: (payload: { card: T; column?: TaskBoardColumnModel; jsEvent: PointerEvent | MouseEvent }) => void;
    /** Announces the release of a drag, whatever the board then did with it. */
    emitDragEnd: (payload: { card: T; oldColumn?: TaskBoardColumnModel; newColumn?: TaskBoardColumnModel; oldIndex: number; newIndex: number }) => void;
    /** Announces an abandoned drag. */
    emitDragCancel: (payload: { card: T; column?: TaskBoardColumnModel }) => void;
    /** Announces a click on a card. */
    emitCardClick: (payload: { card: T; column?: TaskBoardColumnModel; jsEvent: MouseEvent }) => void;
    /** Announces a double click on a card. */
    emitCardDblclick: (payload: { card: T; column?: TaskBoardColumnModel; jsEvent: MouseEvent }) => void;
    /** Announces a right click, so the application can open its own overlay. */
    emitCardContextMenu: (payload: { card?: T; column?: TaskBoardColumnModel; position: { x: number; y: number }; jsEvent: MouseEvent }) => void;
    /** Whether the root was given an explicit `columns` array. */
    hasDeclaredColumns: Signal<boolean>;
    /** A projected column announcing itself, for a board with no `columns` input. */
    registerColumn: (column: TaskBoardColumnModel) => void;
    /** A projected column going away. */
    unregisterColumn: (id: string | number) => void;
}

/**
 * Turns an id into a string that cannot collide across types.
 *
 * `1` and `'1'` are different cards and have to stay different keys, which a bare `String(id)` would
 * merge — so the key carries the type in front of it. It is also what `data-taskboard-id-key`
 * exposes, which is how the drag controller finds a card back from the DOM.
 */
export function taskBoardIdKey(id: string | number | undefined | null): string {
    if (id == null) return '';
    return typeof id === 'number' ? `n:${id}` : `s:${id}`;
}

/** Reads a possibly nested field off a record, so `dataKey="meta.id"` works. */
function readField(item: Record<string, any> | undefined, field: string): any {
    if (!item || !field) return undefined;
    if (!field.includes('.')) return item[field];
    return field.split('.').reduce<any>((accumulator, part) => (accumulator == null ? undefined : accumulator[part]), item);
}

/** Writes a possibly nested field on a SHALLOW copy of a record, leaving the original untouched. */
function writeField<T extends Record<string, any>>(item: T, field: string, value: unknown): T {
    if (!field.includes('.')) return { ...item, [field]: value };

    const parts = field.split('.');
    const head = parts[0];
    const clone: Record<string, any> = { ...item };
    clone[head] = writeField((item[head] ?? {}) as Record<string, any>, parts.slice(1).join('.'), value);

    return clone as T;
}

/** Every feature on, which is what a board with no `features` object gets. */
const FEATURE_DEFAULTS: Required<TaskBoardFeatures> = {
    dragDrop: true,
    columnCollapse: true,
    columnReorder: true,
    swimlanes: true,
    wipLimits: true,
    contextMenu: true,
    cardSelection: true,
    transitionRules: true,
    validation: true,
    history: true
};

/** The English strings the root starts from. */
export const TASKBOARD_DEFAULT_LABELS: TaskBoardLabels = {
    board: 'Task board',
    column: '{0}, {1} items',
    columnHeader: '{0} column header',
    collapseColumn: 'Collapse {0} column',
    expandColumn: 'Expand {0} column',
    swimlane: '{0}, {1} items',
    collapseSwimlane: 'Collapse {0} swimlane',
    expandSwimlane: 'Expand {0} swimlane',
    empty: 'No cards',
    addCard: 'Add card',
    addColumn: 'Add another list',
    moved: '{0} moved to {1}',
    blocked: '{0} could not be moved: {1}',
    wipLimit: '{0} is at its limit of {1} cards',
    transitionRule: '{0} cannot move to {1}',
    validation: '{0} requires {1}',
    access: 'You cannot move cards into {0}',
    confirm: 'Move {0} to {1}?'
};

/** Substitutes `{0}`, `{1}`, … in one of the label templates. */
export function formatLabel(template: string, ...values: (string | number)[]): string {
    return values.reduce<string>((accumulator, value, index) => accumulator.replace(`{${index}}`, String(value)), template);
}

/** How many mutations the local history keeps. Enough to walk back a session, bounded so it cannot grow without limit. */
const HISTORY_LIMIT = 50;

/** How many actions the audit log keeps. */
const AUDIT_LIMIT = 200;

/**
 * The board runtime.
 *
 * @group Types
 */
export class TaskBoardState<T extends TaskBoardItem = TaskBoardItem> {
    constructor(private readonly config: TaskBoardStateConfig<T>) {}

    /** The chrome strings. */
    readonly labels = computed(() => this.config.labels());

    /** Whether the application, and not the board, owns the mutations. */
    readonly external = computed(() => this.config.items() !== undefined);

    /**
     * Every card the board is rendering.
     *
     * `items` wins over `tasks` when both are bound. Reporting the conflict rather than merging them
     * is the only honest answer: the two inputs disagree about who owns the writes, and guessing
     * would silently drop one side's mutations.
     */
    readonly items = computed<T[]>(() => this.config.items() ?? this.config.tasks());

    /** The feature switches, merged over the defaults. */
    readonly features = computed<Required<TaskBoardFeatures>>(() => ({ ...FEATURE_DEFAULTS, ...(this.config.features() ?? {}) }));

    /** What the viewer is allowed to do. */
    readonly access = computed(() => this.config.access());

    /** Whether nothing at all responds to the pointer. */
    readonly inert = computed(() => this.config.disabled() || this.config.readonly());

    /**
     * The columns to render: sorted by `order`, then filtered by `columnAccess[id].canView`.
     *
     * Sorting before filtering matters — a hidden column must not leave a gap in the order the
     * remaining ones are laid out in.
     */
    readonly columns = computed<TaskBoardColumnModel[]>(() => {
        const access = this.access()?.columnAccess;
        const sorted = [...this.config.columns()].sort((left, right) => (left.order ?? 0) - (right.order ?? 0));

        return access ? sorted.filter((column) => access[column.id]?.canView !== false) : sorted;
    });

    /** The swimlanes to render, sorted by `order`. */
    readonly swimlanes = computed<TaskBoardSwimlane[]>(() => [...this.config.swimlanes()].sort((left, right) => (left.order ?? 0) - (right.order ?? 0)));

    /** The phase headers. */
    readonly columnGroups = computed(() => this.config.columnGroups());

    /** How a click builds the selection. */
    readonly selectionMode = computed(() => this.config.selectionMode());

    /** How tightly the board is packed. */
    readonly density = computed(() => this.config.density());

    /** Whether the board lays out right to left. */
    readonly rtl = computed(() => this.config.rtl());

    /** Whether the board scrolls inside its own box. */
    readonly scrollable = computed(() => this.config.scrollable());

    /** Whether the board is disabled. */
    readonly disabled = computed(() => this.config.disabled());

    /** Whether the board is read-only. */
    readonly readonly = computed(() => this.config.readonly());

    /** Whether the board is showing a loading state. */
    readonly loading = computed(() => this.config.loading());

    /** Whether the board is grouped into rows. */
    readonly grouped = computed(() => this.config.swimlaneField() != null && this.swimlanes().length > 0 && this.features().swimlanes);

    /** Reads the id of a card. */
    readonly idOf = (item: T): string | number => readField(item, this.config.dataKey());

    /** Reads the column of a card. */
    readonly columnOf = (item: T): string | number | undefined => readField(item, this.config.columnField());

    /** Reads the swimlane of a card. */
    readonly swimlaneOf = (item: T): string | number | undefined => {
        const field = this.config.swimlaneField();
        return field ? readField(item, field) : undefined;
    };

    /**
     * Every card, indexed by cell.
     *
     * Built once per data change and read by every column, header count and drag hit test. Without
     * it each of those would scan the whole array, which on a board of a few thousand cards is the
     * difference between one pass and one pass per visible cell.
     */
    private readonly index = computed(() => {
        const map = new Map<string, T[]>();
        const grouped = this.grouped();

        for (const item of this.items()) {
            const columnValue = this.columnOf(item);
            if (columnValue == null) continue;

            const key = grouped ? `${taskBoardIdKey(columnValue)}|${taskBoardIdKey(this.swimlaneOf(item))}` : taskBoardIdKey(columnValue);
            const bucket = map.get(key);

            if (bucket) bucket.push(item);
            else map.set(key, [item]);
        }

        for (const bucket of map.values()) bucket.sort((left, right) => (left.order ?? 0) - (right.order ?? 0));

        return map;
    });

    /** The cards of one cell, in render order. */
    readonly itemsOf = (columnValue: string | number, swimlaneValue?: string | number): T[] => this.index().get(this.cellKeyOf(columnValue, swimlaneValue)) ?? [];

    /** How many cards a column holds, across every row. */
    readonly countOfColumn = (columnValue: string | number): number => {
        if (!this.grouped()) return this.itemsOf(columnValue).length;

        const prefix = `${taskBoardIdKey(columnValue)}|`;
        let total = 0;
        for (const [key, bucket] of this.index()) if (key.startsWith(prefix)) total += bucket.length;

        return total;
    };

    /** How many cards a row holds, across every column. */
    readonly countOfSwimlane = (swimlaneValue: string | number): number => {
        const suffix = `|${taskBoardIdKey(swimlaneValue)}`;
        let total = 0;
        for (const [key, bucket] of this.index()) if (key.endsWith(suffix)) total += bucket.length;

        return total;
    };

    /** One visible column, by id. */
    readonly columnById = (id: string | number): TaskBoardColumnModel | undefined => this.columns().find((column) => column.id === id);

    /** One card, by id. */
    readonly itemById = (id: string | number): T | undefined => {
        const key = taskBoardIdKey(id);
        return this.items().find((item) => taskBoardIdKey(this.idOf(item)) === key);
    };

    /** Whether the root was given an explicit `columns` array. */
    readonly hasDeclaredColumns = computed(() => this.config.hasDeclaredColumns());

    /** @internal A projected column announcing itself. */
    registerColumn(column: TaskBoardColumnModel): void {
        this.config.registerColumn(column);
    }

    /** @internal A projected column going away. */
    unregisterColumn(id: string | number): void {
        this.config.unregisterColumn(id);
    }

    /** One swimlane, by id. */
    readonly swimlaneById = (id: string | number): TaskBoardSwimlane | undefined => this.swimlanes().find((swimlane) => swimlane.id === id);

    // ---------------------------------------------------------------------------------------------
    // Selection
    // ---------------------------------------------------------------------------------------------

    private readonly selection = signal<(string | number)[]>([]);

    /** Ids of the selected cards. */
    readonly selectedIds: Signal<(string | number)[]> = this.selection.asReadonly();

    /** The selected cards, in board order. */
    readonly selectedItems = computed<T[]>(() => {
        const keys = new Set(this.selection().map(taskBoardIdKey));
        return this.items().filter((item) => keys.has(taskBoardIdKey(this.idOf(item))));
    });

    /**
     * Where a Shift range starts from.
     *
     * Kept apart from the selection because the anchor survives a range being replaced: extending
     * twice from the same card has to grow and shrink around that card, not around the last one the
     * previous range happened to reach.
     */
    private readonly rangeAnchor = signal<string | number | null>(null);

    /** Whether a card is selected. */
    readonly isSelected = (id: string | number): boolean => {
        const key = taskBoardIdKey(id);
        return this.selection().some((selected) => taskBoardIdKey(selected) === key);
    };

    /** Whether selection is available at all. */
    readonly selectable = computed(() => this.config.selectionMode() !== 'none' && this.features().cardSelection && !this.inert());

    /** Replaces the selection and announces it. */
    setSelection(ids: (string | number)[]): void {
        const next = this.dedupe(ids);
        if (this.sameSelection(next)) return;

        this.selection.set(next);
        this.announceSelection();
    }

    /** Empties the selection. */
    clearSelection(): void {
        if (this.selection().length === 0) return;

        this.selection.set([]);
        this.rangeAnchor.set(null);
        this.announceSelection();
    }

    /**
     * Applies a click to the selection.
     *
     * The three gestures the docs describe, in one place so the pointer and the keyboard cannot
     * drift apart: a plain click replaces, a modifier click toggles, a Shift click extends inside
     * the cell.
     */
    selectFromPointer(item: T, options: { toggle?: boolean; range?: boolean } = {}): void {
        if (!this.selectable()) return;

        const mode = this.config.selectionMode();
        const id = this.idOf(item);

        if (mode === 'single') {
            this.selection.set([id]);
            this.rangeAnchor.set(id);
            this.config.emitCardSelect({ card: item, selected: true });
            this.announceSelection();

            return;
        }

        if (options.range) {
            const range = this.rangeOf(item);

            if (range) {
                this.selection.set(range);
                this.announceSelection();
            } else {
                this.selection.set([id]);
                this.rangeAnchor.set(id);
                this.config.emitCardSelect({ card: item, selected: true });
                this.announceSelection();
            }

            return;
        }

        if (options.toggle) {
            const selected = !this.isSelected(id);
            const key = taskBoardIdKey(id);

            this.selection.update((current) => (selected ? [...current, id] : current.filter((entry) => taskBoardIdKey(entry) !== key)));
            this.rangeAnchor.set(id);
            this.config.emitCardSelect({ card: item, selected });
            this.announceSelection();

            return;
        }

        this.selection.set([id]);
        this.rangeAnchor.set(id);
        this.config.emitCardSelect({ card: item, selected: true });
        this.announceSelection();
    }

    /** Selects every card of the cell the focus is in. */
    selectCell(columnValue: string | number, swimlaneValue?: string | number): void {
        if (!this.selectable() || this.config.selectionMode() !== 'multiple') return;

        this.setSelection(this.itemsOf(columnValue, swimlaneValue).map((item) => this.idOf(item)));
    }

    /** Extends the selection by one card, in the direction the keyboard asked for. */
    extendSelection(from: T, to: T): void {
        if (!this.selectable() || this.config.selectionMode() !== 'multiple') return;

        if (this.rangeAnchor() == null) this.rangeAnchor.set(this.idOf(from));

        const range = this.rangeOf(to);
        if (!range) return;

        this.selection.set(range);
        this.announceSelection();
    }

    /**
     * The ids between the anchor and a target, when both live in the same cell.
     *
     * `undefined` when they do not: a range across two columns has no meaning on a board where the
     * order inside each column is independent, so the caller falls back to selecting the target
     * alone and re-anchors there.
     */
    private rangeOf(target: T): (string | number)[] | undefined {
        const anchorId = this.rangeAnchor();
        if (anchorId == null) return undefined;

        const anchor = this.itemById(anchorId);
        if (!anchor) return undefined;

        const columnValue = this.columnOf(target);
        if (columnValue == null || this.columnOf(anchor) !== columnValue) return undefined;

        const swimlaneValue = this.swimlaneOf(target);
        if (this.grouped() && this.swimlaneOf(anchor) !== swimlaneValue) return undefined;

        const cell = this.itemsOf(columnValue, swimlaneValue);
        const anchorIndex = cell.findIndex((item) => taskBoardIdKey(this.idOf(item)) === taskBoardIdKey(anchorId));
        const targetIndex = cell.findIndex((item) => taskBoardIdKey(this.idOf(item)) === taskBoardIdKey(this.idOf(target)));

        if (anchorIndex < 0 || targetIndex < 0) return undefined;

        const [start, end] = anchorIndex <= targetIndex ? [anchorIndex, targetIndex] : [targetIndex, anchorIndex];

        return cell.slice(start, end + 1).map((item) => this.idOf(item));
    }

    private announceSelection(): void {
        this.config.emitSelectionChange({ selectedIds: [...this.selection()], cards: this.selectedItems() });
    }

    private dedupe(ids: (string | number)[]): (string | number)[] {
        const seen = new Set<string>();
        const out: (string | number)[] = [];

        for (const id of ids) {
            const key = taskBoardIdKey(id);
            if (seen.has(key)) continue;

            seen.add(key);
            out.push(id);
        }

        return out;
    }

    private sameSelection(next: (string | number)[]): boolean {
        const current = this.selection();
        if (current.length !== next.length) return false;

        return current.every((id, index) => taskBoardIdKey(id) === taskBoardIdKey(next[index]));
    }

    // ---------------------------------------------------------------------------------------------
    // Focus
    // ---------------------------------------------------------------------------------------------

    private readonly focus = signal<string | number | null>(null);

    /** Id of the focused card. */
    readonly focusedId: Signal<string | number | null> = this.focus.asReadonly();

    /** Whether the roving focus is on a card. */
    readonly isFocused = (id: string | number): boolean => {
        const focused = this.focus();
        return focused != null && taskBoardIdKey(focused) === taskBoardIdKey(id);
    };

    /** Moves the roving focus. */
    setFocus(id: string | number | null): void {
        this.focus.set(id);
    }

    /** Column the keyboard is in when no card is focused, so an empty column can still be walked. */
    private readonly focusColumn = signal<string | number | null>(null);

    /** Swimlane the keyboard is in when no card is focused. */
    private readonly focusSwimlane = signal<string | number | null>(null);

    /** The cell the keyboard is in. */
    readonly focusCell = computed(() => {
        const focused = this.focus();

        if (focused != null) {
            const item = this.itemById(focused);
            if (item) return { columnValue: this.columnOf(item), swimlaneValue: this.swimlaneOf(item) };
        }

        return { columnValue: this.focusColumn() ?? undefined, swimlaneValue: this.focusSwimlane() ?? undefined };
    });

    /** Parks the keyboard on a cell without focusing a card in it. */
    setFocusCell(columnValue: string | number | null, swimlaneValue?: string | number | null): void {
        this.focusColumn.set(columnValue);
        this.focusSwimlane.set(swimlaneValue ?? null);
    }

    // ---------------------------------------------------------------------------------------------
    // Collapse
    // ---------------------------------------------------------------------------------------------

    /**
     * The collapse decisions the USER has taken, keyed by id.
     *
     * Only explicit decisions live here; the metadata's own `collapsed` is read as the default for a
     * column nobody has touched. That is what makes the metadata a seed and not the owner: a data
     * refresh that resends `collapsed: true` cannot slam a column shut under whoever just opened it,
     * and no state has to be written while a signal is being computed to arrange it.
     */
    private readonly columnCollapseOverrides = signal<Record<string, boolean>>({});
    private readonly swimlaneCollapseOverrides = signal<Record<string, boolean>>({});

    /** Ids of the collapsed columns. */
    readonly collapsedColumnIds = computed<(string | number)[]>(() => {
        const overrides = this.columnCollapseOverrides();

        return this.config
            .columns()
            .filter((column) => overrides[taskBoardIdKey(column.id)] ?? column.collapsed === true)
            .map((column) => column.id);
    });

    /** Ids of the collapsed swimlanes. */
    readonly collapsedSwimlaneIds = computed<(string | number)[]>(() => {
        const overrides = this.swimlaneCollapseOverrides();

        return this.config
            .swimlanes()
            .filter((swimlane) => overrides[taskBoardIdKey(swimlane.id)] ?? swimlane.collapsed === true)
            .map((swimlane) => swimlane.id);
    });

    /** Whether a column is collapsed. */
    readonly isColumnCollapsed = (id: string | number): boolean => {
        const key = taskBoardIdKey(id);
        return this.collapsedColumnIds().some((entry) => taskBoardIdKey(entry) === key);
    };

    /** Whether a swimlane is collapsed. */
    readonly isSwimlaneCollapsed = (id: string | number): boolean => {
        const key = taskBoardIdKey(id);
        return this.collapsedSwimlaneIds().some((entry) => taskBoardIdKey(entry) === key);
    };

    /** Whether the collapse affordance is offered at all. */
    readonly collapsible = computed(() => this.config.columnCollapsible() && this.features().columnCollapse);

    /** Collapses or expands a column and announces it. */
    setColumnCollapsed(id: string | number, collapsed: boolean): void {
        if (!this.collapsible()) return;
        if (this.isColumnCollapsed(id) === collapsed) return;

        this.columnCollapseOverrides.update((current) => ({ ...current, [taskBoardIdKey(id)]: collapsed }));

        const column = this.columnById(id);
        if (column) this.config.emitColumnCollapse({ column, collapsed });
    }

    /** Toggles a column. */
    toggleColumn(id: string | number): void {
        this.setColumnCollapsed(id, !this.isColumnCollapsed(id));
    }

    /** Collapses or expands a swimlane and announces it. */
    setSwimlaneCollapsed(id: string | number, collapsed: boolean): void {
        if (this.isSwimlaneCollapsed(id) === collapsed) return;

        this.swimlaneCollapseOverrides.update((current) => ({ ...current, [taskBoardIdKey(id)]: collapsed }));

        const swimlane = this.swimlaneById(id);
        if (swimlane) this.config.emitSwimlaneCollapse({ swimlane, collapsed });
    }

    /** Toggles a swimlane. */
    toggleSwimlane(id: string | number): void {
        this.setSwimlaneCollapsed(id, !this.isSwimlaneCollapsed(id));
    }

    // ---------------------------------------------------------------------------------------------
    // WIP
    // ---------------------------------------------------------------------------------------------

    /**
     * How full a column is against its limit.
     *
     * `warning` one card short of the limit and `exceeded` at it or past it: a column that has just
     * reached its cap is already the problem the limit exists to surface, so it is not merely a
     * warning.
     */
    readonly wipStateOf = (id: string | number): 'none' | 'warning' | 'exceeded' => {
        const column = this.columnById(id);
        const limit = column?.wipLimit;

        if (!this.features().wipLimits || limit == null || limit <= 0) return 'none';

        const count = this.countOfColumn(id);
        if (count >= limit) return 'exceeded';
        if (count === limit - 1) return 'warning';

        return 'none';
    };

    // ---------------------------------------------------------------------------------------------
    // Drag
    // ---------------------------------------------------------------------------------------------

    private readonly dragSourceId = signal<string | number | null>(null);
    private readonly dragIds = signal<(string | number)[]>([]);
    private readonly dragActive = signal(false);
    private readonly dragTarget = signal<{ columnValue: string | number; swimlaneValue?: string | number; index: number } | null>(null);
    private readonly columnDragId = signal<string | number | null>(null);

    /** Whether a card drag is in progress. */
    readonly dragging = this.dragActive.asReadonly();

    /**
     * Whether a press on a card is being tracked, drag or not.
     *
     * Separate from `dragging` because it starts EARLIER: the browser begins selecting text the
     * moment the pointer moves with the button down, which is before the drag threshold is crossed.
     * Suppressing selection only once the drag starts leaves a stripe of highlighted card text
     * behind every gesture.
     */
    readonly pressing = signal(false);

    /** The card the drag started from. */
    readonly draggingItem = computed<T | undefined>(() => {
        const id = this.dragSourceId();
        return id == null ? undefined : this.itemById(id);
    });

    /** Ids of every card travelling with the drag. */
    readonly draggingIds = this.dragIds.asReadonly();

    /** Where the pointer currently proposes to drop. */
    readonly dropTarget = this.dragTarget.asReadonly();

    /** Id of the column being reordered, if any. */
    readonly reorderingColumnId = this.columnDragId.asReadonly();

    /** Whether a card is one of the travelling set. */
    readonly isDragging = (id: string | number): boolean => {
        const key = taskBoardIdKey(id);
        return this.dragActive() && this.dragIds().some((entry) => taskBoardIdKey(entry) === key);
    };

    /** How far the pointer must travel before a press becomes a drag. */
    readonly dragMinDistance = computed(() => Math.max(0, this.config.dragMinDistance()));

    /** Whether cards respond to the pointer at all. */
    readonly dragEnabled = computed(() => this.config.draggable() && this.features().dragDrop && !this.inert());

    /** Whether column headers can be picked up. */
    readonly columnReorderEnabled = computed(() => this.config.columnReorderable() && this.features().columnReorder && !this.inert());

    /** Announces the start of a drag. */
    emitDragStart(card: T, column: TaskBoardColumnModel | undefined, jsEvent: PointerEvent | MouseEvent): void {
        this.config.emitDragStart({ card, column, jsEvent });
    }

    /** Announces the release of a drag. */
    emitDragEnd(card: T, oldColumn: TaskBoardColumnModel | undefined, newColumn: TaskBoardColumnModel | undefined, oldIndex: number, newIndex: number): void {
        this.config.emitDragEnd({ card, oldColumn, newColumn, oldIndex, newIndex });
    }

    /** Announces an abandoned drag. */
    emitDragCancel(card: T, column: TaskBoardColumnModel | undefined): void {
        this.config.emitDragCancel({ card, column });
    }

    /** Opens a card drag over one card, and over the selection when that card is part of it. */
    beginCardDrag(item: T): void {
        const id = this.idOf(item);
        const selected = this.config.selectionMode() === 'multiple' && this.isSelected(id);
        const ids = selected ? this.orderedSelectionIds() : [id];

        this.dragSourceId.set(id);
        this.dragIds.set(ids);
        this.dragActive.set(true);
    }

    /** Records the position the pointer is over. */
    setDropTarget(target: { columnValue: string | number; swimlaneValue?: string | number; index: number } | null): void {
        this.dragTarget.set(target);
    }

    /** Closes a card drag. */
    endCardDrag(): void {
        this.dragSourceId.set(null);
        this.dragIds.set([]);
        this.dragActive.set(false);
        this.dragTarget.set(null);
    }

    /** Opens a column reorder. */
    beginColumnDrag(id: string | number): void {
        this.columnDragId.set(id);
    }

    /** Closes a column reorder. */
    endColumnDrag(): void {
        this.columnDragId.set(null);
    }

    /** The selected ids in the order they are rendered, which is the order a group move keeps. */
    private orderedSelectionIds(): (string | number)[] {
        const keys = new Set(this.selection().map(taskBoardIdKey));
        const out: (string | number)[] = [];

        for (const column of this.columns()) {
            const cells = this.grouped() ? this.swimlanes().map((swimlane) => swimlane.id) : [undefined];

            for (const swimlaneValue of cells) {
                for (const item of this.itemsOf(column.id, swimlaneValue)) {
                    const id = this.idOf(item);
                    if (keys.has(taskBoardIdKey(id))) out.push(id);
                }
            }
        }

        return out;
    }

    // ---------------------------------------------------------------------------------------------
    // Pointer and activation
    // ---------------------------------------------------------------------------------------------

    /** Whether the right-click payload is emitted. */
    readonly contextMenuEnabled = computed(() => this.config.contextMenu() && this.features().contextMenu);

    /** The column a card sits in, resolved. */
    readonly columnModelOf = (item: T): TaskBoardColumnModel | undefined => {
        const value = this.columnOf(item);
        return value == null ? undefined : this.columnById(value);
    };

    /** Announces a click on a card. */
    emitCardClick(card: T, jsEvent: MouseEvent): void {
        this.config.emitCardClick({ card, column: this.columnModelOf(card), jsEvent });
    }

    /** Announces a double click, then the activation it implies. */
    emitCardDblclick(card: T, jsEvent: MouseEvent): void {
        this.config.emitCardDblclick({ card, column: this.columnModelOf(card), jsEvent });
        this.activate(card, 'pointer', jsEvent);
    }

    /** Announces an intentional request to open a card. */
    activate(card: T, origin: 'pointer' | 'keyboard', jsEvent?: Event): void {
        this.config.emitCardActivate({ card, column: this.columnModelOf(card), origin, jsEvent });
    }

    /** Announces a right click. */
    emitCardContextMenu(card: T | undefined, position: { x: number; y: number }, jsEvent: MouseEvent): void {
        this.config.emitCardContextMenu({ card, column: card ? this.columnModelOf(card) : undefined, position, jsEvent });
    }

    // ---------------------------------------------------------------------------------------------
    // Pending confirmation
    // ---------------------------------------------------------------------------------------------

    private readonly pending = signal<TaskBoardPendingMove<T> | null>(null);

    /** The move held back until the confirmation surface answers. */
    readonly pendingMove = this.pending.asReadonly();

    /** Applies the held move. */
    confirmPendingMove(): void {
        const held = this.pending();
        if (!held) return;

        this.pending.set(null);
        this.applyMove(held.item, held.request, held.ids);
    }

    /** Abandons the held move. */
    cancelPendingMove(): void {
        this.pending.set(null);
    }

    // ---------------------------------------------------------------------------------------------
    // Move validation
    // ---------------------------------------------------------------------------------------------

    /**
     * Whether a card may leave a column, and whether it may enter another.
     *
     * The order the docs fix — transitions, capacity, required fields, then confirmation — is not
     * cosmetic: a card that is not allowed into a column at all should say so, and not complain
     * first about a field it was never going to be asked for.
     */
    validateMove(item: T, targetColumnValue: string | number): TaskBoardMoveRefusal | undefined {
        const sourceValue = this.columnOf(item);
        const target = this.columnById(targetColumnValue);
        const labels = this.labels();
        const title = this.titleOf(item);
        const targetLabel = target?.label ?? String(targetColumnValue);

        if (sourceValue === targetColumnValue) return undefined;

        const access = this.access();

        if (access?.canDrag === false) return { reason: 'access', message: formatLabel(labels.access, targetLabel) };
        if (sourceValue != null && access?.columnAccess?.[sourceValue]?.canMoveOut === false) return { reason: 'access', message: formatLabel(labels.access, targetLabel) };
        if (access?.columnAccess?.[targetColumnValue]?.canMoveIn === false) return { reason: 'access', message: formatLabel(labels.access, targetLabel) };

        if (this.features().transitionRules) {
            const source = sourceValue == null ? undefined : this.columnById(sourceValue);

            const allowedTo = source?.allowedTransitionsTo;
            if (allowedTo && allowedTo.length > 0 && !allowedTo.includes(targetColumnValue)) return { reason: 'transition-rule', message: formatLabel(labels.transitionRule, title, targetLabel) };

            const allowedFrom = target?.allowedTransitionsFrom;
            if (allowedFrom && allowedFrom.length > 0 && sourceValue != null && !allowedFrom.includes(sourceValue)) return { reason: 'transition-rule', message: formatLabel(labels.transitionRule, title, targetLabel) };
        }

        if (this.features().wipLimits && target?.wipLimit != null && target.wipLimit > 0 && this.countOfColumn(targetColumnValue) >= target.wipLimit) {
            return { reason: 'wip-limit', message: formatLabel(labels.wipLimit, targetLabel, target.wipLimit) };
        }

        if (this.features().validation && target?.requiredFields && target.requiredFields.length > 0) {
            const missing = target.requiredFields.filter((field) => {
                const value = readField(item, field);
                return value == null || value === '' || (Array.isArray(value) && value.length === 0);
            });

            if (missing.length > 0) return { reason: 'validation', message: formatLabel(labels.validation, targetLabel, missing.join(', ')), failedFields: missing };
        }

        return undefined;
    }

    /** Whether the target column asks for a confirmation, and what it wants to say. */
    private confirmationFor(item: T, targetColumnValue: string | number): string | undefined {
        const sourceValue = this.columnOf(item);
        if (sourceValue === targetColumnValue) return undefined;

        const target = this.columnById(targetColumnValue);
        const confirm = target?.confirmOnEnter;

        if (!confirm) return undefined;
        if (typeof confirm === 'string') return confirm;

        return formatLabel(this.labels().confirm, this.titleOf(item), target?.label ?? String(targetColumnValue));
    }

    /** Text of a card, for the messages and the announcements. */
    readonly titleOf = (item: T): string => String(item?.title ?? this.idOf(item) ?? '');

    // ---------------------------------------------------------------------------------------------
    // Mutations
    // ---------------------------------------------------------------------------------------------

    /**
     * Runs a proposed move through the rules and either applies it, holds it, or refuses it.
     *
     * The one door every move goes through — pointer, keyboard and `moveTask` alike — so the three
     * cannot end up validating differently.
     */
    requestMove(item: T, request: TaskBoardMoveRequest, ids?: (string | number)[]): void {
        if (this.inert()) return;

        const refusal = this.validateMove(item, request.columnValue);

        if (refusal) {
            this.record({ action: 'blocked', timestamp: Date.now(), taskId: this.idOf(item), fromColumnId: this.columnOf(item), toColumnId: request.columnValue, reason: refusal.reason });
            this.config.emitCardDropBlocked({ task: item, targetColumn: this.columnById(request.columnValue), reason: refusal.reason, message: refusal.message, failedFields: refusal.failedFields });
            this.announce(formatLabel(this.labels().blocked, this.titleOf(item), refusal.message), 'assertive');

            return;
        }

        const message = this.confirmationFor(item, request.columnValue);

        if (message) {
            const sourceValue = this.columnOf(item);

            this.pending.set({
                item,
                request,
                sourceColumn: sourceValue == null ? undefined : this.columnById(sourceValue),
                targetColumn: this.columnById(request.columnValue),
                message,
                ids: ids ?? [this.idOf(item)]
            });

            return;
        }

        this.applyMove(item, request, ids ?? [this.idOf(item)]);
    }

    /**
     * Writes an accepted move.
     *
     * In managed mode the next array is emitted BEFORE the domain output, which is the ordering the
     * docs promise: a handler that reads the signal it just wrote sees the move already applied.
     * In external mode nothing is written and only the outputs go out, as requests.
     */
    private applyMove(item: T, request: TaskBoardMoveRequest, ids: (string | number)[]): void {
        const oldColumnId = this.columnOf(item) as string | number;
        const oldSwimlaneId = this.swimlaneOf(item);
        const sourceCell = this.itemsOf(oldColumnId, oldSwimlaneId);
        const oldIndex = sourceCell.findIndex((entry) => taskBoardIdKey(this.idOf(entry)) === taskBoardIdKey(this.idOf(item)));
        const sameCell = oldColumnId === request.columnValue && (!this.grouped() || oldSwimlaneId === request.swimlaneValue);

        if (!this.external()) {
            const moving = this.orderedMovingItems(ids);
            const next = this.reindex(moving, request);

            this.pushHistory(this.config.tasks());
            this.config.setTasks(next);
            this.config.emitTasksChange(next);
        }

        const moved = this.external() ? item : (this.itemById(this.idOf(item)) ?? item);
        const targetCell = this.itemsOf(request.columnValue, request.swimlaneValue);
        const newIndex = this.external()
            ? request.index
            : Math.max(
                  0,
                  targetCell.findIndex((entry) => taskBoardIdKey(this.idOf(entry)) === taskBoardIdKey(this.idOf(item)))
              );

        this.record({
            action: sameCell ? 'reorder' : 'move',
            timestamp: Date.now(),
            taskId: this.idOf(item),
            fromColumnId: oldColumnId,
            toColumnId: request.columnValue,
            fromSwimlaneId: oldSwimlaneId,
            toSwimlaneId: request.swimlaneValue
        });

        this.config.emitCardMove({
            card: moved,
            oldColumnId,
            newColumnId: request.columnValue,
            oldIndex: Math.max(0, oldIndex),
            newIndex,
            oldSwimlaneId,
            newSwimlaneId: request.swimlaneValue
        });

        if (sameCell) {
            this.config.emitCardReorder({ card: moved, columnValue: request.columnValue, oldIndex: Math.max(0, oldIndex), newIndex, swimlaneId: request.swimlaneValue });
        }

        this.announce(formatLabel(this.labels().moved, this.titleOf(item), this.columnById(request.columnValue)?.label ?? String(request.columnValue)));
    }

    /** The travelling cards, in the order they are rendered, so a group move keeps its shape. */
    private orderedMovingItems(ids: (string | number)[]): T[] {
        const keys = ids.map(taskBoardIdKey);
        const found = new Map<string, T>();

        for (const item of this.items()) {
            const key = taskBoardIdKey(this.idOf(item));
            if (keys.includes(key)) found.set(key, item);
        }

        return keys.map((key) => found.get(key)).filter((item): item is T => item !== undefined);
    }

    /**
     * The next array, with the travelling cards spliced into the target cell and `order` renumbered.
     *
     * Renumbering the affected cells rather than the whole board keeps every untouched card's own
     * `order` intact, which is what a product that persists per-column ordering expects to see.
     */
    private reindex(moving: T[], request: TaskBoardMoveRequest): T[] {
        const columnField = this.config.columnField();
        const swimlaneField = this.config.swimlaneField();
        const grouped = this.grouped();
        const movingKeys = new Set(moving.map((item) => taskBoardIdKey(this.idOf(item))));
        const targetKey = this.cellKeyOf(request.columnValue, request.swimlaneValue);

        // The cells left short by the departing cards, to renumber and close the gap.
        const sourceKeys = new Set(moving.map((item) => this.cellKeyOf(this.columnOf(item), this.swimlaneOf(item))));
        sourceKeys.delete(targetKey);

        const replacements = new Map<string, T>();

        const survivors = this.itemsOf(request.columnValue, request.swimlaneValue).filter((item) => !movingKeys.has(taskBoardIdKey(this.idOf(item))));
        const at = Math.max(0, Math.min(request.index, survivors.length));

        const placed = moving.map((item) => {
            let next = writeField(item, columnField, request.columnValue);
            if (swimlaneField && grouped) next = writeField(next, swimlaneField, request.swimlaneValue);

            return next;
        });

        [...survivors.slice(0, at), ...placed, ...survivors.slice(at)].forEach((item, index) => {
            replacements.set(taskBoardIdKey(this.idOf(item)), { ...item, order: index });
        });

        for (const item of this.items()) {
            const key = this.cellKeyOf(this.columnOf(item), this.swimlaneOf(item));
            if (!sourceKeys.has(key)) continue;

            sourceKeys.delete(key);

            this.itemsOf(this.columnOf(item) as string | number, this.swimlaneOf(item))
                .filter((entry) => !movingKeys.has(taskBoardIdKey(this.idOf(entry))))
                .forEach((entry, index) => {
                    if (entry.order === index) return;
                    replacements.set(taskBoardIdKey(this.idOf(entry)), { ...entry, order: index });
                });
        }

        return this.items().map((item) => replacements.get(taskBoardIdKey(this.idOf(item))) ?? item);
    }

    /** The index key of one cell. `undefined` swimlanes collapse onto the ungrouped key. */
    private cellKeyOf(columnValue: string | number | undefined, swimlaneValue: string | number | undefined): string {
        return this.grouped() ? `${taskBoardIdKey(columnValue)}|${taskBoardIdKey(swimlaneValue)}` : taskBoardIdKey(columnValue);
    }

    /** Adds a card. */
    addItem(item: T, columnValue?: string | number, index?: number): void {
        if (this.inert()) return;

        const columnField = this.config.columnField();
        const target = columnValue ?? this.columnOf(item) ?? this.columns()[0]?.id;
        const placed = target == null ? item : writeField(item, columnField, target);
        const cell = target == null ? [] : this.itemsOf(target, this.swimlaneOf(placed));
        const at = Math.max(0, Math.min(index ?? cell.length, cell.length));
        const withOrder = { ...placed, order: at } as T;

        if (!this.external()) {
            // Everything already in the cell from `at` onwards shifts by one. Writing only the new
            // card's own order left two cards holding the same number, and because the sort is stable
            // the newcomer landed behind the one that already had it: addTask(card, 'backlog', 0) put
            // it at position 1.
            const shifted = new Map(cell.slice(at).map((entry) => [taskBoardIdKey(this.idOf(entry)), (entry.order ?? 0) + 1]));
            const current = this.config.tasks().map((entry) => {
                const shift = shifted.get(taskBoardIdKey(this.idOf(entry)));
                return shift === undefined ? entry : ({ ...entry, order: shift } as T);
            });

            const next = [...current, withOrder];

            this.pushHistory(this.config.tasks());
            this.config.setTasks(next);
            this.config.emitTasksChange(next);
        }

        this.record({ action: 'create', timestamp: Date.now(), taskId: this.idOf(withOrder), toColumnId: target ?? undefined });
        this.config.emitCardCreate({ card: withOrder, column: target == null ? undefined : this.columnById(target) });
    }

    /** Replaces a card, matched by id. */
    updateItem(item: T): void {
        if (this.inert()) return;

        const id = this.idOf(item);
        const previous = this.itemById(id);
        if (!previous) return;

        if (!this.external()) {
            const key = taskBoardIdKey(id);
            const next = this.config.tasks().map((entry) => (taskBoardIdKey(this.idOf(entry)) === key ? item : entry));

            this.pushHistory(this.config.tasks());
            this.config.setTasks(next);
            this.config.emitTasksChange(next);
        }

        this.record({ action: 'update', timestamp: Date.now(), taskId: id });
        this.config.emitCardUpdate({ card: item, oldCard: previous });
    }

    /** Removes a card. */
    removeItem(id: string | number): void {
        if (this.inert()) return;

        const item = this.itemById(id);
        if (!item) return;

        const columnValue = this.columnOf(item);

        if (!this.external()) {
            const key = taskBoardIdKey(id);
            const next = this.config.tasks().filter((entry) => taskBoardIdKey(this.idOf(entry)) !== key);

            this.pushHistory(this.config.tasks());
            this.config.setTasks(next);
            this.config.emitTasksChange(next);
        }

        this.selection.update((current) => current.filter((entry) => taskBoardIdKey(entry) !== taskBoardIdKey(id)));
        this.record({ action: 'delete', timestamp: Date.now(), taskId: id, fromColumnId: columnValue });
        this.config.emitCardDelete({ card: item, column: columnValue == null ? undefined : this.columnById(columnValue) });
    }

    /** Reorders the columns after a completed column drag. */
    reorderColumns(oldIndex: number, newIndex: number): void {
        const columns = this.columns();
        if (oldIndex === newIndex || oldIndex < 0 || newIndex < 0 || oldIndex >= columns.length || newIndex >= columns.length) return;

        const moved = columns[oldIndex];
        if (moved.locked) return;

        const next = [...columns];
        next.splice(oldIndex, 1);
        next.splice(newIndex, 0, moved);

        // A reorder that would displace a locked column is refused whole: locked promises a position,
        // not merely that the column resists being picked up.
        const displacedLocked = next.some((column, index) => column.locked && columns[index]?.id !== column.id);
        if (displacedLocked) return;

        this.config.emitColumnReorder({ columns: next.map((column, index) => ({ ...column, order: index })), oldIndex, newIndex });
    }

    // ---------------------------------------------------------------------------------------------
    // History
    // ---------------------------------------------------------------------------------------------

    private readonly undoStack = signal<T[][]>([]);
    private readonly redoStack = signal<T[][]>([]);

    /** Whether there is anything to undo. */
    readonly canUndo = computed(() => this.undoStack().length > 0);

    /** Whether there is anything to redo. */
    readonly canRedo = computed(() => this.redoStack().length > 0);

    private pushHistory(snapshot: T[]): void {
        if (!this.features().history || this.external()) return;

        this.undoStack.update((stack) => [...stack.slice(-(HISTORY_LIMIT - 1)), snapshot]);
        this.redoStack.set([]);
    }

    /** Applies the previous entry. */
    undo(): void {
        if (this.external()) return;

        const stack = this.undoStack();
        if (stack.length === 0) return;

        const previous = stack[stack.length - 1];
        const current = this.config.tasks();

        this.undoStack.set(stack.slice(0, -1));
        this.redoStack.update((entries) => [...entries, current]);
        this.config.setTasks(previous);
        this.config.emitTasksChange(previous);
    }

    /** Applies the next entry. */
    redo(): void {
        if (this.external()) return;

        const stack = this.redoStack();
        if (stack.length === 0) return;

        const next = stack[stack.length - 1];
        const current = this.config.tasks();

        this.redoStack.set(stack.slice(0, -1));
        this.undoStack.update((entries) => [...entries, current]);
        this.config.setTasks(next);
        this.config.emitTasksChange(next);
    }

    /** Empties the history. */
    clearHistory(): void {
        this.undoStack.set([]);
        this.redoStack.set([]);
    }

    // ---------------------------------------------------------------------------------------------
    // Audit
    // ---------------------------------------------------------------------------------------------

    private readonly audit = signal<TaskBoardAuditEntry[]>([]);

    /** The recorded actions. */
    getAuditLog(): TaskBoardAuditEntry[] {
        return [...this.audit()];
    }

    /** Empties the audit log. */
    clearAuditLog(): void {
        this.audit.set([]);
    }

    private record(entry: TaskBoardAuditEntry): void {
        this.audit.update((entries) => [...entries.slice(-(AUDIT_LIMIT - 1)), entry]);
    }

    // ---------------------------------------------------------------------------------------------
    // Live region
    // ---------------------------------------------------------------------------------------------

    private readonly politeMessage = signal('');
    private readonly assertiveMessage = signal('');

    /** What the polite live region is saying. */
    readonly liveMessage = this.politeMessage.asReadonly();

    /** What the assertive live region is saying. */
    readonly alertMessage = this.assertiveMessage.asReadonly();

    /**
     * Whether the next announcement carries the invisible marker.
     *
     * A live region only speaks when its text CHANGES, so the same message twice — the same card
     * refused twice by the same WIP limit — would be announced once. Alternating a zero-width space
     * makes the text differ every time without changing what is read out.
     */
    private announceToggle = false;

    /** Says something in one of the live regions. */
    announce(message: string, level: 'polite' | 'assertive' = 'polite'): void {
        this.announceToggle = !this.announceToggle;

        const text = this.announceToggle ? `${message}\u200b` : message;

        if (level === 'assertive') this.assertiveMessage.set(text);
        else this.politeMessage.set(text);
    }

    // ---------------------------------------------------------------------------------------------
    // Export and serialisation
    // ---------------------------------------------------------------------------------------------

    /** The board data as pretty JSON. */
    exportToJSON(): string {
        const payload: TaskBoardJsonExport<T> = {
            columns: this.config.columns().map((column) => ({ ...column })),
            tasks: this.items().map((item) => ({ ...item })),
            swimlanes: this.config.swimlanes().map((swimlane) => ({ ...swimlane })),
            exportedAt: new Date().toISOString()
        };

        return JSON.stringify(payload, null, 2);
    }

    /** The cards as CSV. */
    exportToCSV(options: TaskBoardCsvExportOptions = {}): string {
        const fields = options.fields ?? ['id', 'title', 'description', 'columnId', 'priority', 'assignee', 'dueDate', 'tags'];
        const delimiter = options.delimiter ?? ',';
        const joiner = options.arrayJoiner ?? ';';
        const rows: string[] = [];

        if (options.includeHeader !== false) rows.push(fields.map((field) => escapeCsv(field, delimiter)).join(delimiter));

        for (const item of this.items()) {
            rows.push(fields.map((field) => escapeCsv(flatten(readField(item, field), joiner), delimiter)).join(delimiter));
        }

        return rows.join('\n');
    }

    /** The UI state, as a snapshot. */
    serializeState(): TaskBoardStateSnapshot {
        return {
            collapsedColumnIds: [...this.collapsedColumnIds()],
            collapsedSwimlaneIds: [...this.collapsedSwimlaneIds()],
            selectedCardIds: [...this.selection()],
            focusedCardId: this.focus(),
            timestamp: Date.now()
        };
    }

    /** Applies whichever fields a snapshot carries. */
    restoreState(state: TaskBoardStateSnapshot): void {
        // A snapshot is the complete list of what was collapsed, so an explicit decision is written
        // for EVERY column and row: whatever is absent from it was open, and leaving those undecided
        // would hand them back to the metadata.
        if (state.collapsedColumnIds) {
            const collapsed = new Set(state.collapsedColumnIds.map(taskBoardIdKey));
            this.columnCollapseOverrides.set(Object.fromEntries(this.config.columns().map((column) => [taskBoardIdKey(column.id), collapsed.has(taskBoardIdKey(column.id))])));
        }

        if (state.collapsedSwimlaneIds) {
            const collapsed = new Set(state.collapsedSwimlaneIds.map(taskBoardIdKey));
            this.swimlaneCollapseOverrides.set(Object.fromEntries(this.config.swimlanes().map((swimlane) => [taskBoardIdKey(swimlane.id), collapsed.has(taskBoardIdKey(swimlane.id))])));
        }

        if (state.selectedCardIds) this.setSelection(state.selectedCardIds);
        if (state.focusedCardId !== undefined) this.focus.set(state.focusedCardId);
    }

    // ---------------------------------------------------------------------------------------------
    // Virtual scroll
    // ---------------------------------------------------------------------------------------------

    private readonly scrollOffsets = signal<Map<string, { top: number; height: number }>>(new Map());
    private readonly measured = signal<Map<string, number>>(new Map());

    /** Whether only the cards near the viewport are mounted. */
    readonly virtual = computed(() => this.config.virtualScroll());

    /** Records where a cell's viewport is, so its window can be recomputed. */
    setViewport(cellKey: string, top: number, height: number): void {
        this.scrollOffsets.update((current) => {
            const previous = current.get(cellKey);
            if (previous && previous.top === top && previous.height === height) return current;

            const next = new Map(current);
            next.set(cellKey, { top, height });

            return next;
        });
    }

    /** Records a measured card height, which replaces the estimate for that cell. */
    setMeasuredHeight(cellKey: string, height: number): void {
        if (height <= 0) return;

        this.measured.update((current) => {
            if (current.get(cellKey) === height) return current;

            const next = new Map(current);
            next.set(cellKey, height);

            return next;
        });
    }

    /**
     * The window of one cell: which cards to mount and how much space to reserve around them.
     *
     * Off, or below one viewport's worth of cards, the answer is the whole list. Windowing a short
     * column costs two spacer elements and buys nothing.
     */
    readonly windowOf = (cellKey: string, total: number): { start: number; end: number; paddingTop: number; paddingBottom: number } => {
        if (!this.virtual() || total === 0) return { start: 0, end: total, paddingTop: 0, paddingBottom: 0 };

        const height = this.measured().get(cellKey) ?? this.config.virtualScrollItemHeight();
        const viewport = this.scrollOffsets().get(cellKey);
        const buffer = Math.max(0, this.config.virtualScrollBuffer());

        if (!viewport || viewport.height <= 0) {
            const initial = Math.min(total, Math.ceil(this.config.virtualScrollItemHeight() > 0 ? 600 / height : total) + buffer);
            return { start: 0, end: initial, paddingTop: 0, paddingBottom: Math.max(0, (total - initial) * height) };
        }

        const first = Math.max(0, Math.floor(viewport.top / height) - buffer);
        const visible = Math.ceil(viewport.height / height) + buffer * 2;
        const last = Math.min(total, first + visible);

        return { start: first, end: last, paddingTop: first * height, paddingBottom: Math.max(0, (total - last) * height) };
    };
}

/** Flattens a field value into one CSV cell. */
function flatten(value: unknown, joiner: string): string {
    if (value == null) return '';
    if (Array.isArray(value)) return value.map((entry) => flatten(entry, joiner)).join(joiner);
    if (value instanceof Date) return value.toISOString();
    if (typeof value === 'object') return JSON.stringify(value);

    return String(value);
}

/** Quotes a CSV cell when it carries the delimiter, a quote or a newline. */
function escapeCsv(value: string, delimiter: string): string {
    if (!value.includes(delimiter) && !value.includes('"') && !value.includes('\n') && !value.includes('\r')) return value;

    return `"${value.replace(/"/g, '""')}"`;
}

/**
 * Token every TaskBoard part reads its board's state through.
 *
 * @group Types
 */
export const TASKBOARD_STATE = new InjectionToken<TaskBoardState>('TASKBOARD_STATE');

/** A writable signal, as the root's model inputs are. @internal */
export type TaskBoardModelSignal<T> = WritableSignal<T>;
