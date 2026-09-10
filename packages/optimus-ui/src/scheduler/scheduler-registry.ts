import { computed, effect, inject, signal, ChangeDetectionStrategy, Component, Directive, InjectionToken, TemplateRef, ViewEncapsulation } from '@angular/core';
import type { SchedulerViewType } from '@openng/optimus-ui/types/scheduler';
import { SchedulerAgendaView } from './scheduler-agenda';
import { timelineScaleOf } from './scheduler-date';
import { SchedulerMonthView } from './scheduler-month';
import { SCHEDULER_STATE } from './scheduler-state';
import { SCHEDULER_DEF_RESOLVER, type SchedulerDefResolver, type SchedulerSlot } from './scheduler-resolver';
import { SchedulerTimeGridView } from './scheduler-time-grid';
import { SchedulerTimelineView } from './scheduler-timeline';
import { SchedulerYearView } from './scheduler-year';

/**
 * The definition registry: how `<p-scheduler-month-event *pSchedulerMonthEventDef>` reaches the
 * renderer that stamps it.
 *
 * Three pieces:
 *
 * 1. A **scope** (`<p-scheduler-content>`, `<p-scheduler-month>`, …) owns a slot → template map and
 *    declares which views it applies to.
 * 2. A **def directive** is placed on a semantic component, which turns that component into a
 *    `TemplateRef`, and registers it in the nearest scope.
 * 3. {@link SchedulerContent.resolve} picks a template for a slot in the active view, preferring the
 *    view scope over the content-level fallback.
 *
 * The point of the indirection is that a definition is a *declaration*, not a render position: the
 * template is written once and instantiated for every matching event, cell or row.
 *
 * @module scheduler-registry
 */

/**
 * A scope a definition can register into.
 */
export interface SchedulerScopeLike {
    /** Views this scope applies to. Empty means "any view", which is what the content scope is. */
    readonly views: readonly SchedulerViewType[];
    /**
     * Views this scope should make the view selector OFFER, when it is not simply `views`.
     *
     * The timeline scopes cover their four scales plus the original alias name; offering the alias
     * too would put two buttons for the same view in the toolbar.
     */
    readonly selectableViews?: readonly SchedulerViewType[];
    /** Registers a template for a slot. */
    register(slot: SchedulerSlot, template: TemplateRef<any>): void;
}

/** @internal Nearest scope, injected by the def directives. */
export const SCHEDULER_SCOPE = new InjectionToken<SchedulerScopeLike>('SCHEDULER_SCOPE');

/**
 * Base of every scope: holds the slot → template map.
 */
@Directive()
export abstract class SchedulerScope implements SchedulerScopeLike {
    /**
     * Views this scope applies to.
     */
    abstract readonly views: readonly SchedulerViewType[];

    /** @see SchedulerScopeLike.selectableViews */
    readonly selectableViews?: readonly SchedulerViewType[];

    /** @internal */
    readonly defs = signal<ReadonlyMap<SchedulerSlot, TemplateRef<any>>>(new Map());

    /**
     * Registers a template for a slot. Last declaration wins, which matches how Angular content
     * queries behave and keeps a duplicated declaration from being ambiguous.
     */
    register(slot: SchedulerSlot, template: TemplateRef<any>): void {
        const next = new Map(this.defs());
        next.set(slot, template);
        this.defs.set(next);
    }

    /**
     * The template registered for a slot in this scope, if any.
     */
    def(slot: SchedulerSlot): TemplateRef<any> | undefined {
        return this.defs().get(slot);
    }
}

/**
 * The content region: holds the view scopes and the view-agnostic definitions.
 *
 * `<p-scheduler-event *pSchedulerEventDef>` declared straight inside it is the fallback used by any
 * view with no narrower event definition.
 *
 * @group Components
 */
