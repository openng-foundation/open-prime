import { Directive, EnvironmentInjector, TemplateRef, computed, inject, signal } from '@angular/core';
import type { SchedulerAppointmentSlot, SchedulerEvent, SchedulerResource, SchedulerViewType } from '@openng/optimus-ui/types/scheduler';
import { SCHEDULER_CELL_CONTEXT, SCHEDULER_EVENT_CONTEXT, type SchedulerCellContext, type SchedulerEventContext } from './scheduler-context';
import { dayKey, formatTimeRange, isToday, startOfDay, toDate } from './scheduler-date';
import { SchedulerContextHost } from './scheduler-outlet';
import { moveCellFocus } from './scheduler-keyboard';
import { SCHEDULER_DEF_RESOLVER, type SchedulerSlot } from './scheduler-resolver';
import { SCHEDULER_STATE } from './scheduler-state';

/**
 * Whether a gesture started on an event surface rather than on the cell that contains it.
 *
 * Every rendered event carries `data-event-id`, so one `closest` answers it for all six views
 * without the cell handlers having to know what a view puts inside a cell.
 */
function fromEventSurface(originalEvent: Event): boolean {
    const target = originalEvent.target as HTMLElement | null;
    if (!target || target === originalEvent.currentTarget) return false;
    return typeof target.closest === 'function' && !!target.closest('[data-event-id]');
}

/**
 * What every view renderer shares: access to the state, template resolution against the definition
 * registry, and the per-surface context hosts.
 *
 * The renderers are internal — an application never places `<p-scheduler-month-view>`; it declares
 * `<p-scheduler-month>` as a *scope* and the root picks the renderer for the active view. Keeping
 * the two apart is what lets a page declare definitions for views it is not currently showing.
 *
 * @module scheduler-view-base
 */
@Directive()
export abstract class SchedulerViewBase {
    /** Shared view state. */
    protected readonly state = inject(SCHEDULER_STATE);

    /** The definition registry, reached through a token so the module graph stays acyclic. */
    protected readonly content = inject(SCHEDULER_DEF_RESOLVER, { optional: true });

    private readonly envInjector = inject(EnvironmentInjector);

    /** Which view this renderer is drawing, for `data-view` and for template resolution. */
    abstract readonly view: SchedulerViewType;

    /**
     * Whether this renderer can show resize handles.
     *
     * The month grid and the all-day strip cannot: they have no time axis, so pulling an edge would
     * be editing a date range, which is a form, not a drag.
     */
    protected readonly resizableSurface: boolean = true;

    /**
     * Index of every event context of the current layout, keyed the same way the surfaces are.
     * Filled by {@link collectContexts}, which each renderer calls from its layout computed.
     */
    protected readonly eventContexts = signal<ReadonlyMap<unknown, SchedulerEventContext>>(new Map());

    /** Index of every cell context of the current layout. */
    protected readonly cellContexts = signal<ReadonlyMap<unknown, SchedulerCellContext>>(new Map());

    /** Per-event injectors. Built lazily from the template, never from inside a computed. */
    protected readonly eventHost = new SchedulerContextHost<SchedulerEventContext>(SCHEDULER_EVENT_CONTEXT, this.envInjector, this.eventContexts);

    /** Per-cell injectors. */
    protected readonly cellHost = new SchedulerContextHost<SchedulerCellContext>(SCHEDULER_CELL_CONTEXT, this.envInjector, this.cellContexts);

    /** The injector a stamped event template should run in. Call from the template. */
    eventInjector(key: unknown) {
        return this.eventHost.injectorFor(key);
    }

    /** The injector a stamped cell template should run in. Call from the template. */
    cellInjector(key: unknown) {
        return this.cellHost.injectorFor(key);
    }

    /** Locale used for every label this renderer formats. */
    protected readonly locale = computed(() => this.state.locale());

    ngOnDestroy(): void {
        this.eventHost.destroy();
        this.cellHost.destroy();
    }

