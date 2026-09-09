import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { TaskBoardModule } from '@openng/optimus-ui/taskboard';
import type { TaskBoardColumnModel, TaskBoardItem } from '@openng/optimus-ui/types/taskboard';
import { demoColumns, demoTasks } from './demo-data';

@Component({
    selector: 'keyboard-doc',
    standalone: true,
    imports: [AppDocSectionText, TaskBoardModule, AppCode],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <app-docsectiontext>
            <p>
                The keyboard drives the same focus, selection, validation, mutation and history paths the pointer drives, so a keyboard move emits the same <i>cardMove</i>, <i>cardReorder</i> and <i>cardDropBlocked</i> as a drag. Click a card, or tab
                into the board, and try the table below.
            </p>
            <p>
                <i>Alt</i> is the movement modifier throughout — <i>Alt</i> with the up and down arrows reorders inside the lane, with left and right moves between columns, and <i>Alt</i> <i>Shift</i> crosses swimlanes — which is what keeps plain
                arrows safe to explore a board with.
            </p>
            <p>
                Board shortcuts step aside for anything inside a card that owns its own keys: native inputs, buttons and links, editable regions, and elements carrying an interactive ARIA role. A widget built out of generic <i>div</i>s needs that
                role, or <i>Space</i> on it will select the card instead.
            </p>
        </app-docsectiontext>
        <div class="card">
            <div class="mb-4 overflow-x-auto">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="text-left text-muted-color">
                            <th class="py-2 pr-4 font-semibold">Key</th>
                            <th class="py-2 font-semibold">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        @for (row of shortcuts; track row.keys) {
                            <tr class="border-t border-surface-200 dark:border-surface-700">
                                <td class="py-2 pr-4 whitespace-nowrap font-mono text-xs">{{ row.keys }}</td>
                                <td class="py-2">{{ row.action }}</td>
                            </tr>
                        }
                    </tbody>
                </table>
            </div>
            <div style="height: 26rem">
                <p-taskboard-root [tasks]="tasks()" (tasksChange)="tasks.set($event)" dataKey="id" columnField="columnId" [columns]="columns" selectionMode="multiple">
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
export class KeyboardDoc {
    readonly columns: TaskBoardColumnModel[] = demoColumns();

    readonly tasks = signal<TaskBoardItem[]>(demoTasks('k'));

    readonly shortcuts = [
        { keys: 'Arrow keys', action: 'Move the focus across cards, columns, empty columns and swimlane cells.' },
        { keys: 'Home, End', action: 'Focus the first or last card of the current cell.' },
        { keys: 'Tab, Shift Tab', action: 'Move to the next or previous column.' },
        { keys: 'Enter', action: 'Emit cardActivate for the focused card.' },
        { keys: 'Space', action: 'Toggle the focused card when selection is on.' },
        { keys: 'Shift Up, Shift Down', action: 'Extend the range inside the current cell.' },
        { keys: 'Ctrl/Cmd A', action: 'Select every card of the focused cell.' },
        { keys: 'Alt Up, Alt Down', action: 'Reorder the focused card, or the selected set, in its lane.' },
        { keys: 'Alt Left, Alt Right', action: 'Move to the previous or next column.' },
        { keys: 'Alt Shift Up, Alt Shift Down', action: 'Move to the previous or next swimlane.' },
        { keys: 'Escape', action: 'Cancel a pending confirmation or drag, then clear the selection, then the focus.' },
        { keys: 'Ctrl/Cmd Z', action: 'Undo the local history.' },
        { keys: 'Ctrl/Cmd Y, Ctrl/Cmd Shift Z', action: 'Redo the local history.' },
        { keys: 'Delete, Backspace', action: 'Reserved for your own controls; the board applies no default delete.' }
    ];
}
