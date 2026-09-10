import { Component } from '@angular/core';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'accessibility-doc',
    standalone: true,
    imports: [AppDocSectionText],
    template: ` <app-docsectiontext>
        <h3>Screen Reader</h3>
        <p>
            The root carries <i>aria-busy</i> while the <i>loading</i> input is set. The range title is an <i>aria-live="polite"</i> region, so navigating announces the new range without moving focus. View buttons expose their state through
            <i>aria-pressed</i>, and the overflow popover is a <i>dialog</i> labelled with the day it belongs to.
        </p>
        <p>
            Events and cells are rendered as buttons when the view is interactive, so they are reachable and announced as actionable. Definition children own their own markup: keep any interactive element inside the supplied semantic component so it
            stays connected to the right surface.
        </p>
        <p>
            The event popover opens on focus as well as on hover, so the detail it carries is not mouse-only. The context menu is bound to the browser's own contextmenu event, which fires from the keyboard menu key too, and the native menu is only
            suppressed when the Scheduler actually has one to show.
        </p>
        <h3>Keyboard Support</h3>
        <p>Header controls, view buttons, event surfaces, cells and the overflow list are all native buttons and follow the standard tab order.</p>
        <p>
            Events are focusable and editable from the keyboard. With focus on an event the arrow keys move it — up and down by one <i>snapDuration</i> step, left and right by a day — and the same keys with shift resize its end instead. Enter and
            space activate it. It runs through the same controller a drag does, so <i>eventAllow</i>, the blocked intervals, the pending change and the <i>(eventDrop)</i>/<i>(eventResizeStop)</i> outputs behave identically: giving the keyboard its
            own shortcut pipeline is how the two drift apart.
        </p>
        <p>
            Empty cells are navigable too. The grid is ONE tab stop — tabbing into a month reaches the grid, not four hundred cells — and from there the arrows walk it: in a time grid up and down move through the hours while left and right change day
            or resource, in a month left and right move by a day and up and down by a week, and in a mini-month down is the next week. Home and End jump to the ends of the row or column, and Enter or space activates the cell, which is what fires
            <i>dateClick</i> and starts an appointment. In RTL the horizontal arrows follow the reading direction.
        </p>
        <p>
            An arrow that would leave the grid is deliberately NOT swallowed, so it goes on scrolling the page instead of trapping focus at the edge. Cells announce their date, time and resource, and they are exposed as buttons rather than as an ARIA
            grid: the time grid's DOM is column-major, and claiming a row-major grid structure would describe it wrongly.
        </p>
        <h3>Direction</h3>
        <p>
            <i>rtl</i> sets <i>dir</i> on the root, so assistive technology and the layout agree on the reading order. The stylesheet is written with logical properties, which is what keeps the columns, the gutter and the event bars flipping together
            instead of one at a time.
        </p>
        <h3>Reduced Motion</h3>
        <p>The stylesheet disables its transitions under <i>prefers-reduced-motion</i>.</p>
        <p>
            <i>ariaLabel</i> names the whole Scheduler, which matters as soon as a page holds more than one of them or when nothing around it says which schedule this is: a screen reader announces a region, and a region without a name is just
            "application".
        </p>
    </app-docsectiontext>`
})
export class AccessibilityDoc {}
