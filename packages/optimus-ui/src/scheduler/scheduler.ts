import { ApplicationRef, ChangeDetectionStrategy, Component, DestroyRef, ViewEncapsulation, booleanAttribute, computed, effect, inject, input, model, numberAttribute, output, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslationKeys } from '@openng/optimus-ui/api';
import { BaseComponent, PARENT_INSTANCE } from '@openng/optimus-ui/basecomponent';
import { Bind } from '@openng/optimus-ui/bind';
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
    SchedulerEventClickEvent,
    SchedulerHorizontalResourceColumnMode,
    SchedulerPassThrough,
    SchedulerPrintOptions,
    SchedulerRangeChangeEvent,
    SchedulerRecurrenceEditEvent,
    SchedulerRecurrenceEditOptions,
    SchedulerResource,
    SchedulerSlotBookEvent,
    SchedulerSlotClickEvent,
    SchedulerTimeFormatOptions,
    SchedulerViewType
} from '@openng/optimus-ui/types/scheduler';
import { startOfDay } from './scheduler-date';
import { SCHEDULER_IMPLEMENTED_VIEWS, SCHEDULER_STATE, SchedulerState, type SchedulerLabelOverrides, type SchedulerLabels } from './scheduler-state';
import { SchedulerStyle } from './style/schedulerstyle';

/**
 * Scheduler is a compound scheduling surface: the root owns the data, the view state, the selection
 * and the overlays, and every child part reads what it needs from that shared state.
 *
 * @group Components
 */
@Component({
    selector: 'p-scheduler-root',
    standalone: true,
    template: `<ng-content />`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [SchedulerStyle, { provide: PARENT_INSTANCE, useExisting: Scheduler }, { provide: SCHEDULER_STATE, useFactory: () => inject(Scheduler).schedulerState }],
    host: {
        '[class]': 'cx("root")',
        'data-slot': 'scheduler-root',
        '[attr.data-view]': 'view()',
        '[attr.dir]': 'rtl() ? "rtl" : null',
        '[attr.data-rtl]': 'rtl() ? "" : null',
        '[attr.data-interacting]': 'schedulerState.interactingEventId() != null ? "" : null',
        '[style.--p-scheduler-timeline-slot-width]': 'timelineSlotWidth() != null ? timelineSlotWidth() + "px" : null',
        '[attr.data-density]': 'density()',
        '[attr.data-event-shell]': 'eventShell()',
        '[attr.aria-label]': 'ariaLabel()',
        '[style.--p-scheduler-timeline-row-height]': 'resourceRowHeight() != null ? resourceRowHeight() + "px" : null',
        '[attr.data-row-auto-height]': 'rowAutoHeight() ? "" : null',
        '[attr.data-disabled]': 'disabled() ? "" : null',
        '[attr.aria-busy]': 'loading()'
    },
    hostDirectives: [Bind]
})
export class Scheduler extends BaseComponent<SchedulerPassThrough> {
    componentName = 'Scheduler';

    /** @internal */
    _componentStyle = inject(SchedulerStyle);

    private readonly bindDirectiveInstance = inject(Bind, { self: true });

    private readonly appRef = inject(ApplicationRef);

    onAfterViewChecked(): void {
        this.bindDirectiveInstance.setAttrs(this.ptms(['host', 'root']));
    }

