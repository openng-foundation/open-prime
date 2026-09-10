import { Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { SchedulerModule } from '@openng/optimus-ui/scheduler';
import type { SchedulerViewType } from '@openng/optimus-ui/types/scheduler';
import { DEMO_CATEGORIES, DEMO_DATE, DEMO_EVENTS, DEMO_RESOURCES } from './demo-data';

@Component({
    selector: 'event-ui-doc',
    standalone: true,
    imports: [AppDocSectionText, SchedulerModule, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                Each surface an event can appear on has its own definition, because they have nothing in common but the data: <i>p-scheduler-time-grid-event</i> is a tall box in a column, <i>p-scheduler-all-day-event</i> a strip above the grid,
                <i>p-scheduler-month-event</i> a line in a cell, <i>p-scheduler-timeline-event</i> a horizontal bar and <i>p-scheduler-agenda-event</i> a list row. <i>p-scheduler-event</i> declared straight in <i>p-scheduler-content</i> is the
                fallback for any of them you did not define.
            </p>
            <p>
                The Scheduler keeps the positioning, the accent colour, the selection state and the ARIA; the definition owns what is inside. The context arrives with the work already done — <i>title</i> and <i>timeText</i> resolved,
                <i>accentColor</i> picked, <i>category</i> and <i>resource</i> looked up, and the <i>selected</i>, <i>focused</i>, <i>dragging</i> and <i>continuesBefore</i>/<i>continuesAfter</i> flags — so a card is a template, not a calculation.
            </p>
            <p>
                <i>eventShell</i> set to <i>none</i> removes the box the Scheduler draws around an event — its background, border and padding — and keeps everything else: the positioning, the pointer and keyboard activation, the focus ring, the
                selected and dragging state, the resize handles and the overlay anchor. That is the split when your own component draws the card, as the week and agenda definitions below do.
            </p>
        </app-docsectiontext>
        <div class="card">
            <p-scheduler-root locale="en-US" view="week" [views]="views" [events]="events" [resources]="resources" [categories]="categories" categoryField="categoryId" [date]="date" [dayStartHour]="7" [dayEndHour]="19" eventShell="none">
                <p-scheduler-header>
                    <p-scheduler-navigation />
                    <p-scheduler-title />
                    <p-scheduler-view-selector />
                </p-scheduler-header>
                <p-scheduler-content>
                    <p-scheduler-event *pSchedulerEventDef="let ctx">
                        <span class="truncate">{{ ctx.title }}</span>
                    </p-scheduler-event>
                    <p-scheduler-week>
                        <p-scheduler-time-grid-event *pSchedulerTimeGridEventDef="let ctx">
                            <span class="flex items-center gap-1 min-w-0">
                                <span class="inline-block w-1.5 h-1.5 rounded-full shrink-0" [style.background]="ctx.accentColor"></span>
                                <strong class="truncate">{{ ctx.title }}</strong>
                            </span>
                            <span class="opacity-70 truncate">{{ ctx.timeText }}</span>
                            @if (ctx.resource) {
                                <span class="opacity-60 truncate">{{ ctx.resource.name }}</span>
                            }
                        </p-scheduler-time-grid-event>
                        <p-scheduler-all-day-event *pSchedulerAllDayEventDef="let ctx">
                            <span class="truncate">{{ ctx.title }}</span>
                            @if (ctx.continuesAfter) {
                                <span aria-hidden="true">›</span>
                            }
                        </p-scheduler-all-day-event>
                    </p-scheduler-week>
                    <p-scheduler-agenda>
                        <p-scheduler-agenda-date-header *pSchedulerAgendaDateHeaderDef="let ctx">
                            <span class="flex items-baseline gap-2">
                                <strong [class.text-primary]="ctx.today">{{ ctx.formattedDate }}</strong>
                                <span class="text-xs uppercase opacity-60">{{ ctx.dayName }}</span>
                                <span class="text-xs opacity-60">{{ ctx.count }}</span>
                            </span>
                        </p-scheduler-agenda-date-header>
                        <p-scheduler-agenda-event *pSchedulerAgendaEventDef="let ctx">
                            <span class="flex items-center gap-2 min-w-0">
                                <span class="inline-block w-1.5 h-4 rounded-sm shrink-0" [style.background]="ctx.accentColor"></span>
                                <strong class="truncate">{{ ctx.title }}</strong>
                                @if (ctx.category) {
                                    <span class="text-xs opacity-60 truncate">{{ ctx.category.name }}</span>
                                }
                            </span>
                        </p-scheduler-agenda-event>
                    </p-scheduler-agenda>
                    <p-scheduler-timeline>
                        <p-scheduler-timeline-event *pSchedulerTimelineEventDef="let ctx">
                            <span class="flex items-center gap-1 min-w-0 px-1">
                                <strong class="truncate">{{ ctx.title }}</strong>
                                @if (ctx.availableWidth && ctx.availableWidth > 120) {
                                    <span class="opacity-70 truncate">{{ ctx.timeText }}</span>
                                }
                            </span>
                        </p-scheduler-timeline-event>
                    </p-scheduler-timeline>
                </p-scheduler-content>
            </p-scheduler-root>
        </div>
        <app-code></app-code>
    `
})
export class EventUiDoc {
    views: SchedulerViewType[] = ['week', 'agenda', 'timeline'];

    events = DEMO_EVENTS;

    resources = DEMO_RESOURCES;

    categories = DEMO_CATEGORIES;

    date = DEMO_DATE;
}
