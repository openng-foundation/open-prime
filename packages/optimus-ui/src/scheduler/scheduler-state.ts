import { InjectionToken, Signal, computed, signal } from '@angular/core';
import type {
    SchedulerAppointmentSlot,
    SchedulerAppointmentSlotDisplay,
    SchedulerBlockedInterval,
    SchedulerCategory,
    SchedulerDateSelectionMode,
    SchedulerDensity,
    SchedulerDragPayload,
    SchedulerDropInfo,
    SchedulerEvent,
    SchedulerHorizontalResourceColumnMode,
    SchedulerRecurrenceEditEvent,
    SchedulerRecurrenceEditOptions,
    SchedulerRecurrenceScope,
    SchedulerResource,
    SchedulerSlotBookEvent,
    SchedulerTimeFormatOptions,
    SchedulerViewType
} from '@openng/optimus-ui/types/scheduler';
import { addDays, addMonths, dayKey, formatTimeRange, navigate, startOfDay, startOfMonth, timelineScaleOf, toDate, viewRange, type SchedulerRange } from './scheduler-date';
import { expandEvents } from './scheduler-recurrence';
import { fromDisplayTime, toDisplayTime, zoneLabel } from './scheduler-timezone';
import { SchedulerDragController, applyPendingChanges, type SchedulerDragTarget, type SchedulerPendingChange } from './scheduler-drag';

/**
 * The Scheduler's single source of truth, shared with every renderer, part and overlay by injection.
 *
 * Pulling it out of the root component is what keeps the compound API free of prop drilling: a
 * renderer or an overlay asks for {@link SchedulerState} and reads the signals it needs, rather than
 * receiving a dozen inputs from a parent that would have to forward them.
 *
 * The application still owns the DATA. This holds the view state (where we are looking, what is
 * selected, which overlay is open) and derives from the bound arrays; it never mutates `events`.
 *
 * @module scheduler-state
 */

/** @internal */
export const SCHEDULER_STATE = new InjectionToken<SchedulerState>('SCHEDULER_STATE');

/**
 * Views this build renders, which is what the view selector offers when the page declares no scopes.
 *
 * @internal
 */
export const SCHEDULER_IMPLEMENTED_VIEWS: SchedulerViewType[] = [
    'day',
    'week',
    'month',
    'agenda',
    'year',
    'resourceDay',
    'resourceWeek',
    'resourceMonth',
    'dateDay',
    'dateWeek',
    'dateMonth',
    'timeline',
    'timelineDay',
    'timelineWeek',
    'timelineMonth',
    'timelineYear',
    'resourceTimeline',
    'resourceTimelineDay',
    'resourceTimelineWeek',
    'resourceTimelineMonth',
    'resourceTimelineYear'
];

/**
 * What an overlay is currently anchored to.
 */
export interface SchedulerOverlayTarget {
    /** The event the overlay is about, when it is an event overlay. */
    event?: SchedulerEvent;
    /** The day the overlay is about, for the overflow popover. */
    date?: Date;
    /** The resource the overlay is about. */
    resource?: SchedulerResource;
    /** Every event of the cell, for the overflow popover. */
    events?: SchedulerEvent[];
    /** The element the overlay should be positioned against. */
    anchor?: HTMLElement;
}

/**
 * Inputs the root feeds into the state. Plain signals so the root can wire its own `input()`s
 * straight through.
 */
export interface SchedulerLabels {
    /** Label of the "today" button. */
    today: string;
    /** Accessible name of the previous-range button. */
    prev: string;
    /** Accessible name of the next-range button. */
    next: string;
    /** Label of the button that clears the event selection. */
    clear: string;
    /** Label shown when a view has no events. */
    empty: string;
    /** Label of the all-day row. */
    allDay: string;
    /** Template of the overflow link; `{0}` is replaced with the count. */
    more: string;
    /** Header of the resource rail. */
    resources: string;
    /** Label of the action that asks the application to edit an event. */
    edit: string;
    /** Label of the action that asks the application to delete an event. */
    delete: string;
    /** Accessible name of the button that dismisses an overlay. */
    close: string;
    /** Lane that collects events whose resource is unknown. */
    unassigned: string;
    /** Localised name of each view. */
    views: Record<SchedulerViewType, string>;
}

/**
 * Chrome labels an application overrides.
 *
 * `views` is partial too: a page that renames the week view has no business restating the name of
 * the other twelve, and the merge fills the rest in from the defaults.
 */
export interface SchedulerLabelOverrides extends Partial<Omit<SchedulerLabels, 'views'>> {
    /** Localised name of any subset of the views. */
    views?: Partial<Record<SchedulerViewType, string>>;
}

export interface SchedulerStateInputs {
    events: Signal<SchedulerEvent[]>;
    resources: Signal<SchedulerResource[]>;
    categories: Signal<SchedulerCategory[]>;
    categoryField: Signal<string>;
    titleField: Signal<string>;
    view: Signal<SchedulerViewType>;
    date: Signal<Date>;
    firstDayOfWeek: Signal<number>;
    dayCount: Signal<number>;
    monthCount: Signal<number>;
    agendaDays: Signal<number>;
    defaultEventDuration: Signal<number>;
    maxEventsPerCell: Signal<number>;
    workDays: Signal<number[]>;
    businessHours: Signal<{ start: number; end: number } | undefined>;
    availableViews: Signal<SchedulerViewType[] | undefined>;
    categoryFilterable: Signal<boolean>;
    loading: Signal<boolean>;
    labels: Signal<SchedulerLabels>;
    locale: Signal<string | undefined>;
    slotMinutes: Signal<number>;
    timelineSlotMinutes: Signal<number>;
    timelineVirtualScroll: Signal<boolean | 'auto'>;
    timelineVirtualThreshold: Signal<number>;
    timelineVirtualOverscan: Signal<number>;
    timelineVirtualEventBuffer: Signal<number>;
    rtl: Signal<boolean>;
    timeZone: Signal<string | undefined>;
    dayStartHour: Signal<number>;
    dayEndHour: Signal<number>;
    minEventMinutes: Signal<number>;
    selectionMode: Signal<'none' | 'single' | 'multiple'>;
    quickInfoEnabled: Signal<boolean>;
    editable: Signal<boolean>;
    eventStartEditable: Signal<boolean>;
    eventDurationEditable: Signal<boolean>;
    snapDuration: Signal<number>;
    timelineSnapDuration: Signal<number | undefined>;
    dragMinDistance: Signal<number>;
    eventAllow: Signal<((info: SchedulerDropInfo) => boolean) | undefined>;
    blockedIntervals: Signal<SchedulerBlockedInterval[]>;
    appointmentSlots: Signal<SchedulerAppointmentSlot[]>;
    appointmentSlotDisplay: Signal<SchedulerAppointmentSlotDisplay>;
    dateSelection: Signal<SchedulerDateSelectionMode>;
    groupByResource: Signal<boolean>;
    groupByDate: Signal<boolean>;
    resourceColumnMinWidth: Signal<string | undefined>;
    adaptiveMode: Signal<boolean | 'auto'>;
    adaptiveThreshold: Signal<number>;
    selectedResourceId: Signal<string | number | undefined>;
    setSelectedResourceId: (id: string | number | undefined) => void;
    emitResourceClick: (resource: SchedulerResource) => void;
    emitAdaptiveAutoSelect: (resource: SchedulerResource) => void;
    selectedDates: Signal<Date[]>;
    setSelectedDates: (dates: Date[]) => void;
    emitDragStart: (payload: SchedulerDragPayload) => void;
    emitDrop: (payload: SchedulerDragPayload) => void;
    emitResizeStart: (payload: SchedulerDragPayload) => void;
    emitResize: (payload: SchedulerDragPayload) => void;
    emitResizeStop: (payload: SchedulerDragPayload) => void;
    eventPopoverEnabled: Signal<boolean>;
    contextMenuEnabled: Signal<boolean>;
    morePopoverEnabled: Signal<boolean>;
    emitMoreClick: (date: Date, events: SchedulerEvent[]) => void;
    maxSelection: Signal<number>;
    setView: (view: SchedulerViewType) => void;
    setDate: (date: Date) => void;
    bulkDelete: (events: SchedulerEvent[]) => void;
    eventChange: (event: SchedulerEvent) => void;
    eventRemove: (event: SchedulerEvent) => void;
    emitEventClick: (originalEvent: MouseEvent | KeyboardEvent, event: SchedulerEvent) => void;
    emitSlotClick: (originalEvent: MouseEvent | KeyboardEvent, start: Date, end: Date) => void;
    emitSelectionLimit: (max: number) => void;
    emitSelectionChange: (events: SchedulerEvent[]) => void;
    timeFormat: Signal<SchedulerTimeFormatOptions | undefined>;
    dateDisplay: Signal<Intl.DateTimeFormatOptions | undefined>;
    eventShell: Signal<'default' | 'none'>;
    calendar: Signal<string | undefined>;
    numberingSystem: Signal<string | undefined>;
    density: Signal<SchedulerDensity>;
    nowIndicator: Signal<boolean>;
    showEmptyDays: Signal<boolean>;
    alwaysShowAllDay: Signal<boolean>;
    resourcesExpandable: Signal<boolean>;
    resourcesInitiallyExpanded: Signal<boolean>;
    showAggregatedEvents: Signal<boolean>;
    resourceRowHeight: Signal<number | undefined>;
    rowAutoHeight: Signal<boolean>;
    horizontalResourceColumnMode: Signal<SchedulerHorizontalResourceColumnMode>;
    horizontalResourceColumnWidth: Signal<number | undefined>;
    horizontalResourceMinColumnWidth: Signal<number | undefined>;
    horizontalResourceDayMinWidth: Signal<number | undefined>;
    horizontalResourceOverflowThreshold: Signal<number>;
    eventPopoverPosition: Signal<'top' | 'bottom' | 'left' | 'right' | 'auto'>;
    eventPopoverShowOnMobile: Signal<boolean>;
    recurrenceEdit: Signal<boolean | SchedulerRecurrenceEditOptions>;
    emitSlotBook: (payload: SchedulerSlotBookEvent) => void;
    emitSlotCancel: (payload: SchedulerSlotBookEvent) => void;
    emitQuickInfoShow: (event: SchedulerEvent) => void;
    emitQuickInfoEdit: (event: SchedulerEvent) => void;
    emitQuickInfoDelete: (event: SchedulerEvent) => void;
    emitContextMenuShow: (target: SchedulerOverlayTarget) => void;
    emitRecurrenceEdit: (payload: SchedulerRecurrenceEditEvent) => void;
    emitRecurrenceDelete: (payload: SchedulerRecurrenceEditEvent) => void;
}