    /**
     * Prints THIS schedule, and not the page it happens to be on.
     *
     * `window.print()` prints the document, which for a Scheduler inside an application means the
     * navigation, the sidebar and whatever else is on screen, with the schedule somewhere in the
     * middle of it. This marks the document as printing a schedule, which is what lets the
     * stylesheet blank everything else for the duration and put this component at the top of the
     * sheet, and undoes it all afterwards — including when the user cancels the dialog, because a
     * page left in its print state is a broken page.
     *
     * The scroll containers are already unrolled by the print block, so what comes out is the whole
     * range and not the visible window.
     */
    print(options: SchedulerPrintOptions = {}): void {
        const host = this.el?.nativeElement as HTMLElement | undefined;

        if (!isPlatformBrowser(this.platformId) || !host || typeof window.print !== 'function') return;

        const doc = host.ownerDocument;
        const { color = true, layout = {}, pageChrome } = options;
        const { orientation = 'auto', scale = 'standard' } = layout;

        // La cabecera de impresion tiene que estar YA pintada cuando se copia el arbol, y con
        // deteccion sin zonas eso no pasa por si solo: se fuerza una pasada antes de clonar.
        this.printChrome.set(pageChrome === false ? null : (pageChrome ?? {}));
        this.appRef.tick();

        // Se imprime una COPIA en un contenedor propio, y el resto de la pagina sale del flujo con
        // display: none. Con visibility el contenido se oculta pero el hueco se queda, asi que el
        // documento sigue midiendo lo que media —cincuenta hojas en blanco detras del horario—; y
        // mover el elemento vivo le cambiaria el tamano a un componente que esta midiendose. Una
        // copia estatica no tiene ninguno de los dos problemas.
        const container = doc.createElement('div');
        const copy = host.cloneNode(true) as HTMLElement;

        container.id = 'p-scheduler-print-root';
        copy.setAttribute('data-printing', '');
        copy.setAttribute('data-print-color', color ? 'true' : 'false');
        copy.setAttribute('data-print-scale', scale);
        if (pageChrome === false) copy.setAttribute('data-print-chrome', 'false');

        // `fit` encoge contra el lado CORTO de la hoja y no contra el de la orientacion pedida. Suena
        // conservador y es lo unico que no falla: la orientacion se pide con una regla @page que
        // WebKit no implementa —en Safari la elige el dialogo del sistema—, asi que dar por hecha la
        // hoja horizontal deja el horario desbordando a una segunda pagina justo en el navegador que
        // no obedece. Ajustado al lado corto entra en las dos, y en horizontal sobra papel, que es el
        // fallo bueno. A4 a 96dpi menos margenes; en Letter falla por poco.
        if (scale === 'fit') {
            const printable = 700;
            const needed = Math.max(host.scrollWidth, 1);

            if (needed > printable) copy.style.zoom = String(Math.max(printable / needed, 0.3));
        }

        container.appendChild(copy);
        doc.getElementById('p-scheduler-print-root')?.remove();
        doc.body.appendChild(container);
        doc.documentElement.setAttribute('data-p-scheduler-printing', '');

        const page = orientation === 'auto' ? null : doc.createElement('style');

        if (page) {
            page.id = 'p-scheduler-print-page';
            page.textContent = `@page { size: ${orientation}; }`;
            doc.head.appendChild(page);
        }

        const cleanup = () => {
            container.remove();
            doc.documentElement.removeAttribute('data-p-scheduler-printing');
            this.printChrome.set(null);
            page?.remove();
            window.removeEventListener('afterprint', cleanup);
        };

        window.addEventListener('afterprint', cleanup);
        window.print();
        // Safari no siempre emite afterprint: el respaldo garantiza que la pagina vuelve a la vida.
        setTimeout(cleanup, 1000);
    }

    /** @internal What the printed header should carry while a print is running. */
    readonly printChrome = signal<{ generatedAt?: boolean; timezone?: boolean; filters?: string[] } | null>(null);

