import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, inject } from '@angular/core';
import { PARENT_INSTANCE } from '@openng/optimus-ui/basecomponent';
import { SCHEDULER_STATE } from './scheduler-state';
import { SCHEDULER_CATEGORY_LEGEND_CONTEXT, SCHEDULER_HEADER_CONTEXT, SCHEDULER_SELECTION_TOOLBAR_CONTEXT, injectSchedulerHeaderContext } from './scheduler-context';
import type { SchedulerViewType } from '@openng/optimus-ui/types/scheduler';

/**
 * The semantic components and the chrome regions.
 *
 * The semantic components (`<p-scheduler-month-event>`, `<p-scheduler-time-grid-cell>`, …) are
 * deliberately thin: a host element carrying the `data-slot` attribute plus `<ng-content>`. They are
 * the *context boundary* the docs describe — the renderer stamps them with an injector, so anything
 * inside can call `injectSchedulerEventContext()` without an input. Keeping them free of markup is
 * what lets an application replace the visible card without losing positioning, focus or ARIA.
 *
 * The chrome regions (header, legend, toolbar, footer, loading) DO ship default markup, because a
 * scheduler with no way to change month is useless out of the box. Every one of them is overridable
 * by projecting content into it.
 *
 * @module scheduler-parts
 */

// The decorators are written out by hand rather than produced by a helper: Angular's AOT compiler
// has to READ the metadata statically, and an object that comes out of a call (even spread into
// place) leaves the `template` invisible to it and fails with NG2001.

/** Event surface used when no narrower definition exists. @group Components */
@Component({
    selector: 'p-scheduler-event',
    standalone: true,
    template: `<ng-content />`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { 'data-slot': 'scheduler-event' }
})
export class SchedulerEventPart {}

/** Timed event surface of the day and week views. @group Components */
@Component({
    selector: 'p-scheduler-time-grid-event',
    standalone: true,
    template: `<ng-content />`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { 'data-slot': 'scheduler-time-grid-event' }
})
export class SchedulerTimeGridEvent {}

/** Event surface of the all-day row. @group Components */
@Component({
    selector: 'p-scheduler-all-day-event',
    standalone: true,
    template: `<ng-content />`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { 'data-slot': 'scheduler-all-day-event' }
})
export class SchedulerAllDayEvent {}

/** Event surface of a month cell. @group Components */
@Component({
    selector: 'p-scheduler-month-event',
    standalone: true,
    template: `<ng-content />`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { 'data-slot': 'scheduler-month-event' }
})
export class SchedulerMonthEvent {}

/** Event row of the agenda. @group Components */
@Component({
    selector: 'p-scheduler-agenda-event',
    standalone: true,
    template: `<ng-content />`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { 'data-slot': 'scheduler-agenda-event' }
})
export class SchedulerAgendaEvent {}

/** Column header of a day. @group Components */
@Component({
    selector: 'p-scheduler-day-header',
    standalone: true,
    template: `<ng-content />`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { 'data-slot': 'scheduler-day-header' }
})
export class SchedulerDayHeader {}

/** Cell of the all-day row. @group Components */
@Component({
    selector: 'p-scheduler-all-day-cell',
    standalone: true,
    template: `<ng-content />`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { 'data-slot': 'scheduler-all-day-cell' }
})
export class SchedulerAllDayCell {}

/** Label of the time gutter. @group Components */
@Component({
    selector: 'p-scheduler-time-gutter',
    standalone: true,
    template: `<ng-content />`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { 'data-slot': 'scheduler-time-gutter' }
})
export class SchedulerTimeGutter {}

/** Cell of the time grid. @group Components */
@Component({
    selector: 'p-scheduler-time-grid-cell',
    standalone: true,
    template: `<ng-content />`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { 'data-slot': 'scheduler-time-grid-cell' }
})
export class SchedulerTimeGridCell {}

/** Cell of the time grid inside working hours. @group Components */
@Component({
    selector: 'p-scheduler-work-cell',
    standalone: true,
    template: `<ng-content />`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { 'data-slot': 'scheduler-work-cell' }
})
export class SchedulerWorkCell {}

/** Caption naming the month of a grid, drawn when `monthCount` is above one. @group Components */
@Component({
    selector: 'p-scheduler-month-title',
    standalone: true,
    template: `<ng-content />`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { 'data-slot': 'scheduler-month-title' }
})
export class SchedulerMonthTitle {}

/** Weekday header row of the month grid. @group Components */
@Component({
    selector: 'p-scheduler-month-header-cell',
    standalone: true,
    template: `<ng-content />`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { 'data-slot': 'scheduler-month-header-cell' }
})
export class SchedulerMonthHeaderCell {}

