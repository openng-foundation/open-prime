import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { SelectButtonModule } from '@openng/optimus-ui/selectbutton';
import { TaskBoardModule } from '@openng/optimus-ui/taskboard';
import type { TaskBoardColumnModel, TaskBoardItem } from '@openng/optimus-ui/types/taskboard';
import { demoColumnsWithLimit, demoTasks } from './demo-data';

@Component({
    selector: 'customstyles-doc',
    standalone: true,
    imports: [AppDocSectionText, FormsModule, SelectButtonModule, TaskBoardModule, AppCode],
    changeDetection: ChangeDetectionStrategy.OnPush,
    styles: `
        /* Scoped to a class on the board, not written globally: two boards on the same page have to be
           able to disagree about spacing, colour and treatment. */
        .taskboard-ops {
            --p-taskboard-background: #07110d;
            --p-taskboard-color: #d1fae5;
            --p-taskboard-column-background: #091712;
            --p-taskboard-column-border-radius: 0;
            --p-taskboard-column-gap: 0;
            --p-taskboard-card-gap: 0.375rem;
            --p-taskboard-drop-indicator-color: #34d399;
            --p-taskboard-card-selected-ring-color: #34d399;
            --p-taskboard-swimlane-border-color: rgba(16, 185, 129, 0.2);
            --p-taskboard-empty-color: rgba(167, 243, 208, 0.45);
        }

        .taskboard-ops .taskboard-card {
            background: rgba(6, 78, 59, 0.35);
            border-color: rgba(16, 185, 129, 0.25);
            border-radius: 0;
        }

        .taskboard-ops .taskboard-card-title {
            font-family: ui-monospace, SFMono-Regular, monospace;
            letter-spacing: -0.01em;
        }

        /* Identity, not order: the lane is addressed by what it IS, so reordering the columns does not
           move the treatment onto a different one. */
        .taskboard-ops [data-column-id='review'] .p-taskboard-drop-indicator::before {
            background: #fbbf24;
            box-shadow: none;
        }

        /* A runtime state class, so this follows the board's own decision rather than duplicating it. */
        .taskboard-ops .p-taskboard-column-wip-exceeded .taskboard-column-header-title::after {
            content: ' · over capacity';
            font-weight: 400;
            color: #fca5a5;
        }

        /* The chips come from Tag and Avatar and carry their own tokens, so a board-scoped theme has to
           reach them too — otherwise they stay light on a dark surface. */
        .taskboard-ops .p-tag {
            background: rgba(16, 185, 129, 0.16);
            color: #a7f3d0;
            border-radius: 0;
        }

        .taskboard-ops .p-avatar {
            background: rgba(16, 185, 129, 0.22);
            color: #d1fae5;
        }

        .taskboard-ops .taskboard-column-header-meta--neutral {
            background: rgba(16, 185, 129, 0.16);
            border-color: rgba(16, 185, 129, 0.35);
            color: #a7f3d0;
        }

        .taskboard-ops .taskboard-column-header-collapse-toggle {
            color: rgba(167, 243, 208, 0.6);
        }
    `,
    template: `
        <app-docsectiontext>
            <p>
                There are four ways in, and they are meant for different jobs. A DESIGN TOKEN changes a decision for every board — <i>taskboard.column.min.width</i>, <i>taskboard.card.gap</i> — and belongs in the preset. A CSS variable scoped to a
                class on the root changes it for one board. A DATA ATTRIBUTE targets a specific column, card or row by identity. A RUNTIME STATE CLASS follows a decision the board has already taken.
            </p>
            <p>
                Scope product overrides to a local class rather than writing them globally: two boards on the same page have to be able to disagree, and a global override makes the second one a hostage of the first. The example below is one class
                doing all four things.
            </p>
            <p>
                Prefer a state class over recomputing the state. <i>p-taskboard-column-wip-exceeded</i> is on the column whenever the board thinks the lane is over capacity, so a rule keyed to it cannot drift from the validation that refuses the drop
                — which a second copy of the arithmetic in CSS would.
            </p>
            <p>Density is the one knob that is an input rather than a stylesheet: it moves the column padding and the card gap together, and adds <i>p-taskboard-density-*</i> for anything else that has to follow.</p>
            <p>
                The variables the board reads are the design tokens under <i>taskboard.*</i>, so the Theming tab above is the full list. The ones a product override reaches for most are <i>--p-taskboard-background</i>,
                <i>--p-taskboard-border-color</i>, <i>--p-taskboard-column-background</i>, <i>--p-taskboard-column-gap</i>, <i>--p-taskboard-card-gap</i>, <i>--p-taskboard-card-border-radius</i>, <i>--p-taskboard-drop-indicator-color</i>,
                <i>--p-taskboard-card-selected-ring-color</i> and the four <i>--p-taskboard-column-status-*-color</i> accents.
            </p>
        </app-docsectiontext>
        <div class="card">
            <p-selectbutton [options]="themes" [ngModel]="theme()" (ngModelChange)="theme.set($event)" [allowEmpty]="false" class="mb-4" />
            <div style="height: 26rem">
                <p-taskboard-root [class.taskboard-ops]="theme() === 'operations'" [tasks]="tasks()" (tasksChange)="tasks.set($event)" dataKey="id" columnField="columnId" [columns]="columns" selectionMode="multiple">
                    <p-taskboard-content>
                        @for (column of columns; track column.id) {
                            <p-taskboard-column [column]="column" [value]="column.id" [label]="column.label">
                                <ng-template pTaskBoardColumnDef let-columnContext>
                                    <p-taskboard-column-header><p-taskboard-column-header-ui /></p-taskboard-column-header>
                                    <p-taskboard-column-content>
                                        @for (item of columnContext.visibleItems; track item.id) {
                                            <p-taskboard-card [item]="item"><p-taskboard-card-ui /></p-taskboard-card>
                                        } @empty {
                                            <p-taskboard-column-empty />
                                        }
                                    </p-taskboard-column-content>
                                </ng-template>
                            </p-taskboard-column>
                        }
                    </p-taskboard-content>
                    <p-taskboard-drag-preview />
                </p-taskboard-root>
            </div>
        </div>
        <app-code></app-code>
    `
})
export class CustomStylesDoc {
    readonly columns: TaskBoardColumnModel[] = demoColumnsWithLimit();

    readonly tasks = signal<TaskBoardItem[]>(demoTasks('cst'));

    readonly themes = ['default', 'operations'];

    readonly theme = signal('operations');
}
