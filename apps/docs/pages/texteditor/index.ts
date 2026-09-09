import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { AccessibilityDoc } from '@/doc/texteditor/accessibility-doc';
import { ArchitectureDoc } from '@/doc/texteditor/architecture-doc';
import { BasicDoc } from '@/doc/texteditor/basic-doc';
import { BlockCompleteDoc } from '@/doc/texteditor/block-complete-doc';
import { BlockDoc } from '@/doc/texteditor/block-doc';
import { BlockMenuDoc } from '@/doc/texteditor/block-menu-doc';
import { BlockquoteDoc } from '@/doc/texteditor/blockquote-doc';
import { BoldDoc } from '@/doc/texteditor/bold-doc';
import { CodeBlockDoc } from '@/doc/texteditor/code-block-doc';
import { CodeDoc } from '@/doc/texteditor/code-doc';
import { ColorsDoc } from '@/doc/texteditor/colors-doc';
import { ContextToolbarDoc } from '@/doc/texteditor/context-toolbar-doc';
import { ControlledDoc } from '@/doc/texteditor/controlled-doc';
import { DataAttributesDoc } from '@/doc/texteditor/data-attributes-doc';
import { DocumentDoc } from '@/doc/texteditor/document-doc';
import { EventsDoc } from '@/doc/texteditor/events-doc';
import { FontDoc } from '@/doc/texteditor/font-doc';
import { FormsDoc } from '@/doc/texteditor/forms-doc';
import { HeadingDoc } from '@/doc/texteditor/heading-doc';
import { HistoryDoc } from '@/doc/texteditor/history-doc';
import { HorizontalRuleDoc } from '@/doc/texteditor/horizontal-rule-doc';
import { ImageDoc } from '@/doc/texteditor/image-doc';
import { ImportDoc } from '@/doc/texteditor/import-doc';
import { ItalicDoc } from '@/doc/texteditor/italic-doc';
import { LinkDoc } from '@/doc/texteditor/link-doc';
import { ListDoc } from '@/doc/texteditor/list-doc';
import { MarkdownDoc } from '@/doc/texteditor/markdown-doc';
import { MentionDoc } from '@/doc/texteditor/mention-doc';
import { NavigatorDoc } from '@/doc/texteditor/navigator-doc';
import { PluginCharacterCountDoc } from '@/doc/texteditor/plugin-character-count-doc';
import { PluginDetailsDoc } from '@/doc/texteditor/plugin-details-doc';
import { PluginEmojiDoc } from '@/doc/texteditor/plugin-emoji-doc';
import { PluginFocusDoc } from '@/doc/texteditor/plugin-focus-doc';
import { PluginInvisibleCharactersDoc } from '@/doc/texteditor/plugin-invisible-characters-doc';
import { PluginTypographyDoc } from '@/doc/texteditor/plugin-typography-doc';
import { PluginUppercaseDoc } from '@/doc/texteditor/plugin-uppercase-doc';
import { PluginsDoc } from '@/doc/texteditor/plugins-doc';
import { PrintDoc } from '@/doc/texteditor/print-doc';
import { ReadonlyDoc } from '@/doc/texteditor/readonly-doc';
import { SecurityDoc } from '@/doc/texteditor/security-doc';
import { SlashCommandsDoc } from '@/doc/texteditor/slash-commands-doc';
import { SlotsContextsDoc } from '@/doc/texteditor/slots-contexts-doc';
import { StaticToolbarDoc } from '@/doc/texteditor/static-toolbar-doc';
import { StrikethroughDoc } from '@/doc/texteditor/strikethrough-doc';
import { SubscriptDoc } from '@/doc/texteditor/subscript-doc';
import { SuperscriptDoc } from '@/doc/texteditor/superscript-doc';
import { TableDoc } from '@/doc/texteditor/table-doc';
import { TextAlignDoc } from '@/doc/texteditor/text-align-doc';
import { UnderlineDoc } from '@/doc/texteditor/underline-doc';

