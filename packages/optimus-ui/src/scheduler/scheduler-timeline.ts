import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, PLATFORM_ID, ViewEncapsulation, computed, inject, input, signal, viewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NgTemplateOutlet } from '@angular/common';
import type { SchedulerEvent, SchedulerResource, SchedulerTimelineScale, SchedulerViewType } from '@openng/optimus-ui/types/scheduler';
import { isResourceTimeline, timelineScaleOf, toDate } from './scheduler-date';
import { layoutTimeGrid } from './scheduler-layout';
import { buildTimelineAxis, placeOnAxis } from './scheduler-timeline-axis';
import { SchedulerViewBase } from './scheduler-view-base';
import type { SchedulerState } from './scheduler-state';

/**
 * The timeline: time laid out left to right instead of top to bottom.
 *
 * One renderer covers all eight timeline views, because they differ in only two dimensions — how
 * many lanes they have (`timeline*` is a single lane, `resourceTimeline*` is one per resource plus a
 * sticky rail of labels) and how far the axis spans (a day, a week, a month, a year). Splitting them
 * would duplicate the axis, the header, the scroll container and the positioning maths four times
 * over.
 *
 * The axis itself lives in {@link buildTimelineAxis}: on the day and week scales it is made of time
 * slots bounded by `dayStartHour`/`dayEndHour` and therefore skips the nights, so an event's
 * position is NOT a linear fraction of the range and has to be asked for.
 *
 * The rail is `position: sticky` rather than a separate scroller: two scrollers side by side have to
 * be synchronised by hand, and they drift the moment anything else scrolls the page.
 *
 * @module scheduler-timeline
 */
