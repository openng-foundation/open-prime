import { NgModule } from '@angular/core';
import { Scheduler } from './scheduler';
import { SchedulerAgendaView } from './scheduler-agenda';
import { SchedulerMonthView } from './scheduler-month';
import {
    SchedulerAgendaDateHeader,
    SchedulerAgendaEvent,
    SchedulerAllDayCell,
    SchedulerAllDayEvent,
    SchedulerCategoryLegend,
    SchedulerDayHeader,
    SchedulerEventPart,
    SchedulerFooter,
    SchedulerPrintHeader,
    SchedulerHeader,
    SchedulerLoading,
    SchedulerMiniMonthCell,
    SchedulerMiniMonthHeader,
    SchedulerMonthCell,
    SchedulerMonthCellNumber,
    SchedulerMonthDayCell,
    SchedulerMonthEvent,
    SchedulerMonthTitle,
    SchedulerMonthHeaderCell,
    SchedulerMonthMoreLink,
    SchedulerNavigation,
    SchedulerResourceAggregateBadge,
    SchedulerResourceAreaHeader,
    SchedulerResourceColumnHeader,
    SchedulerResourceGroup,
    SchedulerResourceHeader,
    SchedulerResourcePart,
    SchedulerResourceRow,
    SchedulerSelectionToolbar,
    SchedulerTimeGridCell,
    SchedulerTimeGridEvent,
    SchedulerTimeGutter,
    SchedulerTimelineCell,
    SchedulerTimelineEvent,
    SchedulerTimelineHeaderCell,
    SchedulerTitle,
    SchedulerViewSelector,
    SchedulerWorkCell
} from './scheduler-parts';
import { SchedulerContextMenu, SchedulerMorePopover, SchedulerPopover, SchedulerQuickInfo } from './scheduler-overlays';
import { SCHEDULER_DEFS, SCHEDULER_SCOPES } from './scheduler-registry';
import { SchedulerTimeGridView } from './scheduler-time-grid';
import { SchedulerTimelineView } from './scheduler-timeline';
import { SchedulerYearView } from './scheduler-year';

const PARTS = [
    Scheduler,
    SchedulerHeader,
    SchedulerNavigation,
    SchedulerTitle,
    SchedulerViewSelector,
    SchedulerSelectionToolbar,
    SchedulerCategoryLegend,
    SchedulerFooter,
    SchedulerPrintHeader,
    SchedulerLoading,
    SchedulerMorePopover,
    SchedulerQuickInfo,
    SchedulerPopover,
    SchedulerContextMenu,
    SchedulerEventPart,
    SchedulerTimeGridEvent,
    SchedulerAllDayEvent,
    SchedulerMonthEvent,
    SchedulerAgendaEvent,
    SchedulerDayHeader,
    SchedulerAllDayCell,
    SchedulerTimeGutter,
    SchedulerTimeGridCell,
    SchedulerWorkCell,
    SchedulerMonthTitle,
    SchedulerMonthHeaderCell,
    SchedulerMonthCell,
    SchedulerMonthCellNumber,
    SchedulerMonthDayCell,
    SchedulerMonthMoreLink,
    SchedulerMiniMonthHeader,
    SchedulerMiniMonthCell,
    SchedulerAgendaDateHeader,
    SchedulerTimelineHeaderCell,
    SchedulerTimelineCell,
    SchedulerTimelineEvent,
    SchedulerResourceColumnHeader,
    SchedulerResourceAreaHeader,
    SchedulerResourceHeader,
    SchedulerResourcePart,
    SchedulerResourceGroup,
    SchedulerResourceRow,
    SchedulerResourceAggregateBadge,
    SchedulerTimeGridView,
    SchedulerMonthView,
    SchedulerAgendaView,
    SchedulerYearView,
    SchedulerTimelineView
];

/**
 * The complete Scheduler composition surface.
 *
 * Every renderer this build ships is registered, which is the tradeoff the upstream docs describe:
 * one import that works whichever view a feature switches to, at the cost of pulling all of them
 * into the bundle. A feature stuck on a single view can import that view's parts directly instead.
 */
@NgModule({
    imports: [...PARTS, ...SCHEDULER_SCOPES, ...SCHEDULER_DEFS],
    exports: [...PARTS, ...SCHEDULER_SCOPES, ...SCHEDULER_DEFS]
})
export class SchedulerModule {}