/** Whole cell of the month grid. @group Components */
@Component({
    selector: 'p-scheduler-month-cell',
    standalone: true,
    template: `<ng-content />`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { 'data-slot': 'scheduler-month-cell' }
})
export class SchedulerMonthCell {}

/** Day number of a month cell. @group Components */
@Component({
    selector: 'p-scheduler-month-cell-number',
    standalone: true,
    template: `<ng-content />`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { 'data-slot': 'scheduler-month-cell-number' }
})
export class SchedulerMonthCellNumber {}

/** Body of a month cell. @group Components */
@Component({
    selector: 'p-scheduler-month-day-cell',
    standalone: true,
    template: `<ng-content />`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { 'data-slot': 'scheduler-month-day-cell' }
})
export class SchedulerMonthDayCell {}

/** Overflow link of a month cell. @group Components */
@Component({
    selector: 'p-scheduler-month-more-link',
    standalone: true,
    template: `<ng-content />`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { 'data-slot': 'scheduler-month-more-link' }
})
export class SchedulerMonthMoreLink {}

/** Header of a mini month in the year view. @group Components */
@Component({
    selector: 'p-scheduler-mini-month-header',
    standalone: true,
    template: `<ng-content />`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { 'data-slot': 'scheduler-mini-month-header' }
})
export class SchedulerMiniMonthHeader {}

/** Cell of a mini month in the year view. @group Components */
@Component({
    selector: 'p-scheduler-mini-month-cell',
    standalone: true,
    template: `<ng-content />`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { 'data-slot': 'scheduler-mini-month-cell' }
})
export class SchedulerMiniMonthCell {}

/** Date group header of the agenda. @group Components */
@Component({
    selector: 'p-scheduler-agenda-date-header',
    standalone: true,
    template: `<ng-content />`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { 'data-slot': 'scheduler-agenda-date-header' }
})
export class SchedulerAgendaDateHeader {}

/** Header cell of the timeline. @group Components */
@Component({
    selector: 'p-scheduler-timeline-header-cell',
    standalone: true,
    template: `<ng-content />`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { 'data-slot': 'scheduler-timeline-header-cell' }
})
export class SchedulerTimelineHeaderCell {}

/** Cell of the timeline. @group Components */
@Component({
    selector: 'p-scheduler-timeline-cell',
    standalone: true,
    template: `<ng-content />`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { 'data-slot': 'scheduler-timeline-cell' }
})
export class SchedulerTimelineCell {}

/** Event of the timeline. @group Components */
@Component({
    selector: 'p-scheduler-timeline-event',
    standalone: true,
    template: `<ng-content />`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { 'data-slot': 'scheduler-timeline-event' }
})
export class SchedulerTimelineEvent {}

/** Horizontal resource column header. @group Components */
@Component({
    selector: 'p-scheduler-resource-column-header',
    standalone: true,
    template: `<ng-content />`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { 'data-slot': 'scheduler-resource-column-header' }
})
export class SchedulerResourceColumnHeader {}

/** Area above the resource rail. @group Components */
@Component({
    selector: 'p-scheduler-resource-area-header',
    standalone: true,
    template: `<ng-content />`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { 'data-slot': 'scheduler-resource-area-header' }
})
export class SchedulerResourceAreaHeader {}

/** Header of the resource rail. @group Components */
@Component({
    selector: 'p-scheduler-resource-header',
    standalone: true,
    template: `<ng-content />`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { 'data-slot': 'scheduler-resource-header' }
})
export class SchedulerResourceHeader {}

/** General resource surface. @group Components */
@Component({
    selector: 'p-scheduler-resource',
    standalone: true,
    template: `<ng-content />`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { 'data-slot': 'scheduler-resource' }
})
export class SchedulerResourcePart {}

/** Resource group row. @group Components */
@Component({
    selector: 'p-scheduler-resource-group',
    standalone: true,
    template: `<ng-content />`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { 'data-slot': 'scheduler-resource-group' }
})
export class SchedulerResourceGroup {}

/** Resource leaf row. @group Components */
@Component({
    selector: 'p-scheduler-resource-row',
    standalone: true,
    template: `<ng-content />`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { 'data-slot': 'scheduler-resource-row' }
})
export class SchedulerResourceRow {}

/** Summary badge of a collapsed resource group. @group Components */
@Component({
    selector: 'p-scheduler-resource-aggregate-badge',
    standalone: true,
    template: `<ng-content />`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { 'data-slot': 'scheduler-resource-aggregate-badge' }
})
export class SchedulerResourceAggregateBadge {}

/**
 * The header region. Provides the header context and, when nothing is projected into it, renders
 * navigation, title and view selector in that order.
 *
 * @group Components
 */