@Component({
    selector: 'p-scheduler-content',
    standalone: true,
    imports: [SchedulerTimeGridView, SchedulerMonthView, SchedulerAgendaView, SchedulerYearView, SchedulerTimelineView],
    // The <ng-content> is declarations ONLY: the scopes and the *...Def are templates and draw
    // nothing. What is seen is drawn by the active view's renderer, just below.
    template: `
        <ng-content />
        @switch (state.view()) {
            @case ('day') {
                <p-scheduler-time-grid-view viewType="day" />
            }
            @case ('week') {
                <p-scheduler-time-grid-view viewType="week" />
            }
            @case ('resourceDay') {
                <p-scheduler-time-grid-view viewType="resourceDay" />
            }
            @case ('resourceWeek') {
                <p-scheduler-time-grid-view viewType="resourceWeek" />
            }
            @case ('dateDay') {
                <p-scheduler-time-grid-view viewType="dateDay" />
            }
            @case ('dateWeek') {
                <p-scheduler-time-grid-view viewType="dateWeek" />
            }
            @case ('resourceMonth') {
                <p-scheduler-month-view viewType="resourceMonth" />
            }
            @case ('dateMonth') {
                <p-scheduler-month-view viewType="dateMonth" />
            }
            @case ('month') {
                <p-scheduler-month-view viewType="month" />
            }
            @case ('agenda') {
                <p-scheduler-agenda-view />
            }
            @case ('year') {
                <p-scheduler-year-view />
            }
            @default {
                <!-- The eight timelines share one renderer: viewType tells it the scale and whether
                     it carries a resource rail, so listing them as cases would repeat the same line
                     eight times over. -->
                @if (timelineView(); as timeline) {
                    <p-scheduler-timeline-view [viewType]="timeline" />
                } @else {
                    <div class="p-scheduler-view-unavailable" role="status">{{ state.viewLabel(state.view()) }}</div>
                }
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [
        { provide: SCHEDULER_SCOPE, useExisting: SchedulerContent },
        { provide: SCHEDULER_DEF_RESOLVER, useExisting: SchedulerContent }
    ],
    host: {
        class: 'p-scheduler-content',
        'data-slot': 'scheduler-content',
        '[attr.data-view]': 'state.view()'
    }
})
export class SchedulerContent extends SchedulerScope implements SchedulerDefResolver {
    /** @internal */
    readonly state = inject(SCHEDULER_STATE);

    /** The active view when it is one of the timelines, which all share a single renderer. */
    protected readonly timelineView = computed(() => {
        const view = this.state.view();
        return timelineScaleOf(view) ? view : null;
    });

    /**
     * The content scope applies to every view: it is the fallback, not a view.
     */
    override readonly views: readonly SchedulerViewType[] = [];

    /** @internal Registered view scopes, in declaration order. */
    readonly scopes = signal<readonly SchedulerScope[]>([]);

    /** @internal */
    addScope(scope: SchedulerScope): void {
        this.scopes.set([...this.scopes(), scope]);
    }

    /** @internal */
    removeScope(scope: SchedulerScope): void {
        this.scopes.set(this.scopes().filter((s) => s !== scope));
    }

    /** The views the page declared, in declaration order. */
    private readonly declaredViews = computed(() => {
        const views: SchedulerViewType[] = [];
        for (const scope of this.scopes()) {
            for (const view of scope.selectableViews ?? scope.views ?? []) {
                if (!views.includes(view)) views.push(view);
            }
        }
        return views;
    });

    /**
     * Hands the state the views the page declared, so the view selector can offer exactly those
     * instead of every view the build knows how to render.
     *
     * It lives in an effect and NOT in `addScope`: a scope registers itself from its base class's
     * constructor, which is BEFORE the subclass field initialisers run, so its own `views` is still
     * undefined at that point.
     */
    private readonly syncDeclaredViews = effect(() => {
        this.state.declaredViews.set(this.declaredViews());
    });

    /**
     * The template to use for a slot in a view.
     *
     * A view scope beats the content-level fallback, which is what makes the documented override
     * order work: a month-specific event card in Month, the generic one everywhere else.
     */
    resolve(slot: SchedulerSlot, view: SchedulerViewType): TemplateRef<any> | undefined {
        for (const scope of this.scopes()) {
            if (scope.views.includes(view)) {
                const def = scope.def(slot);
                if (def) return def;
            }
        }
        return this.def(slot);
    }
}

/**
 * Base of the per-view scopes. Registers itself with the content region so
 * {@link SchedulerContent.resolve} can find it.
 */
@Directive()
export abstract class SchedulerViewScope extends SchedulerScope {
    private readonly content = inject(SchedulerContent, { optional: true, skipSelf: true });

    constructor() {
        super();
        if (!this.content) {
            throw new Error('[Scheduler] a view scope must be declared inside <p-scheduler-content>.');
        }
        this.content.addScope(this);
    }

    ngOnDestroy(): void {
        this.content?.removeScope(this);
    }
}

// Literal decorators, not generated: see the note in scheduler-parts.ts (NG2001).

/**
 * Scope of the day view.
 * @group Components
 */
@Component({
    selector: 'p-scheduler-day',
    standalone: true,
    template: `<ng-content />`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [{ provide: SCHEDULER_SCOPE, useExisting: SchedulerDayScope }]
})
export class SchedulerDayScope extends SchedulerViewScope {
    override readonly views = ['day'] as const;
}

/**
 * Scope of the week view.
 * @group Components
 */
@Component({
    selector: 'p-scheduler-week',
    standalone: true,
    template: `<ng-content />`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [{ provide: SCHEDULER_SCOPE, useExisting: SchedulerWeekScope }]
})
export class SchedulerWeekScope extends SchedulerViewScope {
    override readonly views = ['week'] as const;
}

/**
 * Scope of the month view.
 * @group Components
 */
@Component({
    selector: 'p-scheduler-month',
    standalone: true,
    template: `<ng-content />`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [{ provide: SCHEDULER_SCOPE, useExisting: SchedulerMonthScope }]
})
export class SchedulerMonthScope extends SchedulerViewScope {
    override readonly views = ['month'] as const;
}

/**
 * Scope of the year view.
 * @group Components
 */
@Component({
    selector: 'p-scheduler-year',
    standalone: true,
    template: `<ng-content />`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [{ provide: SCHEDULER_SCOPE, useExisting: SchedulerYearScope }]
})
export class SchedulerYearScope extends SchedulerViewScope {
    override readonly views = ['year'] as const;
}

/**
 * Scope of the agenda view.
 * @group Components
 */
@Component({
    selector: 'p-scheduler-agenda',
    standalone: true,
    template: `<ng-content />`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [{ provide: SCHEDULER_SCOPE, useExisting: SchedulerAgendaScope }]
})
export class SchedulerAgendaScope extends SchedulerViewScope {
    override readonly views = ['agenda'] as const;
}

/**
 * Scope of the timeline view.
 * @group Components
 */
@Component({
    selector: 'p-scheduler-timeline',
    standalone: true,
    template: `<ng-content />`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [{ provide: SCHEDULER_SCOPE, useExisting: SchedulerTimelineScope }]
})
export class SchedulerTimelineScope extends SchedulerViewScope {
    override readonly views = ['timeline', 'timelineDay', 'timelineWeek', 'timelineMonth', 'timelineYear'] as const;
    override readonly selectableViews = ['timelineDay', 'timelineWeek', 'timelineMonth', 'timelineYear'] as const;
}

/**
 * Scope of the resource day view.
 * @group Components
 */
@Component({
    selector: 'p-scheduler-resource-day',
    standalone: true,
    template: `<ng-content />`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [{ provide: SCHEDULER_SCOPE, useExisting: SchedulerResourceDayScope }]
})
export class SchedulerResourceDayScope extends SchedulerViewScope {
    override readonly views = ['resourceDay'] as const;
}

/**
 * Scope of the resource week view.
 * @group Components
 */
@Component({
    selector: 'p-scheduler-resource-week',
    standalone: true,
    template: `<ng-content />`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [{ provide: SCHEDULER_SCOPE, useExisting: SchedulerResourceWeekScope }]
})
export class SchedulerResourceWeekScope extends SchedulerViewScope {
    override readonly views = ['resourceWeek'] as const;
}

/**
 * Scope of the resource month view.
 * @group Components
 */
@Component({
    selector: 'p-scheduler-resource-month',
    standalone: true,
    template: `<ng-content />`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [{ provide: SCHEDULER_SCOPE, useExisting: SchedulerResourceMonthScope }]
})
export class SchedulerResourceMonthScope extends SchedulerViewScope {
    override readonly views = ['resourceMonth'] as const;
}

/**
 * Scope of the resource timeline view.
 * @group Components
 */
@Component({
    selector: 'p-scheduler-resource-timeline',
    standalone: true,
    template: `<ng-content />`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [{ provide: SCHEDULER_SCOPE, useExisting: SchedulerResourceTimelineScope }]
})
export class SchedulerResourceTimelineScope extends SchedulerViewScope {
    override readonly views = ['resourceTimeline', 'resourceTimelineDay', 'resourceTimelineWeek', 'resourceTimelineMonth', 'resourceTimelineYear'] as const;
    override readonly selectableViews = ['resourceTimelineDay', 'resourceTimelineWeek', 'resourceTimelineMonth', 'resourceTimelineYear'] as const;
}

/**
 * Scope of the date day view.
 * @group Components
 */
@Component({
    selector: 'p-scheduler-date-day',
    standalone: true,
    template: `<ng-content />`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [{ provide: SCHEDULER_SCOPE, useExisting: SchedulerDateDayScope }]
})
export class SchedulerDateDayScope extends SchedulerViewScope {
    override readonly views = ['dateDay'] as const;
}

/**
 * Scope of the date week view.
 * @group Components
 */
@Component({
    selector: 'p-scheduler-date-week',
    standalone: true,
    template: `<ng-content />`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [{ provide: SCHEDULER_SCOPE, useExisting: SchedulerDateWeekScope }]
})
export class SchedulerDateWeekScope extends SchedulerViewScope {
    override readonly views = ['dateWeek'] as const;
}

/**
 * Scope of the date month view.
 * @group Components
 */
@Component({
    selector: 'p-scheduler-date-month',
    standalone: true,
    template: `<ng-content />`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [{ provide: SCHEDULER_SCOPE, useExisting: SchedulerDateMonthScope }]
})
export class SchedulerDateMonthScope extends SchedulerViewScope {
    override readonly views = ['dateMonth'] as const;
}

/**
 * Base of the def directives: captures the `TemplateRef` the structural directive created and
 * registers it in the nearest scope under {@link SchedulerDef.slot}.
 */
@Directive()
export abstract class SchedulerDef {
    /**
     * Slot this definition fills.
     */
    abstract readonly slot: SchedulerSlot;

    /**
     * The captured template.
     */
    readonly template: TemplateRef<any> = inject(TemplateRef);

    private readonly scope = inject(SCHEDULER_SCOPE, { optional: true });

    ngOnInit(): void {
        if (!this.scope) {
            throw new Error(`[Scheduler] *pScheduler${this.slot} must be declared inside <p-scheduler-content> or a view scope.`);
        }
        this.scope.register(this.slot, this.template);
    }
}

/** Declares the fallback event surface. @group Templates */
@Directive({ selector: '[pSchedulerEventDef]', standalone: true })
export class SchedulerEventDef extends SchedulerDef {
    override readonly slot = 'event' as const;
}

/** Declares the day column header. @group Templates */
@Directive({ selector: '[pSchedulerDayHeaderDef]', standalone: true })
export class SchedulerDayHeaderDef extends SchedulerDef {
    override readonly slot = 'dayHeader' as const;
}

/** Declares a cell of the all-day row. @group Templates */
@Directive({ selector: '[pSchedulerAllDayCellDef]', standalone: true })
export class SchedulerAllDayCellDef extends SchedulerDef {
    override readonly slot = 'allDayCell' as const;
}

/** Declares an event of the all-day row. @group Templates */
@Directive({ selector: '[pSchedulerAllDayEventDef]', standalone: true })
export class SchedulerAllDayEventDef extends SchedulerDef {
    override readonly slot = 'allDayEvent' as const;
}

/** Declares a label of the time gutter. @group Templates */
@Directive({ selector: '[pSchedulerTimeGutterDef]', standalone: true })
export class SchedulerTimeGutterDef extends SchedulerDef {
    override readonly slot = 'timeGutter' as const;
}

/** Declares a cell of the time grid. @group Templates */
@Directive({ selector: '[pSchedulerTimeGridCellDef]', standalone: true })
export class SchedulerTimeGridCellDef extends SchedulerDef {
    override readonly slot = 'timeGridCell' as const;
}

/** Declares a working-hours cell. @group Templates */
@Directive({ selector: '[pSchedulerWorkCellDef]', standalone: true })
export class SchedulerWorkCellDef extends SchedulerDef {
    override readonly slot = 'workCell' as const;
}

/** Declares a timed event of the time grid. @group Templates */
@Directive({ selector: '[pSchedulerTimeGridEventDef]', standalone: true })
export class SchedulerTimeGridEventDef extends SchedulerDef {
    override readonly slot = 'timeGridEvent' as const;
}

/** Declares the caption naming the month of a grid, drawn when `monthCount` is above one. @group Templates */
@Directive({ selector: '[pSchedulerMonthTitleDef]', standalone: true })
export class SchedulerMonthTitleDef extends SchedulerDef {
    override readonly slot = 'monthTitle' as const;
}

/** Declares the weekday header row of the month grid. @group Templates */
@Directive({ selector: '[pSchedulerMonthHeaderCellDef]', standalone: true })
export class SchedulerMonthHeaderCellDef extends SchedulerDef {
    override readonly slot = 'monthHeaderCell' as const;
}

/** Declares a whole cell of the month grid. @group Templates */
@Directive({ selector: '[pSchedulerMonthCellDef]', standalone: true })
export class SchedulerMonthCellDef extends SchedulerDef {
    override readonly slot = 'monthCell' as const;
}

/** Declares the day number of a month cell. @group Templates */
@Directive({ selector: '[pSchedulerMonthCellNumberDef]', standalone: true })
export class SchedulerMonthCellNumberDef extends SchedulerDef {
    override readonly slot = 'monthCellNumber' as const;
}

/** Declares the body of a month cell. @group Templates */
@Directive({ selector: '[pSchedulerMonthDayCellDef]', standalone: true })
export class SchedulerMonthDayCellDef extends SchedulerDef {
    override readonly slot = 'monthDayCell' as const;
}

/** Declares an event inside a month cell. @group Templates */
@Directive({ selector: '[pSchedulerMonthEventDef]', standalone: true })
export class SchedulerMonthEventDef extends SchedulerDef {
    override readonly slot = 'monthEvent' as const;
}

/** Declares the overflow link of a month cell. @group Templates */
@Directive({ selector: '[pSchedulerMonthMoreLinkDef]', standalone: true })
export class SchedulerMonthMoreLinkDef extends SchedulerDef {
    override readonly slot = 'monthMoreLink' as const;
}

/** Declares the header of a mini month. @group Templates */
@Directive({ selector: '[pSchedulerMiniMonthHeaderDef]', standalone: true })
export class SchedulerMiniMonthHeaderDef extends SchedulerDef {
    override readonly slot = 'miniMonthHeader' as const;
}

/** Declares a cell of a mini month. @group Templates */
@Directive({ selector: '[pSchedulerMiniMonthCellDef]', standalone: true })
export class SchedulerMiniMonthCellDef extends SchedulerDef {
    override readonly slot = 'miniMonthCell' as const;
}

/** Declares the date header of an agenda group. @group Templates */
@Directive({ selector: '[pSchedulerAgendaDateHeaderDef]', standalone: true })
export class SchedulerAgendaDateHeaderDef extends SchedulerDef {
    override readonly slot = 'agendaDateHeader' as const;
}

/** Declares a row of the agenda. @group Templates */
@Directive({ selector: '[pSchedulerAgendaEventDef]', standalone: true })
export class SchedulerAgendaEventDef extends SchedulerDef {
    override readonly slot = 'agendaEvent' as const;
}

/** Declares a header cell of the timeline. @group Templates */
@Directive({ selector: '[pSchedulerTimelineHeaderCellDef]', standalone: true })
export class SchedulerTimelineHeaderCellDef extends SchedulerDef {
    override readonly slot = 'timelineHeaderCell' as const;
}

/** Declares a cell of the timeline. @group Templates */
@Directive({ selector: '[pSchedulerTimelineCellDef]', standalone: true })
export class SchedulerTimelineCellDef extends SchedulerDef {
    override readonly slot = 'timelineCell' as const;
}

/** Declares an event of the timeline. @group Templates */
@Directive({ selector: '[pSchedulerTimelineEventDef]', standalone: true })
export class SchedulerTimelineEventDef extends SchedulerDef {
    override readonly slot = 'timelineEvent' as const;
}

/** Declares a horizontal resource column header. @group Templates */
@Directive({ selector: '[pSchedulerResourceColumnHeaderDef]', standalone: true })
export class SchedulerResourceColumnHeaderDef extends SchedulerDef {
    override readonly slot = 'resourceColumnHeader' as const;
}

/** Declares the area above the resource rail. @group Templates */
@Directive({ selector: '[pSchedulerResourceAreaHeaderDef]', standalone: true })
export class SchedulerResourceAreaHeaderDef extends SchedulerDef {
    override readonly slot = 'resourceAreaHeader' as const;
}

/** Declares the resource rail header. @group Templates */
@Directive({ selector: '[pSchedulerResourceHeaderDef]', standalone: true })
export class SchedulerResourceHeaderDef extends SchedulerDef {
    override readonly slot = 'resourceHeader' as const;
}

/** Declares a general resource surface. @group Templates */
@Directive({ selector: '[pSchedulerResourceDef]', standalone: true })
export class SchedulerResourceDef extends SchedulerDef {
    override readonly slot = 'resource' as const;
}

/** Declares a resource group row. @group Templates */
@Directive({ selector: '[pSchedulerResourceGroupDef]', standalone: true })
export class SchedulerResourceGroupDef extends SchedulerDef {
    override readonly slot = 'resourceGroup' as const;
}

/** Declares a resource leaf row. @group Templates */
@Directive({ selector: '[pSchedulerResourceRowDef]', standalone: true })
export class SchedulerResourceRowDef extends SchedulerDef {
    override readonly slot = 'resourceRow' as const;
}

/** Declares the summary badge of a collapsed group. @group Templates */
@Directive({ selector: '[pSchedulerResourceAggregateBadgeDef]', standalone: true })
export class SchedulerResourceAggregateBadgeDef extends SchedulerDef {
    override readonly slot = 'resourceAggregateBadge' as const;
}

/**
 * Every view scope, for the `imports` of a standalone consumer.
 */
export const SCHEDULER_SCOPES = [
    SchedulerContent,
    SchedulerDayScope,
    SchedulerWeekScope,
    SchedulerMonthScope,
    SchedulerYearScope,
    SchedulerAgendaScope,
    SchedulerTimelineScope,
    SchedulerResourceDayScope,
    SchedulerResourceWeekScope,
    SchedulerResourceMonthScope,
    SchedulerResourceTimelineScope,
    SchedulerDateDayScope,
    SchedulerDateWeekScope,
    SchedulerDateMonthScope
] as const;

/**
 * Every def directive, for the `imports` of a standalone consumer.
 */
export const SCHEDULER_DEFS = [
    SchedulerEventDef,
    SchedulerDayHeaderDef,
    SchedulerAllDayCellDef,
    SchedulerAllDayEventDef,
    SchedulerTimeGutterDef,
    SchedulerTimeGridCellDef,
    SchedulerWorkCellDef,
    SchedulerTimeGridEventDef,
    SchedulerMonthTitleDef,
    SchedulerMonthHeaderCellDef,
    SchedulerMonthCellDef,
    SchedulerMonthCellNumberDef,
    SchedulerMonthDayCellDef,
    SchedulerMonthEventDef,
    SchedulerMonthMoreLinkDef,
    SchedulerMiniMonthHeaderDef,
    SchedulerMiniMonthCellDef,
    SchedulerAgendaDateHeaderDef,
    SchedulerAgendaEventDef,
    SchedulerTimelineHeaderCellDef,
    SchedulerTimelineCellDef,
    SchedulerTimelineEventDef,
    SchedulerResourceColumnHeaderDef,
    SchedulerResourceAreaHeaderDef,
    SchedulerResourceHeaderDef,
    SchedulerResourceDef,
    SchedulerResourceGroupDef,
    SchedulerResourceRowDef,
    SchedulerResourceAggregateBadgeDef
] as const;
