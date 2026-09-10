import { Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { SchedulerModule } from '@openng/optimus-ui/scheduler';
import { DEMO_CATEGORIES, DEMO_DATE, DEMO_EVENTS, DEMO_RESOURCE_TREE, DEMO_RESOURCES } from './demo-data';

@Component({
    selector: 'resource-ui-doc',
    standalone: true,
    imports: [AppDocSectionText, SchedulerModule, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                Everything the resource rail draws has a definition, because a resource is the one thing in a schedule the Scheduler knows nothing about: a room needs its capacity, a technician a photograph, a machine its serial. There are six, and
                they differ by <em>where</em> they are drawn rather than by what they hold.
            </p>
            <p>
                <i>p-scheduler-resource</i> is a lane label in the resource timeline and <i>p-scheduler-resource-group</i> the label of a parent that has children. <i>p-scheduler-resource-row</i> replaces a whole row of the rail rather than just its
                label, <i>p-scheduler-resource-area-header</i> the corner above the rail, and <i>p-scheduler-resource-column-header</i> the band over the columns in the grouped day and week views. <i>p-scheduler-resource-aggregate-badge</i> is the
                count drawn next to a lane.
            </p>
            <p>
                The context is the same for all of them: the <i>resource</i> itself, its resolved <i>title</i>, its <i>depth</i> in the hierarchy, whether it is a <i>group</i>, the <i>events</i> it holds inside the visible range and their
                <i>count</i>, and its <i>capacity</i> when it declares one. A hierarchy is just a <i>parentId</i> on the resource, which is what turns the flat rail into groups.
            </p>
        </app-docsectiontext>
        <div class="card flex flex-col gap-6">
            <p-scheduler-root locale="en-US" view="resourceTimelineDay" [events]="events" [resources]="tree" [categories]="categories" categoryField="categoryId" [date]="date" [dayStartHour]="7" [dayEndHour]="19">
                <p-scheduler-header>
                    <p-scheduler-navigation />
                    <p-scheduler-title />
                </p-scheduler-header>
                <p-scheduler-content>
                    <p-scheduler-resource-timeline>
                        <p-scheduler-resource-area-header *pSchedulerResourceAreaHeaderDef>
                            <span class="text-xs uppercase tracking-wide opacity-60">Crews</span>
                        </p-scheduler-resource-area-header>
                        <p-scheduler-resource-group *pSchedulerResourceGroupDef="let ctx">
                            <span class="flex items-center gap-2 font-semibold">
                                <span class="truncate">{{ ctx.title }}</span>
                                <span class="text-xs opacity-60">{{ ctx.count }}</span>
                            </span>
                        </p-scheduler-resource-group>
                        <p-scheduler-resource *pSchedulerResourceDef="let ctx">
                            <span class="flex items-center gap-2 min-w-0">
                                <span class="inline-flex items-center justify-center w-6 h-6 rounded-full text-[0.65rem] font-semibold text-white shrink-0" [style.background]="ctx.resource?.color ?? 'rgb(100 116 139)'">
                                    {{ ctx.title?.charAt(0) }}
                                </span>
                                <span class="flex flex-col leading-tight min-w-0">
                                    <span class="truncate">{{ ctx.title }}</span>
                                    <span class="text-[0.65rem] opacity-60">{{ ctx.count }} in range</span>
                                </span>
                            </span>
                        </p-scheduler-resource>
                        <p-scheduler-resource-aggregate-badge *pSchedulerResourceAggregateBadgeDef="let ctx">
                            <span class="text-[0.65rem] px-1.5 rounded-full bg-primary text-primary-contrast">{{ ctx.count }}</span>
                        </p-scheduler-resource-aggregate-badge>
                    </p-scheduler-resource-timeline>
                </p-scheduler-content>
            </p-scheduler-root>

            <p-scheduler-root locale="en-US" view="resourceDay" [events]="events" [resources]="resources" [categories]="categories" categoryField="categoryId" [date]="date" [dayStartHour]="8" [dayEndHour]="18">
                <p-scheduler-header>
                    <p-scheduler-navigation />
                    <p-scheduler-title />
                </p-scheduler-header>
                <p-scheduler-content>
                    <p-scheduler-resource-day>
                        <p-scheduler-resource-column-header *pSchedulerResourceColumnHeaderDef="let ctx">
                            <span class="flex items-center gap-1.5 min-w-0">
                                <span class="inline-block w-2 h-2 rounded-full shrink-0" [style.background]="ctx.resource?.color"></span>
                                <span class="truncate font-semibold">{{ ctx.title }}</span>
                                <span class="text-xs opacity-60 shrink-0">{{ ctx.count }}</span>
                            </span>
                        </p-scheduler-resource-column-header>
                    </p-scheduler-resource-day>
                </p-scheduler-content>
            </p-scheduler-root>

            <p-scheduler-root locale="en-US" view="resourceMonth" [events]="events" [resources]="resources" [categories]="categories" categoryField="categoryId" [date]="date">
                <p-scheduler-header>
                    <p-scheduler-navigation />
                    <p-scheduler-title />
                </p-scheduler-header>
                <p-scheduler-content>
                    <p-scheduler-resource-month>
                        <p-scheduler-resource-header *pSchedulerResourceHeaderDef="let ctx">
                            <span class="flex items-center gap-2">
                                <span class="inline-block w-2 h-2 rounded-full" [style.background]="ctx.resource?.color"></span>
                                <strong>{{ ctx.title }}</strong>
                                <span class="text-xs opacity-60">{{ ctx.count }} this month</span>
                            </span>
                        </p-scheduler-resource-header>
                    </p-scheduler-resource-month>
                </p-scheduler-content>
            </p-scheduler-root>

            <p-scheduler-root locale="en-US" view="resourceTimelineWeek" [events]="events" [resources]="resources" [categories]="categories" categoryField="categoryId" [date]="date">
                <p-scheduler-header>
                    <p-scheduler-navigation />
                    <p-scheduler-title />
                </p-scheduler-header>
                <p-scheduler-content>
                    <p-scheduler-resource-timeline>
                        <p-scheduler-resource-row *pSchedulerResourceRowDef="let ctx">
                            <span class="flex items-center justify-between gap-2 w-full px-2 min-w-0">
                                <span class="truncate">{{ ctx.title }}</span>
                                @if (ctx.capacity) {
                                    <span class="text-[0.65rem] opacity-60 shrink-0">{{ ctx.count }}/{{ ctx.capacity }}</span>
                                } @else {
                                    <span class="text-[0.65rem] opacity-60 shrink-0">{{ ctx.count }}</span>
                                }
                            </span>
                        </p-scheduler-resource-row>
                    </p-scheduler-resource-timeline>
                </p-scheduler-content>
            </p-scheduler-root>
        </div>
        <app-code></app-code>
    `
})
export class ResourceUiDoc {
    events = DEMO_EVENTS;

    resources = DEMO_RESOURCES;

    tree = DEMO_RESOURCE_TREE;

    categories = DEMO_CATEGORIES;

    date = DEMO_DATE;
}
