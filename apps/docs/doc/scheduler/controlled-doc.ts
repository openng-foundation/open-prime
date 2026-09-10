import { Component, signal } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { SchedulerModule } from '@openng/optimus-ui/scheduler';
import type { SchedulerRangeChangeEvent, SchedulerViewType } from '@openng/optimus-ui/types/scheduler';
import { DEMO_CATEGORIES, DEMO_DATE, DEMO_EVENTS } from './demo-data';

@Component({
    selector: 'controlled-doc',
    standalone: true,
    imports: [AppDocSectionText, SchedulerModule, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                <i>view</i> and <i>date</i> are model inputs, so <i>[(view)]</i> and <i>[(date)]</i> keep your own state and the Scheduler's chrome in sync in both directions: the header moves them, and so can a route, a keyboard shortcut or a deep
                link.
            </p>
            <p>
                <i>datesChange</i> is the event to load data on: it carries the resolved <i>start</i>, <i>end</i> and <i>view</i>, and it fires on init and on every change of the range, whichever the cause — the header, a route writing <i>[date]</i>,
                or a change of <i>firstDayOfWeek</i>. The range is half-open, <i>[start, end)</i>, so a query built from it never double-counts the boundary. <i>viewStateChange</i> is narrower: only the view transitions.
            </p>
        </app-docsectiontext>
        <div class="card">
            <div class="flex flex-wrap items-center gap-2 mb-3">
                <button type="button" class="px-2 py-1 text-sm rounded border" (click)="view.set('week')">Week</button>
                <button type="button" class="px-2 py-1 text-sm rounded border" (click)="view.set('month')">Month</button>
                <button type="button" class="px-2 py-1 text-sm rounded border" (click)="jump(-7)">−1 week</button>
                <button type="button" class="px-2 py-1 text-sm rounded border" (click)="jump(7)">+1 week</button>
                <span class="text-sm opacity-70">{{ view() }} · {{ range() }}</span>
            </div>
            <p-scheduler-root locale="en-US" [(view)]="view" [(date)]="date" [events]="events" [categories]="categories" categoryField="categoryId" [dayStartHour]="7" [dayEndHour]="19" (datesChange)="onRange($event)">
                <p-scheduler-header>
                    <p-scheduler-navigation />
                    <p-scheduler-title />
                </p-scheduler-header>
                <p-scheduler-content>
                    <p-scheduler-week />
                    <p-scheduler-month />
                </p-scheduler-content>
                <p-scheduler-more-popover />
            </p-scheduler-root>
        </div>
        <app-code></app-code>
    `
})
export class ControlledDoc {
    events = DEMO_EVENTS;

    categories = DEMO_CATEGORIES;

    view = signal<SchedulerViewType>('week');

    date = signal(DEMO_DATE);

    range = signal('');

    jump(days: number): void {
        const next = new Date(this.date());

        next.setDate(next.getDate() + days);
        this.date.set(next);
    }

    onRange(event: SchedulerRangeChangeEvent): void {
        this.range.set(`${event.start.toLocaleDateString('en-US')} → ${event.end.toLocaleDateString('en-US')}`);
    }
}