    /**
     * The appointments to show. The Scheduler never mutates this array: it emits requests and the
     * application writes them back.
     * @group Props
     */
    readonly events = input<SchedulerEvent[]>([]);
    /**
     * Rows or columns the events are grouped into.
     * @group Props
     */
    readonly resources = input<SchedulerResource[]>([]);
    /**
     * Colour-coded classifications, matched against `categoryField`.
     * @group Props
     */
    readonly categories = input<SchedulerCategory[]>([]);
    /**
     * Event field holding the category id.
     * @defaultValue 'categoryId'
     * @group Props
     */
    readonly categoryField = input('categoryId');
    /**
     * Event field holding the text to show.
     * @defaultValue 'title'
     * @group Props
     */
    readonly titleField = input('title');
    /**
     * Active view. Supports `[(view)]`.
     * @defaultValue 'month'
     * @group Props
     */
    readonly view = model<SchedulerViewType>('month');
    /**
     * Date the visible range is derived from. Supports `[(date)]`.
     * @group Props
     */
    readonly date = model<Date>(startOfDay(new Date()));
    /**
     * Views offered by the view selector.
     *
     * Left unset, the selector offers the view scopes declared inside `<p-scheduler-content>`, which
     * is almost always what you want: a Scheduler that only declares a month should not offer six
     * views it cannot render.
     * @group Props
     */
    readonly views = input<SchedulerViewType[] | undefined>(undefined);
    /**
     * First day of the week, 0 = Sunday. Falls back to the Optimus locale.
     * @group Props
     */
    readonly firstDayOfWeek = input<number | undefined>(undefined, { transform: (value: unknown) => (value == null ? undefined : numberAttribute(value)) });
    /**
     * BCP 47 locale used to format every date. Defaults to the browser's.
     * @group Props
     */
    readonly locale = input<string | undefined>(undefined);
    /**
     * How many days a day view shows at once.
     * @defaultValue 1
     * @group Props
     */
    readonly dayCount = input(1, { transform: numberAttribute });
    /**
     * How many months a month view shows at once, drawn as that many grids one after another.
     *
     * The previous/next controls move by the same amount, so paging never repeats a month that is
     * already on screen.
     * @defaultValue 1
     * @group Props
     */
    readonly monthCount = input(1, { transform: numberAttribute });
    /**
     * How many days the agenda spans.
     * @defaultValue 30
     * @group Props
     */
    readonly agendaDays = input(30, { transform: numberAttribute });
    /**
     * Height of one time-grid row, in minutes.
     * @defaultValue 30
     * @group Props
     */
    readonly slotMinutes = input(30, { transform: numberAttribute });
    /**
     * First hour the time grid renders.
     * @defaultValue 0
     * @group Props
     */
    readonly dayStartHour = input(0, { transform: numberAttribute });
    /**
     * First hour the time grid does NOT render. 24 for a whole day.
     * @defaultValue 24
     * @group Props
     */
    readonly dayEndHour = input(24, { transform: numberAttribute });
    /**
     * Master switch for the pointer interactions. An individual event's own `editable` overrides it,
     * so a schedule can be editable with a few frozen appointments in it.
     * @defaultValue false
     * @group Props
     */
    readonly editable = input(false, { transform: booleanAttribute });
    /**
     * Whether an editable event can be MOVED. Turn it off to allow resizing only.
     * @defaultValue true
     * @group Props
     */
    readonly eventStartEditable = input(true, { transform: booleanAttribute });
    /**
     * Whether an editable event can be RESIZED. Turn it off to allow moving only.
     * @defaultValue true
     * @group Props
     */
    readonly eventDurationEditable = input(true, { transform: booleanAttribute });
    /**
     * Minutes every move and resize is rounded to.
     * @defaultValue 15
     * @group Props
     */
    readonly snapDuration = input(15, { transform: numberAttribute });
    /**
     * Rounding used on the timeline axes, when it has to differ from `snapDuration`. Falls back to it.
     * @group Props
     */
    readonly timelineSnapDuration = input<number | undefined>(undefined, { transform: (value: unknown) => (value == null ? undefined : numberAttribute(value)) });
    /**
     * How far the pointer must travel before a press on an event becomes a drag, in pixels. Below it
     * the press stays a click, which is what keeps selection usable on a touch screen.
     * @defaultValue 4
     * @group Props
     */
    readonly dragMinDistance = input(4, { transform: numberAttribute });
    /**
     * Veto on a proposed move or resize. Return `false` and the Scheduler will not offer that target:
     * the event stays where the last accepted proposal put it.
     *
     * Called on every pointer move, so keep it cheap — a lookup, not a request.
     * @group Props
     */
    readonly eventAllow = input<((info: SchedulerDropInfo) => boolean) | undefined>(undefined);
    /**
     * Whether the resource views show one resource at a time instead of every column at once.
     *
     * `auto` turns it on past `adaptiveThreshold`. Forty resource columns are forty columns of
     * nothing; below the threshold, showing them all is more useful.
     * @defaultValue false
     * @group Props
     */
    readonly adaptiveMode = input<boolean | 'auto'>(false, { transform: (value: unknown) => (value === 'auto' ? 'auto' : booleanAttribute(value)) });
    /**
     * How many resources `adaptiveMode="auto"` needs before it kicks in.
     * @defaultValue 8
     * @group Props
     */
    readonly adaptiveThreshold = input(8, { transform: numberAttribute });
    /**
     * The resource adaptive mode is focused on. Supports `[(selectedResourceId)]`.
     * @group Props
     */
    readonly selectedResourceId = model<string | number | undefined>(undefined);
    /**
     * Whether a timed view breaks its columns down by resource, one vertical schedule per resource.
     * The `resourceDay`/`resourceWeek` views imply it; this is for turning it on without changing
     * the view name.
     * @defaultValue false
     * @group Props
     */
    readonly groupByResource = input(false, { transform: booleanAttribute });
    /**
     * Whether a timed view puts the date first and nests the resource columns inside each day.
     * Implied by the `dateDay`/`dateWeek` views.
     * @defaultValue false
     * @group Props
     */
    readonly groupByDate = input(false, { transform: booleanAttribute });
    /**
     * Minimum width of one column when the columns are per resource, as a CSS length. Resource
     * columns are narrower than day columns by nature — a week of six resources is 42 of them.
     * @group Props
     */
    readonly resourceColumnMinWidth = input<string | undefined>(undefined);
    /**
     * Windows nothing can be scheduled in. Cells inside one carry `data-blocked`, and a move or
     * resize that would land in one is refused before `eventAllow` is asked.
     * @group Props
     */
    readonly blockedIntervals = input<SchedulerBlockedInterval[]>([]);
    /**
     * Windows an appointment can be booked into. Drawn behind the events, because a free slot is a
     * property of the calendar and not an appointment.
     * @group Props
     */
    readonly appointmentSlots = input<SchedulerAppointmentSlot[]>([]);
    /**
     * How the available windows are drawn: a band behind the events, a tint on the cells they cover,
     * or a marker on the edge of the column for a calendar too dense to tint.
     * @defaultValue 'overlay'
     * @group Props
     */
    readonly appointmentSlotDisplay = input<SchedulerAppointmentSlotDisplay>('overlay');
    /**
     * How clicking a date builds a selection. `range` takes two clicks: an anchor and an end.
     * @defaultValue 'none'
     * @group Props
     */
    readonly dateSelection = input<SchedulerDateSelectionMode>('none');
    /**
     * The selected days. Supports `[(selectedDates)]`, so a page can seed the selection and read it
     * back without listening to clicks.
     * @group Props
     */
    readonly selectedDates = model<Date[]>([]);
    /**
     * Minutes per column of a timeline axis, on the day and week scales. The month and year scales
     * are one column per day and per month, so this does not apply to them.
     * @defaultValue 60
     * @group Props
     */
    readonly timelineSlotDuration = input(60, { transform: numberAttribute });
    /**
     * Width of a timeline column, in pixels. Overrides the theme token, which is what a page needs
     * when the same Scheduler has to fit a week of hours and a year of months.
     * @group Props
     */
    readonly timelineSlotWidth = input<number | undefined>(undefined, { transform: (value: unknown) => (value == null ? undefined : numberAttribute(value)) });
    /**
     * Whether long timeline axes only mount the columns near the viewport.
     *
     * `auto` turns it on past `timelineVirtualThreshold` columns, which is the setting to leave
     * alone: a week of 15-minute columns is 672 of them, a year is 12, and only one of those needs
     * windowing.
     * @defaultValue 'auto'
     * @group Props
     */
    readonly timelineVirtualScroll = input<boolean | 'auto'>('auto', { transform: (value: unknown) => (value === 'auto' ? 'auto' : booleanAttribute(value)) });
    /**
     * How many columns an axis needs before `auto` windows it.
     * @defaultValue 100
     * @group Props
     */
    readonly timelineVirtualThreshold = input(100, { transform: numberAttribute });
    /**
     * Extra columns kept mounted either side of the viewport, so a fast scroll does not expose a
     * blank edge.
     * @defaultValue 2
     * @group Props
     */
    readonly timelineVirtualOverscan = input(2, { transform: numberAttribute });
    /**
     * Pixels either side of the viewport an event bar stays mounted for. A long booking has to keep
     * its bar while you scroll through its middle, and the bar can be far wider than the viewport.
     * @defaultValue 192
     * @group Props
     */
    readonly timelineVirtualEventBuffer = input(192, { transform: numberAttribute });
    /**
     * Timezone the schedule is DISPLAYED in, as an IANA name (`Europe/Madrid`, `Asia/Tokyo`). Left
     * unset, the browser's own zone is used.
     *
     * The events keep their real instants: only the rendering moves, and every output converts back
     * before it reaches you.
     * @group Props
     */
    readonly timeZone = input<string | undefined>(undefined);
    /**
     * Whether the Scheduler lays out right to left. Sets `dir` on the root, which is what every
     * logical property in the stylesheet keys off.
     * @defaultValue false
     * @group Props
     */
    readonly rtl = input(false, { transform: booleanAttribute });
    /**
     * Business hours, as whole hours. Set them and the time grid shades everything outside them and
     * resolves the work-cell definition inside them; left unset, no hour is privileged.
     *
     * There is no default on purpose: a shaded 9-to-18 band is an assumption about the product, and
     * it is wrong for a hospital, a hotel or a 24/7 line.
     * @group Props
     */
    readonly businessHours = input<{ start: number; end: number } | undefined>(undefined);
    /**
     * Week days that count as working days, 0 = Sunday.
     * @group Props
     */
    readonly workDays = input<number[]>([1, 2, 3, 4, 5]);
    /**
     * Duration given to an event with no `end`, in minutes.
     * @defaultValue 30
     * @group Props
     */
    readonly defaultEventDuration = input(30, { transform: numberAttribute });
    /**
     * Shortest slice an event may occupy in the time grid, in minutes, so a one-minute appointment
     * stays clickable.
     * @defaultValue 15
     * @group Props
     */
    readonly minEventMinutes = input(15, { transform: numberAttribute });
    /**
     * How many events a month cell shows before collapsing the rest into a "+N more" link.
     * @defaultValue 3
     * @group Props
     */
    readonly maxEventsPerCell = input(3, { transform: numberAttribute });
    /**
     * Event selection behaviour.
     * @defaultValue 'single'
     * @group Props
     */
    readonly selectionMode = input<'none' | 'single' | 'multiple'>('single');
    /**
     * Cap on the multiple selection. Reaching it emits `eventSelectionLimitReached`.
     * @group Props
     */
    readonly maxSelection = input(Infinity, { transform: (value: unknown) => (value == null ? Infinity : numberAttribute(value)) });
    /**
     * Whether the legend items toggle category filters.
     * @defaultValue true
     * @group Props
     */
    readonly categoryFilterable = input(true, { transform: booleanAttribute });
    /**
     * Whether the quick info overlay opens on click.
     * @group Props
     */
    readonly quickInfo = input(false, { transform: booleanAttribute });
    /**
     * Whether the event popover is enabled.
     * @group Props
     */
    readonly eventPopover = input(false, { transform: booleanAttribute });
    /**
     * Whether the context menu is enabled.
     * @group Props
     */
    readonly contextMenu = input(false, { transform: booleanAttribute });
    /**
     * Whether a dense cell collapses into an overflow popover.
     * @defaultValue true
     * @group Props
     */
    readonly showMorePopover = input(true, { transform: booleanAttribute });
    /**
     * Shows the loading overlay.
     * @group Props
     */
    readonly loading = input(false, { transform: booleanAttribute });
    /**
     * Disables every interaction.
     * @group Props
     */
    readonly disabled = input(false, { transform: booleanAttribute });

