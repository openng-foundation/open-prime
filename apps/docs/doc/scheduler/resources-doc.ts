import { Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { SchedulerModule } from '@openng/optimus-ui/scheduler';
import { DEMO_CATEGORIES, DEMO_DATE, DEMO_RESOURCE_TREE, DEMO_SPAN_EVENTS } from './demo-data';

@Component({
    selector: 'resources-doc',
    standalone: true,
    imports: [AppDocSectionText, SchedulerModule, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                A resource is a row an event belongs to: a room, a machine, a crew. Events are matched to it by <i>resourceId</i>, and a resource's <i>color</i> is used as the event accent when no category applies — the category wins because it is
                the classification the legend explains.
            </p>
            <p>Give a resource a <i>parentId</i> and the rail renders it under its parent, reported to your templates as <i>depth</i> on the resource context and as <i>data-depth</i> on the row.</p>
        </app-docsectiontext>
        <div class="card">
            <p-scheduler-root locale="en-US" view="resourceTimelineDay" [events]="events" [resources]="resources" [categories]="categories" categoryField="categoryId" [date]="date" [dayStartHour]="7" [dayEndHour]="19" [timelineSlotWidth]="88">
                <p-scheduler-header>
                    <p-scheduler-navigation />
                    <p-scheduler-title />
                    <p-scheduler-view-selector />
                </p-scheduler-header>
                <p-scheduler-content>
                    <p-scheduler-resource-timeline>
                        <p-scheduler-resource-row *pSchedulerResourceRowDef="let ctx">
                            <span class="inline-block w-2 h-2 rounded-full shrink-0" [style.background]="ctx.resource?.color ?? 'transparent'"></span>
                            <span [class.font-semibold]="ctx.depth === 0" [style.padding-inline-start.rem]="ctx.depth">{{ ctx.title }}</span>
                            @if (ctx.count) {
                                <span class="text-xs opacity-60" style="margin-inline-start: auto">{{ ctx.count }}</span>
                            }
                        </p-scheduler-resource-row>
                    </p-scheduler-resource-timeline>
                </p-scheduler-content>
            </p-scheduler-root>
        </div>
        <app-code></app-code>
    `
})
export class ResourcesDoc {
    events = DEMO_SPAN_EVENTS;

    resources = DEMO_RESOURCE_TREE;

    categories = DEMO_CATEGORIES;

    date = DEMO_DATE;
}
