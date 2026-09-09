import { Component, signal } from '@angular/core';
import { TextEditorModule } from '@openng/optimus-ui/texteditor';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { MentionListUI } from '@/components/texteditor';
import { MENTION_USERS } from './demo-data';

@Component({
    selector: 'mention-doc',
    standalone: true,
    imports: [TextEditorModule, MentionListUI, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                Mounting <i>p-text-editor-mention-menu</i> turns the <i>&#64;</i> trigger on. Three inputs drive it: <i>handler</i> resolves the candidates for the current query, <i>filterField</i> names the field they are filtered on, and
                <i>template</i> renders the text inserted for the one that is picked.
            </p>
            <p>The menu is generic over the item type, so a projected widget that injects <i>MENTION_MENU_CONTEXT</i> with a type argument gets typed items and a typed <i>commands.select(item)</i> back.</p>
        </app-docsectiontext>
        <div class="card">
            <p-text-editor-root [(value)]="value" ariaLabel="Mentions example">
                <p-text-editor-mention-menu [handler]="mentionHandler" filterField="name" [template]="mentionTemplate">
                    <mention-list-ui />
                </p-text-editor-mention-menu>
                <p-text-editor-content height="12rem" />
            </p-text-editor-root>
        </div>
        <app-code></app-code>
    `
})
export class MentionDoc {
    readonly value = signal<string | undefined>(undefined);

    readonly mentionHandler = () => MENTION_USERS;

    readonly mentionTemplate = (data: (typeof MENTION_USERS)[number]) => `@${data.name}`;
}
