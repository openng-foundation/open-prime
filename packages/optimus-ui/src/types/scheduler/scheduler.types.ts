import type { PassThrough, PassThroughOption } from '@openng/optimus-ui/api';

/**
 * The view modes the Scheduler can render.
 *
 * The `timeline*` views lay time out horizontally over a day, a week, a month or a year; the
 * `resourceTimeline*` ones do the same with one lane per resource. The `resource*` views group rows
 * by resource, the `date*` views group columns by date and subdivide each one by resource.
 * Everything else is a plain calendar view.
 *
 * `timeline` and `resourceTimeline` are the day-scale timelines under their original names, kept as
 * aliases of `timelineDay` and `resourceTimelineDay`.
 *
 * @group Types
 */
export type SchedulerViewType =
    | 'day'
    | 'week'
    | 'month'
    | 'year'
    | 'agenda'
    | 'timeline'
    | 'timelineDay'
    | 'timelineWeek'
    | 'timelineMonth'
    | 'timelineYear'
    | 'resourceDay'
    | 'resourceWeek'
    | 'resourceMonth'
    | 'resourceTimeline'
    | 'resourceTimelineDay'
    | 'resourceTimelineWeek'
    | 'resourceTimelineMonth'
    | 'resourceTimelineYear'
    | 'dateDay'
    | 'dateWeek'
    | 'dateMonth';

/**
 * How far a timeline view spans. Derived from the view name by {@link timelineScaleOf}.
 *
 * @group Types
 */
export type SchedulerTimelineScale = 'day' | 'week' | 'month' | 'year';

/**
 * An appointment. `start`/`end` accept a `Date` or anything `new Date()` parses, so a payload
 * straight off a JSON API works without mapping.
 *
 * @group Interface
 */
export interface SchedulerEvent {
    /**
     * Unique identifier. Required: it is the tracking key of every list and the identity used by
     * selection, editing and the overlays.
     */
    id: string | number;
    /**
     * Text shown on the event.
     */
    title?: string;
    /**
     * Start of the appointment.
     */
    start: Date | string | number;
    /**
     * End of the appointment. When omitted the event lasts `defaultEventDuration` minutes.
     */
    end?: Date | string | number;
    /**
     * Whether the event spans whole days and is rendered in the all-day row instead of the time grid.
     */
    allDay?: boolean;
    /**
     * Identifier of the resource this event belongs to. Drives the `resource*` and `date*` views.
     */
    resourceId?: string | number;
    /**
     * Free-form description shown by the quick info and popover.
     */
    description?: string;
    /**
     * Where the appointment takes place.
     */
    location?: string;
    /**
     * Whether the event can be moved or resized.
     */
    editable?: boolean;
    /**
     * Any extra payload. Reachable from every template through the event itself.
     */
    [key: string]: any;
}

/**
 * A row (or column) the events are grouped into: a room, a machine, a person.
 *
 * @group Interface
 */
export interface SchedulerResource {
    /**
     * Unique identifier, matched against `SchedulerEvent.resourceId`.
     */
    id: string | number;
    /**
     * Text shown in the resource header.
     */
    name?: string;
    /**
     * Identifier of the parent resource. Set it to render collapsible groups in the resource timeline.
     */
    parentId?: string | number | null;
    /**
     * Colour used for the resource accent. Any CSS colour.
     */
    color?: string;
    /**
     * Any extra payload.
     */
    [key: string]: any;
}

/**
 * A colour-coded classification, matched against the event field named by `categoryField`.
 *
 * @group Interface
 */
export interface SchedulerCategory {
    /**
     * Value that the event's `categoryField` must equal.
     */
    id: string | number;
    /**
     * Text shown in the legend.
     */
    name?: string;
    /**
     * Colour of the events in this category. Any CSS colour.
     */
    color?: string;
}

/**
 * An event positioned by the layout engine, ready to paint. Coordinates are fractions of the
 * container (0..1) so the same result works for a vertical time grid and a horizontal timeline.
 *
 * @group Interface
 */
