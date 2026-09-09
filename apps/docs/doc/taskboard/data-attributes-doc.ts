import { Component } from '@angular/core';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'data-attributes-doc',
    standalone: true,
    imports: [AppDocSectionText],
    template: ` <app-docsectiontext>
        <p>
            Every surface the board draws carries <i>data-scope="taskboard"</i> and a <i>data-part</i> naming it, and the ones that stand for a piece of data carry its identity too. They are the supported way to style and to test: a selector anchored
            to a data attribute keeps working when the internal DOM changes, and one anchored to a class deep in the tree does not.
        </p>
        <h3>Identity</h3>
        <p>
            <i>data-column-id</i> sits on a column, a swimlane cell and a column-header surface; <i>data-task-id</i> on a card wrapper; <i>data-swimlane-id</i> on a swimlane row and on its cells. A swimlane cell carries BOTH the column and the
            swimlane id, which is the stable selector shape for a lane-relative drag or virtual-scroll check. <i>data-task-index</i> is the card's position inside its cell, and <i>data-drop-index</i> the insertion position a marker stands for.
        </p>
        <p>
            <i>data-taskboard-id-key</i> is the same id with its TYPE in front of it — <i>s:</i> for a string, <i>n:</i> for a number. It exists because <i>1</i> and <i>"1"</i> are different cards and have to stay different keys, which a bare string
            would merge; it is what <i>scrollToCard</i> and the keyboard use to find an element back.
        </p>
        <h3>Parts</h3>
        <p>
            <i>root</i>, <i>header</i>, <i>content</i>, <i>columns</i>, <i>column</i>, <i>column-header</i>, <i>column-content</i>, <i>column-footer</i>, <i>column-empty</i>, <i>column-add</i>, <i>card</i>, <i>card-header</i>, <i>card-content</i>,
            <i>card-footer</i>, <i>card-add</i>, <i>drop-indicator</i>, <i>runtime-drop-indicator</i>, <i>drag-preview</i>, <i>drag-confirm</i>, <i>loading</i>, <i>swimlane-header</i>, <i>swimlane-column-header</i>, plus <i>card-ui</i>,
            <i>card-advanced-ui</i>, <i>column-header-ui</i>, <i>swimlane-header-ui</i> and <i>swimlane-column-header-ui</i> for the supplied visual parts.
        </p>
        <h3>State</h3>
        <p>
            The root carries <i>p-taskboard-density-compact</i>, <i>-standard</i> or <i>-comfortable</i>, plus <i>p-taskboard-disabled</i>, <i>p-taskboard-readonly</i>, <i>p-taskboard-rtl</i>, <i>p-taskboard-dragging</i> and
            <i>p-taskboard-column-reordering</i>. A column carries <i>p-taskboard-column-collapsed</i>, <i>-locked</i>, <i>-pinned</i>, <i>-dragging</i>, its status family (<i>-todo</i>, <i>-in-progress</i>, <i>-done</i>, <i>-blocked</i>) and its
            capacity state (<i>-wip-warning</i>, <i>-wip-exceeded</i>). A card carries <i>p-taskboard-card-selected</i>, <i>-focused</i>, <i>-disabled</i>, <i>-draggable</i>, <i>-dragging</i> and <i>-dragging-source</i>.
        </p>
        <p>
            <i>p-taskboard-card-dragging-source</i> is separate from <i>-dragging</i> on purpose: in a multi-card drag every travelling card is dragging, but only one is the card the gesture started on, and a preview that wants to point back at it
            needs to tell them apart.
        </p>
        <p>While printing, the root carries <i>data-print-target="true"</i> and <i>p-taskboard-printing</i>, the body carries <i>p-taskboard-print-active</i>, and every ancestor of the board carries <i>p-taskboard-print-ancestor</i>.</p>
        <h3>Using them</h3>
        <p>Prefer a design token when the decision is about a whole surface, and a data attribute when it depends on state or identity:</p>
        <pre><code>[data-part='column'][data-column-id='review'] .p-taskboard-drop-indicator &#123; background: var(--p-yellow-500); &#125;
.operations-board .p-taskboard-card-selected &#123; --p-taskboard-card-selected-ring-color: rebeccapurple; &#125;</code></pre>
        <p>The same applies to tests: find the surface by its data attribute, then assert on what the user can see — the visible text, the ARIA state, the selected state.</p>
    </app-docsectiontext>`
})
export class DataAttributesDoc {}
