import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TEXT_EDITOR_CONTEXT, TextEditorModule } from '@openng/optimus-ui/texteditor';
import type { TextEditorPluginRegistration } from '@openng/optimus-ui/types/texteditor';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { typographyPlugin } from '@/plugins/texteditor';

/** The toolbar half: a widget calling into the plugin's namespace. */
@Component({
    selector: 'plugin-typography-doc-buttons',
    standalone: true,
    template: `
        <div class="p-text-editor-ui-toolbar">
            <span class="p-text-editor-ui-menu-shortcut">No commands: the plugin reacts to typing.</span>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PluginTypographyDocButtons {
    readonly ctx = inject(TEXT_EDITOR_CONTEXT);
}

@Component({
    selector: 'plugin-typography-doc',
    standalone: true,
    imports: [TextEditorModule, PluginTypographyDocButtons, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                Smart replacements while typing, through ProseMirror input rules the plugin registers with <i>registerProseMirrorPlugin()</i> and removes again from <i>onUnmounted()</i>. Nothing here is a command the user calls; the plugin reacts to
                what is typed.
            </p>
        </app-docsectiontext>
        <div class="card">
            <p-text-editor-root [(value)]="value" [plugins]="plugins" ariaLabel="Typography plugin">
                <p-text-editor-toolbar>
                    <plugin-typography-doc-buttons />
                </p-text-editor-toolbar>
                <p-text-editor-content height="14rem" />
            </p-text-editor-root>
        </div>
        <app-code></app-code>
    `
})
export class PluginTypographyDoc {
    readonly value = signal<string | undefined>('<p>Type -- for an en dash, ... for an ellipsis, -&gt; for an arrow, (c) for copyright, or 1/2 for a fraction.</p>');

    readonly plugins: TextEditorPluginRegistration[] = [typographyPlugin];
}
