import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TEXT_EDITOR_CONTEXT, TextEditorModule } from '@openng/optimus-ui/texteditor';
import type { TextEditorPluginRegistration } from '@openng/optimus-ui/types/texteditor';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { emojiPlugin } from '@/plugins/texteditor';

/** The toolbar half: a widget calling into the plugin's namespace. */
@Component({
    selector: 'plugin-emoji-doc-buttons',
    standalone: true,
    template: `
        <div class="p-text-editor-ui-toolbar">
            @for (entry of emojis; track entry.shortcode) {
                <button type="button" class="p-text-editor-ui-button" [attr.aria-label]="entry.shortcode" (click)="ctx.pluginCommands()['emoji']?.['insert'](entry.shortcode)">{{ entry.emoji }}</button>
            }
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PluginEmojiDocButtons {
    readonly ctx = inject(TEXT_EDITOR_CONTEXT);

    readonly emojis = [
        { shortcode: 'fire', emoji: '\u{1F525}' },
        { shortcode: 'rocket', emoji: '\u{1F680}' },
        { shortcode: 'tada', emoji: '\u{1F389}' },
        { shortcode: 'sparkles', emoji: '\u2728' }
    ];
}

@Component({
    selector: 'plugin-emoji-doc',
    standalone: true,
    imports: [TextEditorModule, PluginEmojiDocButtons, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>Converts <i>:shortcode:</i> to an emoji as it is typed, and exposes <i>insert</i> and <i>list</i> commands so a picker can be built on the same map. The map is an option, passed as a <i>[plugin, options]</i> tuple.</p>
        </app-docsectiontext>
        <div class="card">
            <p-text-editor-root [(value)]="value" [plugins]="plugins" ariaLabel="Emoji plugin">
                <p-text-editor-toolbar>
                    <plugin-emoji-doc-buttons />
                </p-text-editor-toolbar>
                <p-text-editor-content height="14rem" />
            </p-text-editor-root>
        </div>
        <app-code></app-code>
    `
})
export class PluginEmojiDoc {
    readonly value = signal<string | undefined>('<p>Type :fire: or :rocket: and watch it become an emoji. Or use the buttons.</p>');

    readonly plugins: TextEditorPluginRegistration[] = [emojiPlugin];
}
