import { Component, signal } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { SchedulerModule } from '@openng/optimus-ui/scheduler';
import type { SchedulerDensity, SchedulerViewType } from '@openng/optimus-ui/types/scheduler';
import { DEMO_CATEGORIES, DEMO_DATE, DEMO_EVENTS, DEMO_RESOURCES } from './demo-data';

@Component({
    selector: 'responsive-doc',
    standalone: true,
    imports: [AppDocSectionText, SchedulerModule, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                The Scheduler measures its container and not the viewport, because it is normally inside a panel and the window's width says nothing about the space it actually has. There is no breakpoint list to configure: every view has a floor
                below which it scrolls instead of squeezing.
            </p>
            <p>
                In the time grid that floor is <i>--p-scheduler-column-min-width</i>, seeded from the <i>scheduler.day.min.width</i> token: a week that no longer fits scrolls horizontally with its header, gutter and all-day lanes in step rather than
                cutting seven days in half. <i>resourceColumnMinWidth</i> is the same floor for the grouped views, where the columns are resources and there are many more of them.
            </p>
            <p>
                The year view lays out as many mini-months as fit, four on a wide screen and one on a phone, so the day cell never drops below a legible size. The timeline has a fixed slot width and scrolls, with <i>timelineSlotWidth</i> to change it
                and virtualization to keep a long axis cheap. The agenda has no geometry to lose and stays a list at any width.
            </p>
            <p>
                For dense schedules the answer is not a narrower column but fewer of them: <i>adaptiveMode</i> shows one resource at a time past <i>adaptiveThreshold</i> and reports its choice through <i>(adaptiveAutoSelect)</i>, and
                <i>maxEventsPerCell</i> collapses a busy month cell into an overflow link instead of an unreadable stack. Resize the panel below to watch the floors take effect.
            </p>
            <p>
                <i>density</i> is the other lever: <i>compact</i> trades padding for rows on screen, which is what an operations wall wants and a page someone reads does not. It changes the heights and not the type, so nothing gets harder to read —
                there is just more of it.
            </p>
        </app-docsectiontext>
        <div class="card">
            <div class="flex flex-wrap gap-2 mb-3">
                <button type="button" class="px-2 py-1 text-sm rounded border border-surface" [class.bg-highlight]="density() === 'comfortable'" (click)="density.set('comfortable')">Comfortable</button>
                <button type="button" class="px-2 py-1 text-sm rounded border border-surface" [class.bg-highlight]="density() === 'compact'" (click)="density.set('compact')">Compact</button>
            </div>
            <div class="resize-x overflow-auto border border-surface rounded-md p-2 min-w-[20rem] max-w-full" style="resize: horizontal">
                <p-scheduler-root
                    locale="en-US"
                    view="resourceWeek"
                    [views]="views"
                    [events]="events"
                    [resources]="resources"
                    [categories]="categories"
                    categoryField="categoryId"
                    [date]="date"
                    [dayStartHour]="8"
                    [dayEndHour]="18"
                    [resourceColumnMinWidth]="'7rem'"
                    [maxEventsPerCell]="2"
                    [density]="density()"
                >
                    <p-scheduler-header>
                        <p-scheduler-navigation />
                        <p-scheduler-title />
                        <p-scheduler-view-selector />
                    </p-scheduler-header>
                    <p-scheduler-content>
                        <p-scheduler-resource-week />
                        <p-scheduler-week />
                        <p-scheduler-month />
                        <p-scheduler-year />
                        <p-scheduler-agenda />
                    </p-scheduler-content>
                    <p-scheduler-more-popover />
                </p-scheduler-root>
            </div>
            <p class="mt-3 text-sm opacity-70">Drag the bottom-right corner of the box to narrow it.</p>
        </div>
        <app-code></app-code>
    `
})
export class ResponsiveDoc {
    events = DEMO_EVENTS;

    resources = DEMO_RESOURCES;

    categories = DEMO_CATEGORIES;

    date = DEMO_DATE;

    views: SchedulerViewType[] = ['resourceWeek', 'week', 'month', 'year', 'agenda'];

    density = signal<SchedulerDensity>('comfortable');
}