    /**
     * Fires when the rendered range changes, whatever the cause.
     * @group Emits
     */
    readonly datesChange = output<SchedulerRangeChangeEvent>();
    /**
     * Fires when the Scheduler transitions between views.
     * @group Emits
     */
    readonly viewStateChange = output<SchedulerRangeChangeEvent>();
    /**
     * Fires when an event is activated.
     * @group Emits
     */
    readonly eventClick = output<SchedulerEventClickEvent>();
    /**
     * How the hour is written across the gutter, the event labels and the overlays.
     *
     * Left unset the locale decides, which is right nearly always. It is here for the cases where a
     * product has to override the culture, or where a surface is too small for the full form.
     * @group Props
     */
    readonly timeFormat = input<SchedulerTimeFormatOptions | undefined>(undefined);
    /**
     * Calendar the dates are formatted in, as a Unicode calendar identifier: `islamic`, `buddhist`,
     * `hebrew`, `japanese`. The arithmetic stays Gregorian; what changes is what the labels say.
     * @group Props
     */
    readonly calendar = input<string | undefined>(undefined);
    /**
     * Accessible name of the whole Scheduler.
     *
     * Worth setting when a page holds more than one, or when nothing around it says which schedule
     * this is: a screen reader announces a region, and "application" is not a name.
     * @group Props
     */
    readonly ariaLabel = input<string | undefined>(undefined);
    /**
     * How the range title is written, as `Intl.DateTimeFormat` options.
     *
     * Unset, each view titles itself the way it reads best — a week as `8 - 14 September`, a month as
     * `September 2026`. Set it when the product has its own wording for that line.
     * @group Props
     */
    readonly dateDisplay = input<Intl.DateTimeFormatOptions | undefined>(undefined);
    /**
     * Whether the Scheduler draws the visible box around an event.
     *
     * `none` removes the background, the border and the padding and keeps everything else — the
     * positioning, the pointer and keyboard activation, the focus ring, the selected and dragging
     * state, the resize handles and the overlay anchor — which is what a page wants when its own
     * component draws the card.
     * @defaultValue default
     * @group Props
     */
    readonly eventShell = input<'default' | 'none'>('default');
    /**
     * Numbering system the digits are printed in, as a Unicode identifier: `arab`, `deva`, `latn`.
     * @group Props
     */
    readonly numberingSystem = input<string | undefined>(undefined);
    /**
     * How dense the chrome is drawn. `compact` trades padding for rows on screen.
     * @defaultValue comfortable
     * @group Props
     */
    readonly density = input<SchedulerDensity>('comfortable');
    /**
     * Whether the line marking the current time is drawn in the time grid and the timeline.
     * @defaultValue true
     * @group Props
     */
    readonly nowIndicator = input(true, { transform: booleanAttribute });
    /**
     * Whether the agenda lists days that hold nothing.
     * @defaultValue false
     * @group Props
     */
    readonly showEmptyDays = input(false, { transform: booleanAttribute });
    /**
     * Whether the all-day band stays visible when it is empty, so the grid does not shift as you
     * navigate between days.
     * @defaultValue true
     * @group Props
     */
    readonly alwaysShowAllDay = input(true, { transform: booleanAttribute });
    /**
     * Whether a resource group can be collapsed, which needs a `parentId` on the resources to mean
     * anything.
     * @defaultValue false
     * @group Props
     */
    readonly resourcesExpandable = input(false, { transform: booleanAttribute });
    /**
     * Whether the groups start expanded. Only read until the user collapses something.
     * @defaultValue true
     * @group Props
     */
    readonly resourcesInitiallyExpanded = input(true, { transform: booleanAttribute });
    /**
     * Whether a group lane also draws the events of the resources under it, so a collapsed group
     * still says how busy it is.
     * @defaultValue false
     * @group Props
     */
    readonly showAggregatedEvents = input(false, { transform: booleanAttribute });
    /**
     * Height of one timeline lane in pixels. Unset, the theme's token decides.
     * @group Props
     */
    readonly resourceRowHeight = input<number | undefined>(undefined, { transform: (value: unknown) => (value == null ? undefined : numberAttribute(value)) });
    /**
     * Whether a lane grows to fit however many rows its overlapping events need, instead of
     * scrolling inside a fixed height.
     * @defaultValue false
     * @group Props
     */
    readonly rowAutoHeight = input(false, { transform: booleanAttribute });
    /**
     * How the columns of the grouped resource views are sized.
     * @defaultValue auto
     * @group Props
     */
    readonly horizontalResourceColumnMode = input<SchedulerHorizontalResourceColumnMode>('auto');
    /**
     * Width of a resource column in pixels, used by the `fixed` mode.
     * @group Props
     */
    readonly horizontalResourceColumnWidth = input<number | undefined>(undefined, { transform: (value: unknown) => (value == null ? undefined : numberAttribute(value)) });
    /**
     * Smallest a resource column may get before the view scrolls, in pixels.
     * @group Props
     */
    readonly horizontalResourceMinColumnWidth = input<number | undefined>(undefined, { transform: (value: unknown) => (value == null ? undefined : numberAttribute(value)) });
    /**
     * Smallest a DATE column may get in a resource-first grouped view, in pixels.
     * @group Props
     */
    readonly horizontalResourceDayMinWidth = input<number | undefined>(undefined, { transform: (value: unknown) => (value == null ? undefined : numberAttribute(value)) });
    /**
     * How many columns the `auto` mode fits before it stops dividing the container and scrolls.
     * @defaultValue 6
     * @group Props
     */
    readonly horizontalResourceOverflowThreshold = input(6, { transform: numberAttribute });
    /**
     * Where the event popover opens relative to the event.
     * @defaultValue auto
     * @group Props
     */
    readonly eventPopoverPosition = input<'top' | 'bottom' | 'left' | 'right' | 'auto'>('auto');
    /**
     * Whether the event popover opens on a coarse pointer, where there is no hover to open it with.
     * @defaultValue false
     * @group Props
     */
    readonly eventPopoverShowOnMobile = input(false, { transform: booleanAttribute });
    /**
     * How an interaction on an occurrence of a recurring series is reported.
     *
     * `true` turns on the default flow: an edit, a delete, a drop or a resize on an occurrence is
     * reported through `(recurrenceEdit)`/`(recurrenceDelete)` with the series, the occurrence and an
     * `apply(scope)`, so the page can ask "this appointment or the whole series?" — which is a
     * question only the page can put to a user. Pass an object to choose the default scope or to
     * exclude a flow.
     * @defaultValue false
     * @group Props
     */
    readonly recurrenceEdit = input<boolean | SchedulerRecurrenceEditOptions>(false);
    /**
     * Fires when an empty slot is activated, which is how a new appointment starts.
     * @group Emits
     */
    readonly dateClick = output<SchedulerSlotClickEvent>();
    /**
     * Fires when an available appointment window is activated.
     * @group Emits
     */
    readonly slotBook = output<SchedulerSlotBookEvent>();
    /**
     * Fires when a window the viewer already holds is activated, which is a cancellation.
     * @group Emits
     */
    readonly slotCancel = output<SchedulerSlotBookEvent>();
    /**
     * Fires when the quick info opens for an event.
     * @group Emits
     */
    readonly quickInfoShow = output<{ event: SchedulerEvent }>();
    /**
     * Fires when the quick info's edit action is used.
     * @group Emits
     */
    readonly quickInfoEdit = output<{ event: SchedulerEvent }>();
    /**
     * Fires when the quick info's delete action is used.
     * @group Emits
     */
    readonly quickInfoDelete = output<{ event: SchedulerEvent }>();
    /**
     * Fires when the context menu opens, with whatever it was opened over.
     * @group Emits
     */
    readonly contextMenuShow = output<{ event?: SchedulerEvent; date?: Date; events?: SchedulerEvent[] }>();
    /**
     * Fires when a change touches an occurrence of a series and the scope has to be decided.
     * @group Emits
     */
    readonly recurrenceEditRequest = output<SchedulerRecurrenceEditEvent>({ alias: 'recurrenceEdit' });
    /**
     * Fires when a delete touches an occurrence of a series.
     * @group Emits
     */
    readonly recurrenceDelete = output<SchedulerRecurrenceEditEvent>();
    /**
     * Fires when the set of selected events changes.
     * @group Emits
     */
    readonly eventSelectionChange = output<{ selectedIds: (string | number)[]; events: SchedulerEvent[] }>();
    /**
     * Fires when the selection cap rejects an event.
     * @group Emits
     */
    readonly eventSelectionLimitReached = output<{ selectedIds: (string | number)[]; maxSelection: number }>();
    /**
     * Fires when the application is asked to delete the selected events.
     * @group Emits
     */
    readonly bulkDelete = output<{ events: SchedulerEvent[] }>();
    /**
     * Fires when a dense cell's overflow link opens.
     * @group Emits
     */
    readonly moreClick = output<{ date: Date; events: SchedulerEvent[]; view: SchedulerViewType }>();
    /**
     * Fires when a resource row or column header is activated.
     * @group Emits
     */
    readonly resourceClick = output<{ resource: SchedulerResource }>();
    /**
     * Fires when adaptive mode had to pick a resource because the page had not chosen one. Mirror it
     * into your own state so a selector cannot disagree with the grid.
     * @group Emits
     */
    readonly adaptiveAutoSelect = output<{ resource: SchedulerResource }>();
    /**
     * Fires when a move begins, once the pointer has travelled `dragMinDistance`.
     * @group Emits
     */
    readonly eventDragStart = output<SchedulerDragPayload>();
    /**
     * Fires when a move is released on an accepted target.
     *
     * The Scheduler holds the change so the event stays where it was dropped; persist it, or call
     * `revert()` on the payload to put it back.
     * @group Emits
     */
    readonly eventDrop = output<SchedulerDragPayload>();
    /**
     * Fires when a resize begins.
     * @group Emits
     */
    readonly eventResizeStart = output<SchedulerDragPayload>();
    /**
     * Fires on every accepted proposal while a resize is in progress. Persist `eventResizeStop`, not
     * this — it fires many times per second.
     * @group Emits
     */
    readonly eventResize = output<SchedulerDragPayload>();
    /**
     * Fires when a resize is released.
     * @group Emits
     */
    readonly eventResizeStop = output<SchedulerDragPayload>();
    /**
     * Fires when the Scheduler asks the application to update an event.
     * @group Emits
     */
    readonly eventChange = output<{ event: SchedulerEvent }>();
    /**
     * Fires when the Scheduler asks the application to remove an event.
     * @group Emits
     */
    readonly eventRemove = output<{ event: SchedulerEvent }>();

