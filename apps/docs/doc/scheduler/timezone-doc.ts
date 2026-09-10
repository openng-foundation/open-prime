import { Component, signal } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { SchedulerModule } from '@openng/optimus-ui/scheduler';
import { DEMO_CATEGORIES, DEMO_DATE, DEMO_EVENTS } from './demo-data';

@Component({
    selector: 'timezone-doc',
    standalone: true,
    imports: [AppDocSectionText, SchedulerModule, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                <i>timeZone</i> takes an IANA name and displays the whole schedule in it: the gutter, the column headers, the event times and the geometry all move together. The corner of the gutter prints the offset of the zone being rendered,
                because a time grid without it is ambiguous the moment the data comes from somewhere else — which is exactly the situation this input creates.
            </p>
            <p>
                Your events keep their real instants. The Scheduler shifts them for rendering only, and every output — <i>dateClick</i>, <i>eventDrop</i>, the resize payloads — converts back before it reaches you, so a drag in Tokyo saves the instant
                the user meant and not the wall clock they saw.
            </p>
            <p>
                Offsets are asked of <i>Intl</i> per instant rather than taken once, which is the part a fixed-offset implementation gets wrong twice a year: an event on either side of a daylight-saving change in the target zone lands on the hour it
                actually happens.
            </p>
        </app-docsectiontext>
        <div class="card">
            <div class="flex flex-wrap gap-2 mb-3">
                @for (zone of zones; track zone) {
                    <button type="button" class="px-2 py-1 text-sm rounded border" [class.font-semibold]="zone === timeZone()" (click)="timeZone.set(zone)">{{ zone || 'browser' }}</button>
                }
            </div>
            <p-scheduler-root locale="en-US" view="day" [timeZone]="timeZone()" [events]="events" [categories]="categories" categoryField="categoryId" [date]="date" [dayStartHour]="0" [dayEndHour]="24" [slotMinutes]="60">
                <p-scheduler-header>
                    <p-scheduler-navigation />
                    <p-scheduler-title />
                    <p-scheduler-view-selector />
                </p-scheduler-header>
                <p-scheduler-content>
                    <p-scheduler-day />
                    <p-scheduler-agenda />
                </p-scheduler-content>
            </p-scheduler-root>
        </div>
        <app-code></app-code>
    `
})
export class TimezoneDoc {
    events = DEMO_EVENTS;

    categories = DEMO_CATEGORIES;

    date = DEMO_DATE;

    zones = ['', 'Europe/Madrid', 'America/New_York', 'Asia/Tokyo', 'Pacific/Auckland'];

    timeZone = signal('');
}
