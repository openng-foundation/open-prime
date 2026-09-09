import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TEXT_EDITOR_CONTEXT, TextEditorModule } from '@openng/optimus-ui/texteditor';
import type { TextEditorPluginRegistration } from '@openng/optimus-ui/types/texteditor';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { invisibleCharactersPlugin } from '@/plugins/texteditor';

/** The toolbar half: a widget calling into the plugin's namespace. */
@Component({
    selector: 'plugin-invisible-characters-doc-buttons',
    standalone: true,
    template: `
        <div class="p-text-editor-ui-toolbar">
            <button type="button" class="p-text-editor-ui-menu-item" (click)="ctx.pluginCommands()['invisibleCharacters']?.['toggle']()">Invisible characters</button>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PluginInvisibleCharactersDocButtons {
    readonly ctx = inject(TEXT_EDITOR_CONTEXT);
}

@Component({
    selector: 'plugin-invisible-characters-doc',
    standalone: true,
    imports: [TextEditorModule, PluginInvisibleCharactersDocButtons, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>Toggles markers for spaces and paragraph breaks, which is how a double space or a stray tab becomes visible. Widget decorations again, so the document is untouched.</p>
        </app-docsectiontext>
        <div class="card">
            <p-text-editor-root [(value)]="value" [plugins]="plugins" ariaLabel="Invisible characters plugin">
                <p-text-editor-toolbar>
                    <plugin-invisible-characters-doc-buttons />
                </p-text-editor-toolbar>
                <p-text-editor-content height="14rem" />
            </p-text-editor-root>
        </div>
        <app-code></app-code>
    `
})
export class PluginInvisibleCharactersDoc {
    readonly value = signal<string | undefined>('<p>Toggle invisible characters to reveal spaces and paragraph breaks.</p><p>Useful for spotting double spaces or stray whitespace.</p>');

    readonly plugins: TextEditorPluginRegistration[] = [invisibleCharactersPlugin];
}
