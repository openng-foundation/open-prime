import { Component } from '@angular/core';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'architecture-doc',
    standalone: true,
    imports: [AppDocSectionText],
    template: ` <app-docsectiontext>
        <p>
            TextEditor has two layers. The runtime owns the document model, the schema, command dispatch, state derivation, history, selection and the ProseMirror wiring; the application owns the toolbar buttons, the context toolbar, the slash and
            block menus, the mention list, the upload UI and the styling.
        </p>
        <p>
            Each part renders an empty surface and exposes its <i>commands</i>, <i>state</i> and request data through a matching context token resolved with <i>inject(...)</i>, or through its <i>*Def</i> slot template. That is why the editor ships no
            widgets: the application brings them, and the runtime keeps the document behaviour identical whatever they look like.
        </p>
        <h3>Editing Modes</h3>
        <p>
            <i>mode</i> selects the editing surface, and with it the shape of the value. <i>classic</i> binds to an HTML string and puts a fixed toolbar above one content area - a comment box or an article body. <i>block</i> binds to an array of HTML
            strings, one per block, where each entry drags to reorder, opens a per-block options menu and accepts new content from the slash palette.
        </p>
        <p>Markdown is a feature rather than a mode: <i>markdown</i> works in both.</p>
        <h3>Plugins</h3>
        <p>Plugins register new capabilities at the runtime layer without forking the editor: they add commands, contribute nodes and marks to the per-instance schema, register ProseMirror plugins, and reach external services.</p>
        <h3>ProseMirror</h3>
        <p>
            The document model is ProseMirror. The packages are optional peer dependencies, so an application that never mounts the editor does not pay for them, and an application that does gets the real thing: <i>getView()</i> and
            <i>getState()</i> return the live <i>EditorView</i> and <i>EditorState</i>, <i>runCommand()</i> takes a ProseMirror <i>Command</i>, and <i>registerProseMirrorPlugin()</i> attaches a plugin to the running editor.
        </p>
    </app-docsectiontext>`
})
export class ArchitectureDoc {}
