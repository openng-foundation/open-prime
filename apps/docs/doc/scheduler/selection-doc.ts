import { Component, signal } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { SchedulerModule } from '@openng/optimus-ui/scheduler';
import type { SchedulerEvent } from '@openng/optimus-ui/types/scheduler';
import { DEMO_CATEGORIES, DEMO_DATE, DEMO_EVENTS } from './demo-data';

@Component({
    selector: 'selection-doc',
    standalone: true,
    imports: [AppDocSectionText, SchedulerModule, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                <i>selectionMode</i> is <i>single</i> by default. In <i>multiple</i>, a click with ctrl, cmd or shift adds to the selection instead of replacing it, and <i>maxSelection</i> caps it: the cap is checked BEFORE the event is added and
                reported through <i>eventSelectionLimitReached</i>, so a rejected click says why rather than doing nothing. <i>none</i> selects nothing at all, which is what a read-only display wants.
            </p>
            <p>
                <i>p-scheduler-selection-toolbar</i> appears only while something is selected and provides the selected events, a clear action and a bulk-delete request to whatever you project into it. Every selected surface carries
                <i>data-selected</i>.
            </p>
        </app-docsectiontext>
        <div class="card">
            <p-scheduler-root
                locale="en-US"
                view="week"
                selectionMode="multiple"
                [maxSelection]="3"
                [events]="events"
                [categories]="categories"
                categoryField="categoryId"
                [date]="date"
                [dayStartHour]="7"
                [dayEndHour]="19"
                (eventSelectionChange)="onSelectionChange($event.events)"
                (eventSelectionLimitReached)="limit.set($event.maxSelection)"
            >
                <p-scheduler-header>
                    <p-scheduler-navigation />
                    <p-scheduler-title />
                    <p-scheduler-view-selector />
                </p-scheduler-header>
                <p-scheduler-selection-toolbar />
                <p-scheduler-content>
                    <p-scheduler-week />
                </p-scheduler-content>
            </p-scheduler-root>
            <p class="mt-3 text-sm">
                Selected: {{ selected().length }}
                @if (limit()) {
                    · limit of {{ limit() }} reached
                }
            </p>
        </div>
        <app-code></app-code>
    `
})
export class SelectionDoc {
    events = DEMO_EVENTS;

    categories = DEMO_CATEGORIES;

    date = DEMO_DATE;

    selected = signal<SchedulerEvent[]>([]);

    limit = signal<number | null>(null);

    /** The limit notice clears as soon as the selection changes again, or it stays stuck on screen. */
    onSelectionChange(events: SchedulerEvent[]): void {
        this.selected.set(events);
        this.limit.set(null);
    }
}
