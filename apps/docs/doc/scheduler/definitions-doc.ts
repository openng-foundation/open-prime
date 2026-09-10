import { Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { SchedulerModule } from '@openng/optimus-ui/scheduler';
import { DEMO_CATEGORIES, DEMO_DATE, DEMO_EVENTS } from './demo-data';

@Component({
    selector: 'definitions-doc',
    standalone: true,
    imports: [AppDocSectionText, SchedulerModule, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                Every repeated surface can be replaced with a definition: a semantic component carrying the <i>*pScheduler...Def</i> directive. The template is declared once and instantiated for every matching surface, with a typed context you reach
                through <i>let ctx</i>.
            </p>
            <p>
                Definitions resolve from the narrowest scope outwards. The event card below is declared inside <i>p-scheduler-month</i>, so it only applies to the month view; a <i>p-scheduler-event</i> declared directly in
                <i>p-scheduler-content</i> would be the fallback for every other view.
            </p>
        </app-docsectiontext>
        <div class="card">
            <p-scheduler-root locale="en-US" [events]="events" [categories]="categories" categoryField="categoryId" [date]="date" view="month" [maxEventsPerCell]="3">
                <p-scheduler-header>
                    <p-scheduler-navigation />
                    <p-scheduler-title />
                </p-scheduler-header>
                <p-scheduler-content>
                    <p-scheduler-month>
                        <p-scheduler-month-event *pSchedulerMonthEventDef="let ctx">
                            <span class="flex items-center gap-1 overflow-hidden">
                                <span class="inline-block w-2 h-2 rounded-full shrink-0" [style.background]="ctx.accentColor"></span>
                                <strong class="truncate">{{ ctx.title }}</strong>
                                <span class="opacity-60 shrink-0">{{ ctx.timeText }}</span>
                            </span>
                        </p-scheduler-month-event>
                        <p-scheduler-month-more-link *pSchedulerMonthMoreLinkDef="let ctx"> {{ ctx.count }} more… </p-scheduler-month-more-link>
                    </p-scheduler-month>
                </p-scheduler-content>
                <p-scheduler-more-popover />
            </p-scheduler-root>
        </div>
        <app-code></app-code>
    `
})
export class DefinitionsDoc {
    events = DEMO_EVENTS;

    categories = DEMO_CATEGORIES;

    date = DEMO_DATE;
}