@Component({
    selector: 'p-scheduler-timeline-view',
    standalone: true,
    imports: [NgTemplateOutlet],
    template: `
        <div class="p-scheduler-timeline" [class.p-scheduler-timeline-resource]="grouped()" [attr.data-view]="view" [attr.data-scale]="scale()">
            <!-- ── Resource rail, stuck to the start of the line ───────────────────────────────── -->
            @if (grouped()) {
                <div class="p-scheduler-resource-area" data-slot="scheduler-resource-area" [style.--p-scheduler-timeline-tiers]="tiers().length">
                    <div class="p-scheduler-resource-area-header" data-slot="scheduler-resource-area-header">
                        @if (resourceAreaHeaderDef(); as tpl) {
                            <ng-container *ngTemplateOutlet="tpl" />
                        } @else {
                            {{ labels().resources }}
                        }
                    </div>
                    <div class="p-scheduler-resource-list" data-slot="scheduler-resource-list">
                        @for (lane of lanes(); track lane.key) {
                            <div
                                class="p-scheduler-resource"
                                data-slot="scheduler-resource"
                                [attr.data-resource-id]="lane.resource?.id"
                                [attr.data-depth]="lane.depth"
                                [attr.data-event-count]="lane.events.length"
                                [attr.data-group]="lane.context.group ? '' : null"
                                [attr.data-expanded]="lane.context.group ? (lane.context.expanded ? '' : null) : null"
                                [style.padding-inline-start.rem]="lane.depth ? lane.depth * 0.75 : null"
                            >
                                <!-- El desplegable va FUERA de la definicion: es el control del
                                     componente y una plantilla propia no tiene que reimplementarlo
                                     para no perderlo. -->
                                @if (expandable() && lane.context.group) {
                                    <button type="button" class="p-scheduler-resource-toggle" data-slot="scheduler-resource-toggle" [attr.aria-expanded]="lane.context.expanded" [attr.aria-label]="lane.title" (click)="lane.context.toggle()"></button>
                                }
                                @if (resourceRowDef() ?? (lane.context.group ? (resourceGroupDef() ?? resourceDef()) : resourceDef()); as tpl) {
                                    <ng-container *ngTemplateOutlet="tpl; context: lane.context" />
                                } @else {
                                    <span class="p-scheduler-resource-dot" [style.background]="lane.resource?.color" aria-hidden="true"></span>
                                    <span class="p-scheduler-resource-label">{{ lane.title }}</span>
                                    @if (lane.context.aggregateCount) {
                                        @if (aggregateBadgeDef(); as badge) {
                                            <ng-container *ngTemplateOutlet="badge; context: lane.context" />
                                        } @else {
                                            <span class="p-scheduler-resource-count" data-slot="scheduler-resource-aggregate-badge">{{ lane.context.aggregateCount }}</span>
                                        }
                                    }
                                }
                            </div>
                        }
                    </div>
                </div>
            }

            <!-- ── Eje horizontal + carriles ──────────────────────────────────────────────────── -->
            <div #scroll class="p-scheduler-timeline-scroll" [attr.data-virtual]="virtualized() ? '' : null" [style.--p-scheduler-timeline-cols]="slots().length" [style.--p-scheduler-timeline-tiers]="tiers().length" (scroll)="onScroll()">
                <!-- The context bands above the columns: without them an axis of hours does not
                     say which day they belong to, and one of days does not say which month. Each
                     cell spans the columns it owns through a shared grid template, which is what
                     keeps them squared with the axis. -->
                @for (tier of tiers(); track tier.key) {
                    <div class="p-scheduler-timeline-tier" [attr.data-tier]="tier.key" [style.--p-scheduler-timeline-tier-index]="$index">
                        @for (cell of tier.cells; track cell.key) {
                            <!-- The label goes in a sticky span rather than loose in the cell: a
                                 period cell spans thirty columns and its text scrolled out of view as
                                 soon as the axis moved, leaving the band blank. -->
                            <div class="p-scheduler-timeline-tier-cell" [attr.data-today]="cell.today && multiDay() ? '' : null" [style.--p-scheduler-timeline-span]="cell.span">
                                <span class="p-scheduler-timeline-tier-label">{{ cell.label }}</span>
                            </div>
                        }
                    </div>
                }

                <div class="p-scheduler-timeline-header">
                    <!-- With virtualization only the visible window is mounted, so every cell says
                         which column it goes in: without grid-column-start the first mounted cell
                         would land in column 1 and the whole axis would slide as you scroll. -->
                    @for (slot of visibleSlots(); track slot.key) {
                        <div
                            class="p-scheduler-timeline-header-cell"
                            data-slot="scheduler-timeline-header-cell"
                            [attr.data-time]="slot.label"
                            [attr.data-major]="slot.major ? '' : null"
                            [attr.data-today]="slot.today && multiDay() ? '' : null"
                            [attr.data-col-index]="slot.index"
                            [style.grid-column-start]="slot.index + 1"
                        >
                            @if (timelineHeaderCellDef(); as tpl) {
                                <ng-container *ngTemplateOutlet="tpl; context: slot.context" />
                            } @else if (slot.major || !dense()) {
                                {{ slot.label }}
                            }
                        </div>
                    }
                </div>

                <div class="p-scheduler-timeline-body" data-slot="scheduler-timeline-body">
                    <!-- La linea de ahora cruza TODOS los carriles y va en el cuerpo, no dentro de
                         uno: en horizontal el instante actual es una vertical, y repetirla por
                         carril la partiria en los bordes de cada fila. -->
                    @if (state.nowIndicator() && nowOffset() != null) {
                        <div class="p-scheduler-timeline-now-indicator" data-slot="scheduler-now-indicator" aria-hidden="true" [style.inset-inline-start.%]="nowOffset()! * 100"></div>
                    }
                    @for (lane of visibleLanes(); track lane.key) {
                        <div class="p-scheduler-timeline-lane" data-slot="scheduler-timeline-lane" [attr.data-resource-id]="lane.resource?.id" [style.--p-scheduler-timeline-rows]="lane.rowCount">
                            <div class="p-scheduler-timeline-cells">
                                @for (cell of lane.cells; track cell.key) {
                                    <div
                                        class="p-scheduler-timeline-cell"
                                        data-slot="scheduler-timeline-cell"
                                        [attr.data-major]="cell.major ? '' : null"
                                        [attr.data-today]="cell.today && multiDay() ? '' : null"
                                        [attr.data-blocked]="cell.binding.context.blocked ? '' : null"
                                        [attr.data-start-date]="cell.start.getTime()"
                                        [attr.data-end-date]="cell.end.getTime()"
                                        [attr.data-col-index]="cell.index"
                                        [style.grid-column-start]="cell.index + 1"
                                        data-nav-cell=""
                                        role="button"
                                        [attr.aria-label]="cell.ariaLabel"
                                        [attr.tabindex]="$first && lane.key === visibleLanes()[0].key ? 0 : -1"
                                        (click)="onSlotClick($event, cell.start, cell.end)"
                                        (keydown)="onCellKeydown($event, cell.start, cell.end)"
                                        (contextmenu)="onCellContextMenu($event, cell.start)"
                                    >
                                        @if (timelineCellDef(); as tpl) {
                                            <ng-container *ngTemplateOutlet="tpl; context: cell.binding.context; injector: cellInjector(cell.binding.key)" />
                                        }
                                    </div>
                                }
                            </div>

                            @for (item of lane.items; track item.key) {
                                <div
                                    class="p-scheduler-timeline-event"
                                    data-slot="scheduler-timeline-event"
                                    [attr.data-event-id]="item.context.event.id"
                                    [attr.data-selected]="item.context.selected ? '' : null"
                                    [attr.data-continues-before]="item.context.continuesBefore ? '' : null"
                                    [attr.data-continues-after]="item.context.continuesAfter ? '' : null"
                                    [style.inset-inline-start.%]="item.offset * 100"
                                    [style.inline-size.%]="item.size * 100"
                                    [style.--p-scheduler-event-row]="item.row"
                                    [style.--p-scheduler-event-border-accent]="item.context.accentColor"
                                    (click)="onEventClick($event, item.context.event)"
                                    (mouseenter)="onEventPeek($event, item.context.event)"
                                    (mouseleave)="onEventPeekEnd()"
                                    (focusin)="onEventPeek($event, item.context.event)"
                                    (focusout)="onEventPeekEnd()"
                                    (contextmenu)="onEventContextMenu($event, item.context.event)"
                                    (pointerdown)="onEventPointerDown($event, item.context.event)"
                                    (keydown)="onEventKeydown($event, item.context.event)"
                                    tabindex="0"
                                    role="button"
                                    [attr.data-dragging]="item.context.dragging ? '' : null"
                                    [attr.data-resizing]="item.context.resizing ? '' : null"
                                    [attr.data-draggable]="item.context.draggable ? '' : null"
                                >
                                    @if (timelineEventDef(); as tpl) {
                                        <ng-container *ngTemplateOutlet="tpl; context: item.context; injector: eventInjector(item.key)" />
                                    } @else {
                                        <span class="p-scheduler-event-title">{{ item.context.title }}</span>
                                        <span class="p-scheduler-event-time">{{ item.context.timeText }}</span>
                                    }
                                    @if (item.context.resizable) {
                                        <!-- The handles live INSIDE the event's surface, so their
                                             pointerdown has to stop propagation or the same gesture
                                             would start a move as well. The controller does it. -->
                                        <span class="p-scheduler-event-resize-handle" data-slot="scheduler-event-resize-handle" data-edge="start" aria-hidden="true" (pointerdown)="onResizePointerDown($event, item.context.event, 'start')"></span>
                                        <span class="p-scheduler-event-resize-handle" data-slot="scheduler-event-resize-handle" data-edge="end" aria-hidden="true" (pointerdown)="onResizePointerDown($event, item.context.event, 'end')"></span>
                                    }
                                </div>
                            }
                        </div>
                    } @empty {
                        <div class="p-scheduler-timeline-empty">{{ labels().empty }}</div>
                    }
                </div>
            </div>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { class: 'p-scheduler-view p-scheduler-view-timeline' }
})
export class SchedulerTimelineView extends SchedulerViewBase {
    /** Which of the timeline views is being drawn. */
    readonly viewType = input.required<SchedulerViewType>();

    /** @internal */
    override get view(): SchedulerViewType {
        return this.viewType();
    }

    /** Whether the lanes are resources rather than a single lane. */
    readonly grouped = computed(() => isResourceTimeline(this.viewType()));

    /** How far the axis spans. */
    readonly scale = computed<SchedulerTimelineScale>(() => timelineScaleOf(this.viewType()) ?? 'day');

    /** @internal */
    readonly labels = computed(() => this.state.labels());

    /** @internal */
    readonly timelineHeaderCellDef = computed(() => this.def('timelineHeaderCell'));
    /** @internal */
    readonly timelineCellDef = computed(() => this.def('timelineCell'));
    /** @internal */
    readonly timelineEventDef = computed(() => this.def('timelineEvent'));
    /** @internal */
    readonly resourceAreaHeaderDef = computed(() => this.def('resourceAreaHeader'));
    /** @internal */
    readonly resourceRowDef = computed(() => this.def('resourceRow'));
    /** @internal */
    readonly resourceDef = computed(() => this.def('resource'));
    /** @internal */
    readonly resourceGroupDef = computed(() => this.def('resourceGroup'));
    /** @internal */
    readonly aggregateBadgeDef = computed(() => this.def('resourceAggregateBadge'));

    /**
     * Where the current instant sits along the axis, or `null` when it is outside the range.
     *
     * `position` and not a fraction of the range: the day and week scales skip the nights, so
     * 22:00 on an axis that draws 07:00 to 19:00 is not 92% of the way across it.
     */
    readonly nowOffset = computed(() => {
        const now = this.state.now();
        const { start, end } = this.state.range();

        if (now < start || now >= end) return null;

        return this.axis().position(now);
    });

    /** Whether the rail offers the collapse gesture, which needs a hierarchy to mean anything. */
    readonly expandable = computed(() => this.state.resourcesExpandable() && this.state.resources().some((resource) => resource.parentId != null));

    /** The axis of the active scale. */
    readonly axis = computed(() =>
        buildTimelineAxis(this.scale(), {
            range: this.state.range(),
            dayBounds: this.state.dayBounds(),
            slotMinutes: this.state.timelineSlotMinutes(),
            firstDayOfWeek: this.state.firstDayOfWeek(),
            locale: this.locale(),
            timeFormat: this.state.timeFormat(),
            now: this.state.now()
        })
    );

    /** Columns of the axis, with their index and the context a header-cell definition receives. */
    readonly slots = computed(() =>
        this.axis().slots.map((slot, index) => ({
            ...slot,
            index,
            context: { $implicit: slot.start, date: slot.start, end: slot.end, label: slot.label, hour: slot.start.getHours(), minute: slot.start.getMinutes(), major: slot.major, today: slot.today }
        }))
    );

    /** Horizontal scroll offset of the axis, in pixels. */
    private readonly scrollOffset = signal(0);

    /** Width of the scroll viewport, in pixels. */
    private readonly viewportWidth = signal(0);

    /** Measured width of one column, in pixels. */
    private readonly columnWidth = signal(0);

    /**
     * Whether the axis is being windowed.
     *
     * `auto` only turns it on past `timelineVirtualThreshold`, because windowing costs a scroll
     * listener and a measurement per frame and buys nothing on a twelve-column year. It also needs a
     * measured column width: until the first measurement lands, everything is rendered, which is the
     * safe direction to be wrong in.
     */
    readonly virtualized = computed(() => {
        const mode = this.state.timelineVirtualScroll();
        if (mode === false) return false;
        if (!this.columnWidth() || !this.viewportWidth()) return false;
        return mode === true || this.slots().length >= this.state.timelineVirtualThreshold();
    });

    /** Index range of the columns to mount, inclusive. */
    private readonly windowRange = computed(() => {
        const slots = this.slots();
        if (!this.virtualized()) return { first: 0, last: slots.length - 1 };

        const width = this.columnWidth();
        const overscan = this.state.timelineVirtualOverscan();
        const first = Math.max(Math.floor(this.scrollOffset() / width) - overscan, 0);
        const last = Math.min(Math.ceil((this.scrollOffset() + this.viewportWidth()) / width) + overscan, slots.length - 1);
        return { first, last };
    });

    /** The columns actually mounted. */
    readonly visibleSlots = computed(() => {
        const { first, last } = this.windowRange();
        const slots = this.slots();
        return first === 0 && last === slots.length - 1 ? slots : slots.slice(first, last + 1);
    });

    /**
     * Header bands to draw.
     *
     * The day scale only gets them in the resource views: on a plain single-lane day timeline the
     * date is already in the header title, and two extra bands over twelve columns is chrome saying
     * what the toolbar just said.
     */
    readonly tiers = computed(() => (this.scale() === 'day' && !this.grouped() ? [] : this.axis().tiers));

    /** Whether the axis spans more than one day, which is what makes marking today worth it. */
    readonly multiDay = computed(() => this.axis().multiDay);

    /**
     * Whether to label only the columns that start a unit.
     *
     * It is about the column's WIDTH in time, not how many there are: a week at 30-minute slots is
     * 168 columns and printing every half hour turns the header into a smear, while a month is 30
     * columns that each need their day number. So the rule is sub-hour time columns only.
     */
    readonly dense = computed(() => (this.scale() === 'day' || this.scale() === 'week') && this.state.timelineSlotMinutes() < 60);

    /**
     * The lanes: one per resource in the grouped views, a single unnamed one otherwise.
     *
     * Events with a `resourceId` that matches nothing go to their own trailing lane instead of being
     * dropped — silently hiding an appointment because its resource was deleted is the worst
     * possible failure for a scheduler.
     */
    readonly lanes = computed(() => {
        const axis = this.axis();
        const range = this.state.range();
        const events = this.state.visibleEvents();
        const duration = this.state.defaultEventDuration();
        const interacting = this.state.interactingEventId();

        const groups: { key: string; resource?: SchedulerResource; title: string; depth: number; events: SchedulerEvent[]; aggregateCount?: number }[] = this.grouped()
            ? [
                  ...this.state.visibleResources().map((resource) => {
                      const own = events.filter((event) => this.state.resourceIdsOf(event).includes(resource.id));
                      const isGroup = this.state.isResourceGroup(resource.id);
                      // Un grupo cuenta lo suyo Y lo de sus descendientes, que es lo que hace util un
                      // grupo colapsado: dice cuanto hay debajo sin abrirlo. Y con showAggregatedEvents
                      // tambien lo PINTA, en vez de dejar el carril del grupo vacio.
                      const descendants = isGroup ? this.state.descendantResourceIds(resource.id) : [resource.id];
                      const aggregated = isGroup ? events.filter((event) => this.state.resourceIdsOf(event).some((id) => descendants.includes(id))) : own;

                      return {
                          key: String(resource.id),
                          resource,
                          title: resource.name ?? String(resource.id),
                          depth: this.state.resourceDepth(resource.id),
                          events: isGroup && this.state.showAggregatedEvents() ? aggregated : own,
                          aggregateCount: aggregated.length
                      };
                  }),
                  ...(() => {
                      const known = new Set(this.state.resources().map((r) => r.id));
                      const orphans = events.filter((event) => event.resourceId == null || !known.has(event.resourceId));
                      return orphans.length ? [{ key: '__unassigned', title: this.labels().unassigned, depth: 0, events: orphans }] : [];
                  })()
              ]
            : [{ key: '__all', title: '', depth: 0, events }];

        return groups.map((group) => {
            // Packing the rows by overlap is still time arithmetic and is computed over the whole
            // range; what gets replaced is the geometry, and that comes from the axis.
            const packed = layoutTimeGrid(group.events, {
                range,
                defaultEventDuration: duration,
                minEventMinutes: this.state.minEventMinutes()
            });
            const laid = placeOnAxis(packed, axis, (event) => {
                const start = toDate(event.start);
                const end = event.end != null ? toDate(event.end) : new Date(start.getTime() + duration * 60_000);
                return { start, end: end > start ? end : new Date(start.getTime() + duration * 60_000) };
            });

            const cells = axis.slots.map((slot, index) => ({
                key: `${group.key}|${slot.key}`,
                index,
                start: slot.start,
                end: slot.end,
                ariaLabel: `${slot.start.toLocaleDateString(this.locale(), { weekday: 'long', day: 'numeric', month: 'long' })} ${slot.label}${group.title ? ` · ${group.title}` : ''}`,
                major: slot.major,
                today: slot.today,
                binding: this.bindCell(slot.start, [], { resource: group.resource, label: '' })
            }));

            return {
                ...group,
                cells,
                // Laid out horizontally, overlap is resolved by stacking rows and not by splitting
                // the width: halving the height of a time bar makes it unreadable.
                rowCount: Math.max(
                    laid.reduce((max, item) => Math.max(max, item.column + 1), 1),
                    1
                ),
                items: laid.map((item) => ({
                    offset: item.offset,
                    size: item.size,
                    // The dragged bar stays in the first row and floats above (data-dragging's
                    // z-index does that): re-packing its row every time it brushed another
                    // appointment made it jump vertically while the pointer moved horizontally.
                    row: item.event.id === interacting ? 0 : item.column,
                    ...this.bindEvent(item.event, { continuesBefore: item.continuesBefore, continuesAfter: item.continuesAfter }, group.key)
                })),
                context: laneContext(group, this.state)
            };
        });
    });

    /** Range the axis was last scrolled for, so the scroll happens once per range and not per pass. */
    private scrolledKey: string | null = null;

    /**
     * The lanes with their cells and events clipped to the scroll window.
     *
     * The events are windowed in PIXELS and not in columns, plus a buffer: a bar can be one column
     * wide or three hundred, so intersecting its span with the viewport is the only test that keeps
     * a long booking mounted while you scroll through its middle.
     */
    readonly visibleLanes = computed(() => {
        const lanes = this.lanes();
        if (!this.virtualized()) return lanes;

        const { first, last } = this.windowRange();
        const width = this.columnWidth();
        const buffer = this.state.timelineVirtualEventBuffer();
        const total = this.slots().length * width;
        const from = this.scrollOffset() - buffer;
        const to = this.scrollOffset() + this.viewportWidth() + buffer;

        return lanes.map((lane) => ({
            ...lane,
            cells: lane.cells.slice(first, last + 1),
            items: lane.items.filter((item) => {
                const start = item.offset * total;
                return start < to && start + item.size * total > from;
            })
        }));
    });

    private readonly scroll = viewChild<ElementRef<HTMLElement>>('scroll');

    /**
     * Whether there is a real DOM to measure.
     *
     * Server-side rendering has an element tree but not a layout engine: `getBoundingClientRect` and
     * `scrollIntoView` simply are not there. Windowing and the scroll-to-today both need real
     * geometry, so on the server the whole axis renders and nothing is measured — which is the right
     * output for prerendered HTML anyway.
     */
    private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));

    private readonly destroyRef = inject(DestroyRef);

    /** Watches the axis for size changes, so the geometry is not read on the scroll path. */
    private observer: ResizeObserver | null = null;

    /** Number of columns the current `columnWidth` was measured for. */
    private measuredColumns = -1;

    /**
     * Reads the scroll offset back on every scroll of the axis.
     *
     * ONLY the offset. Scrolling fires an event per frame and `measure` reads geometry, so measuring
     * here forced a reflow per frame and, by writing `viewportWidth`/`columnWidth`, invalidated the
     * virtual window's signals mid-scroll. The size comes from a `ResizeObserver`, which is what
     * actually knows when it changed.
     */
    protected onScroll(): void {
        const host = this.scroll()?.nativeElement;
        if (!host || !this.browser) return;
        // Math.abs because scrollLeft is negative in RTL on Chromium-based browsers: the window is
        // computed from the distance travelled, which has no sign.
        this.scrollOffset.set(Math.abs(host.scrollLeft));
    }

    /** Attaches the observer once the axis exists. */
    private observe(host: HTMLElement): void {
        if (this.observer || !this.browser || typeof ResizeObserver === 'undefined') return;

        this.observer = new ResizeObserver(() => this.measure(host));
        this.observer.observe(host);
        this.destroyRef.onDestroy(() => {
            this.observer?.disconnect();
            this.observer = null;
        });
    }

    /**
     * Measures the viewport and one column.
     *
     * The column is measured off the DOM and not derived from the token: the axis is
     * `minmax(slotWidth, 1fr)`, so a column is wider than its token whenever the axis fits, and
     * computing the window from the token would then window the wrong columns.
     */
    private measure(host: HTMLElement): void {
        if (!this.browser) return;

        const viewport = host.clientWidth;
        if (viewport && viewport !== this.viewportWidth()) this.viewportWidth.set(viewport);

        const cell = host.querySelector('.p-scheduler-timeline-header-cell');
        const width = cell?.getBoundingClientRect().width ?? 0;
        if (width && Math.abs(width - this.columnWidth()) > 0.5) this.columnWidth.set(width);
    }

    ngAfterViewChecked(): void {
        const lanes = this.visibleLanes();
        this.publishContexts(
            lanes.flatMap((lane) => lane.items),
            lanes.flatMap((lane) => lane.cells.map((cell) => cell.binding))
        );

        // Neither measure nor auto-scroll while dragging: both read geometry, and a drag causes one
        // change-detection cycle per frame. Measuring there forces a reflow per frame exactly when
        // what is needed is to let go of the thread.
        if (this.state.drag.active) return;

        const host = this.scroll()?.nativeElement;
        if (host) {
            this.observe(host);
            // Measured when the NUMBER of columns changes, not on every detection cycle: the column
            // width is minmax(slotWidth, 1fr), so it depends on the count and on the container's
            // width, and the observer takes care of the second.
            if (this.measuredColumns !== this.slots().length) {
                this.measuredColumns = this.slots().length;
                this.measure(host);
            }
        }
        this.scrollToToday();
    }

    /**
     * Brings today's first column into view when the axis spans more than a day.
     *
     * A month or a year of columns is several screens wide, and landing on the 1st of January to
     * look at something happening in September is not a scheduler, it is a puzzle. `scrollIntoView`
     * rather than writing `scrollLeft` because the two directions disagree on the sign of
     * `scrollLeft`, and this has to work in RTL.
     */
    private scrollToToday(): void {
        const axis = this.axis();
        const host = this.scroll()?.nativeElement;
        if (!host || !this.browser || !axis.multiDay) return;

        const range = this.state.range();
        const key = `${this.viewType()}|${range.start.getTime()}|${range.end.getTime()}`;
        if (this.scrolledKey === key) return;

        const index = axis.slots.findIndex((slot) => slot.today);
        if (index < 0) {
            // Today is not in the range: there is nothing to look for, and settling that once
            // avoids repeating the search on every change-detection pass.
            this.scrolledKey = key;
            return;
        }

        const target = host.querySelector('.p-scheduler-timeline-header-cell[data-today]');
        if (target) {
            target.scrollIntoView({ block: 'nearest', inline: 'start' });
            this.scrolledKey = key;
            return;
        }

        // Today's column is not mounted, which is exactly what happens when the virtual window sits
        // elsewhere on the axis: looking for it in the DOM cannot find it, and retrying would not
        // move the window either. It jumps by index instead, which the axis already knows.
        const width = this.columnWidth();
        if (!width) return;

        // In RTL the scroll runs negative on browsers that follow the spec, so the distance is
        // measured from the start of the line and the sign is applied at the end.
        const distance = index * width;
        host.scrollLeft = this.state.rtl() ? -distance : distance;
        this.scrolledKey = key;
    }
}

/**
 * Context a resource-row definition receives.
 *
 * `$implicit` is the CONTEXT and not the resource, like every other definition in the Scheduler: a
 * template written as `let ctx` has to reach `ctx.title` and `ctx.count` the same way it does in the
 * month or the agenda. The resource itself stays available as `ctx.resource`.
 */
function laneContext(group: { resource?: SchedulerResource; title: string; depth: number; events: SchedulerEvent[]; aggregateCount?: number }, state?: SchedulerState) {
    const id = group.resource?.id;
    const context = {
        resource: group.resource,
        title: group.title,
        depth: group.depth,
        group: id != null && state ? state.isResourceGroup(id) : false,
        expanded: id != null && state ? state.isResourceExpanded(id) : true,
        toggle: () => {
            if (id != null) state?.toggleResource(id);
        },
        events: group.events,
        count: group.events.length,
        aggregateCount: group.aggregateCount ?? group.events.length,
        capacity: group.resource?.['capacity'] as number | undefined
    };
    return { ...context, $implicit: context, context };
}