export interface SchedulerLayoutItem<T = SchedulerEvent> {
    /**
     * The event being positioned.
     */
    event: T;
    /**
     * Offset along the time axis, as a fraction of the visible range.
     */
    offset: number;
    /**
     * Length along the time axis, as a fraction of the visible range.
     */
    size: number;
    /**
     * Index of the overlap column this event was placed in.
     */
    column: number;
    /**
     * How many overlap columns the group it belongs to needs.
     */
    columns: number;
    /**
     * Row the event was packed into. Used by the all-day row, month cells and timelines.
     */
    row: number;
    /**
     * Whether the event starts before the visible range.
     */
    continuesBefore: boolean;
    /**
     * Whether the event ends after the visible range.
     */
    continuesAfter: boolean;
}

/**
 * Emitted when the visible range changes, whichever the cause: navigation, a view switch or a
 * programmatic change of `date`.
 *
 * @group Interface
 */
export interface SchedulerRangeChangeEvent {
    /**
     * First instant included in the view.
     */
    start: Date;
    /**
     * First instant *after* the view. The range is half-open: `[start, end)`.
     */
    end: Date;
    /**
     * The view that produced the range.
     */
    view: SchedulerViewType;
}

/**
 * Emitted when an event is clicked.
 *
 * @group Interface
 */
export interface SchedulerEventClickEvent {
    /**
     * Browser event that triggered it: a mouse event from a click, a keyboard event when the
     * surface was activated with Enter or space.
     */
    originalEvent: MouseEvent | KeyboardEvent;
    /**
     * The appointment that was clicked.
     */
    event: SchedulerEvent;
}

/**
 * A window nothing can be scheduled in: a maintenance slot, a closure, a resource that is out.
 *
 * Cells inside it are marked `data-blocked`, and a move or resize that would land in it is refused
 * before `eventAllow` is even asked.
 *
 * @group Interface
 */
export interface SchedulerBlockedInterval {
    /**
     * First instant blocked.
     */
    start: Date | string | number;
    /**
     * First instant free again. The interval is half-open, `[start, end)`.
     */
    end: Date | string | number;
    /**
     * Resource the block applies to. Left out, it blocks every resource.
     */
    resourceId?: string | number;
    /**
     * Why it is blocked, for your own templates to show.
     */
    reason?: string;
}

/**
 * A window an appointment can be booked into.
 *
 * Availability is not the absence of events: a clinic with nothing booked at 3am is not open at 3am.
 * Slots say where booking is possible, and they are drawn behind the events rather than as events,
 * because a free slot is a property of the calendar and not an appointment.
 *
 * @group Interface
 */
export interface SchedulerAppointmentSlot {
    /**
     * First instant of the window.
     */
    start: Date | string | number;
    /**
     * First instant after it.
     */
    end: Date | string | number;
    /**
     * Resource the window belongs to. Left out, it applies to every resource.
     */
    resourceId?: string | number;
    /**
     * How many appointments fit. Rendered as the slot's label when there is room for it.
     */
    capacity?: number;
    /**
     * How many are already taken. A slot with `booked >= capacity` is drawn as full.
     */
    booked?: number;
    /**
     * Identifier of the window, so a booking output can name the slot it came from.
     */
    id?: string | number;
    /**
     * What the viewer's own relationship with the window is.
     *
     * `booked` is the one the component cannot work out for itself — capacity says how many places
     * are left, not whether THIS person already took one — and it is what turns an activation into a
     * cancellation instead of a second booking.
     */
    status?: 'available' | 'booked' | 'closed';
    /**
     * Free-form payload, handed straight back on `(slotBook)` and `(slotCancel)`.
     */
    meta?: Record<string, unknown>;
}

/**
 * What `(slotBook)` and `(slotCancel)` hand over.
 *
 * @group Interface
 */
