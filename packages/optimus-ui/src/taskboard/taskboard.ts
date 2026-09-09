import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, ViewEncapsulation, booleanAttribute, computed, inject, input, isDevMode, model, numberAttribute, output, signal } from '@angular/core';
import { BaseComponent, PARENT_INSTANCE } from '@openng/optimus-ui/basecomponent';
import { Bind } from '@openng/optimus-ui/bind';
import type {
    TaskBoardAccess,
    TaskBoardAuditEntry,
    TaskBoardCardActivatePayload,
    TaskBoardCardClickPayload,
    TaskBoardCardContextMenuPayload,
    TaskBoardCardCreatePayload,
    TaskBoardCardDblclickPayload,
    TaskBoardCardDeletePayload,
    TaskBoardCardDropBlockedPayload,
    TaskBoardCardMovePayload,
    TaskBoardCardReorderPayload,
    TaskBoardCardSelectPayload,
    TaskBoardCardUpdatePayload,
    TaskBoardColumnCollapsePayload,
    TaskBoardColumnGroup,
    TaskBoardColumnModel,
    TaskBoardColumnReorderPayload,
    TaskBoardCsvExportOptions,
    TaskBoardDensity,
    TaskBoardDragCancelPayload,
    TaskBoardDragEndPayload,
    TaskBoardDragStartPayload,
    TaskBoardExpose,
    TaskBoardFeatures,
    TaskBoardItem,
    TaskBoardPassThrough,
    TaskBoardSelectionChangePayload,
    TaskBoardSelectionMode,
    TaskBoardStateSnapshot,
    TaskBoardSwimlane,
    TaskBoardSwimlaneCollapsePayload
} from '@openng/optimus-ui/types/taskboard';
import { TASKBOARD_CONTEXT, type TaskBoardContext } from './taskboard-context';
import { TASKBOARD_DRAG, TaskBoardDrag } from './taskboard-drag';
import { TaskBoardRuntimeDropIndicator } from './taskboard-overlays';
import { TaskBoardKeyboard } from './taskboard-keyboard';
import { TASKBOARD_DEFAULT_LABELS, TASKBOARD_STATE, TaskBoardState, type TaskBoardLabelOverrides, type TaskBoardLabels, taskBoardIdKey } from './taskboard-state';
import { TaskBoardStyle } from './style/taskboardstyle';

/**
 * The shortcuts the root claims, advertised on the host so a screen reader can list them.
 *
 * Spelled out rather than summarised because `aria-keyshortcuts` is a machine-read list: a reader
 * announces exactly these tokens, and "arrow keys" is not one of them.
 */
const BOARD_KEYSHORTCUTS = [
    'ArrowUp',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'Home',
    'End',
    'Tab',
    'Shift+Tab',
    'Enter',
    'Space',
    'Control+A',
    'Meta+A',
    'Control+Z',
    'Meta+Z',
    'Control+Y',
    'Meta+Y',
    'Control+Shift+Z',
    'Meta+Shift+Z',
    'Alt+ArrowUp',
    'Alt+ArrowDown',
    'Alt+ArrowLeft',
    'Alt+ArrowRight',
    'Alt+Shift+ArrowUp',
    'Alt+Shift+ArrowDown',
    'Escape'
].join(' ');

/** The inline style the live regions carry, so they work with no stylesheet loaded. */
const LIVE_REGION_STYLE = 'position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap';

/**
 * TaskBoard is a compound kanban surface: the root owns the data, the layout state, the interaction
 * and the outputs, and every child part reads what it needs from that shared state.
 *
 * The visible content is the application's. The root supplies no card, no header and no toolbar of
 * its own — what it supplies is the contract those surfaces sit inside: focus, selection, drag
 * geometry, workflow validation, data attributes and ARIA.
 *
 * @group Components
 */
