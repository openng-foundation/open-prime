import { Component, signal } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { SchedulerModule } from '@openng/optimus-ui/scheduler';
import type { SchedulerViewType } from '@openng/optimus-ui/types/scheduler';
import { DEMO_CATEGORIES, DEMO_DATE, DEMO_EVENTS, DEMO_TIMELINE_FIRST_DAY_OF_WEEK } from './demo-data';

@Component({
    selector: 'rtl-doc',
    standalone: true,
    imports: [AppDocSectionText, SchedulerModule, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                <i>rtl</i> sets <i>dir="rtl"</i> on the root, which is all the stylesheet needs: every offset, border and event position is written with logical properties, so the columns, the time gutter, the resource rail and the event bars flip
                together instead of one at a time. The navigation arrows are the exception the direction cannot infer — "previous" points right when you read right to left — and they are flipped explicitly.
            </p>
            <p>Use it with a matching <i>locale</i> so the dates and times are formatted in the same direction as the layout.</p>
        </app-docsectiontext>
        <div class="card">
            <p-scheduler-root
                locale="ar-EG"
                [rtl]="true"
                [events]="events"
                [categories]="categories"
                categoryField="categoryId"
                [date]="date"
                [(view)]="view"
                [firstDayOfWeek]="firstDayOfWeek"
                [dayStartHour]="7"
                [dayEndHour]="19"
                [timelineSlotWidth]="88"
            >
                <p-scheduler-header>
                    <p-scheduler-navigation />
                    <p-scheduler-title />
                    <p-scheduler-view-selector />
                </p-scheduler-header>
                <p-scheduler-content>
                    <p-scheduler-week />
                    <p-scheduler-timeline />
                </p-scheduler-content>
            </p-scheduler-root>
        </div>
        <app-code></app-code>
    `
})
export class RtlDoc {
    events = DEMO_EVENTS;

    categories = DEMO_CATEGORIES;

    date = DEMO_DATE;

    firstDayOfWeek = DEMO_TIMELINE_FIRST_DAY_OF_WEEK;

    view = signal<SchedulerViewType>('week');
}
