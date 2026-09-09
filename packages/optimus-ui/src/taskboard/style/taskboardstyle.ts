import { Injectable } from '@angular/core';
import { style } from '@openng/optimus-ui-styles/taskboard';
import { BaseStyle } from '@openng/optimus-ui/base';

// The interaction states come from here rather than from an imperative classList write: the root
// carries a [class] binding, and writing classes behind its back leaves the result at the mercy of
// when that binding next evaluates.
const classes = {
    root: ({ instance }) => [
        'p-taskboard p-component',
        `p-taskboard-density-${instance.density()}`,
        {
            'p-taskboard-disabled': instance.disabled(),
            'p-taskboard-readonly': instance.readonly(),
            'p-taskboard-non-scrollable': !instance.scrollable(),
            'p-taskboard-rtl': instance.rtl(),
            'p-taskboard-loading-active': instance.loading(),
            'p-taskboard-pressing': instance.taskBoardState.pressing(),
            'p-taskboard-dragging': instance.taskBoardState.dragging(),
            'p-taskboard-column-reordering': instance.taskBoardState.reorderingColumnId() != null
        }
    ]
};

@Injectable()
export class TaskBoardStyle extends BaseStyle {
    name = 'taskboard';

    style = style;

    classes = classes;
}

/**
 *
 * TaskBoard is a compound kanban surface with columns, swimlanes, phase groups and workflow rules.
 *
 * [Live Demo](https://optimus.openng.org/taskboard/)
 *
 * @module taskboardstyle
 *
 */
export enum TaskBoardClasses {
    /** Class name of the root element */
    root = 'p-taskboard',
    /** Class name of the header element */
    header = 'p-taskboard-header',
    /** Class name of the content element */
    body = 'p-taskboard-body',
    /** Class name of the columns viewport */
    columns = 'p-taskboard-columns',
    /** Class name of the columns row inside a grouped viewport */
    columnsTrack = 'p-taskboard-columns-track',
    /** Class name of the phase-header band */
    columnGroupHeaders = 'p-taskboard-column-group-headers',
    /** Class name of one phase header */
    columnGroupHeader = 'p-taskboard-column-group-header',
    /** Class name of a column element */
    column = 'p-taskboard-column',
    /** Class name of a column header element */
    columnHeader = 'p-taskboard-column-header',
    /** Class name of a column body element */
    columnBody = 'p-taskboard-column-body',
    /** Class name of a column footer element */
    columnFooter = 'p-taskboard-column-footer',
    /** Class name of the empty column surface */
    emptyColumn = 'p-taskboard-empty-column',
    /** Class name of a card element */
    card = 'p-taskboard-card',
    /** Class name of the swimlane grid */
    swimlaneGrid = 'p-taskboard-swimlane-grid',
    /** Class name of the swimlane column header row */
    columnHeaders = 'p-taskboard-column-headers',
    /** Class name of a swimlane row */
    swimlaneRow = 'p-taskboard-swimlane-row',
    /** Class name of a swimlane row header */
    swimlaneHeader = 'p-taskboard-swimlane-header',
    /** Class name of a swimlane cell */
    swimlaneCell = 'p-taskboard-swimlane-cell',
    /** Class name of the insertion marker */
    dropIndicator = 'p-taskboard-drop-indicator',
    /** Class name of the drag preview */
    dragPreview = 'p-taskboard-drag-preview',
    /** Class name of the drag preview count badge */
    dragPreviewBadge = 'p-taskboard-drag-preview-badge'
}

export interface TaskBoardStyle extends BaseStyle {}
