import { Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { SchedulerModule } from '@openng/optimus-ui/scheduler';
import { DEMO_CATEGORIES, DEMO_DATE, DEMO_EVENTS } from './demo-data';

@Component({
    selector: 'day-doc',
    standalone: true,
    imports: [AppDocSectionText, SchedulerModule, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                The day view is the time grid with a single column. <i>dayStartHour</i> and <i>dayEndHour</i> bound the hours it draws and <i>slotMinutes</i> the height of a row, so a grid that only ever shows office hours does not make you scroll
                past the night.
            </p>
            <p>
                Overlapping appointments split the width of the column into as many parts as the busiest moment of their cluster needs, which is why two overlapping events are half-width even when a third only overlaps one of them.
                <i>dayCount</i> turns the view into a rolling N-day grid without leaving the day scale.
            </p>
            <p>
                <i>nowIndicator</i> draws the line marking the current time, in this view and in the timeline; it is on by default and worth turning off for a schedule nobody is reading live. <i>alwaysShowAllDay</i> keeps the band above the grid
                visible when it is empty, so the grid does not shift as you navigate between days.
            </p>
        </app-docsectiontext>
        <div class="card">
            <p-scheduler-root locale="en-US" view="day" [events]="events" [categories]="categories" categoryField="categoryId" [date]="date" [dayStartHour]="7" [dayEndHour]="19" [slotMinutes]="30" [nowIndicator]="true" [alwaysShowAllDay]="true">
                <p-scheduler-header>
                    <p-scheduler-navigation />
                    <p-scheduler-title />
                    <p-scheduler-view-selector />
                </p-scheduler-header>
                <p-scheduler-content>
                    <p-scheduler-day />
                </p-scheduler-content>
            </p-scheduler-root>
        </div>
        <app-code></app-code>
    `
})
export class DayDoc {
    events = DEMO_EVENTS;

    categories = DEMO_CATEGORIES;

    date = DEMO_DATE;
}
