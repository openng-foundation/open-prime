import { Component } from '@angular/core';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'slots-contexts-doc',
    standalone: true,
    imports: [AppDocSectionText],
    template: ` <app-docsectiontext>
        <p>A part's content can be authored two ways, and both are supported.</p>
        <h3>Slot templates</h3>
        <p>
            Every part ships a structural directive that hands over the same values its context token carries, as typed template variables: <i>pTextEditorRootDef</i>, <i>pTextEditorToolbarDef</i>, <i>pTextEditorContextToolbarDef</i>,
            <i>pTextEditorContextToolbarMoreDef</i>, <i>pTextEditorBlockControlsDef</i>, <i>pTextEditorBlockMenuDef</i>, <i>pTextEditorBlockSubmenuDef</i>, <i>pTextEditorSlashMenuDef</i>, <i>pTextEditorMentionMenuDef</i>,
            <i>pTextEditorTableControlsDef</i>, the three table menu and submenu directives, the six upload directives, and <i>pTextEditorNavigatorTriggerDef</i> / <i>pTextEditorNavigatorMenuDef</i>.
        </p>
        <p>Values arrive already unwrapped - <i>blockType</i>, not <i>blockType()</i> - because the part reads its signals before handing them over, and <i>ngTemplateContextGuard</i> types every variable, so a typo fails the build.</p>
        <p>Both binding styles work: name the props you need with <i>let-commands="commands"</i>, or take the whole object with <i>*pTextEditorBlockMenuDef="let ctx"</i>.</p>
        <h3>Context tokens</h3>
        <p>
            For content that needs its own class, project a component and inject the token instead: <i>TEXT_EDITOR_CONTEXT</i>, <i>CONTEXT_TOOLBAR_CONTEXT</i>, <i>BLOCK_CONTROLS_CONTEXT</i>, <i>BLOCK_MENU_CONTEXT</i>, <i>SLASH_MENU_CONTEXT</i>,
            <i>MENTION_MENU_CONTEXT</i>, <i>UPLOAD_CONTEXT</i>, <i>TABLE_CONTROLS_CONTEXT</i>, <i>TABLE_COLUMN_MENU_CONTEXT</i>, <i>TABLE_ROW_MENU_CONTEXT</i>, <i>TABLE_CELL_MENU_CONTEXT</i> and <i>NAVIGATOR_CONTEXT</i>.
        </p>
        <p>
            On a context the reactive fields are signals, so a template reads <i>ctx.commands().duplicate()</i> and <i>{{ '{{' }} ctx.blockType() {{ '}}' }}</i>, and component logic derives from them with <i>computed</i>. The value serializers on
            <i>TEXT_EDITOR_CONTEXT</i> are plain methods.
        </p>
        <p><i>MENTION_MENU_CONTEXT</i> is generic over the item type: type the injection, and <i>items()</i> and <i>commands().select(item)</i> come back typed.</p>
        <h3>Imports</h3>
        <p>
            Every part is a standalone component, so a template can import just the ones it uses; <i>TextEditorModule</i> is the convenience barrel that brings all of them plus the slot directives. A rich text editor has a floor no import style
            removes - the ProseMirror runtime, the schema and the root machinery come along either way - so what careful imports drop is the parts that are never composed.
        </p>
    </app-docsectiontext>`
})
export class SlotsContextsDoc {}
