import { Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { SchedulerModule } from '@openng/optimus-ui/scheduler';
import type { SchedulerEvent, SchedulerViewType } from '@openng/optimus-ui/types/scheduler';
import { DEMO_CATEGORIES, DEMO_DATE, DEMO_RESOURCES } from './demo-data';

@Component({
    selector: 'spanning-doc',
    standalone: true,
    imports: [AppDocSectionText, SchedulerModule, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                An event with <i>allDay</i> is drawn in the band above the time grid rather than in a column, and so is one that covers 24 hours or more even without the flag: a full-day bar inside an hour grid buries everything else that day. The
                band stays visible when there is nothing in it, so the grid does not shift as you navigate between days.
            </p>
            <p>
                A multi-day event is ONE event, not one per day. In the all-day band and in the month grid it is a single bar spanning its days, with <i>continuesBefore</i> and <i>continuesAfter</i> in the context when it starts before or ends after
                the visible range — which is what lets a card draw an arrow instead of pretending the appointment begins on Monday. In the agenda it is listed under every day it touches, because a list has no other way to say so.
            </p>
            <p>
                Across resources it works the same way: <i>resourceIds</i> puts one appointment in several lanes or columns at once, still one event with one id, so moving it moves it everywhere and deleting it deletes it once. In the timeline the
                same event spans both its time and its lanes.
            </p>
        </app-docsectiontext>
        <div class="card">
            <p-scheduler-root locale="en-US" view="month" [views]="views" [events]="events" [resources]="resources" [categories]="categories" categoryField="categoryId" [date]="date" [dayStartHour]="7" [dayEndHour]="19">
                <p-scheduler-header>
                    <p-scheduler-navigation />
                    <p-scheduler-title />
                    <p-scheduler-view-selector />
                </p-scheduler-header>
                <p-scheduler-content>
                    <p-scheduler-event *pSchedulerEventDef="let ctx">
                        <span class="flex items-center gap-1 min-w-0">
                            @if (ctx.continuesBefore) {
                                <span aria-hidden="true">‹</span>
                            }
                            <span class="truncate">{{ ctx.title }}</span>
                            @if (ctx.continuesAfter) {
                                <span aria-hidden="true">›</span>
                            }
                        </span>
                    </p-scheduler-event>
                    <p-scheduler-month />
                    <p-scheduler-week />
                    <p-scheduler-agenda />
                    <p-scheduler-resource-timeline />
                </p-scheduler-content>
            </p-scheduler-root>
        </div>
        <app-code></app-code>
    `
})
export class SpanningDoc {
    resources = DEMO_RESOURCES;

    categories = DEMO_CATEGORIES;

    date = DEMO_DATE;

    views: SchedulerViewType[] = ['month', 'week', 'agenda', 'resourceTimelineDay'];

    events: SchedulerEvent[] = [
        { id: 'festival', title: 'Festival week', start: this.day(-1), end: this.day(4), allDay: true, categoryId: 'blocked' },
        { id: 'permit', title: 'Permit window', start: this.day(1), end: this.day(3), allDay: true, categoryId: 'admin' },
        { id: 'overnight', title: 'Overnight cutover', start: this.at(0, 22), end: this.at(1, 6), categoryId: 'ops' },
        { id: 'shared', title: 'Joint inspection', start: this.at(0, 10), end: this.at(0, 12), resourceIds: ['north-crew', 'harbor-crew'], categoryId: 'planning' },
        { id: 'single', title: 'Load-in', start: this.at(0, 8, 30), end: this.at(0, 9, 30), resourceId: 'north-crew', categoryId: 'planning' }
    ];

    private at(dayOffset: number, hour: number, minute = 0): Date {
        const date = new Date(DEMO_DATE);

        date.setDate(date.getDate() + dayOffset);
        date.setHours(hour, minute, 0, 0);

        return date;
    }

    private day(dayOffset: number): Date {
        return this.at(dayOffset, 0);
    }
}