@Component({
    selector: 'p-taskboard-root',
    standalone: true,
    exportAs: 'pTaskBoard',
    imports: [TaskBoardRuntimeDropIndicator],
    template: `
        <ng-content />
        @if (taskBoardDrag.runtimeIndicator()) {
            <p-taskboard-runtime-drop-indicator />
        }
        <div role="status" aria-live="polite" aria-atomic="true" class="p-taskboard-live-region" [style]="liveRegionStyle">{{ taskBoardState.liveMessage() }}</div>
        <div role="alert" aria-live="assertive" aria-atomic="true" class="p-taskboard-live-region-assertive" [style]="liveRegionStyle">{{ taskBoardState.alertMessage() }}</div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [
        TaskBoardStyle,
        { provide: PARENT_INSTANCE, useExisting: TaskBoard },
        { provide: TASKBOARD_STATE, useFactory: () => inject(TaskBoard).taskBoardState },
        { provide: TASKBOARD_CONTEXT, useFactory: () => inject(TaskBoard).boardContext },
        { provide: TASKBOARD_DRAG, useFactory: () => inject(TaskBoard).taskBoardDrag }
    ],
    host: {
        '[class]': 'cx("root")',
        'data-scope': 'taskboard',
        'data-part': 'root',
        role: 'group',
        '[attr.tabindex]': 'disabled() ? null : 0',
        '[attr.aria-label]': 'ariaLabel()',
        '[attr.aria-keyshortcuts]': 'keyShortcuts',
        '[attr.dir]': 'rtl() ? "rtl" : null',
        '[attr.aria-busy]': 'loading() ? true : null',
        '[style.--p-taskboard-column-min-width]': 'columnWidthValue()',
        '[style.--p-taskboard-column-max-width]': 'columnWidthValue()',
        '[style.--p-taskboard-card-gap]': 'cardGapValue()',
        '(keydown)': 'taskBoardKeyboard.onKeyDown($event)',
        '(contextmenu)': 'onContextMenu($event)'
    },
    hostDirectives: [Bind]
})
export class TaskBoard<T extends TaskBoardItem = TaskBoardItem> extends BaseComponent<TaskBoardPassThrough> implements TaskBoardExpose<T> {
    componentName = 'TaskBoard';

    /** @internal */
    _componentStyle = inject(TaskBoardStyle);

    private readonly bindDirectiveInstance = inject(Bind, { self: true });

    private readonly hostElement = inject<ElementRef<HTMLElement>>(ElementRef);

    /** @internal The shortcut list advertised on the host. */
    readonly keyShortcuts = BOARD_KEYSHORTCUTS;

    /** @internal The inline style the live regions carry. */
    readonly liveRegionStyle = LIVE_REGION_STYLE;

    onAfterViewChecked(): void {
        this.bindDirectiveInstance.setAttrs(this.ptms(['host', 'root']));
    }

    // ---------------------------------------------------------------------------------------------
    // Data
    // ---------------------------------------------------------------------------------------------

    /**
     * The managed card model. Supports `[(tasks)]`.
     *
     * Bind `(tasksChange)` for the board to apply accepted moves, reorders and mutations itself. Left
     * unbound, the board still emits the next array and nothing writes it, so the cards snap back.
     * @group Props
     */
    readonly tasks = model<T[]>([]);
    /**
     * The external read source. Takes precedence over `tasks` and turns off every managed write.
     *
     * Use it when a store owns the mutations: the board renders what it is given and emits its
     * outputs as REQUESTS.
     * @group Props
     */
    readonly items = input<T[] | undefined>(undefined);
    /**
     * The workflow columns. Left empty, the projected `<p-taskboard-column>` children register
     * themselves instead.
     * @group Props
     */
    readonly columns = input<TaskBoardColumnModel[]>([]);
    /**
     * The swimlane rows.
     * @group Props
     */
    readonly swimlanes = input<TaskBoardSwimlane[]>([]);
    /**
     * Item field holding the stable card id. Required.
     * @defaultValue 'id'
     * @group Props
     */
    readonly dataKey = input('id');
    /**
     * Item field holding the card's column. Required.
     * @defaultValue 'columnId'
     * @group Props
     */
    readonly columnField = input('columnId');
    /**
     * Item field holding the card's swimlane. Only needed on a grouped board.
     * @group Props
     */
    readonly swimlaneField = input<string | undefined>(undefined);
    /**
     * The phase headers drawn above runs of columns.
     * @group Props
     */
    readonly columnGroups = input<TaskBoardColumnGroup[]>([]);

    // ---------------------------------------------------------------------------------------------
    // Behaviour
    // ---------------------------------------------------------------------------------------------

    /**
     * Accessible name of the board.
     * @defaultValue 'Task board'
     * @group Props
     */
    readonly ariaLabel = input('Task board');
    /**
     * Whether cards can be moved. An individual card's own `draggable: false` still overrides it.
     * @defaultValue true
     * @group Props
     */
    readonly draggable = input(true, { transform: booleanAttribute });
    /**
     * How far the pointer must travel before a press on a card becomes a drag, in pixels. Below it
     * the press stays a click, which is what keeps selection usable on a touch screen.
     * @defaultValue 5
     * @group Props
     */
    readonly dragMinDistance = input(5, { transform: numberAttribute });
    /**
     * Whether columns offer a collapse affordance and accept the collapse commands.
     * @defaultValue true
     * @group Props
     */
    readonly columnCollapsible = input(true, { transform: booleanAttribute });
    /**
     * Whether a column header can be dragged to reorder the lanes.
     * @defaultValue false
     * @group Props
     */
    readonly columnReorderable = input(false, { transform: booleanAttribute });
    /**
     * Whether the right-click payload is emitted. The overlay itself stays the application's.
     * @defaultValue false
     * @group Props
     */
    readonly contextMenu = input(false, { transform: booleanAttribute });
    /**
     * Whether the board scrolls inside its own box instead of growing with its content.
     * @defaultValue true
     * @group Props
     */
    readonly scrollable = input(true, { transform: booleanAttribute });
    /**
     * How a click builds the selection.
     * @defaultValue 'none'
     * @group Props
     */
    readonly selectionMode = input<TaskBoardSelectionMode>('none');
    /**
     * How tightly the board is packed.
     * @defaultValue 'standard'
     * @group Props
     */
    readonly density = input<TaskBoardDensity>('standard');
    /**
     * The feature switches. A partial object only has to name what it turns OFF.
     * @group Props
     */
    readonly features = input<TaskBoardFeatures | undefined>(undefined);
    /**
     * Width of a column. A number is read as pixels; a string is used as a CSS length.
     * @group Props
     */
    readonly columnWidth = input<number | string | undefined>(undefined);
    /**
     * Gap between the cards of a column, in pixels. Overrides the density.
     * @group Props
     */
    readonly cardGap = input<number | undefined>(undefined, { transform: (value: unknown) => (value == null ? undefined : numberAttribute(value)) });
    /**
     * What the current viewer is allowed to do. An interaction guard, never authorisation.
     * @group Props
     */
    readonly access = input<TaskBoardAccess | undefined>(undefined);
    /**
     * Whether the board lays out right to left. Sets `dir` on the root, which is what every logical
     * property in the stylesheet keys off.
     * @defaultValue false
     * @group Props
     */
    readonly rtl = input(false, { transform: booleanAttribute });
    /**
     * Disables every interaction and dims the board.
     * @defaultValue false
     * @group Props
     */
    readonly disabled = input(false, { transform: booleanAttribute });
    /**
     * Makes the board read-only: it still reads normally, but nothing responds.
     * @defaultValue false
     * @group Props
     */
    readonly readonly = input(false, { transform: booleanAttribute });
    /**
     * Shows the loading state on the board.
     * @defaultValue false
     * @group Props
     */
    readonly loading = input(false, { transform: booleanAttribute });
    /**
     * Whether only the cards near the viewport are mounted.
     * @defaultValue false
     * @group Props
     */
    readonly virtualScroll = input(false, { transform: booleanAttribute });
    /**
     * Estimated card height in pixels, used until a real one has been measured.
     * @defaultValue 250
     * @group Props
     */
    readonly virtualScrollItemHeight = input(250, { transform: numberAttribute });
    /**
     * Extra cards kept mounted either side of the window, so a fast scroll does not expose a blank
     * edge.
     * @defaultValue 3
     * @group Props
     */
    readonly virtualScrollBuffer = input(3, { transform: numberAttribute });
    /**
     * Overrides the chrome and assistive strings. Merged over the defaults, so a partial object is
     * fine.
     * @group Props
     */
    readonly labels = input<TaskBoardLabelOverrides | undefined>(undefined);

    // ---------------------------------------------------------------------------------------------
    // Outputs
    // ---------------------------------------------------------------------------------------------

    /**
     * Fires when a card lands in a different cell, and on every accepted move.
     * @group Emits
     */
    readonly cardMove = output<TaskBoardCardMovePayload<T>>();
    /**
     * Fires after `cardMove` when the move stayed inside the same cell.
     * @group Emits
     */
    readonly cardReorder = output<TaskBoardCardReorderPayload<T>>();
    /**
     * Fires when a card is clicked.
     * @group Emits
     */
    readonly cardClick = output<TaskBoardCardClickPayload<T>>();
    /**
     * Fires when a card is double-clicked, just before `cardActivate`.
     * @group Emits
     */
    readonly cardDblclick = output<TaskBoardCardDblclickPayload<T>>();
    /**
     * Fires when a card is opened on purpose, which is what a detail dialog should listen to.
     * @group Emits
     */
    readonly cardActivate = output<TaskBoardCardActivatePayload<T>>();
    /**
     * Fires for the ONE card whose selection state changed.
     * @group Emits
     */
    readonly cardSelect = output<TaskBoardCardSelectPayload<T>>();
    /**
     * Fires with the WHOLE selection after it changes. The output a toolbar wants.
     * @group Emits
     */
    readonly selectionChange = output<TaskBoardSelectionChangePayload<T>>();
    /**
     * Fires when a card is created.
     * @group Emits
     */
    readonly cardCreate = output<TaskBoardCardCreatePayload<T>>();
    /**
     * Fires when a card is changed.
     * @group Emits
     */
    readonly cardUpdate = output<TaskBoardCardUpdatePayload<T>>();
    /**
     * Fires when a card is removed.
     * @group Emits
     */
    readonly cardDelete = output<TaskBoardCardDeletePayload<T>>();
    /**
     * Fires when a column is collapsed or expanded.
     * @group Emits
     */
    readonly columnCollapse = output<TaskBoardColumnCollapsePayload>();
    /**
     * Fires when a column reorder completes. The board does not own the `columns` array: write the
     * emitted order back yourself.
     * @group Emits
     */
    readonly columnReorder = output<TaskBoardColumnReorderPayload>();
    /**
     * Fires when a swimlane is collapsed or expanded.
     * @group Emits
     */
    readonly swimlaneCollapse = output<TaskBoardSwimlaneCollapsePayload>();
    /**
     * Fires when a drag begins, once the pointer has travelled `dragMinDistance`.
     * @group Emits
     */
    readonly dragStart = output<TaskBoardDragStartPayload<T>>();
    /**
     * Fires when a drag is released, whatever the board then decided. Persist `cardMove` instead.
     * @group Emits
     */
    readonly dragEnd = output<TaskBoardDragEndPayload<T>>();
    /**
     * Fires when a drag is abandoned.
     * @group Emits
     */
    readonly dragCancel = output<TaskBoardDragCancelPayload<T>>();
    /**
     * Fires when a card is right-clicked and `contextMenu` is on.
     * @group Emits
     */
    readonly cardContextMenu = output<TaskBoardCardContextMenuPayload<T>>();
    /**
     * Fires when a drop was refused, with the reason and a message meant for the user.
     * @group Emits
     */
    readonly cardDropBlocked = output<TaskBoardCardDropBlockedPayload<T>>();

    // ---------------------------------------------------------------------------------------------
    // State
    // ---------------------------------------------------------------------------------------------

    private readonly mergedLabels = computed<TaskBoardLabels>(() => {
        const overrides = this.labels();
        return overrides ? { ...TASKBOARD_DEFAULT_LABELS, ...overrides } : TASKBOARD_DEFAULT_LABELS;
    });

    /** @internal The shared state every child part reads. */
    readonly taskBoardState: TaskBoardState<T> = new TaskBoardState<T>({
        tasks: this.tasks,
        items: this.items,
        setTasks: (value) => this.tasks.set(value),
        columns: computed(() => (this.columns().length > 0 ? this.columns() : this.registeredColumns())),
        swimlanes: this.swimlanes,
        columnGroups: this.columnGroups,
        dataKey: this.dataKey,
        columnField: this.columnField,
        swimlaneField: this.swimlaneField,
        draggable: this.draggable,
        dragMinDistance: this.dragMinDistance,
        columnCollapsible: this.columnCollapsible,
        columnReorderable: this.columnReorderable,
        contextMenu: this.contextMenu,
        scrollable: this.scrollable,
        selectionMode: this.selectionMode,
        density: this.density,
        features: this.features,
        access: this.access,
        rtl: this.rtl,
        disabled: this.disabled,
        readonly: this.readonly,
        loading: this.loading,
        virtualScroll: this.virtualScroll,
        virtualScrollItemHeight: this.virtualScrollItemHeight,
        virtualScrollBuffer: this.virtualScrollBuffer,
        labels: this.mergedLabels,
        emitTasksChange: (value) => this.tasks.set(value),
        emitCardMove: (payload) => this.cardMove.emit(payload),
        emitCardReorder: (payload) => this.cardReorder.emit(payload),
        emitCardDropBlocked: (payload) => this.cardDropBlocked.emit(payload),
        emitCardSelect: (payload) => this.cardSelect.emit(payload),
        emitSelectionChange: (payload) => this.selectionChange.emit(payload),
        emitCardCreate: (payload) => this.cardCreate.emit(payload),
        emitCardUpdate: (payload) => this.cardUpdate.emit(payload),
        emitCardDelete: (payload) => this.cardDelete.emit(payload),
        emitColumnCollapse: (payload) => this.columnCollapse.emit(payload),
        emitColumnReorder: (payload) => this.columnReorder.emit(payload),
        emitSwimlaneCollapse: (payload) => this.swimlaneCollapse.emit(payload),
        emitCardActivate: (payload) => this.cardActivate.emit(payload),
        emitDragStart: (payload) => this.dragStart.emit(payload),
        emitDragEnd: (payload) => this.dragEnd.emit(payload),
        emitDragCancel: (payload) => this.dragCancel.emit(payload),
        emitCardClick: (payload) => this.cardClick.emit(payload),
        emitCardDblclick: (payload) => this.cardDblclick.emit(payload),
        emitCardContextMenu: (payload) => this.cardContextMenu.emit(payload),
        hasDeclaredColumns: computed(() => this.columns().length > 0),
        registerColumn: (column) => this.registerColumn(column),
        unregisterColumn: (id) => this.unregisterColumn(id)
    });

    /** @internal The pointer sensor. */
    readonly taskBoardDrag = new TaskBoardDrag<T>(this.taskBoardState);

    /** @internal The keyboard controller. */
    readonly taskBoardKeyboard = new TaskBoardKeyboard<T>(this.taskBoardState, () => this.hostElement.nativeElement);

    /**
     * Columns declared as `<p-taskboard-column>` children, when the root was given no `columns`.
     *
     * Registered by the children themselves rather than queried, because a swimlane layout renders
     * the same column once per row: a `contentChildren` query would see six copies of one lane and
     * report six columns.
     */
    private readonly declaredColumns = signal<TaskBoardColumnModel[]>([]);

    private readonly registeredColumns = computed(() => this.declaredColumns());

    /**
     * @internal A child column announcing itself, for a board with no `columns` input.
     *
     * Returns the same array when nothing actually changed, so the signal does not notify and the
     * registering effect is not woken by its own write.
     */
    registerColumn(column: TaskBoardColumnModel): void {
        this.declaredColumns.update((current) => {
            const index = current.findIndex((entry) => entry.id === column.id);

            if (index < 0) return [...current, column];
            if (sameColumn(current[index], column)) return current;

            const next = [...current];
            next[index] = column;

            return next;
        });
    }

    /** @internal A child column going away. */
    unregisterColumn(id: string | number): void {
        this.declaredColumns.update((current) => current.filter((entry) => entry.id !== id));
    }

    /** @internal The board context every descendant can inject. */
    readonly boardContext: TaskBoardContext<T> = {
        items: this.taskBoardState.items,
        columns: this.taskBoardState.columns,
        swimlanes: this.taskBoardState.swimlanes,
        columnGroups: this.taskBoardState.columnGroups,
        dataKey: this.dataKey,
        columnField: this.columnField,
        swimlaneField: this.swimlaneField,
        selectionMode: this.selectionMode,
        density: this.density,
        features: computed(() => this.taskBoardState.features()),
        access: this.taskBoardState.access,
        disabled: this.disabled,
        readonly: this.readonly,
        rtl: this.rtl,
        selectedIds: this.taskBoardState.selectedIds,
        focusedId: this.taskBoardState.focusedId,
        collapsedColumnIds: this.taskBoardState.collapsedColumnIds,
        collapsedSwimlaneIds: this.taskBoardState.collapsedSwimlaneIds,
        draggingItem: this.taskBoardState.draggingItem,
        draggingIds: this.taskBoardState.draggingIds,
        dragging: this.taskBoardState.dragging,
        idOf: (item) => this.taskBoardState.idOf(item),
        columnOf: (item) => this.taskBoardState.columnOf(item),
        swimlaneOf: (item) => this.taskBoardState.swimlaneOf(item),
        itemsOf: (columnValue, swimlaneValue) => this.taskBoardState.itemsOf(columnValue, swimlaneValue),
        columnById: (id) => this.taskBoardState.columnById(id),
        isColumnCollapsed: (id) => this.taskBoardState.isColumnCollapsed(id),
        isSwimlaneCollapsed: (id) => this.taskBoardState.isSwimlaneCollapsed(id)
    };

    /** `columnWidth` as a CSS length: a bare number means pixels. */
    protected readonly columnWidthValue = computed(() => {
        const width = this.columnWidth();
        if (width == null) return null;

        return typeof width === 'number' ? `${width}px` : width;
    });

    protected readonly cardGapValue = computed(() => {
        const gap = this.cardGap();
        return gap == null ? null : `${gap}px`;
    });

    /**
     * Reports a board bound to both data inputs at once.
     *
     * A development-only warning and not a thrown error: the board still renders — `items` wins —
     * and taking the page down over a binding mistake helps nobody. What it cannot do is guess which
     * of the two the application meant to own the writes.
     */
    private reportOwnershipConflict(): void {
        if (!isDevMode()) return;
        if (this.items() === undefined || this.tasks().length === 0) return;

        console.warn('[TaskBoard] `tasks` and `items` are both bound. `items` wins and every managed write is off. Bind one of them.');
    }

    onAfterViewInit(): void {
        this.taskBoardDrag.attach(this.hostElement.nativeElement);
        this.reportOwnershipConflict();
    }

    /**
     * Drops any pointer listener still attached if the board goes away mid-drag.
     *
     * `DestroyRef` and not an `ngOnDestroy`: the base component owns that hook, and overriding it
     * here would mean remembering to call `super`.
     */
    private readonly cleanup = inject(DestroyRef).onDestroy(() => this.taskBoardDrag.destroy());

    /** @internal The right-click handler, which only fires the payload when the feature is on. */
    onContextMenu(event: MouseEvent): void {
        if (!this.taskBoardState.contextMenuEnabled()) return;

        const wrapper = (event.target as HTMLElement | null)?.closest<HTMLElement>('[data-task-id]');
        const item = wrapper?.dataset['taskId'] == null ? undefined : this.taskBoardState.items().find((entry) => String(this.taskBoardState.idOf(entry)) === wrapper.dataset['taskId']);
        const columnRaw = (event.target as HTMLElement | null)?.closest<HTMLElement>('[data-column-id]')?.dataset['columnId'];

        event.preventDefault();

        const column = item ? this.taskBoardState.columnModelOf(item) : this.taskBoardState.columns().find((entry) => String(entry.id) === columnRaw);

        this.cardContextMenu.emit({ card: item, column, position: { x: event.clientX, y: event.clientY }, jsEvent: event });
    }

    // ---------------------------------------------------------------------------------------------
    // Public methods
    // ---------------------------------------------------------------------------------------------

    /** The visible columns, in render order. */
    getColumns(): TaskBoardColumnModel[] {
        return this.taskBoardState.columns();
    }

    /** One visible column, by id. */
    getColumnById(id: string | number): TaskBoardColumnModel | undefined {
        return this.taskBoardState.columnById(id);
    }

    /** Every card the board received. */
    getTasks(): T[] {
        return this.taskBoardState.items();
    }

    /** One card, by the value of its `dataKey` field. */
    getTaskById(id: string | number): T | undefined {
        return this.taskBoardState.itemById(id);
    }

    /** The cards of one column, in render order. */
    getTasksByColumn(columnId: string | number, swimlaneId?: string | number): T[] {
        return this.taskBoardState.itemsOf(columnId, swimlaneId);
    }

    /** The visible columns, as a signal, for a template that loops over them. */
    visibleColumns(): TaskBoardColumnModel[] {
        return this.taskBoardState.columns();
    }

    /** The visible swimlanes, as a signal, for a template that loops over them. */
    visibleSwimlanes(): TaskBoardSwimlane[] {
        return this.taskBoardState.swimlanes();
    }

    /** Whether a column is collapsed. */
    isColumnCollapsed(id: string | number): boolean {
        return this.taskBoardState.isColumnCollapsed(id);
    }

    /** Whether a swimlane is collapsed. */
    isSwimlaneCollapsed(id: string | number): boolean {
        return this.taskBoardState.isSwimlaneCollapsed(id);
    }

    /** Ids of the selected cards. */
    getSelectedCardIds(): (string | number)[] {
        return [...this.taskBoardState.selectedIds()];
    }

    /** The selected cards. */
    getSelectedCards(): T[] {
        return this.taskBoardState.selectedItems();
    }

    /** Replaces the selection. */
    setSelectedCards(ids: (string | number)[]): void {
        this.taskBoardState.setSelection(ids);
    }

    /** Empties the selection. */
    clearSelection(): void {
        this.taskBoardState.clearSelection();
    }

    /** Adds a card. */
    addTask(task: T, columnId?: string | number, index?: number): void {
        this.taskBoardState.addItem(task, columnId, index);
    }

    /** Replaces a card, matched by id. */
    updateTask(task: T): void {
        this.taskBoardState.updateItem(task);
    }

    /** Removes a card. */
    removeTask(id: string | number): void {
        this.taskBoardState.removeItem(id);
    }

    /** Moves a card through the same validation the pointer goes through. */
    moveTask(taskId: string | number, columnId: string | number, index?: number, swimlaneId?: string | number): void {
        const item = this.taskBoardState.itemById(taskId);
        if (!item) return;

        const target = this.taskBoardState.itemsOf(columnId, swimlaneId);

        this.taskBoardState.requestMove(item, { id: taskId, columnValue: columnId, index: index ?? target.length, swimlaneValue: swimlaneId ?? this.taskBoardState.swimlaneOf(item) });
    }

    /** Collapses a column. */
    collapseColumn(id: string | number): void {
        this.taskBoardState.setColumnCollapsed(id, true);
    }

    /** Expands a column. */
    expandColumn(id: string | number): void {
        this.taskBoardState.setColumnCollapsed(id, false);
    }

    /** Toggles a column. */
    toggleColumn(id: string | number): void {
        this.taskBoardState.toggleColumn(id);
    }

    /** Collapses a swimlane. */
    collapseSwimlane(id: string | number): void {
        this.taskBoardState.setSwimlaneCollapsed(id, true);
    }

    /** Expands a swimlane. */
    expandSwimlane(id: string | number): void {
        this.taskBoardState.setSwimlaneCollapsed(id, false);
    }

    /** Toggles a swimlane. */
    toggleSwimlane(id: string | number): void {
        this.taskBoardState.toggleSwimlane(id);
    }

    /** Brings a column into view. */
    scrollToColumn(id: string | number): void {
        const element = this.hostElement.nativeElement.querySelector<HTMLElement>(`[data-part="column"][data-taskboard-id-key="${taskBoardIdKey(id)}"]`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }

    /** Brings a card into view. */
    scrollToCard(id: string | number): void {
        const element = this.hostElement.nativeElement.querySelector<HTMLElement>(`[data-part="card"][data-taskboard-id-key="${taskBoardIdKey(id)}"]`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }

    /** Applies the previous history entry. */
    undo(): void {
        this.taskBoardState.undo();
    }

    /** Applies the next history entry. */
    redo(): void {
        this.taskBoardState.redo();
    }

    /** Whether there is anything to undo. */
    canUndo(): boolean {
        return this.taskBoardState.canUndo();
    }

    /** Whether there is anything to redo. */
    canRedo(): boolean {
        return this.taskBoardState.canRedo();
    }

    /** Empties the history. */
    clearHistory(): void {
        this.taskBoardState.clearHistory();
    }

    /** The board data as pretty JSON. */
    exportToJSON(): string {
        return this.taskBoardState.exportToJSON();
    }

    /** The cards as CSV. */
    exportToCSV(options?: TaskBoardCsvExportOptions): string {
        return this.taskBoardState.exportToCSV(options);
    }

    /** Downloads the JSON export. */
    downloadJSON(filename = 'taskboard-export.json'): void {
        this.download(filename, this.exportToJSON(), 'application/json');
    }

    /** Downloads the CSV export. */
    downloadCSV(filename = 'taskboard-export.csv', options?: TaskBoardCsvExportOptions): void {
        this.download(filename, this.exportToCSV(options), 'text/csv');
    }

    /**
     * Marks this board as the print target and opens the browser dialog.
     *
     * The ancestors are marked too, because a board inside a scroll panel or a drawer is clipped by
     * boxes it does not own: without unclipping them the print comes out as the one visible screenful.
     */
    print(): void {
        const view = this.document?.defaultView;
        const body = this.document?.body;
        const host = this.hostElement.nativeElement;
        if (!view || !body) return;

        const marked: HTMLElement[] = [];
        let ancestor = host.parentElement;

        while (ancestor && ancestor !== body) {
            if (!ancestor.classList.contains('p-taskboard-print-ancestor')) {
                ancestor.classList.add('p-taskboard-print-ancestor');
                marked.push(ancestor);
            }

            ancestor = ancestor.parentElement;
        }

        const bodyAlready = body.classList.contains('p-taskboard-print-active');
        if (!bodyAlready) body.classList.add('p-taskboard-print-active');

        // The hooks are written straight to the DOM rather than through a signal: window.print() is
        // synchronous, so an attribute waiting for the next change-detection pass would not be there
        // when the browser snapshots the page — and the print sheet, which hides everything that is
        // not the marked board, would therefore print blank.
        host.setAttribute('data-print-target', 'true');
        host.classList.add('p-taskboard-printing');
        host.scrollTop = 0;

        let restored = false;
        let entered = false;

        const onBeforePrint = (): void => {
            entered = true;
        };

        const restore = (): void => {
            if (restored) return;
            restored = true;

            for (const element of marked) element.classList.remove('p-taskboard-print-ancestor');
            if (!bodyAlready) body.classList.remove('p-taskboard-print-active');

            host.removeAttribute('data-print-target');
            host.classList.remove('p-taskboard-printing');

            view.removeEventListener('beforeprint', onBeforePrint);
            view.removeEventListener('afterprint', restore);
        };

        view.addEventListener('beforeprint', onBeforePrint);
        view.addEventListener('afterprint', restore);

        try {
            view.print();
        } finally {
            // The fallback matters in both directions. The hooks hide EVERYTHING that is not the
            // marked board, so an afterprint that never arrives — a dialog dismissed in a way that
            // does not fire it — would leave the whole page invisible; but cleaning up here
            // unconditionally breaks the opposite case, a print() that does not block, by stripping
            // the hooks before the browser has snapshotted the page. beforeprint tells the two apart:
            // if it fired, the browser is printing and afterprint will follow; if it did not, nothing
            // was printed and cleaning up now is correct.
            if (!entered) restore();
        }
    }

    /** The UI state, as a snapshot. */
    serializeState(): TaskBoardStateSnapshot {
        return this.taskBoardState.serializeState();
    }

    /** Applies whichever fields a snapshot carries. */
    restoreState(state: TaskBoardStateSnapshot): void {
        this.taskBoardState.restoreState(state);
    }

    /** Whether the licence check passed. Always true: this build is MIT. */
    licenseValid(): boolean {
        return true;
    }

    /** What the licence check had to say. */
    licenseMessage(): string {
        return '';
    }

    /** The recorded actions. */
    getAuditLog(): TaskBoardAuditEntry[] {
        return this.taskBoardState.getAuditLog();
    }

    /** Empties the audit log. */
    clearAuditLog(): void {
        this.taskBoardState.clearAuditLog();
    }

    private download(filename: string, content: string, type: string): void {
        const document = this.document;
        const url = document?.defaultView?.URL;
        if (!document || !url) return;

        const href = url.createObjectURL(new Blob([content], { type: `${type};charset=utf-8` }));
        const anchor = document.createElement('a');

        anchor.href = href;
        anchor.download = filename;
        anchor.style.display = 'none';

        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();

        url.revokeObjectURL(href);
    }
}

/** Whether two column descriptors carry the same values, one level deep. */
function sameColumn(left: TaskBoardColumnModel, right: TaskBoardColumnModel): boolean {
    const leftKeys = Object.keys(left);
    const rightKeys = Object.keys(right);

    if (leftKeys.length !== rightKeys.length) return false;

    return leftKeys.every((key) => left[key] === right[key]);
}
