import { InjectionToken, Signal, inject } from '@angular/core';
import type { SchedulerCategory, SchedulerEvent, SchedulerResource, SchedulerViewType } from '@openng/optimus-ui/types/scheduler';

/**
 * Read-only contexts handed to the Scheduler definition children, plus the `injectScheduler*Context`
 * helpers they use to read them.
 *
 * Every context is exposed as a `Signal<T>`: a definition template is stamped once per surface and
 * then updated in place as the data changes, so a child component that captured a plain object would
 * go stale. Signals also mean a reusable child part needs no inputs and no prop drilling — it asks
 * for the context of whichever surface it was placed under.
 *
 * @module scheduler-context
 */

/**
 * Context of any event surface.
 */
export interface SchedulerEventContext<T extends SchedulerEvent = SchedulerEvent> {
    /**
     * The event being rendered.
     *
     * With a `timeZone` set this is the RENDERED copy, whose `start` and `end` read as the wall clock
     * of that zone so a template can format them directly. It is not the instant to persist: every
     * output — `eventClick`, `eventChange`, the drag payloads — hands over the bound event with its
     * real instants instead.
     */
    event: T;
    /** Text of the event, already resolved from `titleField`. */
    title: string;
    /** Localised time range of the event, e.g. `09:00 - 10:30`. */
    timeText: string;
    /** The view the surface belongs to. */
    view: SchedulerViewType;
    /** Colour resolved from the event's category or resource, when there is one. */
    accentColor?: string;
    /** Category the event resolved to. */
    category?: SchedulerCategory;
    /** Resource the event belongs to. */
    resource?: SchedulerResource;
    /** Whether the event is part of the current selection. */
    selected: boolean;
    /** Whether keyboard focus is on the event. */
    focused: boolean;
    /** Whether the event is being dragged. */
    dragging: boolean;
    /** Whether the event is being resized. */
    resizing: boolean;
    /** Whether the event can be moved with the pointer. */
    draggable: boolean;
    /** Whether the event can be resized with the pointer, which is what a card draws handles for. */
    resizable: boolean;
    /** Whether the event starts before the visible range. */
    continuesBefore: boolean;
    /** Whether the event ends after the visible range. */
    continuesAfter: boolean;
    /** Height available to the surface in pixels, so a card can drop detail when cramped. */
    availableHeight?: number;
    /** Width available to the surface in pixels. */
    availableWidth?: number;
}

/**
 * Context of any date or time cell.
 */
export interface SchedulerCellContext {
    /** Start of the cell. */
    date: Date;
    /** Localised label of the cell. */
    label: string;
    /** `YYYY-MM-DD` key of the cell, matching the `data-date` attribute. */
    dateKey: string;
    /** Events that fall in the cell. */
    events: SchedulerEvent[];
    /** How many events fall in the cell, including the ones that did not fit. */
    count: number;
    /** Whether the cell is today. */
    today: boolean;
    /** Whether the cell is a weekend day. */
    weekend: boolean;
    /** Whether the cell belongs to a month other than the one being shown. */
    otherMonth: boolean;
    /** Whether the cell falls within business hours. */
    businessHours: boolean;
    /** Whether the cell is blocked and cannot take an appointment. */
    blocked: boolean;
    /** Whether the cell is part of the current date selection. */
    selected: boolean;
    /** Whether the cell is disabled. */
    disabled: boolean;
    /** Resource of the cell, in the views that group by resource. */
    resource?: SchedulerResource;
}

/**
 * Context of a label in the time gutter.
 */
export interface SchedulerTimeGutterContext {
    /** Instant the label refers to. */
    date: Date;
    /** Localised time label, e.g. `09:30`. */
    label: string;
    /** Hour of the slot. */
    hour: number;
    /** Minute of the slot. */
    minute: number;
    /** Whether the slot sits on a whole hour, which is where a label is normally printed. */
    major: boolean;
}

/**
 * Context of the "+N more" link of a month cell.
 */
export interface SchedulerMoreLinkContext {
    /** Day the overflow belongs to. */
    date: Date;
    /** How many events did not fit. */
    count: number;
    /** The events that did not fit. */
    events: SchedulerEvent[];
    /** Localised label, e.g. `+2 more`. */
    label: string;
    /** Opens the overflow popover for this cell. */
    open: () => void;
}

