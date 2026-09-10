import { Component, signal } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { SchedulerModule } from '@openng/optimus-ui/scheduler';
import type { SchedulerEvent, SchedulerViewType } from '@openng/optimus-ui/types/scheduler';
import { DEMO_CATEGORIES, DEMO_DATE, DEMO_RESOURCES, DEMO_TIMELINE_FIRST_DAY_OF_WEEK } from './demo-data';

/** A week of 15-minute columns over four resources: 336 columns and 336 events. */
function busyWeek(): SchedulerEvent[] {
    const events: SchedulerEvent[] = [];
    const resources = DEMO_RESOURCES.map((resource) => resource.id);
    const categories = DEMO_CATEGORIES.map((category) => category.id);

    // 48 slots of 15 minutes between 7 and 19, the same lattice as the axis: with 12-minute steps
    // the events fell between columns.
    for (let day = 0; day < 7; day++) {
        for (let slot = 0; slot < 48; slot++) {
            const start = new Date(DEMO_DATE);

            start.setDate(start.getDate() + day);
            start.setHours(7 + Math.floor(slot / 4), (slot % 4) * 15, 0, 0);

            events.push({
                id: `busy-${day}-${slot}`,
                title: `Slot ${slot + 1}`,
                start,
                end: new Date(start.getTime() + 45 * 60_000),
                resourceId: resources[slot % resources.length],
                categoryId: categories[slot % categories.length]
            });
        }
    }

    return events;
}

@Component({
    selector: 'performance-doc',
    standalone: true,
    imports: [AppDocSectionText, SchedulerModule, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                A timeline axis can be far wider than the viewport: a week of 15-minute columns is 336 of them, and every column is a DOM node in every lane. <i>timelineVirtualScroll</i> mounts only the columns near the viewport, plus
                <i>timelineVirtualOverscan</i> either side so a fast scroll does not expose a blank edge.
            </p>
            <p>
                The default is <i>auto</i>, which turns it on past <i>timelineVirtualThreshold</i> columns — a twelve-column year timeline gains nothing from a scroll listener. Event bars are windowed in pixels rather than in columns, with
                <i>timelineVirtualEventBuffer</i> of slack, because a booking can be three hundred columns long and has to keep its bar while you scroll through its middle.
            </p>
            <p>
                What virtualization does NOT do is make a large collection small. Filter events and resources to the visible workflow first, keep the arrays stable between renders so the overlays and custom cards have less to redo, and use windowing
                for what is left. The demo below is {{ events.length }} events over {{ resources.length }} resources on a 336-column axis.
            </p>
        </app-docsectiontext>
        <div class="card">
            <p-scheduler-root
                locale="en-US"
                [(view)]="view"
                [views]="views"
                [events]="events"
                [resources]="resources"
                [categories]="categories"
                categoryField="categoryId"
                [date]="date"
                [firstDayOfWeek]="firstDayOfWeek"
                [dayStartHour]="7"
                [dayEndHour]="19"
                [timelineSlotDuration]="15"
                [timelineSlotWidth]="48"
                timelineVirtualScroll="auto"
                [timelineVirtualThreshold]="100"
                [timelineVirtualOverscan]="4"
            >
                <p-scheduler-header>
                    <p-scheduler-navigation />
                    <p-scheduler-title />
                    <p-scheduler-view-selector />
                </p-scheduler-header>
                <p-scheduler-content>
                    <p-scheduler-resource-timeline />
                </p-scheduler-content>
            </p-scheduler-root>
        </div>
        <app-code></app-code>
    `
})
export class PerformanceDoc {
    events = busyWeek();

    resources = DEMO_RESOURCES;

    categories = DEMO_CATEGORIES;

    date = DEMO_DATE;

    firstDayOfWeek = DEMO_TIMELINE_FIRST_DAY_OF_WEEK;

    view = signal<SchedulerViewType>('resourceTimelineWeek');

    views: SchedulerViewType[] = ['resourceTimelineDay', 'resourceTimelineWeek'];
}
