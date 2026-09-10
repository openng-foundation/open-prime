import { Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { SchedulerModule } from '@openng/optimus-ui/scheduler';
import { DEMO_CATEGORIES, DEMO_DATE, DEMO_EVENTS } from './demo-data';

@Component({
    selector: 'month-doc',
    standalone: true,
    imports: [AppDocSectionText, SchedulerModule, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                The month grid is always six weeks of seven days, padded with the neighbouring months so every month is the same height and the rows do not jump as you navigate. The padding days carry <i>data-other-month</i> and are tinted, which is
                what makes the grid read as one month with filler either side.
            </p>
            <p>
                An event that spans days is drawn as a bar across them; an event with a time is a dot, a title and a time inside the cell, because half a dozen filled rectangles in a 6rem cell are unreadable. <i>maxEventsPerCell</i> caps how many a
                cell lists before the rest collapse into a "+N more" link that opens <i>p-scheduler-more-popover</i>. <i>monthCount</i> puts more than one month on screen at a time.
            </p>
        </app-docsectiontext>
        <div class="card">
            <p-scheduler-root locale="en-US" view="month" [events]="events" [categories]="categories" categoryField="categoryId" [date]="date" [maxEventsPerCell]="3">
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
export class MonthDoc {
    events = DEMO_EVENTS;

    categories = DEMO_CATEGORIES;

    date = DEMO_DATE;
}