@Component({
    selector: 'p-scheduler-header',
    standalone: true,
    template: `<ng-content />`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'p-scheduler-header',
        'data-slot': 'scheduler-header',
        '[attr.data-view]': 'state.view()'
    },
    providers: [{ provide: SCHEDULER_HEADER_CONTEXT, useFactory: () => inject(SchedulerHeader).context }]
})
export class SchedulerHeader {
    /** @internal */
    readonly state = inject(SCHEDULER_STATE);

    /** The header context, also readable by any child through `injectSchedulerHeaderContext()`. */
    readonly context = computed(() => ({
        view: this.state.view(),
        date: this.state.date(),
        title: this.state.rangeTitle(),
        views: this.state.availableViews(),
        prev: () => this.state.move(-1),
        next: () => this.state.move(1),
        today: () => this.state.goToToday(),
        setView: (view: SchedulerViewType) => this.state.changeView(view)
    }));
}

/**
 * Previous / today / next controls.
 * @group Components
 */
@Component({
    selector: 'p-scheduler-navigation',
    standalone: true,
    template: `
        <button type="button" class="p-scheduler-nav-button" data-slot="scheduler-nav-prev" [attr.aria-label]="labels().prev" (click)="context().prev()">
            <span class="p-scheduler-nav-icon p-scheduler-nav-icon-prev" aria-hidden="true"></span>
        </button>
        <button type="button" class="p-scheduler-today-button" data-slot="scheduler-nav-today" (click)="context().today()">{{ labels().today }}</button>
        <button type="button" class="p-scheduler-nav-button" data-slot="scheduler-nav-next" [attr.aria-label]="labels().next" (click)="context().next()">
            <span class="p-scheduler-nav-icon p-scheduler-nav-icon-next" aria-hidden="true"></span>
        </button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { class: 'p-scheduler-navigation', 'data-slot': 'scheduler-navigation' }
})
export class SchedulerNavigation {
    /** Context of the enclosing header. */
    readonly context = injectSchedulerHeaderContext();

    private readonly state = inject(SCHEDULER_STATE);

    /** @internal */
    readonly labels = computed(() => this.state.labels());
}

/**
 * Title of the visible range.
 * @group Components
 */
@Component({
    selector: 'p-scheduler-title',
    standalone: true,
    template: `{{ context().title }}`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { class: 'p-scheduler-title', 'data-slot': 'scheduler-title', 'aria-live': 'polite' }
})
export class SchedulerTitle {
    /** Context of the enclosing header. */
    readonly context = injectSchedulerHeaderContext();
}

/**
 * Buttons that switch between the views the root offers.
 * @group Components
 */
@Component({
    selector: 'p-scheduler-view-selector',
    standalone: true,
    template: `
        @if (single(); as view) {
            <!-- With a single view available there is nothing to select: a highlighted button that
                 leads nowhere invites a click and confuses. The name is printed instead. -->
            <span class="p-scheduler-view-label" data-slot="scheduler-view-label" [attr.data-view]="view">{{ label(view) }}</span>
        } @else {
            @for (view of context().views; track view) {
                <button
                    type="button"
                    class="p-scheduler-view-button"
                    data-slot="scheduler-view-button"
                    [attr.data-view]="view"
                    [attr.data-selected]="view === context().view ? '' : null"
                    [attr.aria-pressed]="view === context().view"
                    (click)="context().setView(view)"
                >
                    {{ label(view) }}
                </button>
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { class: 'p-scheduler-view-selector', 'data-slot': 'scheduler-view-selector', role: 'group' }
})
export class SchedulerViewSelector {
    /** Context of the enclosing header. */
    readonly context = injectSchedulerHeaderContext();

    private readonly state = inject(SCHEDULER_STATE);

    /** The only available view, when there is exactly one. */
    readonly single = computed(() => {
        const views = this.context().views;
        return views.length === 1 ? views[0] : null;
    });

    /** Localised name of a view. */
    label(view: SchedulerViewType): string {
        return this.state.viewLabel(view);
    }
}

/**
 * Actions over the selected events. Renders a count and a clear button unless content is projected.
 * @group Components
 */
@Component({
    selector: 'p-scheduler-selection-toolbar',
    standalone: true,
    template: `
        @if (context().active) {
            <ng-content>
                <span class="p-scheduler-selection-count">{{ context().selectedIds.length }}</span>
                <button type="button" class="p-scheduler-selection-clear" (click)="context().clear()">{{ labels().clear }}</button>
            </ng-content>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'p-scheduler-selection-toolbar',
        'data-slot': 'scheduler-selection-toolbar',
        '[attr.data-selection-active]': 'context().active ? "" : null'
    },
    providers: [{ provide: SCHEDULER_SELECTION_TOOLBAR_CONTEXT, useFactory: () => inject(SchedulerSelectionToolbar).context }]
})
export class SchedulerSelectionToolbar {
    private readonly state = inject(SCHEDULER_STATE);

    /** The selection toolbar context. */
    readonly context = computed(() => {
        const events = this.state.selectedEvents();
        return {
            events,
            selectedIds: events.map((event) => event.id),
            active: events.length > 0,
            clear: () => this.state.clearSelection(),
            remove: () => this.state.requestBulkDelete()
        };
    });

    /** @internal */
    readonly labels = computed(() => this.state.labels());
}

/**
 * Category swatches with counts, which double as filters.
 * @group Components
 */
@Component({
    selector: 'p-scheduler-category-legend',
    standalone: true,
    template: `
        <ng-content>
            @for (category of context().categories; track category.id) {
                <button
                    type="button"
                    class="p-scheduler-category-legend-item"
                    data-slot="scheduler-category-legend-ui-item"
                    [attr.data-selected]="category.active ? '' : null"
                    [attr.data-event-count]="category.count"
                    [attr.aria-pressed]="category.active"
                    [disabled]="!context().filterable"
                    (click)="context().toggle(category.id)"
                >
                    <span class="p-scheduler-category-legend-swatch" [style.background]="category.color" aria-hidden="true"></span>
                    <span class="p-scheduler-category-legend-label">{{ category.name }}</span>
                    <span class="p-scheduler-category-legend-count">{{ category.count }}</span>
                </button>
            }
        </ng-content>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'p-scheduler-category-legend',
        'data-slot': 'scheduler-category-legend',
        '[attr.data-filterable]': 'context().filterable ? "" : null',
        '[attr.data-filtering]': 'context().filtering ? "" : null'
    },
    providers: [{ provide: SCHEDULER_CATEGORY_LEGEND_CONTEXT, useFactory: () => inject(SchedulerCategoryLegend).context }]
})
export class SchedulerCategoryLegend {
    private readonly state = inject(SCHEDULER_STATE);

    /** The legend context. */
    readonly context = computed(() => ({
        categories: this.state.categoryCounts(),
        filterable: this.state.categoryFilterable(),
        filtering: this.state.filtering(),
        toggle: (id: string | number) => this.state.toggleCategory(id),
        clear: () => this.state.clearCategoryFilter()
    }));
}

/**
 * Header of a printed schedule.
 *
 * It exists because a sheet of paper has no chrome: the range the schedule covers is on screen in
 * `p-scheduler-title`, and once the controls are gone the print has nothing saying what it is or
 * when it was taken. Invisible on screen, so a page can leave it in the tree permanently.
 *
 * What it carries beyond the title comes from the options passed to `print()`, which is where a page
 * decides whether a handoff needs a timestamp, the timezone or the filters behind it.
 *
 * @group Components
 */
@Component({
    selector: 'p-scheduler-print-header',
    standalone: true,
    template: `
        <ng-content>
            <div class="p-scheduler-print-title">{{ state.rangeTitle() }}</div>
            @if (details().length) {
                <div class="p-scheduler-print-meta">
                    @for (detail of details(); track detail) {
                        <span class="p-scheduler-print-meta-item">{{ detail }}</span>
                    }
                </div>
            }
        </ng-content>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { class: 'p-scheduler-print-header', 'data-slot': 'scheduler-print-header' }
})
export class SchedulerPrintHeader {
    /** @internal */
    readonly state = inject(SCHEDULER_STATE);

    private readonly root = inject(PARENT_INSTANCE, { optional: true }) as { printChrome?: () => { generatedAt?: boolean; timezone?: boolean; filters?: string[] } | null } | null;

    /** The extras the sheet carries under the title. */
    readonly details = computed(() => {
        const chrome = this.root?.printChrome?.() ?? null;

        if (!chrome) return [];

        return [...(chrome.generatedAt ? [new Date().toLocaleString(this.state.locale())] : []), ...(chrome.timezone ? [this.state.timeZoneLabel()] : []), ...(chrome.filters ?? [])];
    });
}

/**
 * Footer region. Empty by default; project whatever the page needs into it.
 * @group Components
 */
@Component({
    selector: 'p-scheduler-footer',
    standalone: true,
    template: `<ng-content />`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { 'data-slot': 'scheduler-footer' }
})
export class SchedulerFooter {}

/**
 * Loading overlay, shown while the root's `loading` input is true.
 * @group Components
 */
@Component({
    selector: 'p-scheduler-loading',
    standalone: true,
    template: `
        @if (state.loading()) {
            <ng-content>
                <span class="p-scheduler-loading-spinner" aria-hidden="true"></span>
            </ng-content>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'p-scheduler-loading',
        'data-slot': 'scheduler-loading',
        '[attr.aria-busy]': 'state.loading()',
        '[hidden]': '!state.loading()'
    }
})
export class SchedulerLoading {
    /** @internal */
    readonly state = inject(SCHEDULER_STATE);
}
