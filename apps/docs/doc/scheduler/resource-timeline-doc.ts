import { Component, signal } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { SchedulerModule } from '@openng/optimus-ui/scheduler';
import type { SchedulerViewType } from '@openng/optimus-ui/types/scheduler';
import { DEMO_CATEGORIES, DEMO_DATE, DEMO_RESOURCES, DEMO_SPAN_EVENTS, DEMO_TIMELINE_FIRST_DAY_OF_WEEK } from './demo-data';

@Component({
    selector: 'resource-timeline-doc',
    standalone: true,
    imports: [AppDocSectionText, SchedulerModule, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                <i>p-scheduler-resource-timeline</i> gives each resource its own lane, with a rail of labels that stays put while the axis scrolls horizontally. It covers the same four scales as the plain timeline: <i>resourceTimelineDay</i>,
                <i>resourceTimelineWeek</i>, <i>resourceTimelineMonth</i> and <i>resourceTimelineYear</i>.
            </p>
            <p>
                The rail is <i>position: sticky</i> and not a second scroll container, because two scrollers side by side have to be synchronised by hand and drift the moment anything else scrolls the page. An event whose <i>resourceId</i>
                matches no resource lands in a trailing "Unassigned" lane instead of disappearing — silently hiding an appointment because its resource was deleted is the worst thing a scheduler can do.
            </p>
            <p>Replace the rail header with <i>p-scheduler-resource-area-header</i> and a row with <i>p-scheduler-resource-row</i>.</p>
        </app-docsectiontext>
        <div class="card">
            <p-scheduler-root
                locale="en-US"
                [events]="events"
                [resources]="resources"
                [categories]="categories"
                categoryField="categoryId"
                [date]="date"
                [(view)]="view"
                [firstDayOfWeek]="firstDayOfWeek"
                [dayStartHour]="7"
                [dayEndHour]="19"
                [timelineSlotDuration]="60"
                [timelineSlotWidth]="88"
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
export class ResourceTimelineDoc {
    events = DEMO_SPAN_EVENTS;

    resources = DEMO_RESOURCES;

    categories = DEMO_CATEGORIES;

    date = DEMO_DATE;

    firstDayOfWeek = DEMO_TIMELINE_FIRST_DAY_OF_WEEK;

    view = signal<SchedulerViewType>('resourceTimelineDay');
}
