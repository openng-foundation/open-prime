import { NgModule } from '@angular/core';
import { TaskBoard } from './taskboard';
import { TaskBoardCard } from './taskboard-card';
import { TaskBoardColumn } from './taskboard-column';
import { TaskBoardContent } from './taskboard-content';
import { TaskBoardDragConfirm, TaskBoardDragPreview, TaskBoardDropIndicator, TaskBoardRuntimeDropIndicator } from './taskboard-overlays';
import {
    TaskBoardCardAdd,
    TaskBoardCardContent,
    TaskBoardCardFooter,
    TaskBoardCardHeader,
    TaskBoardColumnAdd,
    TaskBoardColumnContent,
    TaskBoardColumnEmpty,
    TaskBoardColumnFooter,
    TaskBoardColumnHeader,
    TaskBoardHeader,
    TaskBoardLoading,
    TaskBoardSwimlaneColumnHeader,
    TaskBoardSwimlaneHeader
} from './taskboard-parts';
import { TASKBOARD_DEFS } from './taskboard-registry';
import { TASKBOARD_UI_PARTS } from './taskboard-ui';

/** The structural runtime: the root, the layout parts and the drag surfaces. */
const RUNTIME = [
    TaskBoard,
    TaskBoardHeader,
    TaskBoardContent,
    TaskBoardColumn,
    TaskBoardColumnHeader,
    TaskBoardColumnContent,
    TaskBoardColumnFooter,
    TaskBoardColumnEmpty,
    TaskBoardColumnAdd,
    TaskBoardCard,
    TaskBoardCardHeader,
    TaskBoardCardContent,
    TaskBoardCardFooter,
    TaskBoardCardAdd,
    TaskBoardDragPreview,
    TaskBoardDragConfirm,
    TaskBoardDropIndicator,
    TaskBoardRuntimeDropIndicator,
    TaskBoardLoading,
    TaskBoardSwimlaneHeader,
    TaskBoardSwimlaneColumnHeader
];

/**
 * The complete TaskBoard composition surface.
 *
 * Everything in one import, which is the normal consumer path. Unlike the Scheduler there is no
 * per-view engine to leave behind: every board runs the same root, so importing the parts
 * individually narrows the declarations a feature sees without narrowing the runtime it pulls in.
 *
 * The supplied visual parts are exported alongside the structural ones, so a board that wants the
 * stock card and header gets them from the same module. A product replacing them simply stops using
 * them; nothing structural depends on them.
 *
 * @group Components
 */
@NgModule({
    imports: [...RUNTIME, ...TASKBOARD_UI_PARTS, ...TASKBOARD_DEFS],
    exports: [...RUNTIME, ...TASKBOARD_UI_PARTS, ...TASKBOARD_DEFS]
})
export class TaskBoardModule {}

/**
 * Only the supplied visual parts.
 *
 * For a board that composes the structural parts itself — through focused standalone imports — and
 * still wants the stock card and headers.
 *
 * @group Components
 */
@NgModule({
    imports: [...TASKBOARD_UI_PARTS],
    exports: [...TASKBOARD_UI_PARTS]
})
export class TaskBoardUIModule {}
