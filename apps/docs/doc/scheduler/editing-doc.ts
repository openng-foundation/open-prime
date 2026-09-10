import { Component, signal } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { SchedulerModule } from '@openng/optimus-ui/scheduler';
import type { SchedulerEvent, SchedulerEventClickEvent, SchedulerSlotClickEvent } from '@openng/optimus-ui/types/scheduler';
import { DEMO_CATEGORIES, DEMO_DATE, DEMO_EVENTS } from './demo-data';

@Component({
    selector: 'editing-doc',
    standalone: true,
    imports: [AppDocSectionText, SchedulerModule, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                The Scheduler never writes to your array. Adding, editing and deleting are requests: it tells you what the user asked for and your code decides what happens, which is what lets the same component sit in front of a store, an API or a
                form you have already built.
            </p>
            <p>
                <i>(dateClick)</i> is a click on an empty slot and carries the interval that was clicked, which is everything a "new appointment" form needs. <i>(eventClick)</i> is a click on an existing one — with the event and the browser event
                that triggered it, a keyboard activation included, so an Enter on a focused card opens the same form as the click.
            </p>
            <p>
                <i>(eventChange)</i> and <i>(eventRemove)</i> come from the overlays: they are what the quick info's edit and delete actions ask for, and again they are requests. <i>(bulkDelete)</i> is the same for a whole selection, from the
                selection toolbar. <i>(eventDragStart)</i> and <i>(eventResizeStart)</i> fire the moment an interaction begins, which is where a page dims what cannot take the event or opens a drop hint.
            </p>
            <p>Every payload hands back the event object you passed in, so persisting one is a matter of writing it where it came from.</p>
        </app-docsectiontext>
        <div class="card">
            <p-scheduler-root
                locale="en-US"
                view="week"
                [events]="events()"
                [categories]="categories"
                categoryField="categoryId"
                [date]="date"
                [dayStartHour]="7"
                [dayEndHour]="19"
                [editable]="true"
                [quickInfo]="true"
                [selectionMode]="'multiple'"
                (dateClick)="create($event)"
                (eventClick)="edit($event)"
                (eventChange)="save($event.event)"
                (eventRemove)="remove($event.event)"
                (bulkDelete)="removeMany($event.events)"
                (eventDragStart)="log('drag start')"
                (eventResizeStart)="log('resize start')"
            >
                <p-scheduler-header>
                    <p-scheduler-navigation />
                    <p-scheduler-title />
                    <p-scheduler-selection-toolbar />
                </p-scheduler-header>
                <p-scheduler-content>
                    <p-scheduler-week />
                </p-scheduler-content>
                <p-scheduler-quick-info />
            </p-scheduler-root>
            <p class="mt-3 text-sm opacity-70">{{ status() }}</p>
        </div>
        <app-code></app-code>
    `
})
export class EditingDoc {
    categories = DEMO_CATEGORIES;

    date = DEMO_DATE;

    events = signal<SchedulerEvent[]>([...DEMO_EVENTS]);

    status = signal('Click an empty slot to add, an event to edit, or use the quick info to delete.');

    /** A click on an empty slot: here it books the slot straight away, where a page would open a form. */
    create(event: SchedulerSlotClickEvent): void {
        const created: SchedulerEvent = { id: `new-${Date.now()}`, title: 'New appointment', start: event.start, end: event.end, categoryId: 'planning' };

        this.events.update((events) => [...events, created]);
        this.status.set(`Added ${created.title}`);
    }

    edit(event: SchedulerEventClickEvent): void {
        this.status.set(`Edit requested for ${event.event['title']}`);
    }

    /** The Scheduler asked; the application writes. Until this runs, the bound array is untouched. */
    save(event: SchedulerEvent): void {
        this.events.update((events) => events.map((candidate) => (candidate.id === event.id ? event : candidate)));
        this.status.set(`Saved ${event['title']}`);
    }

    remove(event: SchedulerEvent): void {
        this.events.update((events) => events.filter((candidate) => candidate.id !== event.id));
        this.status.set(`Deleted ${event['title']}`);
    }

    removeMany(events: SchedulerEvent[]): void {
        const ids = new Set(events.map((event) => event.id));

        this.events.update((current) => current.filter((candidate) => !ids.has(candidate.id)));
        this.status.set(`Deleted ${events.length} appointments`);
    }

    log(what: string): void {
        this.status.set(what);
    }
}
