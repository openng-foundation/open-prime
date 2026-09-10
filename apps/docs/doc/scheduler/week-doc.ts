import { Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { SchedulerModule } from '@openng/optimus-ui/scheduler';
import { DEMO_CATEGORIES, DEMO_DATE, DEMO_EVENTS } from './demo-data';

@Component({
    selector: 'week-doc',
    standalone: true,
    imports: [AppDocSectionText, SchedulerModule, AppCode],
    template: `
        <app-docsectiontext>
            <p>The week view is the same time grid with seven columns, so day and week share one renderer and differ only in how wide their range is. <i>firstDayOfWeek</i> rotates the columns; left unset it follows the Optimus locale.</p>
            <p>
                An event marked <i>allDay</i>, and any event covering 24 hours or more, goes to the strip above the grid instead of the grid itself: a 24-hour bar drawn in the columns would cover everything else that happens that day. The strip packs
                those events into rows, keeping a multi-day booking on one row across every day it spans.
            </p>
        </app-docsectiontext>
        <div class="card">
            <p-scheduler-root locale="en-US" view="week" [events]="events" [categories]="categories" categoryField="categoryId" [date]="date" [dayStartHour]="7" [dayEndHour]="19" [slotMinutes]="30">
                <p-scheduler-header>
                    <p-scheduler-navigation />
                    <p-scheduler-title />
                    <p-scheduler-view-selector />
                </p-scheduler-header>
                <p-scheduler-content>
                    <p-scheduler-week />
                </p-scheduler-content>
            </p-scheduler-root>
        </div>
        <app-code></app-code>
    `
})
export class WeekDoc {
    events = DEMO_EVENTS;

    categories = DEMO_CATEGORIES;

    date = DEMO_DATE;
}
