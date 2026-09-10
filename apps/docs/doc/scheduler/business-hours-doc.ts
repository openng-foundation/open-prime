import { Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { SchedulerModule } from '@openng/optimus-ui/scheduler';
import { DEMO_CATEGORIES, DEMO_DATE, DEMO_EVENTS } from './demo-data';

@Component({
    selector: 'business-hours-doc',
    standalone: true,
    imports: [AppDocSectionText, SchedulerModule, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                <i>businessHours</i> marks the working window, and <i>workDays</i> which weekdays count. There is no default on purpose: a shaded nine-to-six band is an assumption about the product, and it is wrong for a hospital, a hotel or a 24/7
                line. Set them and the grid shades everything outside them; leave them unset and no hour is privileged.
            </p>
            <p>
                Inside the window a cell resolves the <i>p-scheduler-work-cell</i> definition and falls back to <i>p-scheduler-time-grid-cell</i>, so a page can style just the working hours without redeclaring every cell. Cells carry
                <i>data-business</i>, which is the selector to use from CSS.
            </p>
        </app-docsectiontext>
        <div class="card">
            <p-scheduler-root locale="en-US" view="week" [events]="events" [categories]="categories" categoryField="categoryId" [date]="date" [dayStartHour]="6" [dayEndHour]="22" [businessHours]="businessHours" [workDays]="workDays">
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
export class BusinessHoursDoc {
    events = DEMO_EVENTS;

    categories = DEMO_CATEGORIES;

    date = DEMO_DATE;

    businessHours = { start: 9, end: 18 };

    workDays = [1, 2, 3, 4, 5];
}
