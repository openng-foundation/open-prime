import { Component } from '@angular/core';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'data-attributes-doc',
    standalone: true,
    imports: [AppDocSectionText],
    template: ` <app-docsectiontext>
        <p>
            Every part that renders DOM writes <i>data-scope="texteditor"</i> and a <i>data-part</i> on its root element. These are the stable styling and testing contract: class names may change between releases, the data attributes will not, so
            prefer them over descendant selectors that depend on private nesting.
        </p>
        <p>
            The parts are <i>root</i>, <i>toolbar</i>, <i>body</i>, <i>content</i>, <i>block-controls</i>, <i>context-toolbar</i>, <i>context-toolbar-more</i>, <i>block-menu</i>, <i>block-submenu</i>, <i>slash-menu</i>, <i>mention-menu</i>,
            <i>navigator</i>, <i>navigator-menu</i>, and the three table menus with their submenus: <i>table-column-menu</i>, <i>table-row-menu</i>, <i>table-cell-menu</i>.
        </p>
        <p>
            Renderless parts have no DOM of their own and so carry no <i>data-part</i>: the navigator wrapper and its trigger, the table controls, and the upload overlays with their dropzone and progress halves. Target the widgets rendered inside
            them instead.
        </p>
        <p>
            The root also writes <i>data-id</i>, an instance id stable across server and client renders, plus <i>data-disabled</i> and <i>data-readonly</i> when those inputs are set, and <i>data-mode</i>. The block controls carry
            <i>data-block-type</i>, such as <i>text</i> or <i>heading:2</i>. Inside the content, empty blocks carry <i>data-placeholder</i>, checklist containers <i>data-p-checked-list</i> and checklist items <i>data-p-checked</i>.
        </p>
    </app-docsectiontext>`
})
export class DataAttributesDoc {}