/**
 * The shared, derived view state.
 */
export class SchedulerState {
    constructor(private readonly inputs: SchedulerStateInputs) {}

    /** Active view. */
    readonly view = computed(() => this.inputs.view());

    /** Anchor date the range is derived from. */
    readonly date = computed(() => this.inputs.date());

    /** First day of the week, 0 = Sunday. */
    readonly firstDayOfWeek = computed(() => this.inputs.firstDayOfWeek());

    /** Business hours of a day, as whole hours, or `undefined` when the page did not set any. */
    readonly businessHours = computed(() => this.inputs.businessHours());

    /** Whether the page configured business hours at all, which is what turns the shading on. */
    readonly hasBusinessHours = computed(() => !!this.inputs.businessHours());

    /**
     * Whether an instant falls inside business hours. With none configured every hour counts, which
     * is what leaves the grid unshaded instead of shading all of it.
     */
    isBusinessTime(date: Date, minutes = date.getHours() * 60 + date.getMinutes()): boolean {
        const hours = this.businessHours();
        if (!hours) return true;
        return this.isWorkDay(date) && minutes >= hours.start * 60 && minutes < hours.end * 60;
    }

    /** Week days that count as working days, 0 = Sunday. */
    readonly workDays = computed(() => this.inputs.workDays());

    /** How many month grids the month views draw at once. Never below one. */
    readonly monthCount = computed(() => {
        // A bound `undefined` or a non-numeric attribute arrives as NaN, and NaN months is a month
        // view with no grid in it at all: anything that is not a count above one IS one.
        const count = Math.trunc(this.inputs.monthCount());
        return Number.isFinite(count) && count > 1 ? count : 1;
    });

    /** How many events a month cell shows before it collapses into a "+N more" link. */
    readonly maxEventsPerCell = computed(() => this.inputs.maxEventsPerCell());

    /** Duration given to an event with no `end`. */
    readonly defaultEventDuration = computed(() => this.inputs.defaultEventDuration());

    /**
     * Views whose scope is declared inside `<p-scheduler-content>`, in declaration order. Written by
     * the content region as the scopes register themselves.
     */
    readonly declaredViews = signal<readonly SchedulerViewType[]>([]);

    /**
     * Views offered by the view selector.
     *
     * With no `views` input, the list is the scopes the page DECLARED: a Scheduler that only renders
     * a month has no business offering six other views it cannot draw. The full list is the last
     * resort, for a root with no content region at all.
     */
    readonly availableViews = computed<SchedulerViewType[]>(() => {
        // `!= null` and not `?.length`: an empty list passed on purpose means "offer no views at
        // all", and falling back to the declared scopes there would ignore what the page asked for.
        const explicit = this.inputs.availableViews();
        if (explicit != null) return explicit;
        const declared = this.declaredViews();
        return declared.length ? [...declared] : SCHEDULER_IMPLEMENTED_VIEWS;
    });

    /** Whether the legend toggles filters. */
    readonly categoryFilterable = computed(() => this.inputs.categoryFilterable());

    /** Whether the Scheduler is waiting on data. */
    readonly loading = computed(() => this.inputs.loading());

    /** Localised labels of the chrome. */
    readonly labels = computed(() => this.inputs.labels());

    /** BCP 47 locale used to format every date the Scheduler prints. */
    /**
     * The locale every label is formatted in, with the calendar and the numbering system folded in.
     *
     * They travel as Unicode extensions of the locale tag rather than as options on each formatter,
     * because that is the only way they reach EVERY call — the month title, the weekday initials, the
     * gutter, an event's time text — without every renderer having to know about them. A tag the
     * platform rejects falls back to the plain locale: a Scheduler in the wrong digits beats one that
     * throws while drawing.
     */
    readonly locale = computed(() => {
        const locale = this.inputs.locale();
        const calendar = this.inputs.calendar();
        const numberingSystem = this.inputs.numberingSystem();

        if (!calendar && !numberingSystem) return locale;

        try {
            return new Intl.Locale(locale ?? new Intl.DateTimeFormat().resolvedOptions().locale, {
                ...(calendar ? { calendar } : {}),
                ...(numberingSystem ? { numberingSystem } : {})
            }).toString();
        } catch {
            return locale;
        }
    });

    /** How the hour is written, or `undefined` to leave it to the locale. */
    readonly timeFormat = computed(() => this.inputs.timeFormat());

    /** How dense the chrome is drawn. */
    readonly density = computed(() => this.inputs.density());

    /** Whether the Scheduler draws the visible box around an event, or leaves it to the definition. */
    readonly eventShell = computed(() => this.inputs.eventShell());

    /** Whether the line marking the current time is drawn. */
    readonly nowIndicator = computed(() => this.inputs.nowIndicator());

    /** Whether the agenda lists days with nothing on them. */
    readonly showEmptyDays = computed(() => this.inputs.showEmptyDays());

    /** Whether the all-day band stays visible when it is empty. */
    readonly alwaysShowAllDay = computed(() => this.inputs.alwaysShowAllDay());

    /** Whether a resource group can be collapsed. */
    readonly resourcesExpandable = computed(() => this.inputs.resourcesExpandable());

    /** Whether a group lane also shows the events of the resources under it. */
    readonly showAggregatedEvents = computed(() => this.inputs.showAggregatedEvents());

