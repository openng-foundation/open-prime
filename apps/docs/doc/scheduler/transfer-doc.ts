import { Component, signal, viewChild } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { Scheduler, SchedulerModule, parseICalendar, serializeSchedule, toICalendar } from '@openng/optimus-ui/scheduler';
import type { SchedulerEvent } from '@openng/optimus-ui/types/scheduler';
import { DEMO_CATEGORIES, DEMO_DATE, DEMO_RECURRING_EVENTS } from './demo-data';

@Component({
    selector: 'transfer-doc',
    standalone: true,
    imports: [AppDocSectionText, SchedulerModule, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                <i>toICalendar</i> and <i>parseICalendar</i> move events between the Scheduler and everything else that speaks calendars. They cover the VEVENT subset that actually gets exchanged — <i>SUMMARY</i>, <i>DTSTART</i>/<i>DTEND</i>,
                <i>DESCRIPTION</i>, <i>LOCATION</i>, <i>RRULE</i>, <i>EXDATE</i>, <i>RDATE</i>, <i>UID</i> — and not a complete RFC 5545 implementation: no VTIMEZONE, no VALARM, no VFREEBUSY. What they promise is a round trip of what this component
                can display.
            </p>
            <p>
                A series is exported as ONE VEVENT with its rule, not as its expanded copies, which is the same contract the recurrence page describes. All-day events are written with <i>VALUE=DATE</i> and an exclusive <i>DTEND</i>, because that is
                what the format means by a whole day. Resources travel as <i>X-OPTIMUS-RESOURCE</i> and categories as <i>CATEGORIES</i>, since there is no standard field for either and dropping them would turn a team plan into a list of appointments.
            </p>
            <p><i>serializeSchedule</i> and <i>parseSchedule</i> are the JSON pair for your own storage: instants become ISO strings, because a <i>Date</i> does not survive <i>JSON.stringify</i> in a form anything can read back reliably.</p>
            <p>
                Printing goes through the Scheduler's own <i>print()</i> and not through <i>window.print()</i>, because the browser prints the DOCUMENT: the navigation, the sidebar and whatever else is on screen, with the schedule somewhere in the
                middle. <i>print()</i> marks the document as printing a schedule, which blanks everything else for the duration and puts this component at the top of the sheet, and undoes it afterwards — including when the dialog is cancelled.
            </p>
            <p>
                The stylesheet does the rest: it unrolls the scroll containers so the whole range prints rather than the visible window, drops the sticky headers and the controls, keeps a week row or an agenda day from splitting across pages, and
                forces the category colours, because without them a browser prints every event white and they all become the same event.
            </p>
            <p>
                <i>print()</i> takes what a handoff tends to need: <i>color</i> to print in grey on purpose, <i>layout.orientation</i>, and <i>layout.scale</i> — <i>fit</i> shrinks the schedule until it lands on one sheet, which is the only way a
                week of resource columns gets onto a page. <i>pageChrome</i> fills in <i>p-scheduler-print-header</i>, which is invisible on screen and is what stops a printed sheet from being a grid with nothing saying what it is.
            </p>
            <p>
                Orientation is the one to be careful with. It is asked for with an <i>&#64;page</i> rule, which Chrome and Firefox honour and WebKit does not: in Safari the orientation comes from the print dialog and no stylesheet can reach it. So
                <i>fit</i> deliberately shrinks against the SHORT side of the sheet rather than against the orientation you asked for — landscape then leaves paper spare, which is the harmless failure, where assuming landscape would overflow onto a
                second page in exactly the browser that ignored the request.
            </p>
        </app-docsectiontext>
        <div class="card">
            <div class="flex flex-wrap gap-2 mb-3">
                <button type="button" class="px-2 py-1 text-sm rounded border" (click)="exportIcs()">Export .ics</button>
                <button type="button" class="px-2 py-1 text-sm rounded border" (click)="roundTrip()">Round-trip it back</button>
                <button type="button" class="px-2 py-1 text-sm rounded border" (click)="exportJson()">Export JSON</button>
                <button type="button" class="px-2 py-1 text-sm rounded border" (click)="print()">Print</button>
                <button type="button" class="px-2 py-1 text-sm rounded border" (click)="printFitted()">Print on one page, no colour</button>
            </div>
            <p-scheduler-root #scheduler locale="en-US" view="week" [events]="events()" [categories]="categories" categoryField="categoryId" [date]="date" [dayStartHour]="8" [dayEndHour]="19">
                <p-scheduler-print-header />
                <p-scheduler-header>
                    <p-scheduler-navigation />
                    <p-scheduler-title />
                    <p-scheduler-view-selector />
                </p-scheduler-header>
                <p-scheduler-content>
                    <p-scheduler-week />
                    <p-scheduler-agenda />
                </p-scheduler-content>
            </p-scheduler-root>
            @if (output()) {
                <pre class="mt-3 text-xs overflow-auto max-h-48 p-2 rounded border">{{ output() }}</pre>
            }
        </div>
        <app-code></app-code>
    `
})
export class TransferDoc {
    events = signal<SchedulerEvent[]>(DEMO_RECURRING_EVENTS);

    categories = DEMO_CATEGORIES;

    date = DEMO_DATE;

    /** The root itself, because print() is a method on the component and not an input. */
    scheduler = viewChild.required(Scheduler);

    output = signal('');

    exportIcs(): void {
        this.output.set(toICalendar(this.events(), { name: 'Optimus demo', prodId: '-//optimus-ui docs//scheduler//EN' }));
    }

    /** Exports and imports back, which is the only honest way to show a round trip works. */
    roundTrip(): void {
        const { events, name } = parseICalendar(toICalendar(this.events(), { name: 'Optimus demo' }));

        this.events.set(events);
        this.output.set(`Parsed ${events.length} events back from "${name}". The grid above is now rendering them.`);
    }

    exportJson(): void {
        this.output.set(JSON.stringify(serializeSchedule(this.events(), { categories: this.categories }), null, 2));
    }

    /** The component's own print, so the sheet carries the schedule and not the documentation site. */
    print(): void {
        this.scheduler().print({ pageChrome: { generatedAt: true, timezone: true, filters: ['Every category'] } });
    }

    printFitted(): void {
        this.scheduler().print({ color: false, layout: { orientation: 'landscape', scale: 'fit' }, pageChrome: { generatedAt: true } });
    }
}