    /**
     * Effective first day of the week: the explicit input wins, else the Optimus locale, else Sunday.
     */
    private readonly resolvedFirstDayOfWeek = computed(() => this.firstDayOfWeek() ?? this.config.getTranslation(TranslationKeys.FIRST_DAY_OF_WEEK) ?? 0);

    private readonly resolvedLabels = signal<SchedulerLabels>({
        today: 'Today',
        prev: 'Previous',
        next: 'Next',
        clear: 'Clear',
        empty: 'No events',
        allDay: 'All day',
        more: '+{0} more',
        resources: 'Resources',
        unassigned: 'Unassigned',
        edit: 'Edit',
        delete: 'Delete',
        close: 'Close',
        views: {
            day: 'Day',
            week: 'Week',
            month: 'Month',
            year: 'Year',
            agenda: 'Agenda',
            timeline: 'Timeline',
            timelineDay: 'Timeline day',
            timelineWeek: 'Timeline week',
            timelineMonth: 'Timeline month',
            timelineYear: 'Timeline year',
            resourceDay: 'Resource day',
            resourceWeek: 'Resource week',
            resourceMonth: 'Resource month',
            resourceTimeline: 'Resource timeline',
            resourceTimelineDay: 'Resources timeline day',
            resourceTimelineWeek: 'Resources timeline week',
            resourceTimelineMonth: 'Resources timeline month',
            resourceTimelineYear: 'Resources timeline year',
            dateDay: 'Date day',
            dateWeek: 'Date week',
            dateMonth: 'Date month'
        }
    });

