import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TEXT_EDITOR_CONTEXT, TextEditorModule } from '@openng/optimus-ui/texteditor';
import type { TextEditorPluginRegistration } from '@openng/optimus-ui/types/texteditor';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { detailsPlugin } from '@/plugins/texteditor';

/** The toolbar half: a widget calling into the plugin's namespace. */
@Component({
    selector: 'plugin-details-doc-buttons',
    standalone: true,
    template: `
        <div class="p-text-editor-ui-toolbar">
            <button type="button" class="p-text-editor-ui-menu-item" (click)="ctx.pluginCommands()['details']?.['insert']('Details')">Insert details</button>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PluginDetailsDocButtons {
    readonly ctx = inject(TEXT_EDITOR_CONTEXT);
}

@Component({
    selector: 'plugin-details-doc',
    standalone: true,
    imports: [TextEditorModule, PluginDetailsDocButtons, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                A collapsible block, and the example of a plugin that extends the schema: three nodes contributed through the definition's <i>schema</i> option, round-tripping as plain <i>&lt;details&gt;</i> HTML. Schema contributions are frozen when
                the editor state is built, so the plugin has to be present on the first render.
            </p>
        </app-docsectiontext>
        <div class="card">
            <p-text-editor-root [(value)]="value" [plugins]="plugins" ariaLabel="Details plugin">
                <p-text-editor-toolbar>
                    <plugin-details-doc-buttons />
                </p-text-editor-toolbar>
                <p-text-editor-content height="14rem" />
            </p-text-editor-root>
        </div>
        <app-code></app-code>
    `
})
export class PluginDetailsDoc {
    readonly value = signal<string | undefined>('<details open><summary>What is a details block?</summary><div data-details-content><p>A collapsible section. Click Insert to add another, or click a summary to toggle it.</p></div></details><p></p>');

    readonly plugins: TextEditorPluginRegistration[] = [detailsPlugin];
}
