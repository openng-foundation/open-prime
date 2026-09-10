import { Component, signal } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { SchedulerModule } from '@openng/optimus-ui/scheduler';
import type { SchedulerBlockedInterval } from '@openng/optimus-ui/types/scheduler';
import { DEMO_CATEGORIES, DEMO_DATE, DEMO_EVENTS } from './demo-data';

@Component({
    selector: 'availability-doc',
    standalone: true,
    imports: [AppDocSectionText, SchedulerModule, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                <i>blockedIntervals</i> declares the windows nothing can be scheduled in: a closure, a maintenance slot, a resource that is out. Cells inside one carry <i>data-blocked</i> and are hatched rather than filled, because "you cannot" has
                to read differently from "we usually do not" — which is what <i>businessHours</i> shades.
            </p>
            <p>
                A block without a <i>resourceId</i> applies to every resource; with one it applies to that lane only. A move or resize that would land inside a block is refused BEFORE <i>eventAllow</i> is asked, so a page that has already declared
                the block does not have to repeat it in the callback. Try dragging an event into the hatched band.
            </p>
            <p>
                <i>dateSelection</i> is the other half of availability: <i>single</i>, <i>multiple</i> or <i>range</i> turn clicks on empty cells into a set of days, published through <i>[(selectedDates)]</i> and marked <i>data-selected</i> on the
                cell. <i>range</i> takes two clicks — an anchor and an end — and a third starts over.
            </p>
        </app-docsectiontext>
        <div class="card">
            <p-scheduler-root
                locale="en-US"
                view="week"
                [views]="['week', 'month']"
                [editable]="true"
                [blockedIntervals]="blocked"
                dateSelection="range"
                [(selectedDates)]="selectedDates"
                [events]="events"
                [categories]="categories"
                categoryField="categoryId"
                [date]="date"
                [dayStartHour]="7"
                [dayEndHour]="19"
            >
                <p-scheduler-header>
                    <p-scheduler-navigation />
                    <p-scheduler-title />
                    <p-scheduler-view-selector />
                </p-scheduler-header>
                <p-scheduler-content>
                    <p-scheduler-week />
                    <p-scheduler-month />
                </p-scheduler-content>
                <p-scheduler-more-popover />
            </p-scheduler-root>
            <p class="mt-3 text-sm opacity-70">
                @if (selectedDates().length) {
                    Selected {{ selectedDates().length }} day(s): {{ selectedDates()[0].toLocaleDateString('en-US') }} → {{ selectedDates()[selectedDates().length - 1].toLocaleDateString('en-US') }}
                } @else {
                    Click two empty cells to select a range.
                }
            </p>
        </div>
        <app-code></app-code>
    `
})
export class AvailabilityDoc {
    events = DEMO_EVENTS;

    categories = DEMO_CATEGORIES;

    date = DEMO_DATE;

    selectedDates = signal<Date[]>([]);

    /** A closure over lunch every day of the visible week, for everyone. */
    blocked: SchedulerBlockedInterval[] = Array.from({ length: 7 }, (_, offset) => {
        const start = new Date(DEMO_DATE);

        start.setDate(start.getDate() - 3 + offset);
        start.setHours(13, 0, 0, 0);

        return { start, end: new Date(start.getTime() + 60 * 60_000), reason: 'Lunch' };
    });
}
