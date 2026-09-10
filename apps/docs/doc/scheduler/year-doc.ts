import { Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { SchedulerModule } from '@openng/optimus-ui/scheduler';
import { DEMO_CATEGORIES, DEMO_DATE, DEMO_EVENTS } from './demo-data';

@Component({
    selector: 'year-doc',
    standalone: true,
    imports: [AppDocSectionText, SchedulerModule, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                The year view renders twelve mini-months. At this zoom an event bar would be a single pixel, so each day only carries an indicator when something happens on it; clicking a day drops into the day view for that date. Use
                <i>p-scheduler-mini-month-header</i> and <i>p-scheduler-mini-month-cell</i> to replace the month title or the day cell.
            </p>
            <p>
                Day cells are square, so the marker on today is a circle and not an oval, and the grid fits as many mini-months as the container allows instead of squeezing four columns into it — below
                <i>scheduler.miniMonth.minWidth</i> it drops a column rather than shrinking the day. Weekend numbers take <i>scheduler.miniMonthWeekend.color</i>: at this size there is no weekday header to read, so colour is what finds the Saturday.
            </p>
        </app-docsectiontext>
        <div class="card">
            <p-scheduler-root locale="en-US" [events]="events" [categories]="categories" categoryField="categoryId" [date]="date" view="year">
                <p-scheduler-header>
                    <p-scheduler-navigation />
                    <p-scheduler-title />
                </p-scheduler-header>
                <p-scheduler-content>
                    <p-scheduler-year />
                    <p-scheduler-day />
                </p-scheduler-content>
            </p-scheduler-root>
        </div>
        <app-code></app-code>
    `
})
export class YearDoc {
    events = DEMO_EVENTS;

    categories = DEMO_CATEGORIES;

    date = DEMO_DATE;
}
