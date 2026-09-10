import { Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { SchedulerModule } from '@openng/optimus-ui/scheduler';
import type { SchedulerAppointmentSlot, SchedulerAppointmentSlotDisplay } from '@openng/optimus-ui/types/scheduler';
import { DEMO_CATEGORIES, DEMO_DATE, DEMO_EVENTS } from './demo-data';

@Component({
    selector: 'slots-doc',
    standalone: true,
    imports: [AppDocSectionText, SchedulerModule, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                Availability is not the absence of events: a clinic with nothing booked at 3am is not open at 3am. <i>appointmentSlots</i> says where booking is possible, and the slots are drawn BEHIND the events rather than as events, because a free
                window is a property of the calendar and not an appointment.
            </p>
            <p>
                <i>appointmentSlotDisplay</i> picks how: <i>overlay</i> is a labelled band, <i>grid</i> tints the covered cells without chrome, and <i>indicator</i> is a bar on the edge of the column for a calendar too dense to tint. A slot with
                <i>capacity</i> shows what is left of it, and one whose <i>booked</i> has reached its capacity is hatched like a block.
            </p>
            <p>Clicking a slot fires <i>dateClick</i> with the slot's own range, which is the hook a booking flow hangs off — the Scheduler proposes, your form disposes.</p>
        </app-docsectiontext>
        <div class="card">
            <div class="flex flex-wrap gap-2 mb-3">
                @for (mode of modes; track mode) {
                    <button type="button" class="px-2 py-1 text-sm rounded border" [class.font-semibold]="mode === display" (click)="display = mode">{{ mode }}</button>
                }
            </div>
            <p-scheduler-root locale="en-US" view="week" [events]="events" [categories]="categories" categoryField="categoryId" [date]="date" [dayStartHour]="8" [dayEndHour]="18" [appointmentSlots]="slots" [appointmentSlotDisplay]="display">
                <p-scheduler-header>
                    <p-scheduler-navigation />
                    <p-scheduler-title />
                    <p-scheduler-view-selector />
                </p-scheduler-header>
                <p-scheduler-content>
                    <p-scheduler-week />
                </p-scheduler-content>
            </p-scheduler-root>
        </div>
        <app-code></app-code>
    `
})
export class SlotsDoc {
    events = DEMO_EVENTS;

    categories = DEMO_CATEGORIES;

    date = DEMO_DATE;

    modes: SchedulerAppointmentSlotDisplay[] = ['overlay', 'grid', 'indicator'];

    display: SchedulerAppointmentSlotDisplay = 'overlay';

    /** Two consulting windows a day for the visible week, the afternoon one already full. */
    slots: SchedulerAppointmentSlot[] = Array.from({ length: 7 }, (_, offset) => offset - 3).flatMap((offset) => {
        const morning = new Date(DEMO_DATE);

        morning.setDate(morning.getDate() + offset);
        morning.setHours(9, 0, 0, 0);

        const afternoon = new Date(morning);

        afternoon.setHours(15, 0, 0, 0);

        return [
            { start: morning, end: new Date(morning.getTime() + 3 * 3_600_000), capacity: 6, booked: 2 },
            { start: afternoon, end: new Date(afternoon.getTime() + 2 * 3_600_000), capacity: 4, booked: 4 }
        ];
    });
}
