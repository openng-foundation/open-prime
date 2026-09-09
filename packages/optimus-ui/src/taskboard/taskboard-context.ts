import { InjectionToken, type Signal } from '@angular/core';
import type { TaskBoardAccess, TaskBoardColumnGroup, TaskBoardColumnModel, TaskBoardDensity, TaskBoardFeatures, TaskBoardItem, TaskBoardSelectionMode, TaskBoardSwimlane } from '@openng/optimus-ui/types/taskboard';

/**
 * The typed contexts each compound scope provides, and the tokens a child asks for them with.
 *
 * A part does not hand its state down as inputs: it PROVIDES a context, and whatever renders inside
 * injects the one it needs. That is what lets an application drop its own card component into
 * `<p-taskboard-card>` without threading `selected`, `focused` and `dragging` through every wrapper
 * on the way — and what lets the same component be reused under a different board.
 *
 * Every value is a `Signal<T>`. The parts are stamped once and updated in place, so a child that
 * captured a plain object would keep rendering the card it was first given.
 *
 * @module taskboard-context
 */

/**
 * Context of one card.
 *
 * @group Interface
 */
export interface TaskBoardCardContext<T extends TaskBoardItem = TaskBoardItem> {
    /** The application record being rendered, exactly as it was passed in. */
    item: Signal<T>;
    /** Column the card currently sits in. */
    column: Signal<TaskBoardColumnModel | undefined>;
    /** Whether the card is part of the selection. */
    isSelected: Signal<boolean>;
    /** Whether the roving focus is on the card. */
    isFocused: Signal<boolean>;
    /** Effective disabled state: the card's own, the board's, or a read-only board. */
    isDisabled: Signal<boolean>;
    /** Whether this card is the source of the drag in progress. */
    isDragging: Signal<boolean>;
}

/**
 * Context of one column, or of one swimlane cell of that column.
 *
 * @group Interface
 */
export interface TaskBoardColumnContext<T extends TaskBoardItem = TaskBoardItem> {
    /** Value the column was registered with, matched against each item's `columnField`. */
    value: Signal<string | number>;
    /** Visible name of the column. */
    label: Signal<string>;
    /** The full column metadata, when the board was given any. */
    columnData: Signal<TaskBoardColumnModel | undefined>;
    /** How many cards the column holds, virtualisation aside. */
    itemCount: Signal<number>;
    /** Every card of the column, in board order. */
    items: Signal<T[]>;
    /**
     * The cards to RENDER.
     *
     * The same as `items` until virtual scroll is on, at which point it is the mounted window. A
     * template should loop over this and not over `items`, or the window has no effect.
     */
    visibleItems: Signal<T[]>;
    /** Whether the column is collapsed. */
    isCollapsed: Signal<boolean>;
    /** Toggles the collapsed state, honouring `columnCollapsible` and the feature flag. */
    toggleCollapse: () => void;
    /** Asks the board to add a card to this column. */
    addItem: (item: T) => void;
    /** @internal Where the mounted window starts, for the runtime viewport. */
    virtualStartIndex: Signal<number>;
    /** @internal Height of the spacer above the window, in pixels. */
    virtualPaddingTop: Signal<number>;
    /** @internal Height of the spacer below the window, in pixels. */
    virtualPaddingBottom: Signal<number>;
    /** @internal Turns a rendered index into an index into `items`. */
    toLogicalIndex: (renderedIndex: number) => number;
    /** @internal Key of this cell in the board index, for the runtime viewport. */
    cellKey: Signal<string>;
}

/**
 * Context of a swimlane row header.
 *
 * @group Interface
 */
export interface TaskBoardSwimlaneHeaderContext {
    /** The row. */
    swimlane: Signal<TaskBoardSwimlane>;
    /** How many cards the whole row holds, across every column. */
    itemCount: Signal<number>;
    /** Whether the row is collapsed. */
    isCollapsed: Signal<boolean>;
    /** Toggles the collapsed state. */
    toggleCollapse: () => void;
}

/**
 * Context of a column label inside the swimlane grid.
 *
 * @group Interface
 */
export interface TaskBoardSwimlaneColumnHeaderContext {
    /** The column. */
    column: Signal<TaskBoardColumnModel>;
    /** How many cards the column holds, across every row. */
    itemCount: Signal<number>;
}

/**
 * Context of an insertion marker.
 *
 * For display only: the accepted position arrives with `cardMove` or `cardReorder`, because the
 * marker the pointer is over is a proposal and the board may still refuse it.
 *
 * @group Interface
 */
export interface TaskBoardDropIndicatorContext {
    /** Column the marker belongs to. */
    column: Signal<TaskBoardColumnModel | undefined>;
    /** Rendered insertion position the marker stands for. */
    index: Signal<number>;
    /** Swimlane the marker belongs to, on a grouped board. */
    swimlane: Signal<TaskBoardSwimlane | undefined>;
}

/**
 * Context of the drag preview.
 *
 * @group Interface
 */
