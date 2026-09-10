import { Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { SchedulerModule } from '@openng/optimus-ui/scheduler';
import { DEMO_CATEGORIES, DEMO_DATE, DEMO_RECURRING_EVENTS } from './demo-data';

@Component({
    selector: 'recurrence-doc',
    standalone: true,
    imports: [AppDocSectionText, SchedulerModule, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                An event with an <i>rrule</i> is a series. The Scheduler expands it into the occurrences the visible range needs, so the application stores one event and not five hundred copies. The rule is the RFC 5545 subset calendars actually use:
                <i>FREQ</i> (daily, weekly, monthly, yearly), <i>INTERVAL</i>, <i>COUNT</i>, <i>UNTIL</i>, <i>BYDAY</i>, <i>BYMONTHDAY</i> and <i>BYMONTH</i>. A rule it cannot fully read still produces its base occurrences instead of making the event
                vanish.
            </p>
            <p>
                Each occurrence arrives with a new <i>id</i> — two occurrences sharing one id would fight over the same DOM node and the same selected state — plus <i>recurrenceId</i> pointing at the series and <i>recurrenceStart</i>, the instant it
                was generated for. Those two are what a save flow needs: persist the series and its exceptions, never the expanded copies.
            </p>
            <p>
                Skip an occurrence with <i>exdate</i> on the series. Add an extra one with <i>rdate</i>. Override one by saving a separate event carrying <i>recurrenceId</i> and the original <i>recurrenceStart</i>: it replaces the generated copy
                instead of doubling it, which is how "this occurrence only" edits are stored.
            </p>
        </app-docsectiontext>
        <div class="card">
            <p-scheduler-root locale="en-US" view="week" [events]="events" [categories]="categories" categoryField="categoryId" [date]="date" [dayStartHour]="7" [dayEndHour]="19">
                <p-scheduler-header>
                    <p-scheduler-navigation />
                    <p-scheduler-title />
                    <p-scheduler-view-selector />
                </p-scheduler-header>
                <p-scheduler-content>
                    <p-scheduler-week />
                    <p-scheduler-month />
                    <p-scheduler-agenda />
                </p-scheduler-content>
                <p-scheduler-more-popover />
            </p-scheduler-root>
        </div>
        <app-code></app-code>
    `
})
export class RecurrenceDoc {
    events = DEMO_RECURRING_EVENTS;

    categories = DEMO_CATEGORIES;

    date = DEMO_DATE;
}
