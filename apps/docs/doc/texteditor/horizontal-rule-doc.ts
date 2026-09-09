import { Component, signal } from '@angular/core';
import { TextEditorModule } from '@openng/optimus-ui/texteditor';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ToolbarHorizontalRuleUI } from '@/components/texteditor';

@Component({
    selector: 'horizontal-rule-doc',
    standalone: true,
    imports: [TextEditorModule, ToolbarHorizontalRuleUI, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p><i>commands.insertHorizontalRule()</i> inserts a rule at the cursor. It carries no state flag, so the button needs no pressed binding, and <i>---</i> at the start of a line inserts one when markdown is enabled.</p>
        </app-docsectiontext>
        <div class="card">
            <p-text-editor-root [(value)]="value" ariaLabel="Horizontal rule example">
                <p-text-editor-toolbar>
                    <div class="p-text-editor-ui-toolbar">
                        <horizontal-rule-ui />
                    </div>
                </p-text-editor-toolbar>
                <p-text-editor-content height="12rem" placeholder="Type here..." />
            </p-text-editor-root>
        </div>
        <app-code></app-code>
    `
})
export class HorizontalRuleDoc {
    readonly value = signal<string | undefined>(undefined);
}
