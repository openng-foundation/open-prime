import type { PassThrough, PassThroughOption } from '@openng/optimus-ui/api';

/**
 * A card of the board.
 *
 * TaskBoard reads three fields out of a record and nothing else: the id named by `dataKey`, the
 * column named by `columnField` and — on a grouped board — the row named by `swimlaneField`. Every
 * other field is the application's, and travels untouched through the contexts and the payloads.
 *
 * The optional properties below are the ones the supplied card UI knows how to draw. They are
 * conveniences, not a schema: a board of tickets, shipments or leads is expected to carry its own
 * fields instead.
 *
 * @group Interface
 */
export interface TaskBoardItem {
    /** Value of the field named by `dataKey`. Identity of the card. */
    id?: string | number;
    /** Text shown by the supplied card UI. */
    title?: string;
    /** Secondary text shown by the supplied card UI, clamped to two lines. */
    description?: string;
    /** Column the card belongs to, when `columnField` is left at its usual `columnId`. */
    columnId?: string | number;
    /** Where the card sits inside its column or swimlane cell. Rewritten by an accepted reorder. */
    order?: number;
    /** Weight of the card, drawn as a badge by the advanced card UI. */
    priority?: TaskBoardPriority;
    /** Labels drawn as tags. */
    tags?: string[];
    /** Single owner, drawn as one avatar. */
    assignee?: string;
    /** Several owners, drawn as a stacked avatar group. */
    assignees?: string[];
    /** Completion between 0 and 100, drawn as a progress bar. */
    progress?: number;
    /** When the card is due. Overdue dates are drawn in the blocked colour. */
    dueDate?: Date | string | number;
    /** Sub-items, drawn as a `done/total` count. */
    subtasks?: TaskBoardSubtask[];
    /** Whether this card can be moved with the pointer, overriding the board's `draggable`. */
    draggable?: boolean;
    /** Whether this card refuses selection, activation and movement. */
    disabled?: boolean;
    /** Any extra payload. */
    [key: string]: any;
}

/**
 * The item shape the supplied card UI was written against.
 *
 * Kept as a named alias so a board that has no domain model of its own can still be typed. New code
 * should reach for {@link TaskBoardItem} and add its own fields.
 *
 * @group Interface
 */
export interface TaskBoardTask extends TaskBoardItem {
    /** Identity of the card. Required in this shape, unlike the open one. */
    id: string | number;
    /** Text of the card. */
    title: string;
}

/**
 * One entry of {@link TaskBoardItem.subtasks}.
 *
 * @group Interface
 */
export interface TaskBoardSubtask {
    /** Identity of the sub-item. */
    id?: string | number;
    /** Text of the sub-item. */
    title?: string;
    /** Whether it is finished. Counted by the `done/total` badge. */
    completed?: boolean;
    /** Any extra payload. */
    [key: string]: any;
}

/**
 * Weight of a card. Drives the priority badge of the advanced card UI.
 *
 * @group Types
 */
export type TaskBoardPriority = 'critical' | 'high' | 'medium' | 'low';

/**
 * The workflow families a column can belong to.
 *
 * Each one adds a `p-taskboard-column-<type>` class, which is what paints the strip above the
 * column header.
 *
 * @group Types
 */
export type TaskBoardColumnStatusType = 'todo' | 'in-progress' | 'done' | 'blocked';

/**
 * A workflow column.
 *
 * @group Interface
 */
