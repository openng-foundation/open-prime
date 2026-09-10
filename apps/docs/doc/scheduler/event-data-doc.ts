import { Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { SchedulerModule } from '@openng/optimus-ui/scheduler';
import type { SchedulerEvent } from '@openng/optimus-ui/types/scheduler';
import { DEMO_CATEGORIES, DEMO_DATE, DEMO_RESOURCES } from './demo-data';

@Component({
    selector: 'event-data-doc',
    standalone: true,
    imports: [AppDocSectionText, SchedulerModule, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                An event needs an <i>id</i> and a <i>start</i>; everything else is optional. Without an <i>end</i> it lasts <i>defaultEventDuration</i> minutes, and an end before its start is treated the same way rather than drawn with a negative
                size. <i>start</i> and <i>end</i> accept a <i>Date</i>, an ISO string or a timestamp, so data straight out of an API needs no mapping pass.
            </p>
            <p>
                The title comes from <i>title</i>, or from whichever field <i>titleField</i> names — below the events carry <i>subject</i>, as plenty of calendar APIs do. <i>categoryField</i> does the same for the category, so <i>categoryId</i>,
                <i>type</i> or <i>calendarId</i> all work without touching the data.
            </p>
            <p>
                <i>resourceId</i> assigns the event to a lane or column; <i>resourceIds</i> puts the same event in several at once, as one appointment rather than copies. <i>allDay</i> moves it to the band above the grid, <i>editable</i> freezes a
                single event in an otherwise editable schedule, and <i>color</i> overrides the colour its category would give it. Any other field you add survives untouched: the event object you passed in is the one every output hands back, so
                <i>meta</i>, <i>attendees</i> or a database row id are yours to read in a definition through <i>ctx.event</i>.
            </p>
            <p><i>minEventMinutes</i> is the smallest height an event may be drawn at, so a five-minute appointment in a twelve-hour column stays legible instead of collapsing into a line.</p>
        </app-docsectiontext>
        <div class="card">
            <p-scheduler-root
                locale="en-US"
                view="week"
                [events]="events"
                [resources]="resources"
                [categories]="categories"
                titleField="subject"
                categoryField="type"
                [date]="date"
                [dayStartHour]="8"
                [dayEndHour]="18"
                [defaultEventDuration]="45"
                [minEventMinutes]="30"
            >
                <p-scheduler-header>
                    <p-scheduler-navigation />
                    <p-scheduler-title />
                </p-scheduler-header>
                <p-scheduler-content>
                    <p-scheduler-week>
                        <p-scheduler-time-grid-event *pSchedulerTimeGridEventDef="let ctx">
                            <span class="flex flex-col min-w-0 leading-tight">
                                <strong class="truncate">{{ ctx.title }}</strong>
                                <span class="opacity-70 truncate">{{ ctx.timeText }}</span>
                                @if (ctx.event.room) {
                                    <span class="text-[0.65rem] opacity-60 truncate">{{ ctx.event.room }}</span>
                                }
                            </span>
                        </p-scheduler-time-grid-event>
                    </p-scheduler-week>
                </p-scheduler-content>
            </p-scheduler-root>
        </div>
        <app-code></app-code>
    `
})
export class EventDataDoc {
    resources = DEMO_RESOURCES;

    categories = DEMO_CATEGORIES;

    date = DEMO_DATE;

    /** The same shape an API tends to hand over: its own field names, ISO instants, extra fields. */
    events: SchedulerEvent[] = [
        { id: 1, subject: 'Site survey', start: this.iso(9), end: this.iso(10, 30), type: 'planning', resourceId: 'north-crew', room: 'Bay 2' },
        { id: 2, subject: 'Permit review', start: this.iso(11), type: 'admin', resourceId: 'service-bay-4', room: 'Office' },
        { id: 3, subject: 'Splice check', start: this.iso(12, 15), end: this.iso(12, 20), type: 'ops', resourceIds: ['lift-dock-2', 'harbor-crew'], room: 'Dock' },
        { id: 4, subject: 'Frozen slot', start: this.iso(15), end: this.iso(16), type: 'blocked', editable: false, room: 'Bay 2' }
    ];

    /** An ISO string, to show that the Scheduler parses one. */
    private iso(hour: number, minute = 0): string {
        const date = new Date(DEMO_DATE);

        date.setHours(hour, minute, 0, 0);

        return date.toISOString();
    }
}