export interface SchedulerSlotBookEvent {
    /**
     * Browser event that triggered it: a mouse event from a click, a keyboard event when the slot
     * was activated with Enter or space.
     */
    originalEvent: MouseEvent | KeyboardEvent;
    /**
     * The window, as it was bound.
     */
    slot: SchedulerAppointmentSlot;
    /**
     * Start of the window, with the target timezone undone.
     */
    start: Date;
    /**
     * End of the window, with the target timezone undone.
     */
    end: Date;
}

/**
 * How the hour is written.
 *
 * A calendar's locale decides this most of the time, and `auto` leaves it to the locale on purpose.
 * The rest of the options exist because a product sometimes has to override the culture — an
 * airline's 24-hour clock in an American office — or because a surface is too small for the full
 * form: a month cell has room for `9 - 10 AM` and not for `9:00 AM - 10:00 AM`.
 *
 * @group Interface
 */
export interface SchedulerTimeFormatOptions {
    /**
     * `12h`, `24h`, or `auto` to let the locale decide.
     * @defaultValue auto
     */
    format?: '12h' | '24h' | 'auto';
    /**
     * Whether a whole hour prints its minutes: `9 AM` or `9:00 AM`.
     * @defaultValue always
     */
    showMinutes?: 'always' | 'non-zero';
    /**
     * Whether the meridiem is printed at all. Dropping it does not change the clock — a 12-hour
     * format without AM stays `2`, it does not become `14`.
     * @defaultValue true
     */
    showAMPM?: boolean;
    /**
     * How a `start - end` range is written. `compact` drops the repeated meridiem, `locale` hands the
     * whole range to `Intl`.
     * @defaultValue full
     */
    rangeDisplay?: 'full' | 'compact' | 'locale';
}

/**
 * What a printed schedule looks like, passed to `Scheduler.print()`.
 *
 * @group Interface
 */
export interface SchedulerPrintOptions {
    /**
     * Whether the category and event colours are printed.
     *
     * On by default, and it matters more than it sounds: without the colours a browser prints every
     * event white and they all become the same event.
     * @defaultValue true
     */
    color?: boolean;
    /**
     * How the sheet is laid out.
     */
    layout?: {
        /**
         * Page orientation, asked for with an `@page` rule.
         *
         * Honoured by Chrome and Firefox. WebKit does not implement it, so in Safari the orientation
         * is whatever the print dialog says and this is ignored. `auto` leaves it alone everywhere.
         * @defaultValue auto
         */
        orientation?: 'auto' | 'portrait' | 'landscape';
        /**
         * How the schedule is sized to the page. `standard` prints it as it stands, `compact` prints
         * it at the compact density, and `fit` shrinks it until its full width lands on the sheet —
         * which is the only one that can get a week of resource columns onto one page.
         *
         * `fit` measures against the SHORT side of the paper whatever the orientation, because
         * `orientation` is a request an engine can ignore: assuming the wide side would overflow onto
         * a second page in the browser that ignored it.
         * @defaultValue standard
         */
        scale?: 'standard' | 'compact' | 'fit';
    };
    /**
     * What the printed header carries, when `p-scheduler-print-header` is in the tree.
     *
     * `false` leaves it out. The default prints the range title, and the fields below are the extras
     * a handoff tends to need.
     */
    pageChrome?:
        | false
        | {
              /** Whether the moment it was printed is stamped on it. */
              generatedAt?: boolean;
              /** Whether the timezone the schedule is drawn in is named. */
              timezone?: boolean;
              /** Anything else worth stating on the sheet: the filters behind it, a site, an owner. */
              filters?: string[];
          };
}

/**
 * How dense the chrome is drawn.
 *
 * Not a font size: it changes the paddings and the row heights, which is what decides how many rows
 * fit on a screen. `compact` is for an operations wall, `comfortable` for a page a person reads.
 *
 * @group Types
 */
export type SchedulerDensity = 'comfortable' | 'compact';

/**
 * Which occurrences of a series an edit is meant to touch.
 *
 * @group Types
 */
