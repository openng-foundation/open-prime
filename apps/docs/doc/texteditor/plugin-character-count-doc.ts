import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { TEXT_EDITOR_CONTEXT, TextEditorModule } from '@openng/optimus-ui/texteditor';
import type { TextEditorPluginRegistration } from '@openng/optimus-ui/types/texteditor';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import type { CharacterCountStats } from '@/plugins/texteditor';
import { characterCountPlugin } from '@/plugins/texteditor';

/** The counter half: it subscribes to the plugin rather than polling it. */
@Component({
    selector: 'plugin-character-count-footer',
    standalone: true,
    template: `
        @if (stats(); as counts) {
            <div class="p-text-editor-ui-toolbar" [style.color]="counts.over ? 'var(--p-texteditor-danger-color)' : null">
                <span>{{ counts.characters }}{{ counts.limit ? ' / ' + counts.limit : '' }} characters</span>
                <span>{{ counts.words }} words</span>
            </div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PluginCharacterCountFooter {
    readonly ctx = inject(TEXT_EDITOR_CONTEXT);

    readonly stats = signal<CharacterCountStats | null>(null);

    constructor() {
        effect((onCleanup) => {
            const subscribe = this.ctx.pluginCommands()['characterCount']?.['subscribe'] as ((listener: (value: CharacterCountStats) => void) => () => void) | undefined;

            if (!subscribe) return;

            const unsubscribe = subscribe((value) => this.stats.set(value));

            onCleanup(() => unsubscribe());
        });
    }
}

@Component({
    selector: 'plugin-character-count-doc',
    standalone: true,
    imports: [TextEditorModule, PluginCharacterCountFooter, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                Live character and word counts. The plugin registers a ProseMirror plugin whose view hook fires on every update, and exposes a <i>subscribe</i> command so a widget can follow the counts without polling. The limit is reported rather
                than enforced: truncating what someone is typing is worse than telling them they went over.
            </p>
        </app-docsectiontext>
        <div class="card">
            <p-text-editor-root [(value)]="value" [plugins]="plugins" ariaLabel="Character count plugin">
                <p-text-editor-content height="12rem" />
                <plugin-character-count-footer />
            </p-text-editor-root>
        </div>
        <app-code></app-code>
    `
})
export class PluginCharacterCountDoc {
    readonly value = signal<string | undefined>('<p>Start typing. The counter below updates live and turns red past 280 characters.</p>');

    readonly plugins: TextEditorPluginRegistration[] = [[characterCountPlugin, { limit: 280 }]];
}