    /** Height of one timeline lane in pixels, or `undefined` for the token's. */
    readonly resourceRowHeight = computed(() => this.inputs.resourceRowHeight());

    /** Whether a lane grows to fit the rows its events need. */
    readonly rowAutoHeight = computed(() => this.inputs.rowAutoHeight());

    /** Where an event popover opens. */
    readonly eventPopoverPosition = computed(() => this.inputs.eventPopoverPosition());

    /** Whether the event popover opens on a coarse pointer, where there is no hover. */
    readonly eventPopoverShowOnMobile = computed(() => this.inputs.eventPopoverShowOnMobile());

    /** How an interaction on an occurrence of a series is reported. */
    readonly recurrenceEdit = computed<SchedulerRecurrenceEditOptions | null>(() => {
        const value = this.inputs.recurrenceEdit();

        if (!value) return null;
        const options = value === true ? {} : value;

        return { defaultScope: 'occurrence', askOnDrag: true, askOnDelete: true, ...options };
    });

    /** Height of one row of the time grid, in minutes. */
    readonly slotMinutes = computed(() => this.inputs.slotMinutes());

    /**
     * Width of one column of a time-based timeline axis, in minutes.
     *
     * Separate from `slotMinutes` because the two axes have opposite constraints: a vertical row can
     * be 30 minutes tall and still fit a title, a horizontal column of 30 minutes is 80px of nothing.
     */
    readonly timelineSlotMinutes = computed(() => this.inputs.timelineSlotMinutes());

    /** Whether the layout runs right to left. */
    readonly rtl = computed(() => this.inputs.rtl());

    /** Whether long timeline axes are windowed. `auto` decides by column count. */
    readonly timelineVirtualScroll = computed(() => this.inputs.timelineVirtualScroll());

    /** Column count past which `auto` windows the axis. */
    readonly timelineVirtualThreshold = computed(() => Math.max(this.inputs.timelineVirtualThreshold(), 1));

    /** Extra columns kept mounted either side of the viewport. */
    readonly timelineVirtualOverscan = computed(() => Math.max(this.inputs.timelineVirtualOverscan(), 0));

    /** Pixels either side of the viewport an event bar is still mounted for. */
    readonly timelineVirtualEventBuffer = computed(() => Math.max(this.inputs.timelineVirtualEventBuffer(), 0));

    /** Shortest slice an event may occupy, so a one-minute appointment stays readable. */
    readonly minEventMinutes = computed(() => this.inputs.minEventMinutes());

    /**
     * Wall-clock hours the time grid renders, as `[start, end)`. `end` accepts 24 for a whole day.
     * Clamped and ordered here so a bad input cannot produce a negative span downstream.
     */
    readonly dayBounds = computed(() => {
        const start = Math.min(Math.max(this.inputs.dayStartHour(), 0), 23);
        const end = Math.min(Math.max(this.inputs.dayEndHour(), start + 1), 24);
        return { start, end };
    });

    /** The resources, as bound. */
    readonly resources = computed(() => this.inputs.resources());

    /**
     * Ids of the groups the user has collapsed.
     *
     * Collapsed rather than expanded: a resource the page has not heard of yet is expanded, so a rail
     * that grows while the user is looking at it does not spring shut. `resourcesInitiallyExpanded`
     * being false seeds it with every group, once, from the first read.
     */
    private readonly collapsedResources = signal<Set<string | number> | null>(null);

    /** Which resources have children, indexed by id. */
    private readonly resourceGroups = computed(() => {
        const parents = new Set<string | number>();

        for (const resource of this.inputs.resources()) {
            if (resource.parentId != null) parents.add(resource.parentId);
        }

        return parents;
    });

    /** Whether a resource has resources under it. */
    isResourceGroup(id: string | number): boolean {
        return this.resourceGroups().has(id);
    }

    /** Whether a group is showing its children. */
    isResourceExpanded(id: string | number): boolean {
        const collapsed = this.collapsedResources();

        if (collapsed) return !collapsed.has(id);
        // Sin estado propio todavia: manda el input, y solo para los grupos.
        return this.inputs.resourcesInitiallyExpanded() || !this.resourceGroups().has(id);
    }

    /**
     * Collapses or expands a group.
     *
     * A no-op when `resourcesExpandable` is off, so a rail that does not offer the gesture cannot be
     * put into a state the user has no way out of.
     */
    toggleResource(id: string | number): void {
        if (!this.inputs.resourcesExpandable() || !this.resourceGroups().has(id)) return;

        const collapsed = new Set(this.collapsedResources() ?? (this.inputs.resourcesInitiallyExpanded() ? [] : this.resourceGroups()));

        if (collapsed.has(id)) collapsed.delete(id);
        else collapsed.add(id);
        this.collapsedResources.set(collapsed);
    }

    /**
     * The resources a rail should draw, with the descendants of collapsed groups left out.
     *
     * Walks up the whole chain and not just the immediate parent: collapsing a two-level group has to
     * hide its grandchildren too, or a collapsed group leaves its leaves floating at the root.
     */
    readonly visibleResources = computed(() => {
        const all = this.inputs.resources();

        if (!this.inputs.resourcesExpandable()) return all;

        const byId = new Map(all.map((resource) => [resource.id, resource]));

        return all.filter((resource) => {
            let parentId = resource.parentId;
            let guard = 0;

            while (parentId != null && guard++ < 32) {
                if (!this.isResourceExpanded(parentId)) return false;
                parentId = byId.get(parentId)?.parentId;
            }

            return true;
        });
    });

    /**
     * How deep a resource sits in the rail, counting real ancestors.
     *
     * The rail used to answer "0 when it has no parent, 1 otherwise", which draws a three-level
     * hierarchy as two.
     */
    resourceDepth(id: string | number): number {
        const byId = new Map(this.inputs.resources().map((resource) => [resource.id, resource]));
        let depth = 0;
        let parentId = byId.get(id)?.parentId;

        while (parentId != null && depth < 32) {
            depth++;
            parentId = byId.get(parentId)?.parentId;
        }

        return depth;
    }

    /** Ids of a resource and everything under it, for the aggregate count of a group. */
    descendantResourceIds(id: string | number): (string | number)[] {
        const all = this.inputs.resources();
        const ids = [id];

        for (let index = 0; index < ids.length; index++) {
            for (const resource of all) {
                if (resource.parentId === ids[index]) ids.push(resource.id);
            }
        }

        return ids;
    }

    /** The categories, as bound. */
    readonly categories = computed(() => this.inputs.categories());

    /** The visible range of the active view. */
    readonly range = computed<SchedulerRange>(() =>
        viewRange(this.inputs.view(), this.inputs.date(), {
            firstDayOfWeek: this.inputs.firstDayOfWeek(),
            dayCount: this.inputs.dayCount(),
            monthCount: this.monthCount(),
            agendaDays: this.inputs.agendaDays()
        })
    );

    /** Ids of the categories currently filtered OUT. Empty means everything is shown. */
    readonly hiddenCategories = signal<ReadonlySet<string | number>>(new Set());

    /** Whether a category filter is active. */
    readonly filtering = computed(() => this.hiddenCategories().size > 0);

    /** Ids of the selected events. */
    readonly selectedEventIds = signal<ReadonlySet<string | number>>(new Set());

    /** Id of the event holding keyboard focus. */
    readonly focusedEventId = signal<string | number | null>(null);

    /** Id of the event being dragged, when a drag is in progress. */
    readonly draggingEventId = signal<string | number | null>(null);

    /** Id of the event being resized. */
    readonly resizingEventId = signal<string | number | null>(null);

    /**
     * The event a pointer interaction is currently on, whichever kind.
     *
     * The renderers take it out of the overlap layout: a bar that renarrows and changes row as it
     * collides with whatever it passes over is what makes a drag feel broken, so the one being
     * dragged floats at full size and everything else stays exactly where it was.
     */
    readonly interactingEventId = computed(() => this.draggingEventId() ?? this.resizingEventId());

