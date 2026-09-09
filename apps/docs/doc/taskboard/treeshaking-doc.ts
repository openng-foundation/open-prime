import { Code } from '@/domain/code';
import { Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'treeshaking-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p><i>TaskBoardModule</i> is the normal path: it exports the root, every compound part, the template definitions and the supplied visual parts. Reach for anything else only when a measurement says to.</p>
            <p>
                Importing the parts individually narrows the declarations a feature sees, and that is all it does. Unlike the Scheduler there is no per-view engine to leave behind — every board runs the same root, with the same keyboard handling,
                drag sensor, focus, history and printing — so a shorter import list is not a smaller runtime. Using an NgModule does not disable tree shaking either.
            </p>
            <p>What does make the initial bundle smaller is not loading the board on the first screen. Lazy-load the route that owns it, then measure the feature chunk before deciding whether the import list is worth changing.</p>
            <p>
                <i>TaskBoardUIModule</i> exports only the supplied visual parts, for a feature that composes the structural parts itself and still wants the stock card and headers. Those parts pull in Tag and Avatar; a board that replaces them with
                its own markup does not.
            </p>
        </app-docsectiontext>
        <app-code [code]="code" [hideToggleCode]="true"></app-code>
    `
})
export class TreeShakingDoc {
    code: Code = {
        typescript: `// The normal path: everything, in one import.
import { TaskBoardModule } from '@openng/optimus-ui/taskboard';

@Component({
    standalone: true,
    imports: [TaskBoardModule],
    templateUrl: './delivery-board.html'
})
export class DeliveryBoard {}

// A measured feature that renders only a few parts. Narrower declarations, same runtime.
import { TaskBoard, TaskBoardCard, TaskBoardColumn, TaskBoardColumnContent, TaskBoardColumnDef, TaskBoardColumnHeader, TaskBoardContent } from '@openng/optimus-ui/taskboard';

@Component({
    standalone: true,
    imports: [TaskBoard, TaskBoardContent, TaskBoardColumn, TaskBoardColumnDef, TaskBoardColumnHeader, TaskBoardColumnContent, TaskBoardCard],
    templateUrl: './focused-work-board.html'
})
export class FocusedWorkBoard {}

// The supplied visuals on their own, for a feature that composes the structure itself.
import { TaskBoardUIModule } from '@openng/optimus-ui/taskboard';

// What actually keeps the board out of the first chunk.
import type { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'work',
        loadComponent: () => import('./work/work-board').then((module) => module.WorkBoard)
    }
];`
    };
}