export interface TaskBoardColumnModel {
    /** Identity of the column, matched against each item's `columnField`. */
    id: string | number;
    /** Visible and accessible name of the column. */
    label: string;
    /** Sorts the columns before rendering. A missing value sorts as `0`. */
    order?: number;
    /** Workflow family, which paints the strip above the header. */
    statusType?: TaskBoardColumnStatusType;
    /** How many cards the column is meant to hold. Drives the WIP warning and exceeded states. */
    wipLimit?: number;
    /** Seeds the collapsed state. Runtime changes live in the board state, not in this object. */
    collapsed?: boolean;
    /** Whether the column refuses to be dragged, and refuses to be displaced by another reorder. */
    locked?: boolean;
    /** Whether the column sticks to the leading edge while the board scrolls. */
    pinned?: boolean;
    /** Columns a card may arrive FROM. An empty or missing list allows every source. */
    allowedTransitionsFrom?: (string | number)[];
    /** Columns a card may leave TO. An empty or missing list allows every target. */
    allowedTransitionsTo?: (string | number)[];
    /** Item fields that must carry a value before a card may enter the column. */
    requiredFields?: string[];
    /** Whether entering the column needs a confirmation. A string is used as the message. */
    confirmOnEnter?: boolean | string;
    /** Accent colour of the column. Any CSS colour. */
    color?: string;
    /** Icon name the application's header UI may draw. */
    icon?: string;
    /** Any extra payload. */
    [key: string]: any;
}

/**
 * A swimlane: the second grouping dimension, drawn as a row of cells across the same columns.
 *
 * @group Interface
 */
export interface TaskBoardSwimlane {
    /** Identity of the row, matched against each item's `swimlaneField`. */
    id: string | number;
    /** Visible and accessible name of the row. */
    label: string;
    /** Sorts the rows before rendering. A missing value sorts as `0`. */
    order?: number;
    /** Seeds the collapsed state. */
    collapsed?: boolean;
    /** Alternative key an application may group by. Carried through, never read by the runtime. */
    key?: string;
    /** Any extra payload. */
    [key: string]: any;
}

/**
 * A phase header drawn above a run of columns.
 *
 * @group Interface
 */
export interface TaskBoardColumnGroup {
    /** Text of the header. */
    label: string;
    /** Columns the header spans, by id. */
    columns: (string | number)[];
    /** Accent colour of the underline. Falls back to the board accent. */
    color?: string;
    /** Any extra payload. */
    [key: string]: any;
}

/**
 * The feature switches.
 *
 * Every flag defaults to enabled when the object — or the flag — is left out, so a partial map only
 * has to name what it wants to turn OFF. `columnReorder` is the exception: the board also needs
 * `columnReorderable`, because a reorderable board is a deliberate choice and not a default.
 *
 * @group Interface
 */
export interface TaskBoardFeatures {
    /** Whether cards can be moved with the pointer or the keyboard. */
    dragDrop?: boolean;
    /** Whether columns can be collapsed. */
    columnCollapse?: boolean;
    /** Whether columns can be reordered, given `columnReorderable`. */
    columnReorder?: boolean;
    /** Whether the swimlane grid is active. */
    swimlanes?: boolean;
    /** Whether `wipLimit` takes part in move validation. */
    wipLimits?: boolean;
    /** Whether the context-menu payload is emitted. */
    contextMenu?: boolean;
    /** Whether cards can be selected. */
    cardSelection?: boolean;
    /** Whether the transition rules take part in move validation. */
    transitionRules?: boolean;
    /** Whether `requiredFields` takes part in move validation. */
    validation?: boolean;
    /** Whether accepted mutations are recorded for undo and redo. */
    history?: boolean;
}

/**
 * What the current viewer is allowed to do.
 *
 * A client-side interaction guard, not authorisation: it decides what the board offers, never what
 * the server accepts.
 *
 * @group Interface
 */
export interface TaskBoardAccess {
    /** Name of the role. Carried through for the application's own menus and copy. */
    role?: string;
    /** Whether cards can be dragged. */
    canDrag?: boolean;
    /** Whether cards can be edited. */
    canEdit?: boolean;
    /** Whether cards can be created. */
    canCreate?: boolean;
    /** Whether cards can be deleted. */
    canDelete?: boolean;
    /** Whether columns can be reordered. */
    canReorderColumns?: boolean;
    /** Per-column overrides, keyed by column id. */
    columnAccess?: Record<string | number, TaskBoardColumnAccess>;
}

/**
 * Per-column entry of {@link TaskBoardAccess.columnAccess}.
 *
 * @group Interface
 */
