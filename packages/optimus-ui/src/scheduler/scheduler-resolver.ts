import { InjectionToken, TemplateRef } from '@angular/core';
import type { SchedulerViewType } from '@openng/optimus-ui/types/scheduler';

/**
 * The seam between the definition registry and the renderers.
 *
 * Without it the module graph is a cycle: the registry has to import the renderers to switch on the
 * active view, the renderers extend `SchedulerViewBase`, and the base needs the registry to resolve
 * its templates. The AOT compiler hoists its way out of that, but the runtime graph does not — the
 * base class evaluates as `undefined` and every renderer dies on `class ... extends undefined`.
 *
 * So the base depends on this token instead of on `SchedulerContent`, and the content provides
 * itself for it. Both sides import a leaf, and the cycle is gone.
 *
 * @module scheduler-resolver
 */

/**
 * Names of the definition slots. One per surface the Scheduler can hand over to the application.
 */
export type SchedulerSlot =
    | 'event'
    | 'dayHeader'
    | 'allDayCell'
    | 'allDayEvent'
    | 'timeGutter'
    | 'timeGridCell'
    | 'workCell'
    | 'timeGridEvent'
    | 'monthTitle'
    | 'monthHeaderCell'
    | 'monthCell'
    | 'monthCellNumber'
    | 'monthDayCell'
    | 'monthEvent'
    | 'monthMoreLink'
    | 'miniMonthHeader'
    | 'miniMonthCell'
    | 'agendaDateHeader'
    | 'agendaEvent'
    | 'timelineHeaderCell'
    | 'timelineCell'
    | 'timelineEvent'
    | 'resourceColumnHeader'
    | 'resourceAreaHeader'
    | 'resourceHeader'
    | 'resource'
    | 'resourceGroup'
    | 'resourceRow'
    | 'resourceAggregateBadge';

/**
 * What a renderer needs from the registry: the template declared for a slot in a view.
 */
export interface SchedulerDefResolver {
    /**
     * The template for a slot in a view, or `undefined` to fall back to the renderer's own markup.
     */
    resolve(slot: SchedulerSlot, view: SchedulerViewType): TemplateRef<any> | undefined;
}

/** @internal */
export const SCHEDULER_DEF_RESOLVER = new InjectionToken<SchedulerDefResolver>('SCHEDULER_DEF_RESOLVER');