export interface TaskBoardDragPreviewContext<T extends TaskBoardItem = TaskBoardItem> {
    /** The card being dragged. */
    item: Signal<T | undefined>;
    /** How many cards are travelling, which is more than one on a multi-card drag. */
    count: Signal<number>;
    /** Column the drag started in. */
    column: Signal<TaskBoardColumnModel | undefined>;
}

/**
 * Context of the confirmation surface of a guarded move.
 *
 * @group Interface
 */
export interface TaskBoardDragConfirmContext<T extends TaskBoardItem = TaskBoardItem> {
    /** The card waiting on a decision. */
    task: Signal<T | undefined>;
    /** Column it would leave. */
    sourceColumn: Signal<TaskBoardColumnModel | undefined>;
    /** Column it would enter. */
    targetColumn: Signal<TaskBoardColumnModel | undefined>;
    /** The message `confirmOnEnter` asked for. */
    message: Signal<string>;
    /** Applies the held move. */
    confirm: () => void;
    /** Abandons the held move. */
    cancel: () => void;
}

/**
 * The whole board contract, as the runtime parts and the supplied UI see it.
 *
 * The advanced surface: an application component is better off injecting the narrow card, column,
 * swimlane or indicator context, and querying the `TaskBoard` component when it needs a command.
 * A toolbar coupled to this interface is coupled to the internals.
 *
 * @group Interface
 */
export interface TaskBoardContext<T extends TaskBoardItem = TaskBoardItem> {
    /** Every card the board received, `items` taking precedence over `tasks`. */
    items: Signal<T[]>;
    /** The visible columns, sorted and access-filtered. */
    columns: Signal<TaskBoardColumnModel[]>;
    /** The visible swimlanes, sorted. */
    swimlanes: Signal<TaskBoardSwimlane[]>;
    /** The phase headers. */
    columnGroups: Signal<TaskBoardColumnGroup[]>;
    /** Field holding the card id. */
    dataKey: Signal<string>;
    /** Field holding the card's column. */
    columnField: Signal<string>;
    /** Field holding the card's swimlane, when the board is grouped. */
    swimlaneField: Signal<string | undefined>;
    /** How a click builds the selection. */
    selectionMode: Signal<TaskBoardSelectionMode>;
    /** How tightly the board is packed. */
    density: Signal<TaskBoardDensity>;
    /** The feature switches, already merged with the defaults. */
    features: Signal<TaskBoardFeatures>;
    /** What the viewer is allowed to do. */
    access: Signal<TaskBoardAccess | undefined>;
    /** Whether the board is disabled. */
    disabled: Signal<boolean>;
    /** Whether the board is read-only. */
    readonly: Signal<boolean>;
    /** Whether the board lays out right to left. */
    rtl: Signal<boolean>;
    /** Ids of the selected cards. */
    selectedIds: Signal<(string | number)[]>;
    /** Id of the focused card. */
    focusedId: Signal<string | number | null>;
    /** Ids of the collapsed columns. */
    collapsedColumnIds: Signal<(string | number)[]>;
    /** Ids of the collapsed swimlanes. */
    collapsedSwimlaneIds: Signal<(string | number)[]>;
    /** The card the drag started from, when a drag is in progress. */
    draggingItem: Signal<T | undefined>;
    /** Ids of every card travelling with the current drag. */
    draggingIds: Signal<(string | number)[]>;
    /** Whether a card drag is in progress. */
    dragging: Signal<boolean>;
    /** Reads the id of a card, through `dataKey`. */
    idOf: (item: T) => string | number;
    /** Reads the column of a card, through `columnField`. */
    columnOf: (item: T) => string | number | undefined;
    /** Reads the swimlane of a card, through `swimlaneField`. */
    swimlaneOf: (item: T) => string | number | undefined;
    /** The cards of one cell, in board order. */
    itemsOf: (columnValue: string | number, swimlaneValue?: string | number) => T[];
    /** One visible column, by id. */
    columnById: (id: string | number) => TaskBoardColumnModel | undefined;
    /** Whether a column is collapsed. */
    isColumnCollapsed: (id: string | number) => boolean;
    /** Whether a swimlane is collapsed. */
    isSwimlaneCollapsed: (id: string | number) => boolean;
}

/**
 * Token of the board context. Available to any descendant of the root.
 *
 * @group Types
 */
export const TASKBOARD_CONTEXT = new InjectionToken<TaskBoardContext>('TASKBOARD_CONTEXT');

/**
 * Token of the column context. Available inside a column.
 *
 * @group Types
 */
export const TASKBOARD_COLUMN_CONTEXT = new InjectionToken<TaskBoardColumnContext>('TASKBOARD_COLUMN_CONTEXT');

/**
 * Token of the card context. Available inside a card.
 *
 * @group Types
 */
export const TASKBOARD_CARD_CONTEXT = new InjectionToken<TaskBoardCardContext>('TASKBOARD_CARD_CONTEXT');

/**
 * Token of the swimlane header context. Available inside a swimlane header.
 *
 * @group Types
 */
export const TASKBOARD_SWIMLANE_HEADER_CONTEXT = new InjectionToken<TaskBoardSwimlaneHeaderContext>('TASKBOARD_SWIMLANE_HEADER_CONTEXT');

