import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { TaskBoardModule } from '@openng/optimus-ui/taskboard';
import type { TaskBoardCardMovePayload, TaskBoardColumnModel, TaskBoardItem } from '@openng/optimus-ui/types/taskboard';

/** A support ticket: the id lives in `ticketId` and the workflow state in `stage`. */
interface SupportTicket extends TaskBoardItem {
    ticketId: string;
    subject: string;
    stage: 'new' | 'triaged' | 'investigating' | 'resolved';
    severity: 'critical' | 'major' | 'minor';
    reporter: string;
    order: number;
}

@Component({
    selector: 'data-doc',
    standalone: true,
    imports: [AppDocSectionText, TaskBoardModule, AppCode],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <app-docsectiontext>
            <p>
                The board reads three fields out of a record and nothing else: the id named by <i>dataKey</i>, the column named by <i>columnField</i> and, on a grouped board, the row named by <i>swimlaneField</i>. Point them at whatever your records
                already call those things — <i>ticketId</i> and <i>stage</i> here — and no mapping layer is needed.
            </p>
            <p>Drag a ticket to another column and watch <i>stage</i> change while the card keeps reading severity and reporter from the original object.</p>
        </app-docsectiontext>
        <div class="card">
            <div style="height: 26rem">
                <p-taskboard-root [tasks]="tickets()" (tasksChange)="tickets.set($event)" dataKey="ticketId" columnField="stage" [columns]="columns" (cardMove)="onCardMove($event)">
                    <p-taskboard-content>
                        @for (column of columns; track column.id) {
                            <p-taskboard-column [column]="column" [value]="column.id" [label]="column.label">
                                <ng-template pTaskBoardColumnDef let-columnContext>
                                    <p-taskboard-column-header><p-taskboard-column-header-ui /></p-taskboard-column-header>
                                    <p-taskboard-column-content>
                                        @for (ticket of columnContext.visibleItems; track ticket.ticketId) {
                                            <p-taskboard-card [item]="ticket">
                                                <div class="flex flex-col gap-2 rounded-md border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900 p-3">
                                                    <span class="text-sm font-semibold">{{ ticket.subject }}</span>
                                                    <span class="text-xs text-muted-color">{{ ticket.ticketId }} · {{ ticket.severity }} · {{ ticket.reporter }}</span>
                                                </div>
                                            </p-taskboard-card>
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
            <p class="mt-4 text-sm text-muted-color">{{ lastMove() }}</p>
        </div>
        <app-code></app-code>
    `
})
export class DataDoc {
    readonly columns: TaskBoardColumnModel[] = [
        { id: 'new', label: 'New', statusType: 'todo', order: 0 },
        { id: 'triaged', label: 'Triaged', statusType: 'todo', order: 1 },
        { id: 'investigating', label: 'Investigating', statusType: 'in-progress', order: 2 },
        { id: 'resolved', label: 'Resolved', statusType: 'done', order: 3 }
    ];

    readonly tickets = signal<SupportTicket[]>([
        { ticketId: 'TKT-001', subject: 'Login page returns 500', stage: 'investigating', severity: 'critical', reporter: 'Sarah Kim', order: 0 },
        { ticketId: 'TKT-002', subject: 'Export drops accents', stage: 'new', severity: 'minor', reporter: 'Luis Prat', order: 0 },
        { ticketId: 'TKT-003', subject: 'Invoice totals off by a cent', stage: 'triaged', severity: 'major', reporter: 'Mia Adler', order: 0 },
        { ticketId: 'TKT-004', subject: 'Slow search on large accounts', stage: 'new', severity: 'major', reporter: 'Tom Vega', order: 1 }
    ]);

    readonly lastMove = signal('Move a ticket to see the emitted payload.');

    onCardMove(payload: TaskBoardCardMovePayload): void {
        this.lastMove.set(`${payload.card['ticketId']}: ${payload.oldColumnId} → ${payload.newColumnId} at index ${payload.newIndex}`);
    }
}