@Component({
    template: `<app-doc
        docTitle="Angular TextEditor Component - Optimus UI"
        header="TextEditor"
        description="TextEditor is a ProseMirror-based rich text editor with a classic toolbar, Notion-style blocks, markdown input rules and a fully template-driven UI."
        [docs]="docs"
        [apiDocs]="['TextEditor']"
        themeDocs="texteditor"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class TextEditorDemo {
    docs = [
        { id: 'import', label: 'Import', component: ImportDoc },
        { id: 'basic', label: 'Basic', component: BasicDoc },
        { id: 'architecture', label: 'Architecture', component: ArchitectureDoc },
        { id: 'static-toolbar', label: 'Static Toolbar', component: StaticToolbarDoc },
        { id: 'context-toolbar', label: 'Context Toolbar', component: ContextToolbarDoc },
        { id: 'bold', label: 'Bold', component: BoldDoc },
        { id: 'italic', label: 'Italic', component: ItalicDoc },
        { id: 'underline', label: 'Underline', component: UnderlineDoc },
        { id: 'strikethrough', label: 'Strikethrough', component: StrikethroughDoc },
        { id: 'code', label: 'Code', component: CodeDoc },
        { id: 'subscript', label: 'Subscript', component: SubscriptDoc },
        { id: 'superscript', label: 'Superscript', component: SuperscriptDoc },
        { id: 'colors', label: 'Colors', component: ColorsDoc },
        { id: 'font', label: 'Font', component: FontDoc },
        { id: 'heading', label: 'Heading', component: HeadingDoc },
        { id: 'list', label: 'List', component: ListDoc },
        { id: 'blockquote', label: 'Blockquote', component: BlockquoteDoc },
        { id: 'code-block', label: 'Code Block', component: CodeBlockDoc },
        { id: 'horizontal-rule', label: 'Horizontal Rule', component: HorizontalRuleDoc },
        { id: 'text-align', label: 'Text Align', component: TextAlignDoc },
        { id: 'link', label: 'Link', component: LinkDoc },
        { id: 'image', label: 'Image', component: ImageDoc },
        { id: 'document', label: 'Document', component: DocumentDoc },
        { id: 'mention', label: 'Mention', component: MentionDoc },
        { id: 'table', label: 'Table', component: TableDoc },
        { id: 'block', label: 'Block Mode', component: BlockDoc },
        { id: 'block-menu', label: 'Block Menu', component: BlockMenuDoc },
        { id: 'slash-commands', label: 'Slash Commands', component: SlashCommandsDoc },
        { id: 'block-complete', label: 'Complete', component: BlockCompleteDoc },
        { id: 'markdown', label: 'Markdown', component: MarkdownDoc },
        { id: 'navigator', label: 'Navigator', component: NavigatorDoc },
        { id: 'history', label: 'Undo & Redo', component: HistoryDoc },
        { id: 'print', label: 'Print', component: PrintDoc },
        { id: 'events', label: 'Events & Output', component: EventsDoc },
        { id: 'controlled', label: 'Controlled & Uncontrolled', component: ControlledDoc },
        { id: 'forms', label: 'Forms', component: FormsDoc },
        { id: 'readonly', label: 'Readonly & Disabled', component: ReadonlyDoc },
        { id: 'plugins', label: 'Plugins', component: PluginsDoc },
        { id: 'plugin-uppercase', label: 'Uppercase Plugin', component: PluginUppercaseDoc },
        { id: 'plugin-typography', label: 'Typography Plugin', component: PluginTypographyDoc },
        { id: 'plugin-emoji', label: 'Emoji Plugin', component: PluginEmojiDoc },
        { id: 'plugin-character-count', label: 'Character Count Plugin', component: PluginCharacterCountDoc },
        { id: 'plugin-focus', label: 'Focus Plugin', component: PluginFocusDoc },
        { id: 'plugin-invisible-characters', label: 'Invisible Characters Plugin', component: PluginInvisibleCharactersDoc },
        { id: 'plugin-details', label: 'Details Plugin', component: PluginDetailsDoc },
        { id: 'slots-contexts', label: 'Slots & Contexts', component: SlotsContextsDoc },
        { id: 'data-attributes', label: 'Data Attributes', component: DataAttributesDoc },
        { id: 'security', label: 'Security', component: SecurityDoc },
        { id: 'accessibility', label: 'Accessibility', component: AccessibilityDoc }
    ];
}
