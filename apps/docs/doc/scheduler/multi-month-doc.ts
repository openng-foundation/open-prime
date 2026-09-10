import { Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { SchedulerModule } from '@openng/optimus-ui/scheduler';
import { DEMO_CATEGORIES, DEMO_DATE, DEMO_EVENTS } from './demo-data';

@Component({
    selector: 'multi-month-doc',
    standalone: true,
    imports: [AppDocSectionText, SchedulerModule, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                <i>monthCount</i> says how many months a month view shows at once. Each one is drawn as its own six-week grid, one after another, and not as a single long run of week rows: a row ending in October and starting in November belongs to
                neither month, and the greyed-out padding days only mean something against one month.
            </p>
            <p>
                Every grid is captioned with its month as soon as there is more than one, the header title becomes the span it covers, and the previous/next controls move by <i>monthCount</i> months, so paging never repeats a month that is already on
                screen. It works the same in <i>resourceMonth</i> and <i>dateMonth</i>, where the months are drawn per resource.
            </p>
            <p>
                The grids are stacked and none of them is virtualised, so a range this wide is meant to be scrolled: past a dozen months the year view says the same thing in a twelfth of the DOM. On a narrow screen bind it down to one, and on paper
                each month gets its own sheet.
            </p>
        </app-docsectiontext>
        <div class="card">
            <p-scheduler-root locale="en-US" view="month" [monthCount]="3" [events]="events" [categories]="categories" categoryField="categoryId" [date]="date" [maxEventsPerCell]="2">
                <p-scheduler-header>
                    <p-scheduler-navigation />
                    <p-scheduler-title />
                    <p-scheduler-view-selector />
                </p-scheduler-header>
                <p-scheduler-content>
                    <p-scheduler-month />
                </p-scheduler-content>
                <p-scheduler-more-popover />
            </p-scheduler-root>
        </div>
        <app-code></app-code>
    `
})
export class MultiMonthDoc {
    events = DEMO_EVENTS;

    categories = DEMO_CATEGORIES;

    date = DEMO_DATE;
}
