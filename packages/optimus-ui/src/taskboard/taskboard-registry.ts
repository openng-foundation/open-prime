import { Directive, TemplateRef, inject, input } from '@angular/core';
import type { TaskBoardItem } from '@openng/optimus-ui/types/taskboard';
import type { TaskBoardColumnDefinitionContext, TaskBoardDragConfirmDefinitionContext, TaskBoardDragPreviewDefinitionContext, TaskBoardDropIndicatorDefinitionContext } from './taskboard-context';

/**
 * The template definitions: `*Def` directives that let markup-only customisation take the render
 * data without a component of its own.
 *
 * Two ways to customise the same surface, on purpose. A class-backed component injects the narrow
 * context token and is reusable; a `Def` template stays in the board's own file and reads the values
 * inline. The definitions are the answer for a repeated column body or a one-off overlay, where
 * spinning up a component to read four fields is more ceremony than it buys.
 *
 * A `Def` registers itself with its owning part through {@link TaskBoardDefinitionHost}, so the part
 * does not have to query for it and a definition added later still gets picked up.
 *
 * @module taskboard-registry
 */

/** What a part exposes so a definition can attach itself to it. @internal */
export interface TaskBoardDefinitionHost<C> {
    /** Called when a definition appears, and again when it changes. */
    registerDefinition(template: TemplateRef<C> | undefined): void;
}

/**
 * Typed repeated column template.
 *
 * Declared as `<ng-template pTaskBoardColumnDef let-columnContext>` or, with the microsyntax, as
 * `<ng-container *pTaskBoardColumnDef="let columnContext">`. A column without one falls back to its
 * projected content, so plain compound markup keeps working.
 *
 * @group Components
 */
@Directive({
    selector: '[pTaskBoardColumnDef]',
    standalone: true
})
export class TaskBoardColumnDef<T extends TaskBoardItem = TaskBoardItem> {
    /** @internal The template itself, stamped by the owning column. */
    readonly template = inject<TemplateRef<TaskBoardColumnDefinitionContext<T>>>(TemplateRef);

    /** @internal Unused: present so the microsyntax form parses. */
    readonly pTaskBoardColumnDef = input<unknown>(undefined);

    /**
     * Narrows `let-` bindings to the column context.
     *
     * The signature Angular's strict template checker reads to type a `let-` variable. Without it
     * every `let-columnContext` would come through as `any` and a typo in a field name would compile.
     */
    static ngTemplateContextGuard<T extends TaskBoardItem>(_directive: TaskBoardColumnDef<T>, context: unknown): context is TaskBoardColumnDefinitionContext<T> {
        return true;
    }
}

/**
 * Template of the drag preview body.
 *
 * @group Components
 */
@Directive({
    selector: '[pTaskBoardDragPreviewDef]',
    standalone: true
})
export class TaskBoardDragPreviewDef<T extends TaskBoardItem = TaskBoardItem> {
    /** @internal */
    readonly template = inject<TemplateRef<TaskBoardDragPreviewDefinitionContext<T>>>(TemplateRef);

    /** @internal */
    readonly pTaskBoardDragPreviewDef = input<unknown>(undefined);

    /** @internal */
    static ngTemplateContextGuard<T extends TaskBoardItem>(_directive: TaskBoardDragPreviewDef<T>, context: unknown): context is TaskBoardDragPreviewDefinitionContext<T> {
        return true;
    }
}

/**
 * Template of the guarded-move confirmation body.
 *
 * @group Components
 */
@Directive({
    selector: '[pTaskBoardDragConfirmDef]',
    standalone: true
})
export class TaskBoardDragConfirmDef<T extends TaskBoardItem = TaskBoardItem> {
    /** @internal */
    readonly template = inject<TemplateRef<TaskBoardDragConfirmDefinitionContext<T>>>(TemplateRef);

    /** @internal */
    readonly pTaskBoardDragConfirmDef = input<unknown>(undefined);

    /** @internal */
    static ngTemplateContextGuard<T extends TaskBoardItem>(_directive: TaskBoardDragConfirmDef<T>, context: unknown): context is TaskBoardDragConfirmDefinitionContext<T> {
        return true;
    }
}

/**
 * Template of an authored insertion marker.
 *
 * @group Components
 */
@Directive({
    selector: '[pTaskBoardDropIndicatorDef]',
    standalone: true
})
export class TaskBoardDropIndicatorDef {
    /** @internal */
    readonly template = inject<TemplateRef<TaskBoardDropIndicatorDefinitionContext>>(TemplateRef);

    /** @internal */
    readonly pTaskBoardDropIndicatorDef = input<unknown>(undefined);

    /** @internal */
    static ngTemplateContextGuard(_directive: TaskBoardDropIndicatorDef, context: unknown): context is TaskBoardDropIndicatorDefinitionContext {
        return true;
    }
}

/** Every definition, for the module to import and export in one go. @internal */
export const TASKBOARD_DEFS = [TaskBoardColumnDef, TaskBoardDragPreviewDef, TaskBoardDragConfirmDef, TaskBoardDropIndicatorDef] as const;