/**
 * Context of a resource row, group or column header.
 */
export interface SchedulerResourceContext {
    /** The resource. */
    resource: SchedulerResource;
    /** Name of the resource, resolved from its field. */
    title: string;
    /** Depth in the resource hierarchy, 0 for a root. */
    depth: number;
    /** Whether the resource has children. */
    group: boolean;
    /** Whether the group is expanded. */
    expanded: boolean;
    /** Toggles the expansion of a group. */
    toggle: () => void;
    /** Events of the resource inside the visible range. */
    events: SchedulerEvent[];
    /** How many events the resource has in range. */
    count: number;
    /** Configured capacity of the resource, when it has one. */
    capacity?: number;
}

/**
 * Context of the weekday header row of the month grid.
 */
export interface SchedulerMonthHeaderContext {
    /** Localised weekday names, already rotated to `firstDayOfWeek`. */
    weekdays: string[];
}

/**
 * Context of a mini month in the year view.
 */
export interface SchedulerMiniMonthContext {
    /** First day of the month. */
    monthDate: Date;
    /** Localised month name. */
    monthName: string;
    /** Full label of the month, including the year. */
    monthLabel: string;
    /** The weeks of the month, as rows of days. */
    weeks: Date[][];
}

/**
 * Context of the agenda date group header.
 */
export interface SchedulerAgendaDateHeaderContext {
    /** Day of the group. */
    date: Date;
    /** Localised date. */
    formattedDate: string;
    /** Localised weekday name. */
    dayName: string;
    /** How many events the group holds. */
    count: number;
    /** Whether the group is today. */
    today: boolean;
}

/**
 * Context of the header region.
 */
export interface SchedulerHeaderContext {
    /** Active view. */
    view: SchedulerViewType;
    /** Anchor date. */
    date: Date;
    /** Title of the visible range. */
    title: string;
    /** Views offered by the view selector. */
    views: SchedulerViewType[];
    /** Moves to the previous range. */
    prev: () => void;
    /** Moves to the next range. */
    next: () => void;
    /** Moves to today. */
    today: () => void;
    /** Switches view. */
    setView: (view: SchedulerViewType) => void;
}

/**
 * Context of the category legend.
 */
export interface SchedulerCategoryLegendContext {
    /** The categories, each with the count of events in range. */
    categories: (SchedulerCategory & { count: number; active: boolean })[];
    /** Whether legend items toggle a filter. */
    filterable: boolean;
    /** Whether a filter is currently active. */
    filtering: boolean;
    /** Toggles the filter of a category. */
    toggle: (id: string | number) => void;
    /** Clears every filter. */
    clear: () => void;
}

/**
 * Context of the selection toolbar.
 */
export interface SchedulerSelectionToolbarContext {
    /** The selected events. */
    events: SchedulerEvent[];
    /** Ids of the selected events. */
    selectedIds: (string | number)[];
    /** Whether anything is selected. */
    active: boolean;
    /** Clears the selection. */
    clear: () => void;
    /** Asks the application to delete the selected events. */
    remove: () => void;
}

/**
 * Context of the overflow popover.
 */
export interface SchedulerMorePopoverContext {
    /** Day the overflow belongs to. */
    date?: Date;
    /** Resource the overflow belongs to. */
    resource?: SchedulerResource;
    /** Every event of the cell, not only the ones that overflowed. */
    events: SchedulerEvent[];
    /** Whether the popover is open. */
    visible: boolean;
    /** Closes the popover. */
    close: () => void;
}

/**
 * Context of the quick info, event popover and context menu overlays.
 */
export interface SchedulerEventOverlayContext {
    /** Event the overlay is anchored to. */
    event?: SchedulerEvent;
    /** Whether the overlay is open. */
    visible: boolean;
    /** Closes the overlay. */
    close: () => void;
    /** Asks the application to edit the event. */
    edit: () => void;
    /** Asks the application to delete the event. */
    remove: () => void;
}

function contextToken<T>(name: string) {
    return new InjectionToken<Signal<T>>(name);
}

