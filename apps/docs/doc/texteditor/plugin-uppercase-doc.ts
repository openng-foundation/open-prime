import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TEXT_EDITOR_CONTEXT, TextEditorModule } from '@openng/optimus-ui/texteditor';
import type { TextEditorPluginRegistration } from '@openng/optimus-ui/types/texteditor';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { uppercasePlugin } from '@/plugins/texteditor';

/** The toolbar half: a widget calling into the plugin's namespace. */
@Component({
    selector: 'plugin-uppercase-doc-buttons',
    standalone: true,
    template: `
        <div class="p-text-editor-ui-toolbar">
            <button type="button" class="p-text-editor-ui-menu-item" [disabled]="!ctx.state().hasSelection" (click)="ctx.pluginCommands()['uppercase']?.['run']()">Uppercase</button>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PluginUppercaseDocButtons {
    readonly ctx = inject(TEXT_EDITOR_CONTEXT);
}

@Component({
    selector: 'plugin-uppercase-doc',
    standalone: true,
    imports: [TextEditorModule, PluginUppercaseDocButtons, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>The minimal plugin: one command, no ProseMirror access. It reads the selection with <i>getSelectedText()</i> and writes it back with <i>replaceSelection()</i>, and the command lands under <i>pluginCommands.uppercase</i>.</p>
        </app-docsectiontext>
        <div class="card">
            <p-text-editor-root [(value)]="value" [plugins]="plugins" ariaLabel="Uppercase plugin">
                <p-text-editor-toolbar>
                    <plugin-uppercase-doc-buttons />
                </p-text-editor-toolbar>
                <p-text-editor-content height="14rem" />
            </p-text-editor-root>
        </div>
        <app-code></app-code>
    `
})
export class PluginUppercaseDoc {
    readonly value = signal<string | undefined>('<p>Select some text and click Uppercase.</p>');

    readonly plugins: TextEditorPluginRegistration[] = [uppercasePlugin];
}
