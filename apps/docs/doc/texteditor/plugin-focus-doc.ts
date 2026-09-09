import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TEXT_EDITOR_CONTEXT, TextEditorModule } from '@openng/optimus-ui/texteditor';
import type { TextEditorPluginRegistration } from '@openng/optimus-ui/types/texteditor';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { focusPlugin } from '@/plugins/texteditor';

/** The toolbar half: a widget calling into the plugin's namespace. */
@Component({
    selector: 'plugin-focus-doc-buttons',
    standalone: true,
    template: `
        <div class="p-text-editor-ui-toolbar">
            <button type="button" class="p-text-editor-ui-menu-item" (click)="ctx.pluginCommands()['focus']?.['toggle']()">Focus mode</button>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PluginFocusDocButtons {
    readonly ctx = inject(TEXT_EDITOR_CONTEXT);
}

@Component({
    selector: 'plugin-focus-doc',
    standalone: true,
    imports: [TextEditorModule, PluginFocusDocButtons, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>Dims every block except the one the caret is in. The dimming is a decoration, so it never reaches the value: focus mode is a view concern.</p>
        </app-docsectiontext>
        <div class="card">
            <p-text-editor-root [(value)]="value" [plugins]="plugins" ariaLabel="Focus plugin">
                <p-text-editor-toolbar>
                    <plugin-focus-doc-buttons />
                </p-text-editor-toolbar>
                <p-text-editor-content height="14rem" />
            </p-text-editor-root>
        </div>
        <app-code></app-code>
    `
})
export class PluginFocusDoc {
    readonly value = signal<string | undefined>('<p>Click Focus Mode, then move the caret between paragraphs.</p><p>Every block except the one you are in fades out.</p><p>This helps you concentrate on the current line.</p>');

    readonly plugins: TextEditorPluginRegistration[] = [focusPlugin];
}