/** @internal */
export const SCHEDULER_EVENT_CONTEXT = contextToken<SchedulerEventContext>('SCHEDULER_EVENT_CONTEXT');
/** @internal */
export const SCHEDULER_CELL_CONTEXT = contextToken<SchedulerCellContext>('SCHEDULER_CELL_CONTEXT');
/** @internal */
export const SCHEDULER_RESOURCE_ROW_CONTEXT = contextToken<SchedulerResourceContext>('SCHEDULER_RESOURCE_ROW_CONTEXT');
/** @internal */
export const SCHEDULER_RESOURCE_GROUP_CONTEXT = contextToken<SchedulerResourceContext>('SCHEDULER_RESOURCE_GROUP_CONTEXT');
/** @internal */
export const SCHEDULER_RESOURCE_COLUMN_HEADER_CONTEXT = contextToken<SchedulerResourceContext>('SCHEDULER_RESOURCE_COLUMN_HEADER_CONTEXT');
/** @internal */
export const SCHEDULER_RESOURCE_AGGREGATE_BADGE_CONTEXT = contextToken<SchedulerResourceContext>('SCHEDULER_RESOURCE_AGGREGATE_BADGE_CONTEXT');
/** @internal */
export const SCHEDULER_AGENDA_DATE_HEADER_CONTEXT = contextToken<SchedulerAgendaDateHeaderContext>('SCHEDULER_AGENDA_DATE_HEADER_CONTEXT');
/** @internal */
export const SCHEDULER_HEADER_CONTEXT = contextToken<SchedulerHeaderContext>('SCHEDULER_HEADER_CONTEXT');
/** @internal */
export const SCHEDULER_CATEGORY_LEGEND_CONTEXT = contextToken<SchedulerCategoryLegendContext>('SCHEDULER_CATEGORY_LEGEND_CONTEXT');
/** @internal */
export const SCHEDULER_SELECTION_TOOLBAR_CONTEXT = contextToken<SchedulerSelectionToolbarContext>('SCHEDULER_SELECTION_TOOLBAR_CONTEXT');
/** @internal */
export const SCHEDULER_MORE_POPOVER_CONTEXT = contextToken<SchedulerMorePopoverContext>('SCHEDULER_MORE_POPOVER_CONTEXT');
/** @internal */
export const SCHEDULER_QUICK_INFO_CONTEXT = contextToken<SchedulerEventOverlayContext>('SCHEDULER_QUICK_INFO_CONTEXT');
/** @internal */
export const SCHEDULER_EVENT_POPOVER_CONTEXT = contextToken<SchedulerEventOverlayContext>('SCHEDULER_EVENT_POPOVER_CONTEXT');
/** @internal */
export const SCHEDULER_CONTEXT_MENU_CONTEXT = contextToken<SchedulerEventOverlayContext>('SCHEDULER_CONTEXT_MENU_CONTEXT');

/**
 * Options of the context injection helpers.
 */
export interface SchedulerContextOptions {
    /**
     * When `true` the helper returns `null` outside its parent instead of throwing. Only for a part
     * deliberately built to render outside the Scheduler, such as an isolated preview: a normal UI
     * part should fail fast when it is placed under the wrong parent.
     */
    optional?: boolean;
}

/**
 * Reads a context token, or reports where it should have been.
 *
 * Returns `Signal<T> | null` and not `any`: with `{ optional: true }` the answer really can be
 * `null`, and the wrappers declare that through overloads so a caller cannot forget to check.
 */
function injectContext<T>(token: InjectionToken<Signal<T>>, parent: string, options?: SchedulerContextOptions): Signal<T> | null {
    const context = inject(token, { optional: true });
    if (!context && !options?.optional) {
        throw new Error(`[Scheduler] no context found. This component must be a descendant of <${parent}>.`);
    }
    return context ?? null;
}

/**
 * Reads the context of the enclosing event definition.
 * @group Function
 */
export function injectSchedulerEventContext<T extends SchedulerEvent = SchedulerEvent>(options: SchedulerContextOptions & { optional: true }): Signal<SchedulerEventContext<T>> | null;
export function injectSchedulerEventContext<T extends SchedulerEvent = SchedulerEvent>(options?: SchedulerContextOptions): Signal<SchedulerEventContext<T>>;
export function injectSchedulerEventContext<T extends SchedulerEvent = SchedulerEvent>(options?: SchedulerContextOptions): Signal<SchedulerEventContext<T>> | null {
    return injectContext(SCHEDULER_EVENT_CONTEXT as any, 'p-scheduler-event', options);
}