    /** Days currently selected by a date selection, as `YYYY-MM-DD` keys. */
    readonly selectedDates = computed<readonly string[]>(() => this.inputs.selectedDates().map((date) => dayKey(date)));

    /** Anchor of a range selection: the first click, waiting for the second. */
    private readonly rangeAnchor = signal<Date | null>(null);

    /**
     * The blocked windows, with their instants resolved once.
     */
    private readonly blocked = computed(() =>
        this.inputs.blockedIntervals().map((interval) => ({
            // On display time like the events: they are compared against the cells' dates, which
            // are shifted. Without converting them, a target zone moved the calendar and left the
            // blocked windows where they were.
            start: this.toDisplay(toDate(interval.start)).getTime(),
            end: this.toDisplay(toDate(interval.end)).getTime(),
            resourceId: interval.resourceId
        }))
    );

    /** How the available windows are drawn. */
    readonly appointmentSlotDisplay = computed(() => this.inputs.appointmentSlotDisplay());

    /** The available windows, with their instants resolved once. */
    readonly appointmentSlots = computed(() =>
        this.inputs.appointmentSlots().map((slot) => {
            // Same as the blocked windows: the geometry places them against already shifted cells.
            const start = this.toDisplay(toDate(slot.start));
            const end = this.toDisplay(toDate(slot.end));
            const capacity = slot.capacity;
            const booked = slot.booked ?? 0;
            return { ...slot, start, end, capacity, booked, full: capacity != null && booked >= capacity };
        })
    );

    /**
     * The windows that overlap a day, for one resource.
     *
     * Each one comes back with the fraction of the rendered hours it covers, so a view can draw it
     * without redoing the geometry the time grid already knows.
     */
    slotsForColumn(date: Date, resourceId: string | number | undefined, bounds: { start: number; end: number }): { key: string; offset: number; size: number; label: string; ariaLabel: string; full: boolean; slot: SchedulerAppointmentSlot }[] {
        const slots = this.appointmentSlots();
        if (!slots.length) return [];

        const dayStart = startOfDay(date);
        const from = dayStart.getTime() + bounds.start * 3_600_000;
        const to = dayStart.getTime() + bounds.end * 3_600_000;
        const span = to - from;
        if (span <= 0) return [];

        return slots
            .filter((slot) => (slot.resourceId == null || slot.resourceId === resourceId) && slot.start.getTime() < to && slot.end.getTime() > from)
            .map((slot, index) => {
                const visibleStart = Math.max(slot.start.getTime(), from);
                const visibleEnd = Math.min(slot.end.getTime(), to);
                const label = slot.capacity != null ? `${Math.max(slot.capacity - slot.booked, 0)}/${slot.capacity}` : '';
                const range = formatTimeRange(slot.start, slot.end, this.locale(), this.timeFormat());
                return {
                    key: `${dayKey(date)}|${resourceId ?? ''}|${index}`,
                    offset: (visibleStart - from) / span,
                    size: (visibleEnd - visibleStart) / span,
                    label,
                    // The slot is actionable, so it needs a name: the time, plus the occupancy when
                    // there is one. Without it a screen reader announces an empty button.
                    ariaLabel: label ? `${range}, ${label}` : range,
                    full: slot.full,
                    slot
                };
            });
    }

    /**
     * Whether an instant falls in a blocked window.
     *
     * An interval without a `resourceId` blocks every resource, which is the common case: a closure
     * is a closure for everyone.
     */
    isBlocked(date: Date, resourceId?: string | number): boolean {
        const time = date.getTime();
        return this.blocked().some((interval) => time >= interval.start && time < interval.end && (interval.resourceId == null || interval.resourceId === resourceId));
    }

    /** Whether a range overlaps a blocked window, which is what refuses a drop. */
    overlapsBlocked(start: Date, end: Date, resourceId?: string | number): boolean {
        const from = start.getTime();
        const to = end.getTime();
        return this.blocked().some((interval) => from < interval.end && to > interval.start && (interval.resourceId == null || interval.resourceId === resourceId));
    }

    /**
     * Applies a click on a date to the selection.
     *
     * `range` needs two clicks: the first sets the anchor, the second fills in every day between —
     * and a third starts over, because a range selection with no way back is a trap.
     */
    selectDate(date: Date): void {
        const mode = this.inputs.dateSelection();
        if (mode === 'none') return;

        const day = startOfDay(date);
        const current = this.inputs.selectedDates();

        if (mode === 'single') {
            this.inputs.setSelectedDates(this.isDateSelected(day) && current.length === 1 ? [] : [day]);
            return;
        }

        if (mode === 'multiple') {
            this.inputs.setSelectedDates(this.isDateSelected(day) ? current.filter((selected) => dayKey(selected) !== dayKey(day)) : [...current, day]);
            return;
        }

        const anchor = this.rangeAnchor();
        if (!anchor) {
            this.rangeAnchor.set(day);
            this.inputs.setSelectedDates([day]);
            return;
        }

        const [from, to] = anchor <= day ? [anchor, day] : [day, anchor];
        const range: Date[] = [];
        for (let cursor = from; cursor <= to; cursor = addDays(cursor, 1)) range.push(cursor);
        this.rangeAnchor.set(null);
        this.inputs.setSelectedDates(range);
    }

    /** What each overlay is anchored to; `null` means closed. */
    readonly morePopover = signal<SchedulerOverlayTarget | null>(null);
    /** @see morePopover */
    readonly quickInfo = signal<SchedulerOverlayTarget | null>(null);
    /** @see morePopover */
    readonly eventPopover = signal<SchedulerOverlayTarget | null>(null);
    /** @see morePopover */
    readonly contextMenu = signal<SchedulerOverlayTarget | null>(null);

    /**
     * Window the recurring series are expanded over.
     *
     * The visible range plus six weeks either side, and not the range itself: the month grid draws
     * the neighbouring weeks, the agenda groups by day, and an occurrence that STARTED before the
     * range can still be running inside it. Six weeks covers the widest of those overhangs without
     * turning an open-ended weekly series into thousands of copies.
     */
    private readonly expansionWindow = computed<SchedulerRange>(() => {
        const { start, end } = this.range();
        return { start: addDays(start, -42), end: addDays(end, 42) };
    });

    /**
     * The bound events with every recurring series expanded into its occurrences.
     *
     * Everything downstream reads THIS and not the input, so no view has to know that recurrence
     * exists. A collection with no `rrule` in it comes back untouched, by identity.
     */
    /** The target timezone, when the page asked for one. */
    readonly timeZone = computed(() => this.inputs.timeZone());

    /**
     * Now, as the views see it.
     *
     * Everything that means "today" or "right now" has to be asked in the RENDERED zone: at 23:00 in
     * Madrid it is already tomorrow in Tokyo, and a grid showing Tokyo that highlights the Madrid
     * day is highlighting the wrong column.
     */
    now(): Date {
        return this.toDisplay(new Date());
    }

    /** Label of the rendered zone, for the corner of the time gutter. */
    readonly timeZoneLabel = computed(() => zoneLabel(this.inputs.date(), this.inputs.timeZone()));

    /**
     * An instant as the date the views render, and back.
     *
     * With no target zone both are the identity, so nothing pays for the feature.
     */
    toDisplay(date: Date): Date {
        return toDisplayTime(date, this.inputs.timeZone());
    }

    /** @see toDisplay */
    fromDisplay(date: Date): Date {
        return fromDisplayTime(date, this.inputs.timeZone());
    }

    /**
     * The bound events shifted into the rendered zone.
     *
     * Shifting the DATA and not the renderers is what keeps the target zone from leaking into every
     * view: the engine goes on doing local-time arithmetic, and the only places that convert back are
     * the outputs, where a real instant is what the application needs.
     */
    /**
     * The application's own event behind each shifted copy.
     *
     * A `WeakMap` keyed by the copy: no bookkeeping to invalidate, and it lets every output hand back
     * the object the application passed in — same identity, real instants — instead of the display
     * copy, whose instants are deliberately wrong.
     */
    private readonly realEvents = new WeakMap<SchedulerEvent, SchedulerEvent>();

