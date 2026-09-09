import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, ViewEncapsulation, afterRenderEffect, computed, contentChild, effect, inject, input, numberAttribute, signal, viewChild } from '@angular/core';
import type { TaskBoardItem } from '@openng/optimus-ui/types/taskboard';
import { TASKBOARD_COLUMN_CONTEXT, TASKBOARD_DROP_INDICATOR_CONTEXT, type TaskBoardColumnContext, type TaskBoardDropIndicatorContext } from './taskboard-context';
import { TASKBOARD_DRAG } from './taskboard-drag';
import { TaskBoardDragConfirmDef, TaskBoardDragPreviewDef, TaskBoardDropIndicatorDef } from './taskboard-registry';
import { TASKBOARD_STATE } from './taskboard-state';

/**
 * The drag surfaces: the insertion marker, the travelling preview and the confirmation of a guarded
 * move.
 *
 * All three are declarative. The pointer sensor decides WHICH position is active and holds the
 * pending move; these components only render the state it publishes, which is what keeps the marker
 * and the accepted index from ever disagreeing.
 *
 * @module taskboard-overlays
 */

/**
 * An authored insertion marker.
 *
 * Optional: a cell with none gets a runtime line positioned from the measured card geometry. Declare
 * them — one before every card and one after the last — when the marker needs product-owned content.
 *
 * @group Components
 */
@Component({
    selector: 'p-taskboard-drop-indicator',
    standalone: true,
    template: `
        @if (definition()) {
            <ng-container [ngTemplateOutlet]="definition()!.template" [ngTemplateOutletContext]="definitionContext()" />
        } @else {
            <ng-content />
        }
    `,
    imports: [NgTemplateOutlet],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [{ provide: TASKBOARD_DROP_INDICATOR_CONTEXT, useFactory: () => inject(TaskBoardDropIndicator).indicatorContext }],
    host: {
        'data-scope': 'taskboard',
        'data-part': 'drop-indicator',
        'aria-hidden': 'true',
        '[class]': 'hostClass()',
        '[attr.data-drop-index]': 'index()',
        '[hidden]': '!active()'
    }
})
export class TaskBoardDropIndicator {
    private readonly state = inject(TASKBOARD_STATE);
    private readonly column = inject<TaskBoardColumnContext | null>(TASKBOARD_COLUMN_CONTEXT, { optional: true });
    private readonly hostElement = inject<ElementRef<HTMLElement>>(ElementRef);

    /**
     * The rendered insertion position this marker stands for. Required.
     * @group Props
     */
    readonly index = input.required({ transform: numberAttribute });

    /** The template, when the marker's content was declared as a definition. */
    protected readonly definition = contentChild(TaskBoardDropIndicatorDef);

    /**
     * Whether the sensor is currently proposing this exact position.
     *
     * Compared against the published target rather than set by the sensor: the marker owns its own
     * visibility, so there is no imperative DOM write racing Angular's binding for the same
     * attribute.
     */
    protected readonly active = computed(() => {
        const target = this.state.dropTarget();
        if (!target) return false;

        const value = this.column?.value();
        if (value == null || target.columnValue !== value) return false;

        const swimlane = this.swimlaneValue();
        if (this.state.grouped() && target.swimlaneValue !== swimlane) return false;

        return target.index === this.index();
    });

    private readonly swimlaneValue = computed(() => {
        const raw = this.hostElement.nativeElement.closest<HTMLElement>('[data-swimlane-id]')?.dataset['swimlaneId'];
        return raw == null ? undefined : this.state.swimlanes().find((entry) => String(entry.id) === raw)?.id;
    });

    /**
     * The host classes.
     *
     * Projected content adds `p-taskboard-drop-indicator-custom`, which suppresses the preset line:
     * the two appearances are mutually exclusive, or a custom marker sits on top of a stock one.
     */
    protected readonly hostClass = computed(() => {
        const classes = ['p-taskboard-drop-indicator'];

        if (this.state.grouped()) classes.push('p-taskboard-swimlane-drop-indicator');
        if (this.definition() || this.projected()) classes.push('p-taskboard-drop-indicator-custom');

        return classes.join(' ');
    });

    /**
     * Whether anything was projected into the marker.
     *
     * Angular offers no way to ASK whether content was projected, so it is measured — and measured
     * after every render rather than once inside a computed: content that appears later, from an
     * `@if` in the application's template, has to add the class too, and a DOM read inside a
     * computed would never invalidate.
     */
    private readonly projected = signal(false);

    private readonly measureProjected = afterRenderEffect(() => {
        this.projected.set(this.hostElement.nativeElement.childElementCount > 0);
    });

    /** @internal The context this marker's children inject. */
    readonly indicatorContext: TaskBoardDropIndicatorContext = {
        column: computed(() => this.column?.columnData()),
        index: computed(() => this.index()),
        swimlane: computed(() => {
            const value = this.swimlaneValue();
            return value == null ? undefined : this.state.swimlaneById(value);
        })
    };

    protected readonly definitionContext = computed(() => {
        const render = { column: this.indicatorContext.column(), index: this.index(), swimlane: this.indicatorContext.swimlane() };
        return { $implicit: render, context: render, ...render };
    });
}

/**
 * The travelling preview.
 *
 * Replaces only the visible body: the sensor still measures the source card, keeps the preview's
 * width stable through an edge scroll, hides the travelling cards and works out the drop target from
 * its own geometry snapshot.
 *
 * @group Components
 */
