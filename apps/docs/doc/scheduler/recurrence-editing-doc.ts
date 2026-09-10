import { Component, signal } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { SchedulerModule } from '@openng/optimus-ui/scheduler';
import type { SchedulerEvent, SchedulerRecurrenceEditEvent, SchedulerRecurrenceScope } from '@openng/optimus-ui/types/scheduler';
import { DEMO_CATEGORIES, DEMO_DATE, DEMO_RECURRING_EVENTS } from './demo-data';

@Component({
    selector: 'recurrence-editing-doc',
    standalone: true,
    imports: [AppDocSectionText, SchedulerModule, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                "Save this appointment" is an ambiguous instruction when the appointment is one of fifty. Moving next Tuesday's stand-up might mean moving next Tuesday's stand-up, or moving every stand-up from now on — and only the page can put that
                question to a user, because only the page owns the dialog and the wording.
            </p>
            <p>
                <i>recurrenceEdit</i> turns the reporting on. An edit, a delete, a drop or a resize that lands on an occurrence of a series comes through <i>(recurrenceEdit)</i> or <i>(recurrenceDelete)</i> instead of the plain
                <i>(eventChange)</i>/<i>(eventRemove)</i>, carrying the <i>occurrence</i>, the <i>series</i> it came from — the event that holds the <i>rrule</i>, which is the object you have to write to — and the <i>occurrenceStart</i> an exception
                is keyed under.
            </p>
            <p>
                The payload's <i>apply(scope)</i> is what runs once the user has answered: it fires <i>(eventChange)</i> with the occurrence for <i>occurrence</i>, or with the series for <i>series</i>. Until then nothing is written;
                <i>revert()</i> drops a held drag and puts the appointment back. Pass an object instead of <i>true</i> to set <i>defaultScope</i>, or to leave drags (<i>askOnDrag</i>) or deletes (<i>askOnDelete</i>) out of the flow.
            </p>
        </app-docsectiontext>
        <div class="card">
            <p-scheduler-root
                locale="en-US"
                view="week"
                [events]="events()"
                [categories]="categories"
                categoryField="categoryId"
                [date]="date"
                [dayStartHour]="8"
                [dayEndHour]="18"
                [editable]="true"
                [quickInfo]="true"
                [recurrenceEdit]="true"
                (recurrenceEdit)="ask($event)"
                (recurrenceDelete)="ask($event)"
                (eventChange)="save($event.event)"
            >
                <p-scheduler-header>
                    <p-scheduler-navigation />
                    <p-scheduler-title />
                </p-scheduler-header>
                <p-scheduler-content>
                    <p-scheduler-week />
                </p-scheduler-content>
                <p-scheduler-quick-info />
            </p-scheduler-root>

            @if (pending(); as request) {
                <div class="mt-3 p-3 rounded border border-surface flex flex-wrap items-center gap-2">
                    <span class="text-sm">{{ request.occurrence['title'] }} — this appointment or the whole series?</span>
                    <button type="button" class="px-2 py-1 text-sm rounded border border-surface" (click)="choose(request, 'occurrence')">This one</button>
                    <button type="button" class="px-2 py-1 text-sm rounded border border-surface" (click)="choose(request, 'series')">Whole series</button>
                    <button type="button" class="px-2 py-1 text-sm rounded border border-surface" (click)="dismiss(request)">Cancel</button>
                </div>
            }
            <p class="mt-3 text-sm opacity-70">{{ status() }}</p>
        </div>
        <app-code></app-code>
    `
})
export class RecurrenceEditingDoc {
    categories = DEMO_CATEGORIES;

    date = DEMO_DATE;

    events = signal<SchedulerEvent[]>([...DEMO_RECURRING_EVENTS]);

    pending = signal<SchedulerRecurrenceEditEvent | null>(null);

    status = signal('Drag an occurrence, or use the quick info, to be asked about the scope.');

    /** The Scheduler asks; the page is the one that can put the question to a person. */
    ask(request: SchedulerRecurrenceEditEvent): void {
        this.pending.set(request);
    }

    choose(request: SchedulerRecurrenceEditEvent, scope: SchedulerRecurrenceScope): void {
        request.apply(scope);
        this.pending.set(null);
        this.status.set(`Applied to the ${scope}`);
    }

    dismiss(request: SchedulerRecurrenceEditEvent): void {
        request.revert();
        this.pending.set(null);
        this.status.set('Reverted');
    }

    save(event: SchedulerEvent): void {
        this.events.update((events) => events.map((candidate) => (candidate.id === event.id ? event : candidate)));
    }
}
