import { Component } from '@angular/core';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'data-attributes-doc',
    standalone: true,
    imports: [AppDocSectionText],
    template: ` <app-docsectiontext>
        <p>
            Every surface the Scheduler draws carries a <i>data-slot</i> naming it, and the ones with state carry that too. They are the supported way to style and to test: a selector anchored to <i>data-slot</i> keeps working when the internal DOM
            changes, and one anchored to a class deep in the tree does not.
        </p>
        <h3>Slots</h3>
        <p>
            Shell: <i>scheduler-root</i>, <i>scheduler-header</i>, <i>scheduler-navigation</i>, <i>scheduler-title</i>, <i>scheduler-view-selector</i>, <i>scheduler-view-button</i>, <i>scheduler-view-label</i>, <i>scheduler-content</i>,
            <i>scheduler-footer</i>, <i>scheduler-loading</i>.
        </p>
        <p>
            Time grid: <i>scheduler-day-header</i>, <i>scheduler-time-gutter</i>, <i>scheduler-time-grid-column</i>, <i>scheduler-time-grid-cell</i>, <i>scheduler-work-cell</i>, <i>scheduler-time-grid-event</i>, <i>scheduler-all-day-row</i>,
            <i>scheduler-all-day-cell</i>, <i>scheduler-all-day-event</i>.
        </p>
        <p>
            Month and year: <i>scheduler-month-title</i>, <i>scheduler-month-header-cell</i>, <i>scheduler-month-cell</i>, <i>scheduler-month-cell-number</i>, <i>scheduler-month-day-cell</i>, <i>scheduler-month-event</i>,
            <i>scheduler-month-more-link</i>, <i>scheduler-mini-month</i>, <i>scheduler-mini-month-header</i>, <i>scheduler-mini-month-day</i>.
        </p>
        <p>
            Agenda and timelines: <i>scheduler-agenda</i>, <i>scheduler-agenda-date-header</i>, <i>scheduler-agenda-event</i>, <i>scheduler-timeline-body</i>, <i>scheduler-timeline-lane</i>, <i>scheduler-timeline-header-cell</i>,
            <i>scheduler-timeline-cell</i>, <i>scheduler-timeline-event</i>, <i>scheduler-resource-area</i>, <i>scheduler-resource-area-header</i>, <i>scheduler-resource-list</i>, <i>scheduler-resource</i>, <i>scheduler-resource-aggregate-badge</i>.
        </p>
        <p>
            Overlays and chrome: <i>scheduler-more-popover</i>, <i>scheduler-quick-info</i>, <i>scheduler-event-popover</i>, <i>scheduler-context-menu</i>, <i>scheduler-selection-toolbar</i>, <i>scheduler-category-legend</i>,
            <i>scheduler-category-legend-ui-item</i>, <i>scheduler-event-resize-handle</i>, <i>scheduler-appointment-slot</i>, <i>scheduler-resource-column-header</i>.
        </p>
        <h3>State</h3>
        <p>
            <i>data-view</i> on the root, the header, the content and the event surfaces carries the active view, and <i>data-scale</i> on a timeline carries its scale. Cells and headers carry <i>data-date</i> (an ISO-like day key), <i>data-time</i>,
            <i>data-today</i>, <i>data-weekend</i>, <i>data-other-month</i>, <i>data-business</i>, <i>data-major</i> and <i>data-event-count</i>, and every cell that stands for an interval also carries <i>data-start-date</i> and
            <i>data-end-date</i> as epoch milliseconds (timeline cells add <i>data-col-index</i>). Event surfaces carry <i>data-event-id</i>, <i>data-selected</i>, <i>data-continues-before</i> and <i>data-continues-after</i>, plus
            <i>data-draggable</i>, <i>data-dragging</i> and <i>data-resizing</i> while they are editable or being moved; resource rows carry <i>data-resource-id</i> and <i>data-depth</i>. The root carries <i>data-disabled</i> and <i>data-rtl</i>, and
            a windowed timeline's scroll container carries <i>data-virtual</i>. A grouped view carries <i>data-grouping</i> on its root, a cell inside a blocked interval carries <i>data-blocked</i>, and an appointment slot carries
            <i>data-display</i> and <i>data-full</i>. Every cell the keyboard can reach carries <i>data-nav-cell</i>, which is what the arrow navigation reads to work out the shape of the grid it is in — a custom cell that keeps it keeps keyboard
            navigation.
        </p>
        <p>
            <i>data-start-date</i> and <i>data-end-date</i> are the two the drag pipeline actually READS: a drop target is resolved from the cell under the pointer, which is how one controller handles the week grid, the month and a timeline whose
            axis skips the nights. A custom cell that keeps them keeps drag and drop working.
        </p>
        <h3>Using them</h3>
        <p>Prefer a design token when the decision is about a whole surface, and a data attribute when it depends on state or identity:</p>
        <pre><code>[data-slot='scheduler-month-cell'][data-today] &#123; outline: 2px solid var(--p-primary-color); &#125;
[data-slot='scheduler-timeline-event'][data-resource-id='service-bay-4'] &#123; --p-scheduler-event-border-accent: rebeccapurple; &#125;</code></pre>
        <p>The same applies to tests: find the surface by <i>data-slot</i>, then assert on what the user can see — the visible text, the ARIA state, the selected state.</p>
    </app-docsectiontext>`
})
export class DataAttributesDoc {}