    private readonly zonedEvents = computed(() => {
        const zone = this.inputs.timeZone();
        const events = this.inputs.events();
        if (!zone) return events;

        return events.map((event) => {
            const copy = {
                ...event,
                start: this.toDisplay(toDate(event.start)),
                ...(event.end != null ? { end: this.toDisplay(toDate(event.end)) } : {})
            };
            this.realEvents.set(copy, event);
            return copy;
        });
    });

    /**
     * The event an application should be handed, given one of the copies the views render.
     *
     * Without a target timezone every event IS the application's, so this is the identity. With one:
     *
     * - a bound event comes back as the very object that was passed in, real instants and identity
     *   intact, which is what makes persisting a payload safe;
     * - a recurring occurrence has no counterpart in the bound array — the application holds the
     *   series — so it is rebuilt with its instants converted out of the rendered zone.
     */
    realOf(event: SchedulerEvent): SchedulerEvent {
        if (!this.inputs.timeZone()) return event;

        const bound = this.realEvents.get(event);
        if (bound) return bound;

        return {
            ...event,
            start: this.fromDisplay(toDate(event.start)),
            ...(event.end != null ? { end: this.fromDisplay(toDate(event.end)) } : {}),
            ...(event['recurrenceStart'] != null ? { recurrenceStart: this.fromDisplay(toDate(event['recurrenceStart'])) } : {})
        };
    }

    private readonly seriesEvents = computed(() => expandEvents(this.zonedEvents(), this.expansionWindow(), this.inputs.defaultEventDuration()));

    readonly expandedEvents = computed(() => {
        // Two layers and not one: series expansion depends ONLY on the data and the window, so a
        // drag preview — which changes sixty times a second — neither re-parses an RRULE nor
        // regenerates occurrences. The changes are applied after expanding because an occurrence's
        // id only exists once expanded: dragging an appointment out of a series moves that
        // occurrence, not the series.
        const preview = this.dragPreview();
        const pending = preview ? new Map([...this.pendingChanges(), [preview.id, preview.change]]) : this.pendingChanges();
        return applyPendingChanges(this.seriesEvents(), pending);
    });

    /**
     * Moves and resizes the Scheduler is holding on top of the bound data, keyed by event id.
     *
     * The Scheduler does not own the events, so a finished drag cannot write into them; it keeps the
     * change here and stops applying it as soon as the application persists it or calls `revert()`.
     * That is what makes an interaction feel immediate in a controlled component.
     */
    readonly pendingChanges = signal<ReadonlyMap<string | number, SchedulerPendingChange>>(new Map());

    /** The live proposal of the interaction in progress. */
    readonly dragPreview = signal<{ id: string | number; change: SchedulerPendingChange } | null>(null);

    /**
     * Events that survive the category filter, with their instants resolved.
     *
     * Deliberately NOT clipped to the range: the month grid shows the neighbouring weeks and the
     * agenda groups by day, so each renderer clips to what it draws.
     */
    readonly filteredEvents = computed(() => {
        const hidden = this.hiddenCategories();
        const field = this.inputs.categoryField();
        const events = this.expandedEvents();
        if (!hidden.size || !field) return events;
        return events.filter((event) => !hidden.has(event[field]));
    });

    /** Events overlapping the visible range. */
    readonly visibleEvents = computed(() => {
        const { start, end } = this.range();
        const duration = this.inputs.defaultEventDuration();
        return this.filteredEvents().filter((event) => {
            const from = toDate(event.start);
            const rawTo = event.end != null ? toDate(event.end) : null;
            const to = rawTo && rawTo > from ? rawTo : new Date(from.getTime() + duration * 60_000);
            return from < end && to > start;
        });
    });

    /**
     * The selected events, in the order they were bound.
     *
     * Read from the EXPANDED collection: the ids of a recurring occurrence exist only there, so
     * looking them up in the input would return nothing for a selected occurrence.
     */
    readonly selectedEvents = computed(() => {
        const ids = this.selectedEventIds();
        return ids.size ? this.expandedEvents().filter((event) => ids.has(event.id)) : [];
    });

    /** Categories with the count of visible events each, and whether the category is shown. */
    readonly categoryCounts = computed(() => {
        const field = this.inputs.categoryField();
        const hidden = this.hiddenCategories();
        const counts = new Map<unknown, number>();
        for (const event of this.visibleEvents()) {
            const key = field ? event[field] : undefined;
            counts.set(key, (counts.get(key) ?? 0) + 1);
        }
        return this.inputs.categories().map((category) => ({
            ...category,
            count: counts.get(category.id) ?? 0,
            active: !hidden.has(category.id)
        }));
    });

    /** Whether a plain timed view should still break its columns down by resource. */
    readonly groupByResource = computed(() => this.inputs.groupByResource());

    /** Whether a plain timed view should break each date down by resource. */
    readonly groupByDate = computed(() => this.inputs.groupByDate());

    /** Minimum width of one column once the columns are per resource. */
    readonly resourceColumnMinWidth = computed(() => this.inputs.resourceColumnMinWidth());

    /**
     * Whether the resource views are showing one resource at a time.
     *
     * `auto` turns it on past `adaptiveThreshold`, because the point of adaptive mode is that forty
     * resource columns are forty columns of nothing: below the threshold, showing them all is both
     * possible and more useful.
     */
    readonly adaptive = computed(() => {
        const mode = this.inputs.adaptiveMode();
        if (mode === false) return false;
        return mode === true || this.inputs.resources().length >= this.inputs.adaptiveThreshold();
    });

    /** Id of the resource adaptive mode is focused on. */
    readonly selectedResourceId = computed(() => this.inputs.selectedResourceId());

    /** The resource adaptive mode is focused on, when there is one. */
    readonly selectedResource = computed(() => {
        const id = this.inputs.selectedResourceId();
        return id != null ? this.resourceMap().get(id) : undefined;
    });

    /**
     * The resources the grouped views should render.
     *
     * Outside adaptive mode that is all of them. Inside it, the selected resource plus its children,
     * so picking a parent group still shows what is inside it.
     */
    readonly groupedResources = computed<SchedulerResource[]>(() => {
        const all = this.inputs.resources();
        if (!this.adaptive()) return all;

        const selected = this.selectedResource();
        if (!selected) return all.length ? [all[0]] : [];

        const children = all.filter((resource) => resource.parentId === selected.id);
        return children.length ? [selected, ...children] : [selected];
    });

    /**
     * Picks the resource adaptive mode should focus on when the page has not chosen one.
     *
     * Reports it through `adaptiveAutoSelect` rather than silently deciding, so the application can
     * mirror the choice in its own state — a selector that disagrees with the grid is worse than no
     * selector.
     */
    autoSelectResource(): void {
        if (!this.adaptive() || this.inputs.selectedResourceId() != null) return;

        const events = this.visibleEvents();
        const withEvents = this.inputs.resources().find((resource) => events.some((event) => this.eventBelongsTo(event, resource.id)));
        const pick = withEvents ?? this.inputs.resources()[0];
        if (!pick) return;

        this.inputs.setSelectedResourceId(pick.id);
        this.inputs.emitAdaptiveAutoSelect(pick);
    }

    /** A click on a resource row or column header. */
    handleResourceClick(resource: SchedulerResource | null | undefined): void {
        if (!resource) return;
        if (this.adaptive()) this.inputs.setSelectedResourceId(resource.id);
        this.inputs.emitResourceClick(resource);
    }

    /**
     * The resources an event belongs to.
     *
     * `resourceIds` wins over `resourceId` so one appointment can occupy several columns — a meeting
     * that books a room AND a projector is one event, not two.
     */
    resourceIdsOf(event: SchedulerEvent): (string | number)[] {
        const many = event['resourceIds'];
        if (Array.isArray(many)) return many.filter((id) => id != null);
        return event.resourceId != null ? [event.resourceId] : [];
    }

