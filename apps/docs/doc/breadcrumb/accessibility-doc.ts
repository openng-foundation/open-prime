import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'accessibility-doc',
    standalone: true,
    imports: [RouterModule, AppDocSectionText],
    template: ` <app-docsectiontext>
        <h3>Screen Reader</h3>
        <p>
            Breadcrumb uses the <i>nav</i> element and since any attribute is passed to the root implicitly <i>aria-labelledby</i> or <i>aria-label</i> can be used to describe the component. Inside an ordered list is used where the list item
            separators have <i>aria-hidden</i> to be able to ignored by the screen readers. If the last link represents the current route, <i>aria-current</i> is added with "page" as the value.
        </p>
        <p>
            The home item renders an icon, so when it has no <i>label</i> the link is named with the <i>homeAriaLabel</i> property. When <i>homeAriaLabel</i> is not defined either, the <i>aria.home</i> key of the
            <a routerLink="/configuration" fragment="locale">locale</a> configuration is used as the default.
        </p>

        <h3>Keyboard Support</h3>
        <p>No special keyboard interaction is needed, all menuitems are focusable based on the page tab sequence.</p>
    </app-docsectiontext>`
})
export class AccessibilityDoc {}
