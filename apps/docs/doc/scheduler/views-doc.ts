import { Component, signal } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { SchedulerModule } from '@openng/optimus-ui/scheduler';
import type { SchedulerViewType } from '@openng/optimus-ui/types/scheduler';
import { DEMO_CATEGORIES, DEMO_DATE, DEMO_EVENTS } from './demo-data';

@Component({
    selector: 'views-doc',
    standalone: true,
    imports: [AppDocSectionText, SchedulerModule, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                Declaring a scope inside <i>p-scheduler-content</i> is what makes a view available, and it is also what the view selector offers: with no <i>views</i> input, the header lists exactly the scopes you declared, in declaration order. A
                Scheduler that only draws a month has no business offering six views it cannot render — and with a single scope the selector prints the view's name instead of a button that leads nowhere.
            </p>
            <p>
                Day and week share the time grid, month packs events across the days they span, and agenda drops the geometry for a scrollable list. The <i>view</i> model input selects the active one and supports two-way binding, so the header and
                your own state stay in sync. Pass <i>views</i> explicitly to offer a narrower list than the one you declared.
            </p>
        </app-docsectiontext>
        <div class="card">
            <p-scheduler-root locale="en-US" [events]="events" [date]="date" [(view)]="view" [categories]="categories" categoryField="categoryId" [dayStartHour]="7" [dayEndHour]="19" [slotMinutes]="30">
                <p-scheduler-header>
                    <p-scheduler-navigation />
                    <p-scheduler-title />
                    <p-scheduler-view-selector />
                </p-scheduler-header>
                <p-scheduler-content>
                    <p-scheduler-day />
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
export class ViewsDoc {
    events = DEMO_EVENTS;

    categories = DEMO_CATEGORIES;

    date = DEMO_DATE;

    view = signal<SchedulerViewType>('week');
}
