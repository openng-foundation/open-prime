import { Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { SchedulerModule } from '@openng/optimus-ui/scheduler';
import { DEMO_CATEGORIES, DEMO_DATE, DEMO_EVENTS } from './demo-data';

@Component({
    selector: 'categories-doc',
    standalone: true,
    imports: [AppDocSectionText, SchedulerModule, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                A category is matched against the event field named by <i>categoryField</i> and gives the event its accent colour. Adding <i>p-scheduler-category-legend</i> renders a swatch per category with the number of events in the visible range;
                clicking one filters it out.
            </p>
        </app-docsectiontext>
        <div class="card">
            <p-scheduler-root locale="en-US" [events]="events" [categories]="categories" categoryField="categoryId" [date]="date" view="month" [categoryFilterable]="true">
                <p-scheduler-header>
                    <p-scheduler-navigation />
                    <p-scheduler-title />
                </p-scheduler-header>
                <p-scheduler-category-legend />
                <p-scheduler-content>
                    <p-scheduler-month />
                </p-scheduler-content>
                <p-scheduler-more-popover />
            </p-scheduler-root>
        </div>
        <app-code></app-code>
    `
})
export class CategoriesDoc {
    events = DEMO_EVENTS;

    categories = DEMO_CATEGORIES;

    date = DEMO_DATE;
}