export interface TaskBoardColumnAccess {
    /** Whether the column is rendered at all. A hidden column keeps its cards in the data. */
    canView?: boolean;
    /** Whether a card may be moved INTO the column. */
    canMoveIn?: boolean;
    /** Whether a card may be moved OUT of the column. */
    canMoveOut?: boolean;
}

/**
 * How a click builds the selection.
 *
 * @group Types
 */
export type TaskBoardSelectionMode = 'none' | 'single' | 'multiple';

/**
 * How tightly the board is packed. Adds a `p-taskboard-density-<value>` class on the root.
 *
 * @group Types
 */
export type TaskBoardDensity = 'compact' | 'standard' | 'comfortable';

/**
 * Why a drop was refused.
 *
 * @group Types
 */
export type TaskBoardBlockedReason = 'transition-rule' | 'wip-limit' | 'validation' | 'access' | 'locked';

/**
 * What asked for the card to be opened.
 *
 * @group Types
 */
export type TaskBoardActivateOrigin = 'pointer' | 'keyboard';

/**
 * Payload of `cardMove`.
 *
 * @group Interface
 */
export interface TaskBoardCardMovePayload<T extends TaskBoardItem = TaskBoardItem> {
    /** The card that moved. */
    card: T;
    /** Column the card came from. */
    oldColumnId: string | number;
    /** Column the card landed in. */
    newColumnId: string | number;
    /** Position inside the source cell. */
    oldIndex: number;
    /** Position inside the target cell. */
    newIndex: number;
    /** Swimlane the card came from, on a grouped board. */
    oldSwimlaneId?: string | number;
    /** Swimlane the card landed in, on a grouped board. */
    newSwimlaneId?: string | number;
}

/**
 * Payload of `cardReorder`.
 *
 * @group Interface
 */
export interface TaskBoardCardReorderPayload<T extends TaskBoardItem = TaskBoardItem> {
    /** The card that moved. */
    card: T;
    /** Column the reorder happened in. */
    columnValue: string | number;
    /** Position before the reorder. */
    oldIndex: number;
    /** Position after the reorder. */
    newIndex: number;
    /** Swimlane the reorder happened in, on a grouped board. */
    swimlaneId?: string | number;
}

/**
 * Payload of `cardClick`.
 *
 * @group Interface
 */
export interface TaskBoardCardClickPayload<T extends TaskBoardItem = TaskBoardItem> {
    /** The card that was clicked. */
    card: T;
    /** Column it belongs to. */
    column?: TaskBoardColumnModel;
    /** The original DOM event. */
    jsEvent: MouseEvent;
}

/**
 * Payload of `cardDblclick`.
 *
 * @group Interface
 */
export interface TaskBoardCardDblclickPayload<T extends TaskBoardItem = TaskBoardItem> {
    /** The card that was double-clicked. */
    card: T;
    /** Column it belongs to. */
    column?: TaskBoardColumnModel;
    /** The original DOM event. */
    jsEvent: MouseEvent;
}

/**
 * Payload of `cardActivate`: an intentional request to OPEN the card.
 *
 * @group Interface
 */
export interface TaskBoardCardActivatePayload<T extends TaskBoardItem = TaskBoardItem> {
    /** The card being opened. */
    card: T;
    /** Column it belongs to. */
    column?: TaskBoardColumnModel;
    /** Whether the pointer or the keyboard asked for it. */
    origin: TaskBoardActivateOrigin;
    /** The original DOM event, when there was one. */
    jsEvent?: Event;
}

/**
 * Payload of `cardSelect`, which describes ONE affected card.
 *
 * @group Interface
 */
export interface TaskBoardCardSelectPayload<T extends TaskBoardItem = TaskBoardItem> {
    /** The card whose state changed. */
    card: T;
    /** Whether it ended up selected. */
    selected: boolean;
}

/**
 * Payload of `selectionChange`, which describes the WHOLE selection.
 *
 * @group Interface
 */
export interface TaskBoardSelectionChangePayload<T extends TaskBoardItem = TaskBoardItem> {
    /** Ids of every selected card. */
    selectedIds: (string | number)[];
    /** The selected cards themselves. */
    cards: T[];
}

/**
 * Payload of `cardCreate`.
 *
 * @group Interface
 */
