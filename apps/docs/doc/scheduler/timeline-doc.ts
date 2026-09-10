import { Component, signal } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { SchedulerModule } from '@openng/optimus-ui/scheduler';
import type { SchedulerViewType } from '@openng/optimus-ui/types/scheduler';
import { DEMO_CATEGORIES, DEMO_DATE, DEMO_EVENTS } from './demo-data';

@Component({
    selector: 'timeline-doc',
    standalone: true,
    imports: [AppDocSectionText, SchedulerModule, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                The timeline lays time out left to right. One scope, <i>p-scheduler-timeline</i>, covers four scales: <i>timelineDay</i> and <i>timelineWeek</i> are made of time columns bounded by <i>dayStartHour</i>/<i>dayEndHour</i>,
                <i>timelineMonth</i> is one column per day and <i>timelineYear</i> one per month.
            </p>
            <p>
                Because the day and week axes only draw the hours you asked for, the axis skips the nights: an event is placed by which column it falls in, not by a linear fraction of the range. Overlapping events stack into rows rather than
                splitting the height, because a half-height bar on a horizontal axis is unreadable.
            </p>
            <p>
                <i>timelineSlotDuration</i> sets the minutes per column on the two time-based scales, and <i>timelineSlotWidth</i> its width in pixels — a week of hours and a year of months want very different numbers. <i>timelineSnapDuration</i> is
                the step a drag or an arrow key rounds to here, falling back to <i>snapDuration</i>: an hour-wide column laid out horizontally does not want the same step as a half-hour row laid out vertically. A long axis only mounts the columns
                near the viewport; the Performance section below covers the windowing options.
            </p>
        </app-docsectiontext>
        <div class="card">
            <p-scheduler-root
                locale="en-US"
                [events]="events"
                [categories]="categories"
                categoryField="categoryId"
                [date]="date"
                [(view)]="view"
                [dayStartHour]="7"
                [dayEndHour]="19"
                [timelineSlotDuration]="60"
                [timelineSlotWidth]="84"
                [timelineSnapDuration]="30"
                [editable]="true"
            >
                <p-scheduler-header>
                    <p-scheduler-navigation />
                    <p-scheduler-title />
                    <p-scheduler-view-selector />
                </p-scheduler-header>
                <p-scheduler-content>
                    <p-scheduler-timeline />
                </p-scheduler-content>
            </p-scheduler-root>
        </div>
        <app-code></app-code>
    `
})
export class TimelineDoc {
    events = DEMO_EVENTS;

    categories = DEMO_CATEGORIES;

    date = DEMO_DATE;

    view = signal<SchedulerViewType>('timelineWeek');
}