/**
 * Reads the context of the enclosing cell definition.
 * @group Function
 */
export function injectSchedulerCellContext(options: SchedulerContextOptions & { optional: true }): Signal<SchedulerCellContext> | null;
export function injectSchedulerCellContext(options?: SchedulerContextOptions): Signal<SchedulerCellContext>;
export function injectSchedulerCellContext(options?: SchedulerContextOptions): Signal<SchedulerCellContext> | null {
    return injectContext(SCHEDULER_CELL_CONTEXT, 'p-scheduler-month-cell', options);
}

/**
 * Reads the context of the enclosing resource row.
 * @group Function
 */
export function injectSchedulerResourceRowContext(options: SchedulerContextOptions & { optional: true }): Signal<SchedulerResourceContext> | null;
export function injectSchedulerResourceRowContext(options?: SchedulerContextOptions): Signal<SchedulerResourceContext>;
export function injectSchedulerResourceRowContext(options?: SchedulerContextOptions): Signal<SchedulerResourceContext> | null {
    return injectContext(SCHEDULER_RESOURCE_ROW_CONTEXT, 'p-scheduler-resource-row', options);
}

/**
 * Reads the context of the enclosing resource group.
 * @group Function
 */
export function injectSchedulerResourceGroupContext(options: SchedulerContextOptions & { optional: true }): Signal<SchedulerResourceContext> | null;
export function injectSchedulerResourceGroupContext(options?: SchedulerContextOptions): Signal<SchedulerResourceContext>;
export function injectSchedulerResourceGroupContext(options?: SchedulerContextOptions): Signal<SchedulerResourceContext> | null {
    return injectContext(SCHEDULER_RESOURCE_GROUP_CONTEXT, 'p-scheduler-resource-group', options);
}

/**
 * Reads the context of the enclosing resource column header.
 * @group Function
 */
export function injectSchedulerResourceColumnHeaderContext(options: SchedulerContextOptions & { optional: true }): Signal<SchedulerResourceContext> | null;
export function injectSchedulerResourceColumnHeaderContext(options?: SchedulerContextOptions): Signal<SchedulerResourceContext>;
export function injectSchedulerResourceColumnHeaderContext(options?: SchedulerContextOptions): Signal<SchedulerResourceContext> | null {
    return injectContext(SCHEDULER_RESOURCE_COLUMN_HEADER_CONTEXT, 'p-scheduler-resource-column-header', options);
}

/**
 * Reads the context of the enclosing aggregate badge.
 * @group Function
 */
export function injectSchedulerResourceAggregateBadgeContext(options: SchedulerContextOptions & { optional: true }): Signal<SchedulerResourceContext> | null;
export function injectSchedulerResourceAggregateBadgeContext(options?: SchedulerContextOptions): Signal<SchedulerResourceContext>;
export function injectSchedulerResourceAggregateBadgeContext(options?: SchedulerContextOptions): Signal<SchedulerResourceContext> | null {
    return injectContext(SCHEDULER_RESOURCE_AGGREGATE_BADGE_CONTEXT, 'p-scheduler-resource-aggregate-badge', options);
}

/**
 * Reads the context of the enclosing agenda date header.
 * @group Function
 */
export function injectSchedulerAgendaDateHeaderContext(options: SchedulerContextOptions & { optional: true }): Signal<SchedulerAgendaDateHeaderContext> | null;
export function injectSchedulerAgendaDateHeaderContext(options?: SchedulerContextOptions): Signal<SchedulerAgendaDateHeaderContext>;
export function injectSchedulerAgendaDateHeaderContext(options?: SchedulerContextOptions): Signal<SchedulerAgendaDateHeaderContext> | null {
    return injectContext(SCHEDULER_AGENDA_DATE_HEADER_CONTEXT, 'p-scheduler-agenda-date-header', options);
}

/**
 * Reads the context of the header region.
 * @group Function
 */