    /**
     * The template declared for a slot, or `undefined` to use the renderer's own markup.
     *
     * Resolution goes through {@link SchedulerContent.resolve}, so a definition inside
     * `<p-scheduler-month>` beats one sitting directly in `<p-scheduler-content>`.
     */
    protected def(slot: SchedulerSlot): TemplateRef<any> | undefined {
        return this.content?.resolve(slot, this.view);
    }

    /**
     * Builds the context of an event surface and binds it to its injector.
     *
     * `keySuffix` exists for the events that are drawn as MORE THAN ONE surface: a month event that
     * crosses a week boundary is two bars, and with a single key per event id they would share one
     * context and overwrite each other's `continuesBefore`/`continuesAfter`.
     */
    protected bindEvent(event: SchedulerEvent, extra: Partial<SchedulerEventContext> = {}, keySuffix?: string): { key: unknown; context: SchedulerEventContext & { $implicit: SchedulerEventContext } } {
        const key = keySuffix ? `${event.id}|${keySuffix}` : event.id;
        const context: SchedulerEventContext = {
            event,
            title: this.state.title(event),
            timeText: this.timeText(event),
            view: this.view,
            accentColor: this.state.accentColor(event),
            category: this.state.category(event),
            resource: this.state.resource(event),
            selected: this.state.isSelected(event),
            focused: this.state.focusedEventId() === event.id,
            dragging: this.state.draggingEventId() === event.id,
            resizing: this.state.resizingEventId() === event.id,
            draggable: this.state.isStartEditable(event),
            resizable: this.state.isDurationEditable(event) && this.resizableSurface,
            continuesBefore: false,
            continuesAfter: false,
            ...extra
        };
        return { key, context: { ...context, $implicit: context, context } as any };
    }

    /**
     * Builds the context of a date or time cell.
     */
    protected bindCell(date: Date, events: SchedulerEvent[], extra: Partial<SchedulerCellContext> = {}, kind = 'cell'): { key: unknown; context: SchedulerCellContext & { $implicit: SchedulerCellContext } } {
        // `kind` separates surfaces that fall on the SAME instant: the day header, its all-day cell
        // and the midnight cell are all three midnight, and with one key they overwrote each other's
        // context.
        const key = `${kind}|${dayKey(date)}|${date.getHours()}:${date.getMinutes()}${extra.resource ? `|${extra.resource.id}` : ''}`;
        const context: SchedulerCellContext = {
            date,
            label: this.cellLabel(date),
            dateKey: dayKey(date),
            events,
            count: events.length,
            today: isToday(date, this.state.now()),
            weekend: date.getDay() === 0 || date.getDay() === 6,
            otherMonth: false,
            businessHours: this.state.isBusinessTime(date),
            blocked: this.state.isBlocked(date, extra.resource?.id),
            selected: this.state.isDateSelected(date),
            disabled: false,
            ...extra
        };
        return { key, context: { ...context, $implicit: context, context } as any };
    }

    /** Label a cell shows by default. Overridden by the views that need something else. */
    protected cellLabel(date: Date): string {
        return String(date.getDate());
    }

    /**
     * Localised time range of an event, e.g. `9:00 AM - 10:30 AM`. An all-day event has no time to
     * show.
     */
    protected timeText(event: SchedulerEvent): string {
        if (event.allDay) return this.state.labels().allDay;
        const start = toDate(event.start);
        const end = event.end != null ? toDate(event.end) : new Date(start.getTime() + this.state.defaultEventDuration() * 60_000);
        return formatTimeRange(start, end, this.locale(), this.state.timeFormat());
    }

