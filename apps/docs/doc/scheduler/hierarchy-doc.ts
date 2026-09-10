import { Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { SchedulerModule } from '@openng/optimus-ui/scheduler';
import { DEMO_CATEGORIES, DEMO_DATE, DEMO_EVENTS, DEMO_RESOURCE_TREE } from './demo-data';

@Component({
    selector: 'hierarchy-doc',
    standalone: true,
    imports: [AppDocSectionText, SchedulerModule, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                A <i>parentId</i> on a resource turns the flat rail into a hierarchy, and <i>resourcesExpandable</i> lets the user collapse it. Fifty crews under four departments is a rail nobody can read; four departments that open on demand is the
                same data at a size that fits.
            </p>
            <p>
                <i>resourcesInitiallyExpanded</i> decides where it starts. The state the Scheduler keeps is which groups the user CLOSED, not which are open, so a rail that grows while someone is looking at it does not spring shut on the new
                arrivals.
            </p>
            <p>
                <i>showAggregatedEvents</i> makes a group lane draw the events of everything under it, which is what makes a closed group still worth looking at. The count in its badge is aggregated either way — that is <i>ctx.aggregateCount</i>,
                next to <i>ctx.count</i> for the lane's own — so a collapsed department says how busy it is without being opened.
            </p>
            <p>
                <i>resourceRowHeight</i> sets the lane height in pixels, and <i>rowAutoHeight</i> decides what happens when a lane needs more than one row: on, the lane grows to fit every overlap; off, it stays one row tall and clips, which is what
                keeps every resource comparable on an operations wall.
            </p>
        </app-docsectiontext>
        <div class="card">
            <p-scheduler-root
                locale="en-US"
                view="resourceTimelineDay"
                [events]="events"
                [resources]="resources"
                [categories]="categories"
                categoryField="categoryId"
                [date]="date"
                [dayStartHour]="7"
                [dayEndHour]="19"
                [resourcesExpandable]="true"
                [resourcesInitiallyExpanded]="true"
                [showAggregatedEvents]="true"
                [resourceRowHeight]="36"
                [rowAutoHeight]="true"
            >
                <p-scheduler-header>
                    <p-scheduler-navigation />
                    <p-scheduler-title />
                </p-scheduler-header>
                <p-scheduler-content>
                    <p-scheduler-resource-timeline>
                        <p-scheduler-resource-group *pSchedulerResourceGroupDef="let ctx">
                            <span class="flex items-center gap-2 min-w-0">
                                <strong class="truncate">{{ ctx.title }}</strong>
                                <span class="text-[0.65rem] px-1.5 rounded-full bg-primary text-primary-contrast">{{ ctx.aggregateCount }}</span>
                                <span class="text-[0.65rem] opacity-60">{{ ctx.expanded ? 'open' : 'closed' }}</span>
                            </span>
                        </p-scheduler-resource-group>
                        <p-scheduler-resource *pSchedulerResourceDef="let ctx">
                            <span class="flex items-center gap-2 min-w-0">
                                <span class="inline-block w-2 h-2 rounded-full shrink-0" [style.background]="ctx.resource?.color"></span>
                                <span class="truncate">{{ ctx.title }}</span>
                                <span class="text-[0.65rem] opacity-60">{{ ctx.count }}</span>
                            </span>
                        </p-scheduler-resource>
                    </p-scheduler-resource-timeline>
                </p-scheduler-content>
            </p-scheduler-root>
        </div>
        <app-code></app-code>
    `
})
export class HierarchyDoc {
    events = DEMO_EVENTS;

    resources = DEMO_RESOURCE_TREE;

    categories = DEMO_CATEGORIES;

    date = DEMO_DATE;
}
