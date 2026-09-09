import { Component } from '@angular/core';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'accessibility-doc',
    standalone: true,
    imports: [AppDocSectionText],
    template: ` <app-docsectiontext>
        <h3>Screen Reader</h3>
        <p>
            The editing region is exposed as an ARIA textbox - <i>role="textbox"</i> with <i>aria-multiline="true"</i> - and not only as a native contenteditable, so it has a recognized role. Give every editor a name through <i>ariaLabel</i> or
            <i>ariaLabelledby</i>: an editor with no accessible name is a WCAG 4.1.2 failure. When <i>readonly</i> or <i>disabled</i> is set the region also exposes <i>aria-readonly</i>, and document-mutating commands are blocked even when triggered
            programmatically.
        </p>
        <p>
            While a slash or mention menu is open the region becomes a combobox: <i>role="combobox"</i>, <i>aria-autocomplete="list"</i>, <i>aria-expanded</i> and <i>aria-activedescendant</i> pointing at the highlighted entry, with the popover as a
            <i>listbox</i> of <i>option</i>s. When the menu closes it reverts to a plain textbox. Block, table and navigator menus are not type-ahead comboboxes and stay <i>menu</i> / <i>menuitem</i>.
        </p>
        <p>
            The static toolbar and the floating one are <i>role="toolbar"</i> with an accessible name and an orientation. Toggle buttons announce their state through <i>aria-pressed</i>, and upload progress is wrapped in a <i>role="status"</i> live
            region so progress and errors are announced.
        </p>
        <h3>Keyboard Support</h3>
        <p>
            In the content, <i>Ctrl/Cmd + B</i>, <i>I</i> and <i>U</i> toggle bold, italic and underline, <i>Ctrl/Cmd + Z</i> and <i>Ctrl/Cmd + Shift + Z</i> (or <i>Ctrl + Y</i>) step through history, <i>Enter</i> splits list items, and <i>Tab</i> /
            <i>Shift + Tab</i> indent a list item or move between table cells. <i>Backspace</i> on an empty list item lifts it out of the list.
        </p>
        <p>Toolbar buttons are native buttons in the standard tab order, activated with <i>Enter</i> or <i>Space</i>, and <i>Escape</i> closes any open popover.</p>
        <p>
            The slash and mention menus share one popover primitive, so arrow keys, <i>Enter</i> and <i>Escape</i> behave identically in both, and the active entry is marked with <i>data-p-focus</i> rather than focused outright - the caret has to
            stay in the document while the query is still being typed. Submenus follow the same pattern.
        </p>
        <p>
            In a table, <i>Shift + Arrow</i> extends a multi-cell selection, <i>Escape</i> clears it, and <i>Delete</i> or <i>Backspace</i> clears the contents of the selected cells rather than removing them. In block mode <i>Ctrl/Cmd + A</i>
            selects the current block first and the document on the second press.
        </p>
        <h3>Motion</h3>
        <p>Every editor animation and transition is disabled under <i>prefers-reduced-motion: reduce</i>.</p>
    </app-docsectiontext>`
})
export class AccessibilityDoc {}
