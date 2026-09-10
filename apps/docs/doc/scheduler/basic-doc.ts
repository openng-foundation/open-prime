import { Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { SchedulerModule } from '@openng/optimus-ui/scheduler';
import type { SchedulerEvent } from '@openng/optimus-ui/types/scheduler';
import { DEMO_CATEGORIES, DEMO_DATE, DEMO_EVENTS } from './demo-data';

@Component({
    selector: 'basic-doc',
    standalone: true,
    imports: [AppDocSectionText, SchedulerModule, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                Scheduler is a compound component: <i>p-scheduler-root</i> owns the data and the view state, and every child part reads what it needs from it. A minimal calendar is the root, a header and a content region with the scope of the view
                you want to render.
            </p>
        </app-docsectiontext>
        <div class="card">
            <p-scheduler-root locale="en-US" [events]="events" [categories]="categories" categoryField="categoryId" [date]="date" [dayStartHour]="7" [dayEndHour]="19" [slotMinutes]="30">
                <p-scheduler-header>
                    <p-scheduler-navigation />
                    <p-scheduler-title />
                    <p-scheduler-view-selector />
                </p-scheduler-header>
                <p-scheduler-content>
                    <p-scheduler-month />
                    <p-scheduler-week />
                    <p-scheduler-day />
                    <p-scheduler-agenda />
                </p-scheduler-content>
                <p-scheduler-more-popover />
            </p-scheduler-root>
        </div>
        <app-code></app-code>
    `
})
export class BasicDoc {
    events: SchedulerEvent[] = DEMO_EVENTS;

    categories = DEMO_CATEGORIES;

    date = DEMO_DATE;
}
