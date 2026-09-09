import { defineTextEditorPlugin } from '@openng/optimus-ui/texteditor';

/**
 * The smallest possible plugin: one command, no ProseMirror access.
 */
export const uppercasePlugin = defineTextEditorPlugin('uppercase', (ctx) => ({
    commands: {
        run: () => ctx.replaceSelection(ctx.getSelectedText().toUpperCase())
    }
}));