/**
 * Token of the swimlane column header context. Available inside a swimlane column header.
 *
 * @group Types
 */
export const TASKBOARD_SWIMLANE_COLUMN_HEADER_CONTEXT = new InjectionToken<TaskBoardSwimlaneColumnHeaderContext>('TASKBOARD_SWIMLANE_COLUMN_HEADER_CONTEXT');

/**
 * Token of the drop indicator context. Available inside an authored indicator.
 *
 * @group Types
 */
export const TASKBOARD_DROP_INDICATOR_CONTEXT = new InjectionToken<TaskBoardDropIndicatorContext>('TASKBOARD_DROP_INDICATOR_CONTEXT');

/**
 * The render context a `pTaskBoardColumnDef` template is stamped with.
 *
 * Angular's microsyntax cannot read a signal, so the definition hands over the same values already
 * unwrapped. `$implicit` and `context` are the whole object, and the named fields let a template
 * pick one out with `let-itemCount="itemCount"`.
 *
 * @group Interface
 */
export interface TaskBoardColumnDefinitionContext<T extends TaskBoardItem = TaskBoardItem> {
    /** The whole context, for `let-columnContext`. */
    $implicit: TaskBoardColumnRenderContext<T>;
    /** The whole context again, for `let-columnContext="context"`. */
    context: TaskBoardColumnRenderContext<T>;
    /** Value the column was registered with. */
    value: string | number;
    /** Visible name of the column. */
    label: string;
    /** The full column metadata. */
    column: TaskBoardColumnModel | undefined;
    /** Every card of the column. */
    items: T[];
    /** The cards to render. */
    visibleItems: T[];
    /** How many cards the column holds. */
    itemCount: number;
    /** Whether the column is collapsed. */
    isCollapsed: boolean;
    /** Toggles the collapsed state. */
    toggleCollapse: () => void;
    /** Asks the board to add a card to this column. */
    addItem: (item: T) => void;
}

/**
 * The unwrapped column values, as `$implicit` of a column definition.
 *
 * @group Interface
 */
export interface TaskBoardColumnRenderContext<T extends TaskBoardItem = TaskBoardItem> {
    /** Value the column was registered with. */
    value: string | number;
    /** Visible name of the column. */
    label: string;
    /** The full column metadata. */
    column: TaskBoardColumnModel | undefined;
    /** Every card of the column. */
    items: T[];
    /** The cards to render. */
    visibleItems: T[];
    /** How many cards the column holds. */
    itemCount: number;
    /** Whether the column is collapsed. */
    isCollapsed: boolean;
    /** Toggles the collapsed state. */
    toggleCollapse: () => void;
    /** Asks the board to add a card to this column. */
    addItem: (item: T) => void;
}

/**
 * The render context a `pTaskBoardDragPreviewDef` template is stamped with.
 *
 * @group Interface
 */
export interface TaskBoardDragPreviewDefinitionContext<T extends TaskBoardItem = TaskBoardItem> {
    /** The whole context. */
    $implicit: { item: T | undefined; count: number; column: TaskBoardColumnModel | undefined };
    /** The whole context again. */
    context: { item: T | undefined; count: number; column: TaskBoardColumnModel | undefined };
    /** The card being dragged. */
    item: T | undefined;
    /** How many cards are travelling. */
    count: number;
    /** Column the drag started in. */
    column: TaskBoardColumnModel | undefined;
}

/**
 * The render context a `pTaskBoardDragConfirmDef` template is stamped with.
 *
 * @group Interface
 */
export interface TaskBoardDragConfirmDefinitionContext<T extends TaskBoardItem = TaskBoardItem> {
    /** The whole context. */
    $implicit: { task: T | undefined; sourceColumn: TaskBoardColumnModel | undefined; targetColumn: TaskBoardColumnModel | undefined; message: string };
    /** The whole context again. */
    context: { task: T | undefined; sourceColumn: TaskBoardColumnModel | undefined; targetColumn: TaskBoardColumnModel | undefined; message: string };
    /** The card waiting on a decision. */
    task: T | undefined;
    /** Column it would leave. */
    sourceColumn: TaskBoardColumnModel | undefined;
    /** Column it would enter. */
    targetColumn: TaskBoardColumnModel | undefined;
    /** The confirmation message. */
    message: string;
    /** Applies the held move. */
    confirm: () => void;
    /** Abandons the held move. */
    cancel: () => void;
}

/**
 * The render context a `pTaskBoardDropIndicatorDef` template is stamped with.
 *
 * @group Interface
 */
export interface TaskBoardDropIndicatorDefinitionContext {
    /** The whole context. */
    $implicit: { column: TaskBoardColumnModel | undefined; index: number; swimlane: TaskBoardSwimlane | undefined };
    /** The whole context again. */
    context: { column: TaskBoardColumnModel | undefined; index: number; swimlane: TaskBoardSwimlane | undefined };
    /** Column the marker belongs to. */
    column: TaskBoardColumnModel | undefined;
    /** Rendered insertion position. */
    index: number;
    /** Swimlane the marker belongs to. */
    swimlane: TaskBoardSwimlane | undefined;
}
