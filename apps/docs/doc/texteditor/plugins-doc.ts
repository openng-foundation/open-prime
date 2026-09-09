import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TEXT_EDITOR_CONTEXT, TextEditorModule, defineTextEditorPlugin } from '@openng/optimus-ui/texteditor';
import type { TextEditorPluginRegistration } from '@openng/optimus-ui/types/texteditor';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

/**
 * The smallest possible plugin: one command, no ProseMirror access.
 */
const uppercasePlugin = defineTextEditorPlugin('uppercase', (ctx) => ({
    commands: {
        run: () => ctx.replaceSelection(ctx.getSelectedText().toUpperCase())
    }
}));

/**
 * A plugin with options. Commands land under `pluginCommands.wrap`.
 */
const wrapPlugin = defineTextEditorPlugin<{ prefix: string; suffix: string }>('wrap', ({ options, getSelectedText, replaceSelection }) => ({
    commands: {
        run: () => replaceSelection(`${options?.prefix ?? '('}${getSelectedText()}${options?.suffix ?? ')'}`)
    }
}));

/** A widget calling into the plugin namespace, the way any toolbar button would. */
@Component({
    selector: 'plugin-buttons',
    standalone: true,
    template: `
        <div class="p-text-editor-ui-toolbar">
            <button type="button" class="p-text-editor-ui-menu-item" [disabled]="!ctx.state().hasSelection" (click)="ctx.pluginCommands()['uppercase']?.['run']()">Uppercase</button>
            <button type="button" class="p-text-editor-ui-menu-item" [disabled]="!ctx.state().hasSelection" (click)="ctx.pluginCommands()['wrap']?.['run']()">Wrap in brackets</button>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PluginButtons {
    readonly ctx = inject(TEXT_EDITOR_CONTEXT);
}

@Component({
    selector: 'plugins-doc',
    standalone: true,
    imports: [TextEditorModule, PluginButtons, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                <i>defineTextEditorPlugin(name, install, options?)</i> creates a plugin. The commands it returns are exposed under <i>pluginCommands[name]</i>, and its install function receives the editor context: the selected text,
                <i>replaceSelection</i>, the live ProseMirror view and state, <i>registerProseMirrorPlugin</i>, <i>runCommand</i> and an <i>onUnmounted</i> hook.
            </p>
            <p>
                A <i>[plugin, options]</i> tuple passes configuration, and the optional third argument contributes nodes and marks to the per-instance schema or ProseMirror plugins to the initial state. The plugin set is frozen when the editor state
                is built, so every plugin has to be present on the initial render.
            </p>
            <p>
                The sections that follow are the plugins the docs ship: uppercase, typography, emoji, character count, focus, invisible characters and details. Plugins that depend on a third-party service - an AI rewrite, a translation API, a syntax
                highlighter - are written exactly the same way; they are left out of the docs because a demo of one is a demo of somebody's API key.
            </p>
        </app-docsectiontext>
        <div class="card">
            <p-text-editor-root [(value)]="value" [plugins]="plugins" ariaLabel="Plugins example">
                <p-text-editor-toolbar>
                    <plugin-buttons />
                </p-text-editor-toolbar>
                <p-text-editor-content height="12rem" />
            </p-text-editor-root>
        </div>
        <app-code></app-code>
    `
})
export class PluginsDoc {
    readonly value = signal<string | undefined>('<p>Select a few words and run one of the plugin commands.</p>');

    readonly plugins: TextEditorPluginRegistration[] = [uppercasePlugin, [wrapPlugin, { prefix: '[', suffix: ']' }]];
}
