import { Component, signal } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { SchedulerModule } from '@openng/optimus-ui/scheduler';
import type { SchedulerResource, SchedulerViewType } from '@openng/optimus-ui/types/scheduler';
import { DEMO_CATEGORIES, DEMO_DATE, DEMO_RESOURCE_TREE, DEMO_SPAN_EVENTS } from './demo-data';

@Component({
    selector: 'adaptive-doc',
    standalone: true,
    imports: [AppDocSectionText, SchedulerModule, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                Forty resource columns are forty columns of nothing. <i>adaptiveMode</i> shows one resource at a time instead — and picking a parent group shows the group with its children, so a hierarchy stays navigable. <i>auto</i> only turns it on
                past <i>adaptiveThreshold</i> resources, because below that showing them all is both possible and more useful.
            </p>
            <p>
                <i>[(selectedResourceId)]</i> is the focus, and clicking a resource row or column header moves it. When the page has not chosen one, the Scheduler picks the first resource that has events and reports it through
                <i>(adaptiveAutoSelect)</i> rather than deciding in silence — a selector that disagrees with the grid is worse than no selector. <i>(resourceClick)</i> fires either way.
            </p>
            <p>The unassigned lane is left out while adaptive mode is on: the view is one specific resource, and hanging the ownerless events off it would be a lie.</p>
        </app-docsectiontext>
        <div class="card">
            <div class="flex flex-wrap gap-2 mb-3">
                @for (resource of resources; track resource.id) {
                    <button type="button" class="px-2 py-1 text-sm rounded border" [class.font-semibold]="resource.id === selected()" (click)="selected.set(resource.id)">{{ resource.name }}</button>
                }
            </div>
            <p-scheduler-root
                locale="en-US"
                [(view)]="view"
                adaptiveMode="true"
                [(selectedResourceId)]="selected"
                [events]="events"
                [resources]="resources"
                [categories]="categories"
                categoryField="categoryId"
                [date]="date"
                [dayStartHour]="8"
                [dayEndHour]="18"
                [timelineSlotWidth]="88"
                (adaptiveAutoSelect)="log.set('Auto-selected ' + $event.resource.name)"
                (resourceClick)="log.set('Clicked ' + $event.resource.name)"
            >
                <p-scheduler-header>
                    <p-scheduler-navigation />
                    <p-scheduler-title />
                    <p-scheduler-view-selector />
                </p-scheduler-header>
                <p-scheduler-content>
                    <p-scheduler-resource-timeline />
                    <p-scheduler-resource-day />
                </p-scheduler-content>
            </p-scheduler-root>
            <p class="mt-3 text-sm opacity-70">{{ log() || 'Pick a resource above, or click one in the rail.' }}</p>
        </div>
        <app-code></app-code>
    `
})
export class AdaptiveDoc {
    events = DEMO_SPAN_EVENTS;

    resources: SchedulerResource[] = DEMO_RESOURCE_TREE;

    categories = DEMO_CATEGORIES;

    date = DEMO_DATE;

    view = signal<SchedulerViewType>('resourceTimelineDay');

    selected = signal<string | number | undefined>(undefined);

    log = signal('');
}
