import { Component, signal } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { SchedulerModule } from '@openng/optimus-ui/scheduler';
import type { SchedulerDragPayload, SchedulerDropInfo, SchedulerEvent, SchedulerViewType } from '@openng/optimus-ui/types/scheduler';
import { DEMO_CATEGORIES, DEMO_DATE, DEMO_EVENTS } from './demo-data';

@Component({
    selector: 'interaction-doc',
    standalone: true,
    imports: [AppDocSectionText, SchedulerModule, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                <i>editable</i> turns on the pointer interactions; <i>eventStartEditable</i> and <i>eventDurationEditable</i> split them into moving and resizing, and an event's own <i>editable</i> overrides the root, so a schedule can be editable
                with a handful of frozen appointments in it. <i>snapDuration</i> rounds every proposal, and <i>dragMinDistance</i> is how far the pointer has to travel before a press stops being a click.
            </p>
            <p>
                A drag is resolved from the cell under the pointer, which is why it works the same in the week grid, the month and the timeline. Drop the event on another slot to move it, or pull its top or bottom edge to resize; the month grid has
                no time axis, so there it only moves, by whole days, keeping the time of day.
            </p>
            <p>
                <i>eventAllow</i> vetoes a target before the Scheduler offers it — used below to refuse anything that would start before 8am. Nothing is written to your array: the Scheduler HOLDS the accepted change so the event stays where you
                dropped it, hands you <i>(eventDrop)</i> or <i>(eventResizeStop)</i>, and stops holding it the moment you persist it. Reject it instead by calling <i>revert()</i> on the payload.
            </p>
        </app-docsectiontext>
        <div class="card">
            <p-scheduler-root
                locale="en-US"
                view="week"
                [views]="views"
                [editable]="true"
                [snapDuration]="15"
                [eventAllow]="allow"
                [events]="events()"
                [categories]="categories"
                categoryField="categoryId"
                [date]="date"
                [dayStartHour]="7"
                [dayEndHour]="19"
                (eventDrop)="onDrop($event)"
                (eventResizeStop)="onResize($event)"
            >
                <p-scheduler-header>
                    <p-scheduler-navigation />
                    <p-scheduler-title />
                    <p-scheduler-view-selector />
                </p-scheduler-header>
                <p-scheduler-content>
                    <p-scheduler-week />
                    <p-scheduler-day />
                    <p-scheduler-month />
                    <p-scheduler-timeline />
                </p-scheduler-content>
                <p-scheduler-more-popover />
            </p-scheduler-root>
            <p class="mt-3 text-sm opacity-70">{{ log() || 'Drag an event, or pull its edge.' }}</p>
        </div>
        <app-code></app-code>
    `
})
export class InteractionDoc {
    events = signal<SchedulerEvent[]>(DEMO_EVENTS);

    /** Narrower than what the demo declares: seven view buttons leave no room for the title. */
    views: SchedulerViewType[] = ['week', 'day', 'month', 'timelineDay'];

    categories = DEMO_CATEGORIES;

    date = DEMO_DATE;

    log = signal('');

    /** Refuses anything that would start before 8am. Called on every pointer move, so it stays cheap. */
    allow = (info: SchedulerDropInfo): boolean => info.start.getHours() >= 8;

    /** Persisting is what makes the Scheduler stop holding the change. */
    onDrop(payload: SchedulerDragPayload): void {
        this.persist(payload);
        this.log.set(`Moved ${payload.event.title} to ${payload.start.toLocaleString('en-US')}`);
    }

    onResize(payload: SchedulerDragPayload): void {
        this.persist(payload);
        this.log.set(`${payload.event.title} now runs until ${payload.end.toLocaleTimeString('en-US')}`);
    }

    private persist(payload: SchedulerDragPayload): void {
        this.events.update((events) => events.map((event) => (event.id === payload.event.id ? { ...event, start: payload.start, end: payload.end, resourceId: payload.resourceId } : event)));
    }
}