    /**
     * Overrides the chrome labels. Merged over the defaults, so a partial object is fine.
     * @group Props
     */
    readonly labels = input<SchedulerLabelOverrides | undefined>(undefined);

    private readonly mergedLabels = computed<SchedulerLabels>(() => {
        const overrides = this.labels();
        const base = this.resolvedLabels();
        return overrides ? { ...base, ...overrides, views: { ...base.views, ...(overrides.views ?? {}) } } : base;
    });

    /** @internal The shared state every child part reads. */
    readonly schedulerState = new SchedulerState({
        events: this.events,
        resources: this.resources,
        categories: this.categories,
        categoryField: this.categoryField,
        titleField: this.titleField,
        view: this.view,
        date: this.date,
        firstDayOfWeek: this.resolvedFirstDayOfWeek,
        dayCount: this.dayCount,
        monthCount: this.monthCount,
        agendaDays: this.agendaDays,
        defaultEventDuration: this.defaultEventDuration,
        maxEventsPerCell: this.maxEventsPerCell,
        workDays: this.workDays,
        businessHours: this.businessHours,
        availableViews: this.views,
        categoryFilterable: this.categoryFilterable,
        loading: this.loading,
        labels: this.mergedLabels,
        locale: this.locale,
        slotMinutes: this.slotMinutes,
        timelineSlotMinutes: this.timelineSlotDuration,
        timelineVirtualScroll: this.timelineVirtualScroll,
        timelineVirtualThreshold: this.timelineVirtualThreshold,
        timelineVirtualOverscan: this.timelineVirtualOverscan,
        timelineVirtualEventBuffer: this.timelineVirtualEventBuffer,
        rtl: this.rtl,
        timeZone: this.timeZone,
        dayStartHour: this.dayStartHour,
        dayEndHour: this.dayEndHour,
        minEventMinutes: this.minEventMinutes,
        selectionMode: this.selectionMode,
        quickInfoEnabled: this.quickInfo,
        editable: this.editable,
        eventStartEditable: this.eventStartEditable,
        eventDurationEditable: this.eventDurationEditable,
        snapDuration: this.snapDuration,
        timelineSnapDuration: this.timelineSnapDuration,
        dragMinDistance: this.dragMinDistance,
        eventAllow: this.eventAllow,
        blockedIntervals: this.blockedIntervals,
        appointmentSlots: this.appointmentSlots,
        appointmentSlotDisplay: this.appointmentSlotDisplay,
        dateSelection: this.dateSelection,
        groupByResource: this.groupByResource,
        groupByDate: this.groupByDate,
        resourceColumnMinWidth: this.resourceColumnMinWidth,
        adaptiveMode: this.adaptiveMode,
        adaptiveThreshold: this.adaptiveThreshold,
        selectedResourceId: this.selectedResourceId,
        setSelectedResourceId: (id) => this.selectedResourceId.set(id),
        emitResourceClick: (resource) => this.resourceClick.emit({ resource }),
        emitAdaptiveAutoSelect: (resource) => this.adaptiveAutoSelect.emit({ resource }),
        selectedDates: this.selectedDates,
        setSelectedDates: (dates) => this.selectedDates.set(dates),
        emitDragStart: (payload) => this.eventDragStart.emit(payload),
        emitDrop: (payload) => this.eventDrop.emit(payload),
        emitResizeStart: (payload) => this.eventResizeStart.emit(payload),
        emitResize: (payload) => this.eventResize.emit(payload),
        emitResizeStop: (payload) => this.eventResizeStop.emit(payload),
        eventPopoverEnabled: this.eventPopover,
        contextMenuEnabled: this.contextMenu,
        morePopoverEnabled: this.showMorePopover,
        emitMoreClick: (date, events) => this.moreClick.emit({ date, events, view: this.view() }),
        maxSelection: this.maxSelection,
        setView: (view) => {
            this.view.set(view);
            const { start, end } = this.schedulerState.range();
            this.viewStateChange.emit({ start, end, view });
        },
        setDate: (date) => this.date.set(date),
        bulkDelete: (events) => this.bulkDelete.emit({ events }),
        eventChange: (event) => this.eventChange.emit({ event }),
        eventRemove: (event) => this.eventRemove.emit({ event }),
        emitEventClick: (originalEvent, event) => this.eventClick.emit({ originalEvent, event }),
        emitSlotClick: (originalEvent, start, end) => this.dateClick.emit({ originalEvent, start, end }),
        emitSelectionLimit: (maxSelection) => this.eventSelectionLimitReached.emit({ selectedIds: [...this.schedulerState.selectedEventIds()], maxSelection }),
        emitSelectionChange: (events) => this.eventSelectionChange.emit({ selectedIds: events.map((event) => event.id), events }),
        timeFormat: this.timeFormat,
        dateDisplay: this.dateDisplay,
        eventShell: this.eventShell,
        calendar: this.calendar,
        numberingSystem: this.numberingSystem,
        density: this.density,
        nowIndicator: this.nowIndicator,
        showEmptyDays: this.showEmptyDays,
        alwaysShowAllDay: this.alwaysShowAllDay,
        resourcesExpandable: this.resourcesExpandable,
        resourcesInitiallyExpanded: this.resourcesInitiallyExpanded,
        showAggregatedEvents: this.showAggregatedEvents,
        resourceRowHeight: this.resourceRowHeight,
        rowAutoHeight: this.rowAutoHeight,
        horizontalResourceColumnMode: this.horizontalResourceColumnMode,
        horizontalResourceColumnWidth: this.horizontalResourceColumnWidth,
        horizontalResourceMinColumnWidth: this.horizontalResourceMinColumnWidth,
        horizontalResourceDayMinWidth: this.horizontalResourceDayMinWidth,
        horizontalResourceOverflowThreshold: this.horizontalResourceOverflowThreshold,
        eventPopoverPosition: this.eventPopoverPosition,
        eventPopoverShowOnMobile: this.eventPopoverShowOnMobile,
        recurrenceEdit: this.recurrenceEdit,
        emitSlotBook: (payload) => this.slotBook.emit(payload),
        emitSlotCancel: (payload) => this.slotCancel.emit(payload),
        emitQuickInfoShow: (event) => this.quickInfoShow.emit({ event }),
        emitQuickInfoEdit: (event) => this.quickInfoEdit.emit({ event }),
        emitQuickInfoDelete: (event) => this.quickInfoDelete.emit({ event }),
        emitContextMenuShow: (target) => this.contextMenuShow.emit({ event: target.event, date: target.date, events: target.events }),
        emitRecurrenceEdit: (payload) => this.recurrenceEditRequest.emit(payload),
        emitRecurrenceDelete: (payload) => this.recurrenceDelete.emit(payload)
    });

    /**
     * Drops any pointer listener still attached if the Scheduler goes away mid-drag.
     *
     * `DestroyRef` and not an `ngOnDestroy`: the base component owns that hook and overriding it here
     * would mean remembering to call `super`.
     */
    private readonly cleanupDrag = inject(DestroyRef).onDestroy(() => this.schedulerState.drag.destroy());

    /**
     * Announces the rendered range, on init and on every change of it.
     *
     * An effect and not a call inside the navigation handlers: the range is derived from the view,
     * the anchor date, `firstDayOfWeek`, `dayCount`, `monthCount` and `agendaDays`, so a page that changes any of
     * those — or that binds `[date]` from a route — moves the range without going through the
     * header, and an application loading its events here has to hear about it. Firing once on init
     * is deliberate for the same reason: the first range is the one the first request needs.
     */
    private readonly emitDatesChange = effect(() => {
        const { start, end } = this.schedulerState.range();
        this.datesChange.emit({ start, end, view: this.view() });
    });

    /** Whether the active view has a renderer in this build. */
    readonly viewImplemented = computed(() => SCHEDULER_IMPLEMENTED_VIEWS.includes(this.view()));
}
