import { Component, signal } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { SchedulerModule } from '@openng/optimus-ui/scheduler';
import type { SchedulerTimeFormatOptions } from '@openng/optimus-ui/types/scheduler';
import { DEMO_CATEGORIES, DEMO_DATE, DEMO_EVENTS } from './demo-data';

@Component({
    selector: 'time-format-doc',
    standalone: true,
    imports: [AppDocSectionText, SchedulerModule, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                Left alone, the locale decides how the hour is written, and that is the right answer nearly always: <i>en-US</i> gets 9:00 AM and <i>es-ES</i> gets 9:00 without anyone configuring anything. <i>timeFormat</i> is for the cases where the
                product has to override the culture — an airline running a 24-hour clock in an American office — or where the surface is too small for the full form.
            </p>
            <p>
                <i>format</i> is <i>12h</i>, <i>24h</i> or <i>auto</i>. <i>showMinutes</i> set to <i>non-zero</i> prints <i>9 AM</i> instead of <i>9:00 AM</i> and leaves <i>9:30 AM</i> alone, which is how a gutter stays legible at a small size.
                <i>showAMPM</i> drops the meridiem without changing the clock — two in the afternoon stays <i>2</i>, it does not become <i>14</i>.
            </p>
            <p>
                <i>rangeDisplay</i> is about the <i>start - end</i> an event prints. <i>compact</i> drops the meridiem when both ends share it, so a month cell says <i>9 - 10 AM</i>, and keeps both when they differ, because <i>11 AM - 1 PM</i> means
                something else without them. <i>locale</i> hands the whole range to <i>Intl</i> so a culture that writes it its own way gets its own way.
            </p>
            <p><i>dateDisplay</i> is the same idea for the range title in the header: pass <i>Intl.DateTimeFormat</i> options and the title uses them instead of the wording each view picks for itself.</p>
            <p>One object covers the gutter, the event labels, the timeline axis, the agenda and the overlays: a schedule where the grid and the cards disagree about the clock is worse than either choice.</p>
        </app-docsectiontext>
        <div class="card">
            <div class="flex flex-wrap gap-2 mb-3">
                @for (option of options; track option.label) {
                    <button type="button" class="px-2 py-1 text-sm rounded border border-surface" [class.bg-highlight]="option.label === selected().label" (click)="selected.set(option)">{{ option.label }}</button>
                }
            </div>
            <p-scheduler-root locale="en-US" view="week" [events]="events" [categories]="categories" categoryField="categoryId" [date]="date" [dayStartHour]="8" [dayEndHour]="18" [timeFormat]="selected().value" [dateDisplay]="dateDisplay">
                <p-scheduler-header>
                    <p-scheduler-navigation />
                    <p-scheduler-title />
                    <p-scheduler-view-selector />
                </p-scheduler-header>
                <p-scheduler-content>
                    <p-scheduler-week />
                    <p-scheduler-month />
                    <p-scheduler-agenda />
                </p-scheduler-content>
            </p-scheduler-root>
        </div>
        <app-code></app-code>
    `
})
export class TimeFormatDoc {
    events = DEMO_EVENTS;

    categories = DEMO_CATEGORIES;

    date = DEMO_DATE;

    options: { label: string; value: SchedulerTimeFormatOptions | undefined }[] = [
        { label: 'Locale', value: undefined },
        { label: '24 hour', value: { format: '24h' } },
        { label: '12 hour', value: { format: '12h' } },
        { label: 'Whole hours', value: { format: '12h', showMinutes: 'non-zero' } },
        { label: 'No meridiem', value: { format: '12h', showAMPM: false } },
        { label: 'Compact range', value: { format: '12h', showMinutes: 'non-zero', rangeDisplay: 'compact' } }
    ];

    selected = signal(this.options[0]);

    dateDisplay: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
}
