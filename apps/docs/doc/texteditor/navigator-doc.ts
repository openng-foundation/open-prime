import { Component, signal } from '@angular/core';
import { TextEditorModule } from '@openng/optimus-ui/texteditor';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { NavigatorMenuUI, NavigatorTriggerUI, ToolbarUI } from '@/components/texteditor';
import { DEMO_OUTLINE } from './demo-data';

@Component({
    selector: 'navigator-doc',
    standalone: true,
    imports: [TextEditorModule, ToolbarUI, NavigatorTriggerUI, NavigatorMenuUI, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                The navigator is a minimap of the document's heading structure. <i>navigator</i> on the root draws the rail; <i>p-text-editor-navigator</i> adds the interactive half, with a <i>Trigger</i> that opens on hover, focus, Enter, Space or
                ArrowDown and a <i>Menu</i> that lists the headings.
            </p>
            <p>Render the entries as <i>&lt;button role="menuitem"&gt;</i> so the popover's arrow-key navigation picks them up.</p>
        </app-docsectiontext>
        <div class="card">
            <p-text-editor-root [(value)]="value" navigator ariaLabel="Document with an outline example">
                <p-text-editor-toolbar>
                    <toolbar-ui />
                </p-text-editor-toolbar>
                <p-text-editor-navigator>
                    <p-text-editor-navigator-trigger>
                        <navigator-trigger-ui />
                    </p-text-editor-navigator-trigger>
                    <p-text-editor-navigator-menu>
                        <navigator-menu-ui />
                    </p-text-editor-navigator-menu>
                </p-text-editor-navigator>
                <p-text-editor-content height="18rem" />
            </p-text-editor-root>
        </div>
        <app-code></app-code>
    `
})
export class NavigatorDoc {
    readonly value = signal<string | undefined>(DEMO_OUTLINE);
}