export function injectSchedulerHeaderContext(options: SchedulerContextOptions & { optional: true }): Signal<SchedulerHeaderContext> | null;
export function injectSchedulerHeaderContext(options?: SchedulerContextOptions): Signal<SchedulerHeaderContext>;
export function injectSchedulerHeaderContext(options?: SchedulerContextOptions): Signal<SchedulerHeaderContext> | null {
    return injectContext(SCHEDULER_HEADER_CONTEXT, 'p-scheduler-header', options);
}

/**
 * Reads the context of the category legend.
 * @group Function
 */
export function injectSchedulerCategoryLegendContext(options: SchedulerContextOptions & { optional: true }): Signal<SchedulerCategoryLegendContext> | null;
export function injectSchedulerCategoryLegendContext(options?: SchedulerContextOptions): Signal<SchedulerCategoryLegendContext>;
export function injectSchedulerCategoryLegendContext(options?: SchedulerContextOptions): Signal<SchedulerCategoryLegendContext> | null {
    return injectContext(SCHEDULER_CATEGORY_LEGEND_CONTEXT, 'p-scheduler-category-legend', options);
}

/**
 * Reads the context of the selection toolbar.
 * @group Function
 */
export function injectSchedulerSelectionToolbarContext(options: SchedulerContextOptions & { optional: true }): Signal<SchedulerSelectionToolbarContext> | null;
export function injectSchedulerSelectionToolbarContext(options?: SchedulerContextOptions): Signal<SchedulerSelectionToolbarContext>;
export function injectSchedulerSelectionToolbarContext(options?: SchedulerContextOptions): Signal<SchedulerSelectionToolbarContext> | null {
    return injectContext(SCHEDULER_SELECTION_TOOLBAR_CONTEXT, 'p-scheduler-selection-toolbar', options);
}

/**
 * Reads the context of the overflow popover.
 * @group Function
 */
export function injectSchedulerMorePopoverContext(options: SchedulerContextOptions & { optional: true }): Signal<SchedulerMorePopoverContext> | null;
export function injectSchedulerMorePopoverContext(options?: SchedulerContextOptions): Signal<SchedulerMorePopoverContext>;
export function injectSchedulerMorePopoverContext(options?: SchedulerContextOptions): Signal<SchedulerMorePopoverContext> | null {
    return injectContext(SCHEDULER_MORE_POPOVER_CONTEXT, 'p-scheduler-more-popover', options);
}

/**
 * Reads the context of the quick info overlay.
 * @group Function
 */
export function injectSchedulerQuickInfoContext(options: SchedulerContextOptions & { optional: true }): Signal<SchedulerEventOverlayContext> | null;
export function injectSchedulerQuickInfoContext(options?: SchedulerContextOptions): Signal<SchedulerEventOverlayContext>;
export function injectSchedulerQuickInfoContext(options?: SchedulerContextOptions): Signal<SchedulerEventOverlayContext> | null {
    return injectContext(SCHEDULER_QUICK_INFO_CONTEXT, 'p-scheduler-quick-info', options);
}

/**
 * Reads the context of the event popover.
 * @group Function
 */
export function injectSchedulerEventPopoverContext(options: SchedulerContextOptions & { optional: true }): Signal<SchedulerEventOverlayContext> | null;
export function injectSchedulerEventPopoverContext(options?: SchedulerContextOptions): Signal<SchedulerEventOverlayContext>;
export function injectSchedulerEventPopoverContext(options?: SchedulerContextOptions): Signal<SchedulerEventOverlayContext> | null {
    return injectContext(SCHEDULER_EVENT_POPOVER_CONTEXT, 'p-scheduler-popover', options);
}

/**
 * Reads the context of the context menu.
 * @group Function
 */
export function injectSchedulerContextMenuContext(options: SchedulerContextOptions & { optional: true }): Signal<SchedulerEventOverlayContext> | null;
export function injectSchedulerContextMenuContext(options?: SchedulerContextOptions): Signal<SchedulerEventOverlayContext>;
export function injectSchedulerContextMenuContext(options?: SchedulerContextOptions): Signal<SchedulerEventOverlayContext> | null {
    return injectContext(SCHEDULER_CONTEXT_MENU_CONTEXT, 'p-scheduler-context-menu', options);
}