    /**
     * Whether an event belongs in a resource's column or lane.
     *
     * `null` asks for the unassigned bucket: an event with no resource, or with one that is not in
     * the bound collection. Dropping those silently is the worst failure a scheduler has.
     */
    eventBelongsTo(event: SchedulerEvent, resourceId: string | number | null): boolean {
        const ids = this.resourceIdsOf(event);
        if (resourceId === null) return !ids.length || !ids.some((id) => this.resourceMap().has(id));
        return ids.includes(resourceId);
    }

    /** Resources indexed by id, for the event → resource lookup. */
    readonly resourceMap = computed(() => new Map(this.inputs.resources().map((resource) => [resource.id, resource])));

    /** Categories indexed by id. */
    readonly categoryMap = computed(() => new Map(this.inputs.categories().map((category) => [category.id, category])));

    /**
     * Title of an event, from `titleField`, falling back to `title` and then to the id so a card is
     * never blank.
     */
    title(event: SchedulerEvent): string {
        const field = this.inputs.titleField();
        return String(event[field] ?? event.title ?? event.id);
    }

    /**
     * Category of an event, resolved through `categoryField`.
     */
    category(event: SchedulerEvent): SchedulerCategory | undefined {
        const field = this.inputs.categoryField();
        return field ? this.categoryMap().get(event[field]) : undefined;
    }

    /**
     * Resource of an event.
     */
    resource(event: SchedulerEvent): SchedulerResource | undefined {
        return event.resourceId != null ? this.resourceMap().get(event.resourceId) : undefined;
    }

    /**
     * Accent colour of an event: its category's, else its resource's, else none. The category wins
     * because it is the classification the legend explains.
     */
    accentColor(event: SchedulerEvent): string | undefined {
        return this.category(event)?.color ?? this.resource(event)?.color;
    }

    /** Whether an event is selected. */
    isSelected(event: SchedulerEvent): boolean {
        return this.selectedEventIds().has(event.id);
    }

    /** Whether a day is part of the date selection. */
    isDateSelected(date: Date): boolean {
        return this.selectedDates().includes(dayKey(date));
    }

    /** Whether a day is a working day. */
    isWorkDay(date: Date): boolean {
        return this.workDays().includes(date.getDay());
    }

    /** Moves the anchor date by one range in either direction. */
    move(direction: -1 | 1): void {
        this.inputs.setDate(
            navigate(this.inputs.view(), this.inputs.date(), direction, {
                dayCount: this.inputs.dayCount(),
                monthCount: this.monthCount(),
                agendaDays: this.inputs.agendaDays()
            })
        );
    }

    /**
     * Jumps to a date in the day view. The year view is a navigator, so its cells lead here.
     */
    goToDay(date: Date): void {
        this.inputs.setDate(startOfDay(date));
        this.inputs.setView('day');
    }

    /** Moves the anchor date to today — today in the rendered zone, which is the one on screen. */
    goToToday(): void {
        this.inputs.setDate(startOfDay(this.now()));
    }

    /** Switches view, keeping the anchor date. */
    changeView(view: SchedulerViewType): void {
        this.inputs.setView(view);
    }

    /** Toggles a category filter. */
    toggleCategory(id: string | number): void {
        const next = new Set(this.hiddenCategories());
        next.has(id) ? next.delete(id) : next.add(id);
        this.hiddenCategories.set(next);
    }

    /** Clears every category filter. */
    clearCategoryFilter(): void {
        this.hiddenCategories.set(new Set());
    }

    /**
     * Applies a click to the selection.
     *
     * `single` replaces the selection, `multiple` toggles the clicked event, and `none` selects
     * nothing at all — a Scheduler used purely as a read-only display should not accumulate state.
     */
    selectEvent(event: SchedulerEvent, mode: 'none' | 'single' | 'multiple', additive: boolean, max: number): boolean {
        if (mode === 'none') return true;

        const current = this.selectedEventIds();
        if (mode === 'single' || !additive) {
            this.selectedEventIds.set(current.has(event.id) && current.size === 1 ? new Set() : new Set([event.id]));
            return true;
        }

        const next = new Set(current);
        if (next.has(event.id)) {
            next.delete(event.id);
        } else {
            // The cap is checked BEFORE adding and the caller is told: the root emits
            // eventSelectionLimitReached instead of swallowing the click in silence.
            if (Number.isFinite(max) && next.size >= max) return false;
            next.add(event.id);
        }
        this.selectedEventIds.set(next);
        return true;
    }

    /** Clears the event selection. */
    clearSelection(): void {
        this.selectedEventIds.set(new Set());
    }

    /** Closes every overlay. */
    closeOverlays(): void {
        this.morePopover.set(null);
        this.quickInfo.set(null);
        this.eventPopover.set(null);
        this.contextMenu.set(null);
    }

    /** Localised name of a view. */
    viewLabel(view: SchedulerViewType): string {
        return this.labels().views[view] ?? view;
    }

    /** Asks the application to delete the selected events. */
    requestBulkDelete(): void {
        this.inputs.bulkDelete(this.selectedEvents().map((event) => this.realOf(event)));
    }

    /**
     * A click on an event surface: updates the selection, opens the quick info if it is enabled, and
     * emits `eventClick` either way.
     *
     * The order matters. The selection is applied first so an application listening to
     * `eventClick` already sees the new selection, and a rejected click (the selection cap) emits
     * `eventSelectionLimitReached` instead of silently doing nothing.
     */
    handleEventClick(originalEvent: MouseEvent | KeyboardEvent, event: SchedulerEvent): void {
        // The click that ends a drag is not a click: without this, moving an appointment would
        // select it and open its quick info on release.
        if (this.drag.consumeClickSuppression()) return;

        const mode = this.inputs.selectionMode();
        const max = this.inputs.maxSelection();
        const additive = originalEvent.ctrlKey || originalEvent.metaKey || originalEvent.shiftKey;

        const accepted = this.selectEvent(event, mode, additive, max);
        if (!accepted) {
            this.inputs.emitSelectionLimit(max);
        } else if (mode !== 'none') {
            this.inputs.emitSelectionChange(this.selectedEvents().map((candidate) => this.realOf(candidate)));
        }

        if (this.inputs.quickInfoEnabled()) {
            this.quickInfo.set({ event, anchor: (originalEvent.currentTarget as HTMLElement) ?? undefined });
            this.inputs.emitQuickInfoShow(this.realOf(event));
        }

        // Sin hover no hay quien abra el popover: en un puntero grueso lo abre la propia
        // activacion, que es el unico gesto que existe ahi.
        if (this.inputs.eventPopoverEnabled() && this.inputs.eventPopoverShowOnMobile()) {
            this.eventPopover.set({ event, anchor: (originalEvent.currentTarget as HTMLElement) ?? undefined });
        }

        this.inputs.emitEventClick(originalEvent, this.realOf(event));
    }

    /**
     * Hover or focus on an event surface: opens the event popover when the root enabled it.
     *
     * Focus counts as well as hover on purpose — an overlay only a mouse can reach is an overlay a
     * keyboard user cannot read.
     */
    handleEventPeek(originalEvent: Event, event: SchedulerEvent): void {
        if (!this.inputs.eventPopoverEnabled()) return;
        this.eventPopover.set({ event, anchor: (originalEvent.currentTarget as HTMLElement) ?? undefined });
    }

    /** The pointer or the focus left the event surface. */
    handleEventPeekEnd(): void {
        if (this.eventPopover()) this.eventPopover.set(null);
    }

    /**
     * A right click on an event or a cell: opens the context menu when the root enabled it.
     *
     * The browser menu is only suppressed when the Scheduler actually has one to show, so a page
     * that did not ask for it keeps the native menu instead of losing it to a no-op.
     */
    handleContextMenu(originalEvent: MouseEvent, target: SchedulerOverlayTarget): void {
        if (!this.inputs.contextMenuEnabled()) return;
        originalEvent.preventDefault();
        this.contextMenu.set({ ...target, anchor: (originalEvent.currentTarget as HTMLElement) ?? undefined });
        this.inputs.emitContextMenuShow({ ...target, ...(target.event ? { event: this.realOf(target.event) } : {}), events: target.events?.map((event) => this.realOf(event)) });
    }