export type SchedulerRecurrenceScope = 'occurrence' | 'series' | 'following';

/**
 * How the Scheduler behaves when an interaction changes an event that belongs to a series.
 *
 * @group Interface
 */
export interface SchedulerRecurrenceEditOptions {
    /**
     * Scope reported when the page does not choose one.
     * @defaultValue occurrence
     */
    defaultScope?: SchedulerRecurrenceScope;
    /**
     * Whether a drag or a resize on an occurrence asks before it is applied. With it on, the change
     * is held and `(recurrenceEdit)` is emitted so the page can ask the question; with it off the
     * change is applied under `defaultScope`.
     * @defaultValue true
     */
    askOnDrag?: boolean;
    /**
     * Whether deleting an occurrence reports through `(recurrenceDelete)` rather than
     * `(eventRemove)`.
     * @defaultValue true
     */
    askOnDelete?: boolean;
}

/**
 * What `(recurrenceEdit)` and `(recurrenceDelete)` hand over.
 *
 * @group Interface
 */
export interface SchedulerRecurrenceEditEvent {
    /**
     * The occurrence the user acted on, with its own instants.
     */
    occurrence: SchedulerEvent;
    /**
     * The series it belongs to, as it was bound — the event that carries the `rrule`.
     */
    series: SchedulerEvent;
    /**
     * Instant the occurrence was generated for, which is the key an exception is stored under.
     *
     * Not the same as an occurrence's own `recurrenceId` field, which holds the id of its series.
     */
    occurrenceStart: Date;
    /**
     * Scope the Scheduler is reporting under, from `recurrenceEdit.defaultScope`.
     */
    scope: SchedulerRecurrenceScope;
    /**
     * Proposed start, when the report comes from a drag or a resize.
     */
    start?: Date;
    /**
     * Proposed end, when the report comes from a drag or a resize.
     */
    end?: Date;
    /**
     * Applies the change under a scope, which is what the page calls once it has asked.
     */
    apply: (scope: SchedulerRecurrenceScope) => void;
    /**
     * Drops the held change and puts the occurrence back where it was.
     */
    revert: () => void;
}

/**
 * How the columns of the grouped resource views are sized.
 *
 * `auto` fits them to the container until there are more than the overflow threshold, and scrolls
 * from there; `fit` always divides the container; `fixed` always uses the declared width.
 *
 * @group Types
 */
export type SchedulerHorizontalResourceColumnMode = 'auto' | 'fit' | 'fixed';

/**
 * How available slots are drawn.
 *
 * `overlay` is a band behind the events, `grid` tints the cells the slot covers, and `indicator` is
 * a marker on the edge of the column for a calendar too dense to tint.
 *
 * @group Types
 */
export type SchedulerAppointmentSlotDisplay = 'overlay' | 'grid' | 'indicator';

/**
 * How clicking a date builds a selection.
 *
 * @group Types
 */
export type SchedulerDateSelectionMode = 'none' | 'single' | 'multiple' | 'range';

/**
 * Which edge of an event a resize is pulling.
 *
 * @group Types
 */
export type SchedulerResizeEdge = 'start' | 'end';

/**
 * A proposed move or resize, handed to `eventAllow` before the Scheduler offers the target.
 *
 * @group Interface
 */
export interface SchedulerDropInfo {
    /**
     * The event being moved or resized.
     */
    event: SchedulerEvent;
    /**
     * Proposed start.
     */
    start: Date;
    /**
     * Proposed end.
     */
    end: Date;
    /**
     * Whether the proposal lands on an all-day surface.
     */
    allDay: boolean;
    /**
     * Proposed resource, when the drag crossed lanes.
     */
    resourceId?: string | number;
    /**
     * The view the interaction is happening in.
     */
    view: SchedulerViewType;
}

/**
 * Emitted by every drag and resize output.
 *
 * @group Interface
 */
