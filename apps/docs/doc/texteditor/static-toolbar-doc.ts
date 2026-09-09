import { Component, signal } from '@angular/core';
import { TextEditorModule } from '@openng/optimus-ui/texteditor';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ToolbarBoldUI, ToolbarItalicUI, ToolbarStrikethroughUI, ToolbarUnderlineUI } from '@/components/texteditor';

@Component({
    selector: 'static-toolbar-doc',
    standalone: true,
    imports: [TextEditorModule, ToolbarBoldUI, ToolbarItalicUI, ToolbarUnderlineUI, ToolbarStrikethroughUI, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                <i>p-text-editor-toolbar</i> is a persistent <i>role="toolbar"</i> surface above the content. The widget inside reads <i>commands</i> and <i>state</i> from the <i>pTextEditorToolbarDef</i> slot template, or from
                <i>TEXT_EDITOR_CONTEXT</i> when it is a projected component.
            </p>
            <p>The toolbar publishes its height on the root as <i>--p-text-editor-toolbar-height</i>, so the navigator and the block controls offset themselves without coupling to source order.</p>
        </app-docsectiontext>
        <div class="card">
            <p-text-editor-root [(value)]="value" ariaLabel="Comment example">
                <p-text-editor-toolbar>
                    <ng-template pTextEditorToolbarDef let-commands="commands" let-state="state">
                        <div class="flex items-center gap-1 p-2">
                            <button type="button" class="p-text-editor-ui-button" [attr.aria-pressed]="state.bold" (click)="commands.bold()">B</button>
                            <button type="button" class="p-text-editor-ui-button" [attr.aria-pressed]="state.italic" (click)="commands.italic()">I</button>
                            <button type="button" class="p-text-editor-ui-button" [attr.aria-pressed]="state.underline" (click)="commands.underline()">U</button>
                        </div>
                    </ng-template>
                </p-text-editor-toolbar>
                <p-text-editor-content height="12rem" placeholder="Write a comment..." />
            </p-text-editor-root>
        </div>
        <app-docsectiontext>
            <p>A projected component works the same way, and is the shape to reach for when the widget needs its own class.</p>
        </app-docsectiontext>
        <div class="card">
            <p-text-editor-root [(value)]="second" ariaLabel="Comment with widgets example">
                <p-text-editor-toolbar>
                    <div class="p-text-editor-ui-toolbar">
                        <bold-ui />
                        <italic-ui />
                        <underline-ui />
                        <strikethrough-ui />
                    </div>
                </p-text-editor-toolbar>
                <p-text-editor-content height="12rem" placeholder="Type here..." />
            </p-text-editor-root>
        </div>
        <app-code></app-code>
    `
})
export class StaticToolbarDoc {
    readonly value = signal<string | undefined>(undefined);

    readonly second = signal<string | undefined>(undefined);
}