export interface TaskBoardCardCreatePayload<T extends TaskBoardItem = TaskBoardItem> {
    /** The new card. */
    card: T;
    /** Column it was created in. */
    column?: TaskBoardColumnModel;
}

/**
 * Payload of `cardUpdate`.
 *
 * @group Interface
 */
export interface TaskBoardCardUpdatePayload<T extends TaskBoardItem = TaskBoardItem> {
    /** The card after the change. */
    card: T;
    /** The card before the change. */
    oldCard: T;
}

/**
 * Payload of `cardDelete`.
 *
 * @group Interface
 */
export interface TaskBoardCardDeletePayload<T extends TaskBoardItem = TaskBoardItem> {
    /** The card that was removed. */
    card: T;
    /** Column it was removed from. */
    column?: TaskBoardColumnModel;
}

/**
 * Payload of `cardDropBlocked`.
 *
 * @group Interface
 */
export interface TaskBoardCardDropBlockedPayload<T extends TaskBoardItem = TaskBoardItem> {
    /** The card whose move was refused. */
    task: T;
    /** Column it tried to enter. */
    targetColumn?: TaskBoardColumnModel;
    /** Why it was refused. */
    reason: TaskBoardBlockedReason;
    /** Message meant to be shown to the user. */
    message: string;
    /** Fields that were missing, when the reason is `validation`. */
    failedFields?: string[];
}

/**
 * Payload of `columnCollapse`.
 *
 * @group Interface
 */
export interface TaskBoardColumnCollapsePayload {
    /** The column that was toggled. */
    column: TaskBoardColumnModel;
    /** Whether it ended up collapsed. */
    collapsed: boolean;
}

/**
 * Payload of `columnReorder`.
 *
 * @group Interface
 */
export interface TaskBoardColumnReorderPayload {
    /** The columns in their new order. */
    columns: TaskBoardColumnModel[];
    /** Where the moved column was. */
    oldIndex: number;
    /** Where it ended up. */
    newIndex: number;
}

/**
 * Payload of `swimlaneCollapse`.
 *
 * @group Interface
 */
export interface TaskBoardSwimlaneCollapsePayload {
    /** The row that was toggled. */
    swimlane: TaskBoardSwimlane;
    /** Whether it ended up collapsed. */
    collapsed: boolean;
}

/**
 * Payload of `dragStart`.
 *
 * @group Interface
 */
export interface TaskBoardDragStartPayload<T extends TaskBoardItem = TaskBoardItem> {
    /** The card being dragged. */
    card: T;
    /** Column it started in. */
    column?: TaskBoardColumnModel;
    /** The original DOM event. */
    jsEvent: PointerEvent | MouseEvent;
}

/**
 * Payload of `dragEnd`.
 *
 * Analytics, not persistence: persist the accepted change from `cardMove` instead, which only fires
 * when the move was actually applied.
 *
 * @group Interface
 */
export interface TaskBoardDragEndPayload<T extends TaskBoardItem = TaskBoardItem> {
    /** The card that was dragged. */
    card: T;
    /** Column it started in. */
    oldColumn?: TaskBoardColumnModel;
    /** Column it was released over. */
    newColumn?: TaskBoardColumnModel;
    /** Position it started at. */
    oldIndex: number;
    /** Position it was released at. */
    newIndex: number;
}

/**
 * Payload of `dragCancel`.
 *
 * @group Interface
 */
export interface TaskBoardDragCancelPayload<T extends TaskBoardItem = TaskBoardItem> {
    /** The card whose drag was abandoned. */
    card: T;
    /** Column it started in. */
    column?: TaskBoardColumnModel;
}

/**
 * Payload of `cardContextMenu`.
 *
 * @group Interface
 */
export interface TaskBoardCardContextMenuPayload<T extends TaskBoardItem = TaskBoardItem> {
    /** The card under the pointer, when there was one. */
    card?: T;
    /** Column the pointer was over. */
    column?: TaskBoardColumnModel;
    /** Where to open the menu. */
    position: { x: number; y: number };
    /** The original DOM event. */
    jsEvent: MouseEvent;
}

