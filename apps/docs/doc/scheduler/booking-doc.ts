import { Component, signal } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { SchedulerModule } from '@openng/optimus-ui/scheduler';
import type { SchedulerAppointmentSlot, SchedulerSlotBookEvent } from '@openng/optimus-ui/types/scheduler';
import { DEMO_CATEGORIES, DEMO_DATE } from './demo-data';

@Component({
    selector: 'booking-doc',
    standalone: true,
    imports: [AppDocSectionText, SchedulerModule, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                An appointment window is a property of the calendar, not an appointment: it says where booking is possible. Activating one reports through <i>(slotBook)</i>, with the window object you bound — its <i>id</i>, its <i>capacity</i>, its
                <i>meta</i> — so the handler has everything it needs to write the booking without looking anything up.
            </p>
            <p>
                Whether an activation is a booking or a cancellation comes from the window's own <i>status</i>, because the Scheduler cannot work it out: <i>capacity</i> and <i>booked</i> say how many places are left, not whether THIS viewer holds
                one of them. Mark a window <i>booked</i> and activating it reports <i>(slotCancel)</i> instead.
            </p>
            <p>A window with no places left is drawn hatched and does not activate at all, the same way a blocked interval does — as far as booking goes they are the same thing.</p>
        </app-docsectiontext>
        <div class="card">
            <p-scheduler-root
                locale="en-US"
                view="day"
                [events]="[]"
                [categories]="categories"
                [date]="date"
                [dayStartHour]="9"
                [dayEndHour]="14"
                [appointmentSlots]="slots()"
                appointmentSlotDisplay="overlay"
                (slotBook)="book($event)"
                (slotCancel)="cancel($event)"
            >
                <p-scheduler-header>
                    <p-scheduler-navigation />
                    <p-scheduler-title />
                </p-scheduler-header>
                <p-scheduler-content>
                    <p-scheduler-day />
                </p-scheduler-content>
            </p-scheduler-root>
            <p class="mt-3 text-sm opacity-70">{{ status() }}</p>
        </div>
        <app-code></app-code>
    `
})
export class BookingDoc {
    categories = DEMO_CATEGORIES;

    date = DEMO_DATE;

    slots = signal<SchedulerAppointmentSlot[]>([
        { id: 'early', start: this.at(9), end: this.at(10), capacity: 2, booked: 0, meta: { room: 'Bay 2' } },
        { id: 'mid', start: this.at(10, 30), end: this.at(11, 30), capacity: 2, booked: 1, meta: { room: 'Bay 2' } },
        { id: 'mine', start: this.at(11, 30), end: this.at(12, 30), capacity: 1, booked: 1, status: 'booked', meta: { room: 'Office' } },
        { id: 'full', start: this.at(12, 30), end: this.at(13, 30), capacity: 1, booked: 1, meta: { room: 'Dock' } }
    ]);

    status = signal('Activate an open window to book it, or the one you hold to cancel.');

    /** Booking is the application's write: the Scheduler reported, the page decides. */
    book(event: SchedulerSlotBookEvent): void {
        this.slots.update((slots) => slots.map((slot) => (slot.id === event.slot.id ? { ...slot, booked: (slot.booked ?? 0) + 1, status: 'booked' as const } : slot)));
        this.status.set(`Booked ${event.slot.id} in ${String(event.slot.meta?.['room'])}`);
    }

    cancel(event: SchedulerSlotBookEvent): void {
        this.slots.update((slots) => slots.map((slot) => (slot.id === event.slot.id ? { ...slot, booked: Math.max((slot.booked ?? 1) - 1, 0), status: 'available' as const } : slot)));
        this.status.set(`Cancelled ${event.slot.id}`);
    }

    private at(hour: number, minute = 0): Date {
        const date = new Date(DEMO_DATE);

        date.setHours(hour, minute, 0, 0);

        return date;
    }
}