    /**
     * Turns a payload into what the application should receive: its own event, and real instants.
     *
     * An endpoint the interaction did NOT move comes back byte-exact from the bound event rather than
     * through the wall clock — which is what removes the repeated-hour ambiguity from every real
     * flow. Resizing the end of an event that starts inside a fall-back hour used to walk its start
     * back by an hour; now the start is simply the start it already had.
     */
    private realise(payload: SchedulerDragPayload): SchedulerDragPayload {
        const event = this.realOf(payload.event);
        if (!this.inputs.timeZone()) return { ...payload, event };

        const displayed = payload.event;
        const startMoved = toDate(displayed.start).getTime() !== payload.start.getTime();
        const displayedEnd = displayed.end != null ? toDate(displayed.end).getTime() : null;
        const endMoved = displayedEnd == null || displayedEnd !== payload.end.getTime();

        return {
            ...payload,
            event,
            start: startMoved ? this.fromDisplay(payload.start) : toDate(event.start),
            end: endMoved || event.end == null ? this.fromDisplay(payload.end) : toDate(event.end)
        };
    }

    /**
     * A click on an empty slot, which is how a new appointment starts.
     *
     * The date selection is applied BEFORE the output fires, so an application listening to
     * `dateClick` already sees the selection the click produced. The instants are converted out of
     * the rendered zone first.
     */
    handleSlotClick(originalEvent: MouseEvent | KeyboardEvent, start: Date, end: Date): void {
        this.selectDate(start);
        this.inputs.emitSlotClick(originalEvent, this.fromDisplay(start), this.fromDisplay(end));
    }

    /**
     * Asks the application to edit an event. The Scheduler never mutates it itself.
     *
     * An occurrence of a series is reported through `(recurrenceEdit)` instead, because "save this
     * appointment" is an ambiguous instruction when the appointment is one of fifty: the page has to
     * ask whether it means the occurrence or the series, and it is the only one that can.
     */
    requestEdit(event?: SchedulerEvent): void {
        if (!event) return;
        if (this.reportRecurrence(event, 'edit')) return;
        this.inputs.eventChange(this.realOf(event));
    }

    /**
     * The quick info's edit action.
     *
     * It reports through `(quickInfoEdit)` as well as asking for the change, because the two are
     * different facts: one is "the user pressed edit in the quick info", which is where a page opens
     * its form, and the other is "this event should be saved".
     */
    requestQuickInfoEdit(event?: SchedulerEvent): void {
        if (!event) return;
        this.inputs.emitQuickInfoEdit(this.realOf(event));
        this.requestEdit(event);
    }

    /** The quick info's delete action. */
    requestQuickInfoDelete(event?: SchedulerEvent): void {
        if (!event) return;
        this.inputs.emitQuickInfoDelete(this.realOf(event));
        this.requestRemove(event);
    }

    /** Asks the application to delete an event, or to decide the scope when it is an occurrence. */
    requestRemove(event?: SchedulerEvent): void {
        if (!event) return;
        if (this.reportRecurrence(event, 'delete')) return;
        this.inputs.eventRemove(this.realOf(event));
    }

    /**
     * The series an occurrence came from, or `undefined` when the event is not part of one.
     *
     * An expanded occurrence carries `seriesId`; the series itself is the bound event with that id,
     * which is the object the application has to write to.
     */
    seriesOf(event: SchedulerEvent): SchedulerEvent | undefined {
        // `recurrenceId` on an expanded occurrence is the id of the series it came from; the instant
        // it was generated for is `recurrenceStart`.
        const seriesId = event['recurrenceId'];

        if (seriesId == null) return undefined;

        return this.inputs.events().find((candidate) => candidate.id === seriesId);
    }

    /**
     * Reports an interaction on an occurrence, and says whether it did.
     *
     * `false` means this is an ordinary event and the caller should carry on with the plain output;
     * `true` means the question has been handed to the page and the caller must not also fire the
     * unscoped one, or the application would receive both.
     */
    private reportRecurrence(event: SchedulerEvent, kind: 'edit' | 'delete', change?: { start: Date; end: Date; apply: () => void; revert: () => void }): boolean {
        const options = this.recurrenceEdit();

        if (!options) return false;
        if (kind === 'edit' && change && !options.askOnDrag) return false;
        if (kind === 'delete' && !options.askOnDelete) return false;

        const series = this.seriesOf(event);
        const recurrenceStart = event['recurrenceStart'];

        if (!series || recurrenceStart == null) return false;

        const scope: SchedulerRecurrenceScope = options.defaultScope ?? 'occurrence';
        const payload: SchedulerRecurrenceEditEvent = {
            occurrence: this.realOf(event),
            series,
            occurrenceStart: this.fromDisplay(toDate(recurrenceStart)),
            scope,
            ...(change ? { start: this.fromDisplay(change.start), end: this.fromDisplay(change.end) } : {}),
            // `apply` deja el cambio pendiente puesto bajo el alcance que la pagina elija; sin
            // llamarlo, la cita se queda donde estaba, que es lo que hace segura la pregunta.
            apply: (chosen: SchedulerRecurrenceScope) => {
                if (kind === 'delete') {
                    this.inputs.eventRemove(chosen === 'occurrence' ? this.realOf(event) : series);
                    return;
                }
                change?.apply();
                this.inputs.eventChange(chosen === 'occurrence' ? this.realOf(event) : series);
            },
            revert: () => change?.revert()
        };

        if (kind === 'delete') this.inputs.emitRecurrenceDelete(payload);
        else this.inputs.emitRecurrenceEdit(payload);

        return true;
    }

    /**
     * Activation of an appointment window: a booking, or a cancellation of one already taken.
     *
     * Which of the two it is comes from the slot's own `status`, because the component cannot know
     * it: capacity says how many places are left, not whether THIS viewer holds one of them.
     */
    handleSlotBook(originalEvent: MouseEvent | KeyboardEvent, slot: SchedulerAppointmentSlot): void {
        const bound = this.inputs.appointmentSlots().find((candidate) => candidate === slot || (slot.id != null && candidate.id === slot.id)) ?? slot;
        const payload: SchedulerSlotBookEvent = {
            originalEvent,
            slot: bound,
            start: this.fromDisplay(toDate(slot.start)),
            end: this.fromDisplay(toDate(slot.end))
        };

        if (slot.status === 'booked') this.inputs.emitSlotCancel(payload);
        else this.inputs.emitSlotBook(payload);
    }

    /**
     * Width of one column of the grouped resource views, as a CSS length.
     *
     * `fixed` always uses the declared width; `fit` always divides the container; `auto` divides it
     * until there are more columns than `horizontalResourceOverflowThreshold` and then falls back to
     * the minimum, which is what makes the view scroll instead of squeezing forty crews into a
     * screen. `resourceColumnMinWidth` stays the override for a page that wants to state it outright.
     */
    horizontalResourceColumnWidth(columns: number): string | undefined {
        const explicit = this.inputs.resourceColumnMinWidth();

        if (explicit) return explicit;

        const mode = this.inputs.horizontalResourceColumnMode();
        const width = this.inputs.horizontalResourceColumnWidth();
        const minimum = this.inputs.horizontalResourceMinColumnWidth();

        if (mode === 'fixed' && width != null) return `${width}px`;
        if (mode === 'fit') return undefined;
        if (mode === 'auto' && columns > this.inputs.horizontalResourceOverflowThreshold()) return `${minimum ?? width ?? 160}px`;

        return minimum != null ? `${minimum}px` : undefined;
    }

    /** Minimum width of a DATE column in a resource-first grouped view. */
    readonly horizontalResourceDayMinWidth = computed(() => this.inputs.horizontalResourceDayMinWidth());