/**
 * Options of `exportToCSV` and `downloadCSV`.
 *
 * @group Interface
 */
export interface TaskBoardCsvExportOptions {
    /** Item fields to write, in order. */
    fields?: string[];
    /** Column separator. */
    delimiter?: string;
    /** Whether the first row carries the field names. */
    includeHeader?: boolean;
    /** How an array value is flattened into one cell. */
    arrayJoiner?: string;
}

/**
 * What `serializeState` saves and `restoreState` applies.
 *
 * UI state only. The cards, the query, the access rules and the workflow rules stay with the
 * application: a snapshot that carried them would go stale the moment the data moved on.
 *
 * @group Interface
 */
export interface TaskBoardStateSnapshot {
    /** Ids of the collapsed columns. */
    collapsedColumnIds?: (string | number)[];
    /** Ids of the collapsed swimlanes. */
    collapsedSwimlaneIds?: (string | number)[];
    /** Ids of the selected cards. */
    selectedCardIds?: (string | number)[];
    /** Id of the last focused card. */
    focusedCardId?: string | number | null;
    /** When the snapshot was taken, in milliseconds. */
    timestamp?: number;
}

/**
 * One line of the audit log.
 *
 * @group Interface
 */
export interface TaskBoardAuditEntry {
    /** What happened. */
    action: 'move' | 'reorder' | 'create' | 'update' | 'delete' | 'blocked';
    /** When it happened, in milliseconds. */
    timestamp: number;
    /** Card it happened to. */
    taskId?: string | number;
    /** Column it came from. */
    fromColumnId?: string | number;
    /** Column it went to. */
    toColumnId?: string | number;
    /** Swimlane it came from. */
    fromSwimlaneId?: string | number;
    /** Swimlane it went to. */
    toSwimlaneId?: string | number;
    /** Why it was refused, when the action is `blocked`. */
    reason?: TaskBoardBlockedReason;
}

/**
 * What `exportToJSON` produces.
 *
 * @group Interface
 */
export interface TaskBoardJsonExport<T extends TaskBoardItem = TaskBoardItem> {
    /** The columns the board received. */
    columns: TaskBoardColumnModel[];
    /** The cards the board received. */
    tasks: T[];
    /** The swimlanes the board received. */
    swimlanes: TaskBoardSwimlane[];
    /** When the export was produced, as an ISO instant. */
    exportedAt: string;
}

/**
 * The imperative surface of the root, as a type.
 *
 * A toolbar that only needs to command the board can depend on this instead of on the component
 * class, which keeps the coupling to the documented methods.
 *
 * @group Interface
 */
