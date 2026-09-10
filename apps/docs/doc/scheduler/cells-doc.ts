import { Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { SchedulerModule } from '@openng/optimus-ui/scheduler';
import type { SchedulerViewType } from '@openng/optimus-ui/types/scheduler';
import { DEMO_CATEGORIES, DEMO_DATE, DEMO_EVENTS } from './demo-data';

@Component({
    selector: 'cells-doc',
    standalone: true,
    imports: [AppDocSectionText, SchedulerModule, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                Cells and headers are definitions too, and they are the ones that let a page carry its own information without giving up the layout: the Scheduler keeps the geometry, the focus ring, the <i>data-*</i> attributes and the accessible
                name of the cell, and the template owns what is drawn inside it.
            </p>
            <p>
                The time grid has four. <i>p-scheduler-day-header</i> is a column header, <i>p-scheduler-time-gutter</i> a label on the hour axis, <i>p-scheduler-time-grid-cell</i> an empty slot and <i>p-scheduler-work-cell</i> a slot inside business
                hours — the second wins over the first for those cells, so a working hour can look different without a condition in the template. <i>p-scheduler-all-day-cell</i> does the same for the strip above the grid.
            </p>
            <p>
                The month has <i>p-scheduler-month-header-cell</i> for the weekday row, <i>p-scheduler-month-cell</i> for a whole day cell, and two narrower ones for when you only want part of it: <i>p-scheduler-month-cell-number</i> replaces the day
                number and <i>p-scheduler-month-day-cell</i> the events area under it, leaving the rest of the cell as the Scheduler draws it. The year view has <i>p-scheduler-mini-month-header</i> and <i>p-scheduler-mini-month-cell</i>, and the
                timeline <i>p-scheduler-timeline-header-cell</i> and <i>p-scheduler-timeline-cell</i>.
            </p>
            <p>
                Every cell context carries the same facts, already resolved: <i>date</i>, <i>label</i>, <i>dateKey</i>, the <i>events</i> that fall in it and their <i>count</i>, plus the <i>today</i>, <i>weekend</i>, <i>otherMonth</i>,
                <i>businessHours</i>, <i>blocked</i>, <i>selected</i> and <i>disabled</i> flags, and the <i>resource</i> in the grouped views. A gutter label adds <i>hour</i>, <i>minute</i> and <i>major</i>; the weekday row gets <i>weekdays</i>; a
                mini month gets <i>monthName</i>, <i>monthLabel</i> and its <i>weeks</i>.
            </p>
        </app-docsectiontext>
        <div class="card">
            <p-scheduler-root locale="en-US" view="week" [views]="views" [events]="events" [categories]="categories" categoryField="categoryId" [date]="date" [dayStartHour]="7" [dayEndHour]="19" [businessHours]="businessHours">
                <p-scheduler-header>
                    <p-scheduler-navigation />
                    <p-scheduler-title />
                    <p-scheduler-view-selector />
                </p-scheduler-header>
                <p-scheduler-content>
                    <p-scheduler-week>
                        <p-scheduler-day-header *pSchedulerDayHeaderDef="let ctx">
                            <span class="flex flex-col items-center leading-tight">
                                <span class="text-lg font-semibold" [class.text-primary]="ctx.today">{{ ctx.date.getDate() }}</span>
                                @if (ctx.count) {
                                    <span class="text-xs opacity-60">{{ ctx.count }} booked</span>
                                }
                            </span>
                        </p-scheduler-day-header>
                        <p-scheduler-time-gutter *pSchedulerTimeGutterDef="let ctx">
                            @if (ctx.major) {
                                <span class="text-xs tabular-nums opacity-70">{{ ctx.hour }}h</span>
                            }
                        </p-scheduler-time-gutter>
                        <p-scheduler-time-grid-cell *pSchedulerTimeGridCellDef="let ctx">
                            @if (ctx.blocked) {
                                <span class="text-[0.65rem] opacity-50">closed</span>
                            }
                        </p-scheduler-time-grid-cell>
                        <p-scheduler-work-cell *pSchedulerWorkCellDef="let ctx">
                            @if (ctx.date.getHours() === 13) {
                                <span class="text-[0.65rem] opacity-50">lunch</span>
                            }
                        </p-scheduler-work-cell>
                        <p-scheduler-all-day-cell *pSchedulerAllDayCellDef="let ctx">
                            @if (!ctx.count) {
                                <span class="text-[0.65rem] opacity-40">&mdash;</span>
                            }
                        </p-scheduler-all-day-cell>
                    </p-scheduler-week>
                    <p-scheduler-month>
                        <p-scheduler-month-header-cell *pSchedulerMonthHeaderCellDef="let ctx">
                            <span class="grid grid-cols-7 w-full text-xs uppercase tracking-wide opacity-60">
                                @for (weekday of ctx.weekdays; track weekday) {
                                    <span class="text-center py-1">{{ weekday }}</span>
                                }
                            </span>
                        </p-scheduler-month-header-cell>
                        <p-scheduler-month-cell-number *pSchedulerMonthCellNumberDef="let ctx">
                            <span class="flex items-center gap-1">
                                <span class="font-semibold" [class.opacity-40]="ctx.otherMonth">{{ ctx.date.getDate() }}</span>
                                @if (ctx.count > 2) {
                                    <span class="text-[0.65rem] px-1 rounded bg-primary text-primary-contrast">{{ ctx.count }}</span>
                                }
                            </span>
                        </p-scheduler-month-cell-number>
                        <p-scheduler-month-day-cell *pSchedulerMonthDayCellDef="let ctx">
                            @if (ctx.count) {
                                <span class="text-[0.65rem] opacity-60">{{ ctx.count }} scheduled</span>
                            } @else {
                                <span class="text-[0.65rem] opacity-40">free</span>
                            }
                        </p-scheduler-month-day-cell>
                    </p-scheduler-month>
                    <p-scheduler-year>
                        <p-scheduler-mini-month-header *pSchedulerMiniMonthHeaderDef="let ctx">
                            <span class="font-semibold">{{ ctx.monthName }}</span>
                        </p-scheduler-mini-month-header>
                        <p-scheduler-mini-month-cell *pSchedulerMiniMonthCellDef="let ctx">
                            <span class="text-[0.7rem]" [class.font-bold]="ctx.today" [class.opacity-30]="ctx.otherMonth">{{ ctx.date.getDate() }}</span>
                        </p-scheduler-mini-month-cell>
                    </p-scheduler-year>
                    <p-scheduler-timeline>
                        <p-scheduler-timeline-header-cell *pSchedulerTimelineHeaderCellDef="let ctx">
                            <span class="text-xs tabular-nums" [class.font-semibold]="ctx.major">{{ ctx.label }}</span>
                        </p-scheduler-timeline-header-cell>
                        <p-scheduler-timeline-cell *pSchedulerTimelineCellDef="let ctx">
                            @if (ctx.blocked) {
                                <span class="text-[0.6rem] opacity-50">×</span>
                            }
                        </p-scheduler-timeline-cell>
                    </p-scheduler-timeline>
                </p-scheduler-content>
            </p-scheduler-root>
        </div>

        <app-docsectiontext>
            <p>
                <i>p-scheduler-month-cell</i> is the wider brush: it replaces the whole day cell, number and events included, so a page that wants its own month layout is not fighting the one the Scheduler draws. It cannot be combined with the two
                narrower ones — a cell is either yours or ours.
            </p>
        </app-docsectiontext>
        <div class="card">
            <p-scheduler-root locale="en-US" view="month" [events]="events" [categories]="categories" categoryField="categoryId" [date]="date">
                <p-scheduler-header>
                    <p-scheduler-navigation />
                    <p-scheduler-title />
                </p-scheduler-header>
                <p-scheduler-content>
                    <p-scheduler-month>
                        <p-scheduler-month-cell *pSchedulerMonthCellDef="let ctx">
                            <span class="flex flex-col h-full w-full p-1 gap-1" [class.opacity-40]="ctx.otherMonth">
                                <span class="flex items-center justify-between">
                                    <span class="text-sm font-semibold" [class.text-primary]="ctx.today">{{ ctx.date.getDate() }}</span>
                                    @if (ctx.weekend) {
                                        <span class="text-[0.6rem] uppercase opacity-50">off</span>
                                    }
                                </span>
                                @for (event of ctx.events.slice(0, 2); track event.id) {
                                    <span class="text-[0.65rem] truncate rounded px-1 bg-highlight">{{ event.title }}</span>
                                }
                                @if (ctx.count > 2) {
                                    <span class="text-[0.6rem] opacity-60">+{{ ctx.count - 2 }}</span>
                                }
                            </span>
                        </p-scheduler-month-cell>
                    </p-scheduler-month>
                </p-scheduler-content>
            </p-scheduler-root>
        </div>
        <app-code></app-code>
    `
})
export class CellsDoc {
    events = DEMO_EVENTS;

    categories = DEMO_CATEGORIES;

    date = DEMO_DATE;

    views: SchedulerViewType[] = ['week', 'month', 'year', 'timeline'];

    businessHours = { start: 9, end: 18 };
}
