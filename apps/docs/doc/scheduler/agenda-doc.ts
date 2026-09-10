import { Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { SchedulerModule } from '@openng/optimus-ui/scheduler';
import { DEMO_CATEGORIES, DEMO_DATE, DEMO_EVENTS } from './demo-data';

@Component({
    selector: 'agenda-doc',
    standalone: true,
    imports: [AppDocSectionText, SchedulerModule, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                The agenda drops the geometry: a row is as tall as its content, which is exactly why this is the view that works on a phone. Events are grouped by day, and empty days are left out rather than rendered blank — scrolling a month of
                agenda should not mean scrolling past twenty empty headers.
            </p>
            <p><i>agendaDays</i> sets how many days it spans from the anchor date. Replace a day header with <i>p-scheduler-agenda-date-header</i> and a row with <i>p-scheduler-agenda-event</i>.</p>
            <p><i>showEmptyDays</i> lists the days the range covers that hold nothing, which is the difference between a list you read and a list you have to check dates against.</p>
        </app-docsectiontext>
        <div class="card">
            <p-scheduler-root locale="en-US" view="agenda" [events]="events" [categories]="categories" categoryField="categoryId" [date]="date" [agendaDays]="14" [showEmptyDays]="showEmptyDays">
                <p-scheduler-header>
                    <p-scheduler-navigation />
                    <p-scheduler-title />
                    <p-scheduler-view-selector />
                </p-scheduler-header>
                <p-scheduler-content>
                    <p-scheduler-agenda />
                </p-scheduler-content>
            </p-scheduler-root>
        </div>
        <app-code></app-code>
    `
})
export class AgendaDoc {
    showEmptyDays = true;

    events = DEMO_EVENTS;

    categories = DEMO_CATEGORIES;

    date = DEMO_DATE;
}