export interface TaskBoardExpose<T extends TaskBoardItem = TaskBoardItem> {
    /** The visible columns, in render order. */
    getColumns(): TaskBoardColumnModel[];
    /** One visible column, by id. */
    getColumnById(id: string | number): TaskBoardColumnModel | undefined;
    /** Every card the board received. */
    getTasks(): T[];
    /** One card, by the value of its `dataKey` field. */
    getTaskById(id: string | number): T | undefined;
    /** The cards of one column, in render order. */
    getTasksByColumn(columnId: string | number, swimlaneId?: string | number): T[];
    /** Ids of the selected cards. */
    getSelectedCardIds(): (string | number)[];
    /** The selected cards. */
    getSelectedCards(): T[];
    /** Replaces the selection. */
    setSelectedCards(ids: (string | number)[]): void;
    /** Empties the selection. */
    clearSelection(): void;
    /** Adds a card. */
    addTask(task: T, columnId?: string | number, index?: number): void;
    /** Replaces a card, matched by its id. */
    updateTask(task: T): void;
    /** Removes a card. */
    removeTask(id: string | number): void;
    /** Moves a card, using the configured field mapping. */
    moveTask(taskId: string | number, columnId: string | number, index?: number, swimlaneId?: string | number): void;
    /** Collapses a column. */
    collapseColumn(id: string | number): void;
    /** Expands a column. */
    expandColumn(id: string | number): void;
    /** Toggles a column. */
    toggleColumn(id: string | number): void;
    /** Collapses a swimlane. */
    collapseSwimlane(id: string | number): void;
    /** Expands a swimlane. */
    expandSwimlane(id: string | number): void;
    /** Toggles a swimlane. */
    toggleSwimlane(id: string | number): void;
    /** Brings a column into view. */
    scrollToColumn(id: string | number): void;
    /** Brings a card into view. */
    scrollToCard(id: string | number): void;
    /** Applies the previous history entry. */
    undo(): void;
    /** Applies the next history entry. */
    redo(): void;
    /** Whether there is anything to undo. */
    canUndo(): boolean;
    /** Whether there is anything to redo. */
    canRedo(): boolean;
    /** Empties the history. */
    clearHistory(): void;
    /** The board data as pretty JSON. */
    exportToJSON(): string;
    /** The cards as CSV. */
    exportToCSV(options?: TaskBoardCsvExportOptions): string;
    /** Downloads the JSON export. */
    downloadJSON(filename?: string): void;
    /** Downloads the CSV export. */
    downloadCSV(filename?: string, options?: TaskBoardCsvExportOptions): void;
    /** Prepares the board as the print target and opens the browser dialog. */
    print(): void;
    /** The UI state, as a snapshot. */
    serializeState(): TaskBoardStateSnapshot;
    /** Applies whichever fields a snapshot carries. */
    restoreState(state: TaskBoardStateSnapshot): void;
    /** Whether the licence check passed. Always true in this build. */
    licenseValid(): boolean;
    /** What the licence check had to say. */
    licenseMessage(): string;
    /** The recorded actions. */
    getAuditLog(): TaskBoardAuditEntry[];
    /** Empties the audit log. */
    clearAuditLog(): void;
}

/**
 * Custom passthrough options of the TaskBoard root.
 *
 * @see {@link TaskBoardPassThrough}
 * @group Interface
 */
export interface TaskBoardPassThroughOptions<I = unknown> {
    /**
     * Used to pass attributes to the root's DOM element.
     */
    root?: PassThroughOption<HTMLElement, I>;
}

/**
 * Custom passthrough of the TaskBoard root.
 *
 * @see {@link TaskBoardPassThroughOptions}
 * @group Types
 */
export type TaskBoardPassThrough<I = unknown> = PassThrough<I, TaskBoardPassThroughOptions<I>>;

/**
 * Custom passthrough options of a TaskBoard column.
 *
 * @see {@link TaskBoardColumnPassThrough}
 * @group Interface
 */
export interface TaskBoardColumnPassThroughOptions<I = unknown> {
    /**
     * Used to pass attributes to the column's DOM element.
     */
    root?: PassThroughOption<HTMLElement, I>;
    /**
     * Used to pass attributes to the column header's DOM element.
     */
    header?: PassThroughOption<HTMLElement, I>;
    /**
     * Used to pass attributes to the column body's DOM element.
     */
    body?: PassThroughOption<HTMLElement, I>;
    /**
     * Used to pass attributes to the column footer's DOM element.
     */
    footer?: PassThroughOption<HTMLElement, I>;
}

/**
 * Custom passthrough of a TaskBoard column.
 *
 * @see {@link TaskBoardColumnPassThroughOptions}
 * @group Types
 */
export type TaskBoardColumnPassThrough<I = unknown> = PassThrough<I, TaskBoardColumnPassThroughOptions<I>>;

/**
 * Custom passthrough options of a TaskBoard card.
 *
 * @see {@link TaskBoardCardPassThrough}
 * @group Interface
 */
export interface TaskBoardCardPassThroughOptions<I = unknown> {
    /**
     * Used to pass attributes to the card's DOM element.
     */
    root?: PassThroughOption<HTMLElement, I>;
}

/**
 * Custom passthrough of a TaskBoard card.
 *
 * @see {@link TaskBoardCardPassThroughOptions}
 * @group Types
 */
export type TaskBoardCardPassThrough<I = unknown> = PassThrough<I, TaskBoardCardPassThroughOptions<I>>;
