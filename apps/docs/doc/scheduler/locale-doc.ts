import { Component, computed, signal } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { SchedulerModule } from '@openng/optimus-ui/scheduler';
import type { SchedulerViewType } from '@openng/optimus-ui/types/scheduler';
import { DEMO_CATEGORIES, DEMO_DATE, DEMO_EVENTS } from './demo-data';

/** What one locale changes, split into the part the browser knows and the part it cannot. */
interface LocaleOption {
    label: string;
    locale: string;
    firstDayOfWeek: number;
    today: string;
    allDay: string;
    empty: string;
    views: Partial<Record<SchedulerViewType, string>>;
}

@Component({
    selector: 'locale-doc',
    standalone: true,
    imports: [AppDocSectionText, SchedulerModule, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                Every date and time the Scheduler prints goes through <i>toLocaleDateString</i>/<i>toLocaleTimeString</i> with the <i>locale</i> input, so the 12- or 24-hour clock, the weekday names, the month names and the order of day and month all
                come from the locale rather than from a format string you have to maintain. <i>firstDayOfWeek</i> rotates the week-based views and the mini-months; left unset it falls back to the Optimus locale configuration and then to Sunday.
            </p>
            <p>
                The chrome labels are a separate input, because they are NOT derivable from a locale: no browser API knows what your product calls the week view, and "Today", "All day" or "No events" are copy, not data. Pass them through
                <i>labels</i>, which is merged over the defaults — including <i>labels.views</i>, keyed by view name, which is what the view selector prints. Switch the locale below and the view names change with it.
            </p>
            <p>
                <i>calendar</i> and <i>numberingSystem</i> go further than the language. They travel as Unicode extensions of the locale tag, so one setting reaches every label at once — the month title, the weekday initials, the gutter, an event's
                time text — and the arithmetic stays Gregorian: what changes is what the labels say, not which day an event falls on.
            </p>
        </app-docsectiontext>
        <div class="card">
            <div class="flex flex-wrap gap-2 mb-3">
                @for (option of options; track option.locale) {
                    <button type="button" class="px-2 py-1 text-sm rounded border" [class.font-semibold]="option.locale === selected().locale" (click)="selected.set(option)">{{ option.label }}</button>
                }
            </div>
            <div class="flex flex-wrap gap-2 mb-3">
                @for (option of calendars; track option.label) {
                    <button type="button" class="px-2 py-1 text-sm rounded border" [class.font-semibold]="option.label === calendarOption().label" (click)="calendarOption.set(option)">{{ option.label }}</button>
                }
            </div>
            <p-scheduler-root
                [locale]="selected().locale"
                [(view)]="view"
                [labels]="labels()"
                [firstDayOfWeek]="selected().firstDayOfWeek"
                [events]="events"
                [categories]="categories"
                categoryField="categoryId"
                [date]="date"
                [dayStartHour]="7"
                [dayEndHour]="19"
                [calendar]="calendarOption().calendar"
                [numberingSystem]="calendarOption().numberingSystem"
            >
                <p-scheduler-header>
                    <p-scheduler-navigation />
                    <p-scheduler-title />
                    <p-scheduler-view-selector />
                </p-scheduler-header>
                <p-scheduler-content>
                    <p-scheduler-day />
                    <p-scheduler-week />
                    <p-scheduler-month />
                    <p-scheduler-agenda />
                </p-scheduler-content>
                <p-scheduler-more-popover />
            </p-scheduler-root>
        </div>
        <app-code></app-code>
    `
})
export class LocaleDoc {
    events = DEMO_EVENTS;

    categories = DEMO_CATEGORIES;

    date = DEMO_DATE;

    view = signal<SchedulerViewType>('week');

    calendars: { label: string; calendar?: string; numberingSystem?: string }[] = [
        { label: 'Gregorian' },
        { label: 'Buddhist', calendar: 'buddhist' },
        { label: 'Japanese', calendar: 'japanese' },
        { label: 'Islamic', calendar: 'islamic' },
        { label: 'Arabic digits', numberingSystem: 'arab' }
    ];

    calendarOption = signal(this.calendars[0]);

    options: LocaleOption[] = [
        {
            label: 'en-US',
            locale: 'en-US',
            firstDayOfWeek: 0,
            today: 'Today',
            allDay: 'All day',
            empty: 'No events',
            views: { day: 'Day', week: 'Week', month: 'Month', agenda: 'Agenda' }
        },
        {
            label: 'es-ES',
            locale: 'es-ES',
            firstDayOfWeek: 1,
            today: 'Hoy',
            allDay: 'Todo el día',
            empty: 'Sin eventos',
            views: { day: 'Día', week: 'Semana', month: 'Mes', agenda: 'Agenda' }
        },
        {
            label: 'de-DE',
            locale: 'de-DE',
            firstDayOfWeek: 1,
            today: 'Heute',
            allDay: 'Ganztägig',
            empty: 'Keine Termine',
            views: { day: 'Tag', week: 'Woche', month: 'Monat', agenda: 'Agenda' }
        },
        {
            label: 'ja-JP',
            locale: 'ja-JP',
            firstDayOfWeek: 0,
            today: '今日',
            allDay: '終日',
            empty: '予定なし',
            views: { day: '日', week: '週', month: '月', agenda: '予定リスト' }
        }
    ];

    selected = signal<LocaleOption>(this.options[0]);

    /** Only the keys this page overrides: `labels` is merged over the defaults, so a partial object is enough. */
    labels = computed(() => {
        const option = this.selected();

        return { today: option.today, allDay: option.allDay, empty: option.empty, views: option.views };
    });
}
