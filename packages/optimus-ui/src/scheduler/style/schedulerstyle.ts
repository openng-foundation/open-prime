import { Injectable } from '@angular/core';
import { style } from '@openng/optimus-ui-styles/scheduler';
import { BaseStyle } from '@openng/optimus-ui/base';

const classes = {
    root: ({ instance }) => [
        'p-scheduler p-component',
        {
            'p-scheduler-disabled': instance.disabled(),
            'p-scheduler-loading-active': instance.loading()
        }
    ]
};

@Injectable()
export class SchedulerStyle extends BaseStyle {
    name = 'scheduler';

    style = style;

    classes = classes;
}

/**
 *
 * Scheduler is a compound scheduling surface with day, week, month and agenda views.
 *
 * [Live Demo](https://optimus.openng.org/scheduler/)
 *
 * @module schedulerstyle
 *
 */
export enum SchedulerClasses {
    /** Class name of the root element */
    root = 'p-scheduler',
    /** Class name of the header element */
    header = 'p-scheduler-header',
    /** Class name of the navigation element */
    navigation = 'p-scheduler-navigation',
    /** Class name of the title element */
    title = 'p-scheduler-title',
    /** Class name of the view selector element */
    viewSelector = 'p-scheduler-view-selector',
    /** Class name of the content element */
    content = 'p-scheduler-content',
    /** Class name of the time grid element */
    timeGrid = 'p-scheduler-time-grid',
    /** Class name of the time gutter element */
    timeGutter = 'p-scheduler-time-gutter',
    /** Class name of the all-day row element */
    allDayRow = 'p-scheduler-all-day-row',
    /** Class name of a time grid cell */
    timeGridCell = 'p-scheduler-time-grid-cell',
    /** Class name of a timed event */
    timeGridEvent = 'p-scheduler-time-grid-event',
    /** Class name of the month grid element */
    month = 'p-scheduler-month',
    /** Class name of a month cell */
    monthCell = 'p-scheduler-month-cell',
    /** Class name of a month event */
    monthEvent = 'p-scheduler-month-event',
    /** Class name of the overflow link */
    monthMoreLink = 'p-scheduler-month-more-link',
    /** Class name of the agenda element */
    agenda = 'p-scheduler-agenda',
    /** Class name of an agenda event */
    agendaEvent = 'p-scheduler-agenda-event',
    /** Class name of the category legend */
    categoryLegend = 'p-scheduler-category-legend',
    /** Class name of the selection toolbar */
    selectionToolbar = 'p-scheduler-selection-toolbar',
    /** Class name of the loading overlay */
    loading = 'p-scheduler-loading'
}

export interface SchedulerStyle extends BaseStyle {}