    /** Splits the visible events into the all-day strip and the time grid. */
    protected partitionEvents(events: SchedulerEvent[]): { allDay: SchedulerEvent[]; timed: SchedulerEvent[] } {
        const allDay: SchedulerEvent[] = [];
        const timed: SchedulerEvent[] = [];
        for (const event of events) {
            // An event marked allDay, and one covering 24 h or more as well, belong in the top
            // band: drawing a 24 h bar in the time grid buries everything else that day.
            const start = toDate(event.start);
            const end = event.end != null ? toDate(event.end) : start;
            (event.allDay || end.getTime() - start.getTime() >= 86_400_000 ? allDay : timed).push(event);
        }
        return { allDay, timed };
    }

    /**
     * Publishes the contexts of a finished layout so the per-surface injectors can look themselves
     * up, and drops the injectors of the surfaces that are gone.
     *
     * Called from `ngAfterViewChecked` and NOT from the layout computed: writing these signals
     * inside a computed is exactly what Angular forbids.
     */
    protected publishContexts(events: Iterable<{ key: unknown; context: any }>, cells: Iterable<{ key: unknown; context: any }>): void {
        const eventIndex = new Map<unknown, any>();
        for (const item of events) eventIndex.set(item.key, item.context);
        const cellIndex = new Map<unknown, any>();
        for (const item of cells) cellIndex.set(item.key, item.context);

        this.eventContexts.set(eventIndex);
        this.cellContexts.set(cellIndex);
        this.eventHost.sweep();
        this.cellHost.sweep();
    }

    /** Handles a click on an event surface. */
    protected onEventClick(originalEvent: MouseEvent | KeyboardEvent, event: SchedulerEvent): void {
        this.state.handleEventClick(originalEvent, event);
    }

    /** A press on an event surface, which may turn into a move. */
    protected onEventPointerDown(originalEvent: PointerEvent, event: SchedulerEvent): void {
        this.state.drag.startMove(originalEvent, event);
    }

    /** A press on a resize handle. */
    protected onResizePointerDown(originalEvent: PointerEvent, event: SchedulerEvent, edge: 'start' | 'end'): void {
        this.state.drag.startResize(originalEvent, event, edge);
    }

    /**
     * Handles a click on an empty slot.
     *
     * Ignores a gesture that came from an event surface inside the cell. A month event lives INSIDE
     * its day cell, so clicking it also reached here and fired `dateClick` on top of `eventClick` —
     * one gesture, two unrelated outputs. The test is the surface it came from and not
     * `target !== currentTarget`, because the cell's own content — the day number, a custom cell
     * template — is a legitimate place to click the cell.
     */
    protected onSlotClick(originalEvent: MouseEvent | KeyboardEvent, start: Date, end: Date, disabled = false): void {
        // A full slot is announced aria-disabled: activating it with the pointer would select the
        // date and emit slotClick anyway, which is exactly what it says cannot be done.
        if (disabled || fromEventSurface(originalEvent)) return;
        this.state.handleSlotClick(originalEvent, start, end);
    }

    /**
     * Keyboard activation of a standalone slot surface, such as an appointment window.
     *
     * It is announced as a button, so Enter and space have to do what a click does. Nothing else is
     * handled: the slot is not part of the arrow ring, and swallowing the arrows there would break
     * out of the grid it floats over.
     */
    protected onSlotKeydown(originalEvent: KeyboardEvent, start: Date, end: Date, disabled = false): void {
        if (disabled || (originalEvent.key !== 'Enter' && originalEvent.key !== ' ')) return;
        originalEvent.preventDefault();
        this.state.handleSlotClick(originalEvent, start, end);
    }

    /**
     * Activation of an appointment window.
     *
     * It reports twice on purpose, and the two say different things: `dateClick` is "the user picked
     * this interval", which a page listens to whether or not the interval happens to be a declared
     * window, and `slotBook`/`slotCancel` is "the user acted on THIS window", with the window's own
     * object and its metadata. A page that only wants the second ignores the first.
     */
    protected onSlotActivate(originalEvent: MouseEvent | KeyboardEvent, slot: { full: boolean; slot: SchedulerAppointmentSlot }): void {
        if (slot.full && slot.slot.status !== 'booked') return;

        this.state.handleSlotClick(originalEvent, toDate(slot.slot.start), toDate(slot.slot.end));
        this.state.handleSlotBook(originalEvent, slot.slot);
    }

