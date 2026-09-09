import { Code } from '@/domain/code';
import { Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'contexts-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                Every compound scope provides a typed context, and whatever renders inside injects the one it needs. That is what lets an application drop its own component into a wrapper without threading <i>selected</i>, <i>focused</i> and
                <i>dragging</i> through everything on the way — and what lets the same component be reused under a different board.
            </p>
            <p>Every value is a signal. The parts are stamped once and updated in place, so a child that captured a plain object would keep rendering the card it was first given.</p>
            <ul class="leading-relaxed">
                <li><i>TASKBOARD_CONTEXT</i> — the whole board contract. The advanced surface; prefer a narrower one.</li>
                <li><i>TASKBOARD_COLUMN_CONTEXT</i> — <i>value</i>, <i>label</i>, <i>columnData</i>, <i>items</i>, <i>visibleItems</i>, <i>itemCount</i>, <i>isCollapsed</i>, <i>toggleCollapse()</i>, <i>addItem()</i>.</li>
                <li><i>TASKBOARD_CARD_CONTEXT</i> — <i>item</i>, <i>column</i>, <i>isSelected</i>, <i>isFocused</i>, <i>isDisabled</i>, <i>isDragging</i>.</li>
                <li><i>TASKBOARD_SWIMLANE_HEADER_CONTEXT</i> — <i>swimlane</i>, <i>itemCount</i>, <i>isCollapsed</i>, <i>toggleCollapse()</i>.</li>
                <li><i>TASKBOARD_SWIMLANE_COLUMN_HEADER_CONTEXT</i> — <i>column</i>, <i>itemCount</i>.</li>
                <li><i>TASKBOARD_DROP_INDICATOR_CONTEXT</i> — <i>column</i>, <i>index</i>, <i>swimlane</i>.</li>
            </ul>
            <p>
                Template-only customisation can use a definition instead of a component: <i>pTaskBoardColumnDef</i>, <i>pTaskBoardDragPreviewDef</i>, <i>pTaskBoardDragConfirmDef</i> and <i>pTaskBoardDropIndicatorDef</i> hand over the same values
                already unwrapped, because Angular's <i>let-</i> microsyntax cannot call a signal.
            </p>
        </app-docsectiontext>
        <app-code [code]="code" [hideToggleCode]="true"></app-code>
    `
})
export class ContextsDoc {
    code: Code = {
        typescript: `import { Component, inject } from '@angular/core';
import { TASKBOARD_CARD_CONTEXT, type TaskBoardCardContext } from '@openng/optimus-ui/taskboard';

@Component({
    standalone: true,
    selector: 'app-work-card',
    template: \`<strong>{{ card.item().title }}</strong>\`
})
export class WorkCard {
    readonly card = inject<TaskBoardCardContext>(TASKBOARD_CARD_CONTEXT);

    // A component that may also render outside a board asks for it optionally.
    readonly maybeCard = inject<TaskBoardCardContext | null>(TASKBOARD_CARD_CONTEXT, { optional: true });
}`,
        html: `<p-taskboard-column [column]="column" [value]="column.id" [label]="column.label">
    <ng-template pTaskBoardColumnDef let-columnContext let-itemCount="itemCount">
        <p-taskboard-column-header>{{ columnContext.label }} ({{ itemCount }})</p-taskboard-column-header>
        <p-taskboard-column-content>
            @for (item of columnContext.visibleItems; track item.id) {
                <p-taskboard-card [item]="item"><app-work-card /></p-taskboard-card>
            }
        </p-taskboard-column-content>
        <p-taskboard-column-footer>
            <button type="button" (click)="columnContext.toggleCollapse()">Toggle</button>
        </p-taskboard-column-footer>
    </ng-template>
</p-taskboard-column>`
    };
}