export interface SchedulerDragPayload {
    /**
     * The event that produced it: a pointer event for a drag, a keyboard event when the move came
     * from the arrow keys.
     */
    originalEvent: PointerEvent | KeyboardEvent;
    /**
     * The event, as it is bound. For a recurring series this is the OCCURRENCE, so `recurrenceId`
     * and `recurrenceStart` are what identify it inside the series.
     */
    event: SchedulerEvent;
    /**
     * Accepted start.
     */
    start: Date;
    /**
     * Accepted end.
     */
    end: Date;
    /**
     * Whether it ended on an all-day surface.
     */
    allDay: boolean;
    /**
     * Resource it ended in, when the view has lanes.
     */
    resourceId?: string | number;
    /**
     * Which edge a resize was pulling. Absent for a move.
     */
    edge?: SchedulerResizeEdge;
    /**
     * Drops the change the Scheduler is holding, putting the event back where it was. Call it when
     * the change cannot be persisted.
     */
    revert: () => void;
}

/**
 * Emitted when an empty slot is clicked, which is how a new appointment starts.
 *
 * @group Interface
 */
export interface SchedulerSlotClickEvent {
    /**
     * Browser event that triggered it: a mouse event from a click, a keyboard event when the cell
     * was activated with Enter or space.
     */
    originalEvent: MouseEvent | KeyboardEvent;
    /**
     * Start of the clicked slot.
     */
    start: Date;
    /**
     * End of the clicked slot.
     */
    end: Date;
    /**
     * Resource of the clicked slot, when the view has one.
     */
    resource?: SchedulerResource;
}

/**
 * Defines valid pass-through options in Scheduler component.
 * @template I Type of instance.
 *
 * @group Interface
 */
export interface SchedulerPassThroughOptions<I = unknown> {
    /**
     * Used to pass attributes to the root's DOM element.
     */
    root?: PassThroughOption<HTMLElement, I>;
}

/**
 * Defines valid pass-through options in Scheduler component.
 * @see {@link SchedulerPassThroughOptions}
 *
 * @template I Type of instance.
 */
export type SchedulerPassThrough<I = unknown> = PassThrough<I, SchedulerPassThroughOptions<I>>;

/**
 * Defines valid pass-through options in SchedulerHeader component.
 * @template I Type of instance.
 *
 * @group Interface
 */
export interface SchedulerHeaderPassThroughOptions<I = unknown> {
    /**
     * Used to pass attributes to the root's DOM element.
     */
    root?: PassThroughOption<HTMLElement, I>;
}

/**
 * Defines valid pass-through options in SchedulerHeader component.
 * @see {@link SchedulerHeaderPassThroughOptions}
 *
 * @template I Type of instance.
 */
export type SchedulerHeaderPassThrough<I = unknown> = PassThrough<I, SchedulerHeaderPassThroughOptions<I>>;

/**
 * Defines valid pass-through options in the Scheduler view components.
 * @template I Type of instance.
 *
 * @group Interface
 */
export interface SchedulerViewPassThroughOptions<I = unknown> {
    /**
     * Used to pass attributes to the root's DOM element.
     */
    root?: PassThroughOption<HTMLElement, I>;
    /**
     * Used to pass attributes to the header's DOM element.
     */
    header?: PassThroughOption<HTMLElement, I>;
    /**
     * Used to pass attributes to the body's DOM element.
     */
    body?: PassThroughOption<HTMLElement, I>;
    /**
     * Used to pass attributes to a cell's DOM element.
     */
    cell?: PassThroughOption<HTMLElement, I>;
    /**
     * Used to pass attributes to an event's DOM element.
     */
    event?: PassThroughOption<HTMLElement, I>;
}

/**
 * Defines valid pass-through options in the Scheduler view components.
 * @see {@link SchedulerViewPassThroughOptions}
 *
 * @template I Type of instance.
 */
export type SchedulerViewPassThrough<I = unknown> = PassThrough<I, SchedulerViewPassThroughOptions<I>>;
