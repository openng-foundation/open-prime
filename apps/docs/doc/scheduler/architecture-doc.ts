import { Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { SchedulerModule } from '@openng/optimus-ui/scheduler';
import { DEMO_CATEGORIES, DEMO_DATE, DEMO_EVENTS } from './demo-data';

@Component({
    selector: 'architecture-doc',
    standalone: true,
    imports: [AppDocSectionText, SchedulerModule, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                The Scheduler is a compound component: <i>p-scheduler-root</i> owns the data, the view state, the selection and the overlays, and every part below it reads what it needs from that shared state. Nothing is passed down through inputs,
                so adding a part to the tree is enough to make it work — and leaving one out is enough to leave it out of the page.
            </p>
            <p>There are four kinds of child, and telling them apart is most of what there is to learn:</p>
            <ul>
                <li><strong>Regions</strong> — <i>p-scheduler-header</i>, <i>p-scheduler-content</i> and <i>p-scheduler-footer</i>: where things go.</li>
                <li>
                    <strong>Chrome</strong> — <i>p-scheduler-navigation</i>, <i>p-scheduler-title</i>, <i>p-scheduler-view-selector</i>, <i>p-scheduler-category-legend</i>, <i>p-scheduler-selection-toolbar</i>, <i>p-scheduler-loading</i>: ready-made
                    controls that drive the state.
                </li>
                <li><strong>Scopes</strong> — <i>p-scheduler-month</i>, <i>p-scheduler-week</i>, <i>p-scheduler-resource-timeline</i> and the rest: declaring one is what makes a view exist and what the view selector offers.</li>
                <li>
                    <strong>Overlays</strong> — <i>p-scheduler-more-popover</i>, <i>p-scheduler-quick-info</i>, <i>p-scheduler-popover</i>, <i>p-scheduler-context-menu</i>: each opt-in through a flag on the root plus the part in the tree. The flag
                    decides when it opens, the part decides what it contains.
                </li>
            </ul>
            <p>
                A scope draws nothing itself: it declares that the view is available and holds the definitions that apply to it. The drawing is done by an internal renderer the root picks for the active view, which is why definitions can be declared
                for views that are not currently on screen without paying for them.
            </p>
            <p>
                Definitions resolve from the narrowest scope outwards — a <i>p-scheduler-event</i> inside <i>p-scheduler-week</i> applies to the week only, the same part in <i>p-scheduler-content</i> is the fallback for every view — and each one is
                instantiated per surface with its own injector, so a child component placed inside a definition can inject the context of the exact cell or event it was drawn for.
            </p>
            <p>
                Everything ships from one secondary entry point, <i>&#64;openng/optimus-ui/scheduler</i>, with the types in <i>&#64;openng/optimus-ui/types/scheduler</i>. <i>SchedulerModule</i> imports the whole set for convenience; every part is
                standalone, so importing only the ones a page uses keeps the rest out of the bundle.
            </p>
        </app-docsectiontext>
        <div class="card">
            <p-scheduler-root locale="en-US" view="week" [events]="events" [categories]="categories" categoryField="categoryId" [date]="date" [dayStartHour]="8" [dayEndHour]="18" [quickInfo]="true" ariaLabel="Crew schedule">
                <p-scheduler-header>
                    <p-scheduler-navigation />
                    <p-scheduler-title />
                    <p-scheduler-view-selector />
                    <p-scheduler-category-legend />
                </p-scheduler-header>
                <p-scheduler-content>
                    <p-scheduler-week />
                    <p-scheduler-month />
                </p-scheduler-content>
                <p-scheduler-footer>
                    <span class="text-sm opacity-70">{{ events.length }} appointments loaded</span>
                </p-scheduler-footer>
                <p-scheduler-quick-info />
            </p-scheduler-root>
        </div>
        <app-code></app-code>
    `
})
export class ArchitectureDoc {
    events = DEMO_EVENTS;

    categories = DEMO_CATEGORIES;

    date = DEMO_DATE;
}