@Component({
    selector: 'p-taskboard-drag-preview',
    standalone: true,
    template: `
        @if (visible()) {
            @if (count() > 1) {
                <span class="p-taskboard-drag-preview-badge">{{ count() }}</span>
            }
            @if (definition()) {
                <ng-container [ngTemplateOutlet]="definition()!.template" [ngTemplateOutletContext]="definitionContext()" />
            } @else {
                <div #body class="p-taskboard-drag-preview-body"><ng-content /></div>
            }
        }
    `,
    imports: [NgTemplateOutlet],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        'data-scope': 'taskboard',
        'data-part': 'drag-preview',
        'aria-hidden': 'true',
        class: 'p-taskboard-drag-preview',
        '[hidden]': '!visible()',
        '[style.left.px]': 'position()?.x',
        '[style.top.px]': 'position()?.y',
        '[style.width.px]': 'width()'
    }
})
export class TaskBoardDragPreview<T extends TaskBoardItem = TaskBoardItem> {
    private readonly state = inject(TASKBOARD_STATE);
    private readonly drag = inject(TASKBOARD_DRAG);

    /** The template, when the preview's content was declared as a definition. */
    protected readonly definition = contentChild(TaskBoardDragPreviewDef<T>);

    private readonly body = viewChild<ElementRef<HTMLElement>>('body');

    private mountedClone = false;

    /**
     * Falls back to a copy of the dragged card when the preview has no body of its own.
     *
     * `<p-taskboard-drag-preview />` on its own is the common case, and an empty preview means the
     * card appears to vanish while it travels. The emptiness is measured rather than declared
     * because Angular gives no way to ask whether anything was projected; a wrapper with no element
     * children is the answer.
     */
    private readonly mountClone = effect(() => {
        const host = this.body()?.nativeElement;
        const clone = this.drag.previewClone();

        if (!host) {
            this.mountedClone = false;
            return;
        }

        if (!clone || !this.visible()) {
            if (this.mountedClone) {
                host.replaceChildren();
                this.mountedClone = false;
            }

            return;
        }

        if (this.mountedClone || host.childElementCount > 0) return;

        host.append(...clone.map((element) => element.cloneNode(true)));
        this.mountedClone = true;
    });

    protected readonly visible = computed(() => this.state.dragging() && this.drag.previewPosition() !== null);

    protected readonly position = computed(() => this.drag.previewPosition());

    protected readonly width = computed(() => this.drag.previewWidth());

    /** How many cards are travelling. */
    protected readonly count = computed(() => this.state.draggingIds().length);

    protected readonly definitionContext = computed(() => {
        const item = this.state.draggingItem() as T | undefined;
        const render = { item, count: this.count(), column: item ? this.state.columnModelOf(item) : undefined };

        return { $implicit: render, context: render, ...render };
    });
}

/**
 * The confirmation surface of a guarded move.
 *
 * Ships no controls: the message, the buttons and their copy belong to the product, so the component
 * projects them and exposes `confirm()` and `cancel()` for them to call. Escape cancels.
 *
 * @group Components
 */
@Component({
    selector: 'p-taskboard-drag-confirm',
    standalone: true,
    exportAs: 'pTaskBoardDragConfirm',
    template: `
        @if (pending()) {
            @if (definition()) {
                <ng-container [ngTemplateOutlet]="definition()!.template" [ngTemplateOutletContext]="definitionContext()" />
            } @else {
                <ng-content />
            }
        }
    `,
    imports: [NgTemplateOutlet],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        'data-scope': 'taskboard',
        'data-part': 'drag-confirm',
        class: 'p-taskboard-drag-confirm',
        role: 'dialog',
        '[attr.aria-modal]': 'pending() ? true : null',
        '[attr.aria-label]': 'message()',
        '[hidden]': '!pending()'
    }
})
export class TaskBoardDragConfirm<T extends TaskBoardItem = TaskBoardItem> {
    private readonly state = inject(TASKBOARD_STATE);

    /** The template, when the confirmation body was declared as a definition. */
    protected readonly definition = contentChild(TaskBoardDragConfirmDef<T>);

    /** The held move, when there is one. */
    protected readonly pending = computed(() => this.state.pendingMove());

    /** The message the column asked for. */
    readonly message = computed(() => this.pending()?.message ?? '');

    /** Applies the held move. */
    confirm(): void {
        this.state.confirmPendingMove();
    }

    /** Abandons the held move. */
    cancel(): void {
        this.state.cancelPendingMove();
    }

    protected readonly definitionContext = computed(() => {
        const held = this.pending();
        const render = { task: held?.item as T | undefined, sourceColumn: held?.sourceColumn, targetColumn: held?.targetColumn, message: held?.message ?? '' };

        return { $implicit: render, context: render, ...render, confirm: () => this.confirm(), cancel: () => this.cancel() };
    });
}

/**
 * The runtime insertion line, for a cell with no authored marker.
 *
 * Rendered by the root rather than per column: it is one fixed-position element for the whole board,
 * which is what lets it follow the pointer across cells without being re-created in each of them.
 *
 * @group Components
 */
@Component({
    selector: 'p-taskboard-runtime-drop-indicator',
    standalone: true,
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        'data-scope': 'taskboard',
        'data-part': 'runtime-drop-indicator',
        'aria-hidden': 'true',
        class: 'p-taskboard-drop-indicator p-taskboard-drop-indicator-runtime',
        '[hidden]': '!line()',
        '[style.top.px]': 'line()?.top',
        '[style.left.px]': 'line()?.left',
        '[style.width.px]': 'line()?.width'
    }
})
export class TaskBoardRuntimeDropIndicator {
    private readonly drag = inject(TASKBOARD_DRAG);

    protected readonly line = computed(() => this.drag.runtimeIndicator());
}
