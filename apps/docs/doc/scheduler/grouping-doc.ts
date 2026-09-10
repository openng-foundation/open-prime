import { Component, signal } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { SchedulerModule } from '@openng/optimus-ui/scheduler';
import type { SchedulerViewType } from '@openng/optimus-ui/types/scheduler';
import { DEMO_CATEGORIES, DEMO_DATE, DEMO_EVENTS, DEMO_RESOURCES } from './demo-data';

@Component({
    selector: 'grouping-doc',
    standalone: true,
    imports: [AppDocSectionText, SchedulerModule, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                A timed view can break its columns down by resource instead of only by date. <i>resourceDay</i> and <i>resourceWeek</i> put the resource first and its dates inside, so each person, room or crew owns a vertical schedule.
                <i>dateDay</i> and <i>dateWeek</i> invert it: the date comes first and the resource columns nest inside each day. The band above the columns carries whichever one is the outer level.
            </p>
            <p>
                <i>resourceMonth</i> is one month grid per resource, stacked and labelled — a month cell is a whole day, and a day cannot be split into six readable columns. <i>dateMonth</i> keeps the single grid and groups the events inside each
                cell under their resource, which is the same idea at the only scale a month cell has room for.
            </p>
            <p>
                An event reaches a column through <i>resourceId</i>, or <i>resourceIds</i> when one appointment occupies several — a meeting that books a room and a projector is one event, not two. Anything whose resource is unknown lands in a
                trailing "Unassigned" column instead of disappearing. <i>resourceColumnMinWidth</i> sets the floor for a resource column, which needs to be narrower than a day column: a week of six resources is 42 of them.
            </p>
            <p>The same grouping is available on a plain <i>day</i> or <i>week</i> view through <i>groupByResource</i> and <i>groupByDate</i>, for a page that switches between "my week" and "the team's week" without changing the view name.</p>
            <p>
                How wide those columns get is <i>horizontalResourceColumnMode</i>: <i>auto</i> divides the container until there are more columns than <i>horizontalResourceOverflowThreshold</i> and then falls back to
                <i>horizontalResourceMinColumnWidth</i> and scrolls, <i>fit</i> always divides, <i>fixed</i> always uses <i>horizontalResourceColumnWidth</i>. <i>horizontalResourceDayMinWidth</i> is the floor for the DATE columns inside a resource,
                which are a different measurement from the resource columns themselves.
            </p>
        </app-docsectiontext>
        <div class="card">
            <p-scheduler-root
                locale="en-US"
                [(view)]="view"
                [events]="events"
                [resources]="resources"
                [categories]="categories"
                categoryField="categoryId"
                [date]="date"
                [dayStartHour]="8"
                [dayEndHour]="18"
                resourceColumnMinWidth="4.5rem"
                [maxEventsPerCell]="3"
                horizontalResourceColumnMode="auto"
                [horizontalResourceOverflowThreshold]="6"
                [horizontalResourceMinColumnWidth]="150"
                [horizontalResourceDayMinWidth]="120"
            >
                <p-scheduler-header>
                    <p-scheduler-navigation />
                    <p-scheduler-title />
                    <p-scheduler-view-selector />
                </p-scheduler-header>
                <p-scheduler-content>
                    <p-scheduler-resource-day />
                    <p-scheduler-date-day />
                    <p-scheduler-resource-month />
                    <p-scheduler-date-month />
                </p-scheduler-content>
                <p-scheduler-more-popover />
            </p-scheduler-root>
        </div>
        <app-code></app-code>
    `
})
export class GroupingDoc {
    events = DEMO_EVENTS;

    resources = DEMO_RESOURCES;

    categories = DEMO_CATEGORIES;

    date = DEMO_DATE;

    view = signal<SchedulerViewType>('resourceDay');
}