    /** Enter and space on an appointment window, which is announced as a button. */
    protected onSlotActivateKeydown(originalEvent: KeyboardEvent, slot: { full: boolean; slot: SchedulerAppointmentSlot }): void {
        if (originalEvent.key !== 'Enter' && originalEvent.key !== ' ') return;
        originalEvent.preventDefault();
        this.onSlotActivate(originalEvent, slot);
    }

    /** Pointer or focus entering an event surface, which is what opens the event popover. */
    protected onEventPeek(originalEvent: Event, event: SchedulerEvent): void {
        this.state.handleEventPeek(originalEvent, event);
    }

    /** Pointer or focus leaving an event surface. */
    protected onEventPeekEnd(): void {
        this.state.handleEventPeekEnd();
    }

    /** Right click on an event surface. */
    protected onEventContextMenu(originalEvent: MouseEvent, event: SchedulerEvent): void {
        this.state.handleContextMenu(originalEvent, { event });
    }

    /**
     * Keyboard navigation and activation on an empty cell.
     *
     * Arrows walk the grid, Home and End jump to the ends of the row or column, and Enter or space
     * activates the cell — which is what starts an appointment. A move that would leave the grid is
     * NOT swallowed, so the arrow keeps scrolling the page instead of trapping focus at the edge.
     */
    protected onCellKeydown(originalEvent: KeyboardEvent, start: Date, end: Date): void {
        const cell = originalEvent.currentTarget as HTMLElement | null;
        // A key that came from a month event has already been handled by its own surface.
        if (fromEventSurface(originalEvent)) return;

        if (originalEvent.key === 'Enter' || originalEvent.key === ' ') {
            originalEvent.preventDefault();
            this.state.handleSlotClick(originalEvent, start, end);
            return;
        }

        if (cell && moveCellFocus(cell, originalEvent.key, this.state.rtl())) originalEvent.preventDefault();
    }

    /** Activation of a resource row or column header. */
    protected onResourceClick(resource: SchedulerResource | null | undefined): void {
        this.state.handleResourceClick(resource);
    }

    /**
     * Keyboard editing on a focused event surface.
     *
     * Arrows move: up and down by one snap step, left and right by a day. With shift they resize the
     * end instead. Enter and space activate the surface, which is what a button is announced as
     * doing.
     *
     * It goes through the same controller as a drag, so the validation, the pending change and the
     * outputs are identical. A schedule that can only be edited with a mouse is a schedule some
     * users cannot edit, and giving the keyboard its own shortcut pipeline is how the two drift.
     */
    protected onEventKeydown(originalEvent: KeyboardEvent, event: SchedulerEvent): void {
        const snap = this.state.snapMinutes();
        const day = 24 * 60;
        const step = originalEvent.key === 'ArrowUp' ? -snap : originalEvent.key === 'ArrowDown' ? snap : originalEvent.key === 'ArrowLeft' ? -day : originalEvent.key === 'ArrowRight' ? day : 0;

        if (step) {
            if (this.state.drag.nudge(originalEvent, event, originalEvent.shiftKey ? 'resize' : 'move', step)) originalEvent.preventDefault();
            return;
        }

        if (originalEvent.key === 'Enter' || originalEvent.key === ' ') {
            originalEvent.preventDefault();
            this.state.handleEventClick(originalEvent, event);
        }
    }

    /** Right click on a date or time cell. */
    protected onCellContextMenu(originalEvent: MouseEvent, date: Date, events: SchedulerEvent[] = []): void {
        this.state.handleContextMenu(originalEvent, { date, events });
    }

    /** Today's midnight in the rendered zone, so the highlight does not go stale. */
    protected readonly todayKey = computed(() => dayKey(startOfDay(this.state.now())));
}
