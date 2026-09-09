import { Component } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TextEditorModule } from '@openng/optimus-ui/texteditor';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ToolbarUI } from '@/components/texteditor';

@Component({
    selector: 'forms-doc',
    standalone: true,
    imports: [TextEditorModule, ToolbarUI, ReactiveFormsModule, FormsModule, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                The root implements <i>ControlValueAccessor</i>, so it drops into reactive and template-driven forms directly - no wrapper directive and no <i>[(value)]</i> alongside it. <i>reset()</i> applies, <i>disable()</i> really blocks input,
                and the first edit marks the control touched.
            </p>
            <p>Set <i>name</i> and the root also renders a hidden input carrying the serialized value, so a plain <i>&lt;form&gt;</i> submit includes the content with no extra wiring.</p>
        </app-docsectiontext>
        <div class="card">
            <p-text-editor-root [formControl]="body" ariaLabel="Post body example">
                <p-text-editor-toolbar>
                    <toolbar-ui />
                </p-text-editor-toolbar>
                <p-text-editor-content height="14rem" />
            </p-text-editor-root>
            <div class="mt-2 flex items-center gap-2 text-sm text-muted-color">
                <span>status: {{ body.status }}</span>
                <span>touched: {{ body.touched }}</span>
                <button type="button" class="p-text-editor-ui-menu-item" (click)="body.reset('<p></p>')">Reset</button>
                <button type="button" class="p-text-editor-ui-menu-item" (click)="body.disabled ? body.enable() : body.disable()">{{ body.disabled ? 'Enable' : 'Disable' }}</button>
            </div>
        </div>
        <app-code></app-code>
    `
})
export class FormsDoc {
    readonly body = new FormControl('<p>Written through a form control.</p>', Validators.required);
}
