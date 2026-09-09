import type { TextEditorPlugin, TextEditorPluginCommands, TextEditorPluginContext, TextEditorPluginExpose, TextEditorPluginOptions, TextEditorPluginRegistration } from '@openng/optimus-ui/types/texteditor';
import type { Command, EditorState, Plugin } from 'prosemirror-state';
import type { EditorView } from 'prosemirror-view';

/**
 * Creates a plugin. The result goes into the `plugins` input on `p-text-editor-root`, and the
 * commands it returns show up under `pluginCommands[name]`.
 *
 * The definition itself is framework-agnostic: it never touches Angular, only the editor context.
 *
 * @group Function
 */
export function defineTextEditorPlugin<TOptions = unknown>(name: string, install: (context: TextEditorPluginContext<TOptions>) => TextEditorPluginExpose | void, options?: TextEditorPluginOptions<TOptions>): TextEditorPlugin<TOptions> {
    return { name, install, options };
}

/**
 * What the editor hands the plugin layer. Mirrors the plugin context, plus the callback that
 * publishes the collected commands.
 */
export interface PluginHostDeps {
    /**
     * Returns the plain text of the current selection.
     */
    getSelectedText: () => string;
    /**
     * Replaces the current selection with the given content.
     */
    replaceSelection: (content: string, asHtml?: boolean) => void;
    /**
     * Returns the editor's content DOM element, or null before mount.
     */
    getEditorElement: () => HTMLElement | null;
    /**
     * The current ProseMirror EditorState, or null before mount.
     */
    getState: () => EditorState | null;
    /**
     * The live ProseMirror EditorView, or null before mount.
     */
    getView: () => EditorView | null;
    /**
     * Attaches a ProseMirror plugin to the live editor; returns a remover.
     */
    registerProseMirrorPlugin: (plugin: Plugin) => () => void;
    /**
     * Runs a ProseMirror command against the editor.
     */
    runCommand: (command: Command) => boolean;
    /**
     * Publishes the namespaced command map.
     */
    setCommands: (commands: TextEditorPluginCommands) => void;
}

/**
 * Installs every registered plugin once, collects the commands they contribute, and returns the
 * cleanups the editor runs when the view is torn down.
 *
 * @group Function
 */
export function installPlugins(registrations: TextEditorPluginRegistration[], deps: PluginHostDeps): Array<() => void> {
    const cleanups: Array<() => void> = [];
    const commands: TextEditorPluginCommands = {};

    for (const registration of registrations ?? []) {
        const plugin = Array.isArray(registration) ? registration[0] : registration;
        const options = Array.isArray(registration) ? registration[1] : undefined;
        const context: TextEditorPluginContext = {
            options,
            getSelectedText: deps.getSelectedText,
            replaceSelection: deps.replaceSelection,
            getEditorElement: deps.getEditorElement,
            getState: deps.getState,
            getView: deps.getView,
            registerProseMirrorPlugin: (prosemirrorPlugin) => {
                const remove = deps.registerProseMirrorPlugin(prosemirrorPlugin);

                cleanups.push(remove);

                return remove;
            },
            runCommand: deps.runCommand,
            onUnmounted: (fn) => cleanups.push(fn)
        };

        try {
            const exposed = plugin.install(context) || undefined;

            if (exposed && exposed.commands) commands[plugin.name] = exposed.commands;
        } catch (error) {
            /* One plugin throwing must not take the editor - or the cleanups the plugins before it
               already registered - down with it. */
            console.error(`[optimus-ui] TextEditor plugin "${plugin.name}" failed to install.`, error);
        }
    }

    deps.setCommands(commands);

    return cleanups;
}
