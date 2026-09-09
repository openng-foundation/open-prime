import { Component } from '@angular/core';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'accessibility-doc',
    standalone: true,
    imports: [AppDocSectionText],
    template: ` <app-docsectiontext>
        <h3>Screen Reader</h3>
        <p>
            The root renders <i>role="group"</i> with an accessible name — <i>Task board</i> unless <i>ariaLabel</i> says otherwise — the list of shortcuts it claims in <i>aria-keyshortcuts</i>, and two live regions: a polite one for accepted moves
            and an assertive one for refusals. A column renders <i>role="list"</i> with its name and count, and <i>aria-expanded</i> when collapse is available. A card renders <i>role="listitem"</i> with its title as the accessible name and
            <i>aria-grabbed</i> while it can be dragged.
        </p>
        <p>Custom column-header content stays responsible for choosing an appropriate heading element or role, and custom cards, menus, dialogs and toolbar controls for their own labels, focus order and disabled state.</p>
        <h3>Keyboard Support</h3>
        <p>
            Only one card is tabbable at a time — a roving focus — so entering the board and walking it are two different gestures: <i>Tab</i> reaches the board, then the arrow keys move inside it. The full table is in the <i>Keyboard</i> section
            above; the behaviour worth repeating here is that a keyboard move goes through the same validation as a drag, so a blocked one leaves the data untouched and announces the reason in the assertive region.
        </p>
        <p>
            <i>Escape</i> unwinds one layer at a time, most transient first: a pending confirmation, then a drag, then a column reorder, then the selection, then the focus. Application overlays should close through their own keyboard handling before
            the focus returns to the board.
        </p>
        <h3>Motion and contrast</h3>
        <p>
            The runtime stylesheet drops the board's transitions under <i>prefers-reduced-motion</i>, thickens the focus ring, the selected ring and the insertion line under <i>prefers-contrast: more</i>, and swaps the shadows for outlines under
            <i>forced-colors</i>, where a shadow does not render at all. Product-owned card and overlay animation should do the same.
        </p>
    </app-docsectiontext>`
})
export class AccessibilityDoc {}