    /** Localised time range of an event, for the overlays. */
    eventTimeText(event: SchedulerEvent): string {
        if (event.allDay) return this.labels().allDay;
        const start = toDate(event.start);
        const end = event.end != null ? toDate(event.end) : new Date(start.getTime() + this.defaultEventDuration() * 60_000);
        return formatTimeRange(start, end, this.locale(), this.timeFormat());
    }

    /** Opens the overflow popover for a cell. */
    openMorePopover(date: Date, events: SchedulerEvent[], anchor?: HTMLElement): void {
        // The notice always goes out, popover off included: turning it off is keeping the link to
        // open whatever the page wants, not losing the event.
        this.inputs.emitMoreClick(
            date,
            events.map((event) => this.realOf(event))
        );
        if (!this.inputs.morePopoverEnabled()) return;
        this.morePopover.set({ date, events, anchor });
    }

    /** Minutes one keyboard step moves or resizes an event: the same rounding a drag uses. */
    /**
     * Snap step of the active view, in minutes.
     *
     * The timeline scales get their own step when the root declared one, exactly like a pointer
     * drag does: reading `snapDuration` here made the arrow keys move by a different amount than the
     * mouse in the same view.
     */
    readonly snapMinutes = computed(() => (timelineScaleOf(this.inputs.view()) ? (this.inputs.timelineSnapDuration() ?? this.inputs.snapDuration()) : this.inputs.snapDuration()));
    /**
     * Whether an event may be moved.
     *
     * The event's own `editable` wins over the root's, so a schedule can be editable with a handful
     * of frozen appointments in it without the page having to split the collection.
     */
    isStartEditable(event: SchedulerEvent): boolean {
        return (event.editable ?? this.inputs.editable()) && this.inputs.eventStartEditable();
    }

    /** Whether an event may be resized. */
    isDurationEditable(event: SchedulerEvent): boolean {
        // An all-day event is not resized in the grid: it has no time axis to grab, so changing its
        // range is a form, not a drag.
        if (event.allDay) return false;
        return (event.editable ?? this.inputs.editable()) && this.inputs.eventDurationEditable();
    }

    /** Drives the pointer interactions. Views hand it their pointerdown and it does the rest. */
    readonly drag = new SchedulerDragController({
        view: () => this.inputs.view(),
        startEditable: (event) => this.isStartEditable(event),
        durationEditable: (event) => this.isDurationEditable(event),
        // A timeline can ask for a snap of its own: an hour-wide column laid out horizontally does
        // not want the same step as a half-hour row laid out vertically. It applies to the TIMELINE
        // only, because the vertical day and week grids also produce targets that are not whole
        // days and were picking up the horizontal axis's step.
        snapMinutes: (target: SchedulerDragTarget) => (target.whole ? 24 * 60 : timelineScaleOf(this.inputs.view()) ? (this.inputs.timelineSnapDuration() ?? this.inputs.snapDuration()) : this.inputs.snapDuration()),
        minEventMinutes: () => this.inputs.minEventMinutes(),
        defaultEventDuration: () => this.inputs.defaultEventDuration(),
        minDistance: () => this.inputs.dragMinDistance(),
        // A blocked window is refused BEFORE the application is asked: if the page already declared
        // that it cannot happen there, it should not have to say so again in the callback.
        allow: (info) => !this.overlapsBlocked(info.start, info.end, info.resourceId) && (this.inputs.eventAllow()?.(info) ?? true),
        preview: (id, change, kind) => {
            if (id == null || !change) {
                this.dragPreview.set(null);
                this.draggingEventId.set(null);
                this.resizingEventId.set(null);
                return;
            }
            // The starting point comes from the controller, which captured it when the drag began:
            // looking it up by id here walked the whole collection on every frame.
            this.dragPreview.set({ id, change });
            (kind === 'move' ? this.draggingEventId : this.resizingEventId).set(id);
        },
        commit: (id, change) => {
            const next = new Map(this.pendingChanges());
            next.set(id, change);
            this.pendingChanges.set(next);
        },
        rollback: (id) => {
            const next = new Map(this.pendingChanges());
            next.delete(id);
            this.pendingChanges.set(next);
        },
        // Every output undoes the zone shift: the component draws in the target zone, the
        // application stores real instants.
        emitDragStart: (payload) => this.inputs.emitDragStart(this.realise(payload)),
        emitDrop: (payload) => {
            this.inputs.emitDrop(this.realise(payload));
            // El arrastre ya esta aplicado como cambio pendiente: la pregunta del alcance va DESPUES
            // y trae revert, para que la pagina pueda deshacerlo si el usuario cancela.
            this.reportRecurrence(payload.event, 'edit', { start: payload.start, end: payload.end, apply: () => undefined, revert: () => payload.revert() });
        },
        emitResizeStart: (payload) => this.inputs.emitResizeStart(this.realise(payload)),
        emitResize: (payload) => this.inputs.emitResize(this.realise(payload)),
        emitResizeStop: (payload) => {
            this.inputs.emitResizeStop(this.realise(payload));
            this.reportRecurrence(payload.event, 'edit', { start: payload.start, end: payload.end, apply: () => undefined, revert: () => payload.revert() });
        }
    });

    /**
     * Human title of the visible range.
     *
     * The end of the range is nudged back by a millisecond before formatting: a half-open range
     * ending at midnight on the 1st would otherwise print the next month's name in the header.
     */
    readonly rangeTitle = computed(() => {
        // `locale` y no `inputs.locale`: el titulo tiene que salir en el mismo calendario y el mismo
        // sistema de numeracion que el resto, o el encabezado dice un mes distinto de la rejilla.
        const locale = this.locale();
        const { start, end } = this.range();
        const last = new Date(end.getTime() - 1);
        const view = this.inputs.view();
        const display = this.inputs.dateDisplay();

        // Con dateDisplay manda la pagina: un titulo es copy, y una vista que no lo respeta obliga a
        // sustituir la parte entera para cambiar una coma.
        if (display) {
            const from = start.toLocaleDateString(locale, display);
            const to = last.toLocaleDateString(locale, display);

            return from === to ? from : `${from} - ${to}`;
        }

        const timelineScale = timelineScaleOf(view);
        if (view === 'year' || timelineScale === 'year') {
            return String(start.getFullYear());
        }
        // Month and agenda are titled with the anchor date's month and NOT with the range: the
        // month's range covers whole weeks and spills at both ends — a month starting on a Sunday
        // would be titled with the previous one — and the agenda's is N days from the anchor, which
        // printed as a range gives an "8 Sep - 7 Oct" that says nothing about where you are.
        if (view === 'month' || view === 'resourceMonth' || view === 'dateMonth' || view === 'agenda' || timelineScale === 'month') {
            // Several months on screen are titled as the span they cover, not as the anchor: a
            // header reading "September" over a grid that runs into November is a lie. The year is
            // printed once when both ends share it.
            const months = this.monthCount();
            if (months > 1 && (view === 'month' || view === 'resourceMonth' || view === 'dateMonth')) {
                const first = startOfMonth(this.inputs.date());
                const lastMonth = addMonths(first, months - 1);
                const sameYear = first.getFullYear() === lastMonth.getFullYear();
                const from = first.toLocaleDateString(locale, sameYear ? { month: 'long' } : { month: 'long', year: 'numeric' });
                return `${from} - ${lastMonth.toLocaleDateString(locale, { month: 'long', year: 'numeric' })}`;
            }
            return this.inputs.date().toLocaleDateString(locale, { month: 'long', year: 'numeric' });
        }
        if (dayKey(start) === dayKey(last)) {
            return start.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
        }
        if (start.getFullYear() !== last.getFullYear()) {
            return `${start.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })} - ${last.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })}`;
        }
        if (start.getMonth() !== last.getMonth()) {
            return `${start.toLocaleDateString(locale, { day: 'numeric', month: 'short' })} - ${last.toLocaleDateString(locale, { day: 'numeric', month: 'short' })}`;
        }
        // No year within the same month: across a week the year is noise, and the month is already there once.
        return `${start.getDate()} - ${last.toLocaleDateString(locale, { day: 'numeric', month: 'long' })}`;
    });
}
