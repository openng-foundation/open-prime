import { ChangeDetectionStrategy, Component, Directive, ElementRef, ViewEncapsulation, computed, inject } from '@angular/core';
import type { SchedulerEvent } from '@openng/optimus-ui/types/scheduler';
import { SCHEDULER_CONTEXT_MENU_CONTEXT, SCHEDULER_EVENT_POPOVER_CONTEXT, SCHEDULER_MORE_POPOVER_CONTEXT, SCHEDULER_QUICK_INFO_CONTEXT } from './scheduler-context';
import { SCHEDULER_STATE } from './scheduler-state';

/**
 * The four overlays.
 *
 * Each one owns its anchor, its open/closed state and its dismissal, and provides a context so a
 * projected part can draw the contents without inputs — the ownership split the upstream docs
 * insist on: Scheduler owns the positioned root and the dismissal, the child owns the markup.
 *
 * Positioning is deliberately simple here: absolute placement next to the anchor. It is enough for
 * the month overflow and the event surfaces, and it keeps the overlays free of a dependency on the
 * library's overlay/portal machinery, which would drag the whole `p-popover` stack in.
 *
 * @module scheduler-overlays
 */

/**
 * What every overlay shares: dismissal on Escape and giving the focus back.
 *
 * An overlay the keyboard can open — and the event popover opens on `focusin` — is an overlay the
 * keyboard has to be able to close. Escape closes it, and the focus returns to the surface it was
 * opened from, because leaving the focus on a removed node drops it to the top of the document.
 */
@Directive()
abstract class SchedulerOverlayBase {
    /** @internal */
    readonly state = inject(SCHEDULER_STATE);

    protected readonly el = inject<ElementRef<HTMLElement>>(ElementRef);

    /** What the overlay is anchored to, whichever slot of the state it lives in. */
    protected abstract target(): { anchor?: HTMLElement } | null;

    /** Closes it. */
    abstract close(): void;

    /**
     * Where this overlay opens.
     *
     * Only the event popover takes it from the root: an overflow list or a context menu opens where
     * it was asked for, and a page that wanted to move those would be moving them for a reason the
     * component cannot guess.
     */
    protected placement(): SchedulerOverlayPlacement {
        return 'auto';
    }

    /** @internal Where the panel sits, relative to the surface it was opened from. */
    readonly offset = computed(() => anchorOffset(this.el.nativeElement, this.target()?.anchor ?? undefined, this.placement()));

    /** @internal Whether the panel is drawn above its anchor, which CSS has to translate. */
    readonly above = computed(() => this.placement() === 'top');

    /** @internal Chrome labels, so the default actions are not hard-coded English. */
    readonly labels = computed(() => this.state.labels());

    /** Escape closes, and the anchor gets the focus back. */
    protected onKeydown(originalEvent: KeyboardEvent): void {
        if (originalEvent.key !== 'Escape') return;

        originalEvent.stopPropagation();
        this.dismiss();
    }

    /** Closes and restores the focus. */
    protected dismiss(): void {
        const anchor = this.target()?.anchor;

        this.close();
        if (anchor?.isConnected && typeof anchor.focus === 'function') anchor.focus();
    }
}

/**
 * Where an overlay panel goes, relative to the element it was opened from.
 *
 * Absolute offsets against the panel's own `offsetParent` and not `position: fixed`: the Scheduler's
 * scroll containers would leave a fixed panel behind while the grid moved under it. The inline
 * offset is measured from the START edge, so it is the left edge in LTR and the right one in RTL and
 * the same `inset-inline-start` works for both.
 *
 * `null` when there is no anchor, which leaves the panel wherever the part was placed — the fallback
 * the "+N more" list used before it had one.
 */
function anchorOffset(host: HTMLElement, anchor?: HTMLElement, placement: SchedulerOverlayPlacement = 'auto'): { top: number; start: number } | null {
    // getBoundingClientRect and getComputedStyle do not exist outside the browser: the server has
    // an element tree but no layout engine, and an unpositioned overlay is exactly what belongs in
    // the prerendered HTML.
    if (!anchor?.isConnected || typeof anchor.getBoundingClientRect !== 'function' || typeof getComputedStyle !== 'function') return null;

    const parent = (host.offsetParent as HTMLElement | null) ?? host.ownerDocument.body;
    const anchorBox = anchor.getBoundingClientRect();
    const parentBox = parent.getBoundingClientRect();
    const rtl = getComputedStyle(host).direction === 'rtl';
    const gap = 4;

    const top = anchorBox.top - parentBox.top;
    const bottom = anchorBox.bottom - parentBox.top;
    const start = rtl ? parentBox.right - anchorBox.right : anchorBox.left - parentBox.left;
    const end = rtl ? parentBox.right - anchorBox.left : anchorBox.right - parentBox.left;

    // 'auto' abre por debajo salvo que no quepa, que es lo que hace un popover util en la fila de
    // abajo de una rejilla: ahi la unica opcion es abrir hacia arriba.
    const room = (typeof window !== 'undefined' ? window.innerHeight : parentBox.height) - anchorBox.bottom;
    const resolved = placement === 'auto' ? (room < 160 ? 'top' : 'bottom') : placement;

    switch (resolved) {
        case 'top':
            // El alto del panel no se conoce todavia, asi que se ancla su BASE al borde superior del
            // evento con una traslacion en CSS y no con una medida que habria que volver a leer.
            return { top: top - gap, start };
        case 'left':
            return { top, start: Math.max(0, start - gap) };
        case 'right':
            return { top, start: end + gap };
        default:
            return { top: bottom + gap, start };
    }
}

/** Where an overlay opens relative to what opened it. */
export type SchedulerOverlayPlacement = 'top' | 'bottom' | 'left' | 'right' | 'auto';

/**
 * Overflow list of a dense cell, opened by the "+N more" link.
 * @group Components
 */
@Component({
    selector: 'p-scheduler-more-popover',
    standalone: true,
    template: `
        @if (context().visible) {
            <div class="p-scheduler-more-popover-panel" role="dialog" [attr.aria-label]="title()" tabindex="-1" (keydown)="onKeydown($event)" [style.inset-block-start.px]="offset()?.top" [style.inset-inline-start.px]="offset()?.start">
                <div class="p-scheduler-more-popover-header">
                    <span>{{ title() }}</span>
                    <button type="button" class="p-scheduler-more-popover-close" [attr.aria-label]="labels().close" (click)="dismiss()">&times;</button>
                </div>
                <ng-content>
                    @for (event of context().events; track event.id) {
                        <button type="button" class="p-scheduler-more-popover-item" [attr.data-event-id]="event.id" (click)="pick($event, event)">
                            <span class="p-scheduler-event-title">{{ state.title(event) }}</span>
                        </button>
                    }
                </ng-content>
            </div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'p-scheduler-more-popover',
        'data-slot': 'scheduler-more-popover',
        '[attr.data-view]': 'state.view()',
        '[hidden]': '!context().visible'
    },
    providers: [{ provide: SCHEDULER_MORE_POPOVER_CONTEXT, useFactory: () => inject(SchedulerMorePopover).context }]
})
export class SchedulerMorePopover extends SchedulerOverlayBase {
    protected override target() {
        return this.state.morePopover();
    }

    override close(): void {
        this.state.morePopover.set(null);
    }

    /** The overflow context. */
    readonly context = computed(() => {
        const target = this.state.morePopover();
        return {
            date: target?.date,
            resource: target?.resource,
            events: target?.events ?? [],
            visible: target != null,
            close: () => this.state.morePopover.set(null)
        };
    });

    /** @internal */
    readonly title = computed(() => {
        const date = this.state.morePopover()?.date;
        return date ? date.toLocaleDateString(this.state.locale(), { weekday: 'long', day: 'numeric', month: 'long' }) : '';
    });

    /** Selects an event from the list and closes the overlay. */
    pick(originalEvent: MouseEvent, event: SchedulerEvent): void {
        this.state.handleEventClick(originalEvent, event);
        this.state.morePopover.set(null);
    }
}

/**
 * Compact read-only summary of an event.
 * @group Components
 */
@Component({
    selector: 'p-scheduler-quick-info',
    standalone: true,
    template: `
        @if (context().visible) {
            <div class="p-scheduler-overlay-panel" role="dialog" tabindex="-1" [attr.data-placement]="above() ? 'top' : null" (keydown)="onKeydown($event)" [style.inset-block-start.px]="offset()?.top" [style.inset-inline-start.px]="offset()?.start">
                <ng-content>
                    <div class="p-scheduler-overlay-title">{{ title() }}</div>
                    <div class="p-scheduler-overlay-time">{{ timeText() }}</div>
                    <div class="p-scheduler-overlay-actions">
                        <button type="button" (click)="context().edit()">{{ labels().edit }}</button>
                        <button type="button" (click)="context().remove()">{{ labels().delete }}</button>
                    </div>
                </ng-content>
            </div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'p-scheduler-quick-info',
        'data-slot': 'scheduler-quick-info',
        '[hidden]': '!context().visible'
    },
    providers: [{ provide: SCHEDULER_QUICK_INFO_CONTEXT, useFactory: () => inject(SchedulerQuickInfo).context }]
})
export class SchedulerQuickInfo extends SchedulerOverlayBase {
    protected override target() {
        return this.state.quickInfo();
    }

    override close(): void {
        this.state.quickInfo.set(null);
    }

    /** The quick info context. */
    readonly context = computed(() => {
        const target = this.state.quickInfo();
        return {
            event: target?.event,
            visible: target != null,
            close: () => this.state.quickInfo.set(null),
            edit: () => this.state.requestQuickInfoEdit(target?.event),
            remove: () => this.state.requestQuickInfoDelete(target?.event)
        };
    });

    /** @internal */
    readonly title = computed(() => {
        const event = this.state.quickInfo()?.event;
        return event ? this.state.title(event) : '';
    });

    /** @internal */
    readonly timeText = computed(() => {
        const event = this.state.quickInfo()?.event;
        return event ? this.state.eventTimeText(event) : '';
    });
}

/**
 * Fuller detail panel of an event.
 * @group Components
 */
@Component({
    selector: 'p-scheduler-popover',
    standalone: true,
    template: `
        @if (context().visible) {
            <div class="p-scheduler-overlay-panel" role="dialog" tabindex="-1" [attr.data-placement]="above() ? 'top' : null" (keydown)="onKeydown($event)" [style.inset-block-start.px]="offset()?.top" [style.inset-inline-start.px]="offset()?.start">
                <ng-content>
                    <div class="p-scheduler-overlay-title">{{ title() }}</div>
                </ng-content>
            </div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'p-scheduler-popover',
        'data-slot': 'scheduler-event-popover',
        '[hidden]': '!context().visible'
    },
    providers: [{ provide: SCHEDULER_EVENT_POPOVER_CONTEXT, useFactory: () => inject(SchedulerPopover).context }]
})
export class SchedulerPopover extends SchedulerOverlayBase {
    protected override target() {
        return this.state.eventPopover();
    }

    /** The event popover is the one the root places, through `eventPopoverPosition`. */
    protected override placement() {
        return this.state.eventPopoverPosition();
    }

    override close(): void {
        this.state.eventPopover.set(null);
    }

    /** The popover context. */
    readonly context = computed(() => {
        const target = this.state.eventPopover();
        return {
            event: target?.event,
            visible: target != null,
            close: () => this.state.eventPopover.set(null),
            edit: () => this.state.requestEdit(target?.event),
            remove: () => this.state.requestRemove(target?.event)
        };
    });

    /** @internal */
    readonly title = computed(() => {
        const event = this.state.eventPopover()?.event;
        return event ? this.state.title(event) : '';
    });
}

/**
 * Actions for an event or a date.
 * @group Components
 */
@Component({
    selector: 'p-scheduler-context-menu',
    standalone: true,
    template: `
        @if (context().visible) {
            <div class="p-scheduler-overlay-panel" role="menu" tabindex="-1" (keydown)="onKeydown($event)" [style.inset-block-start.px]="offset()?.top" [style.inset-inline-start.px]="offset()?.start">
                <ng-content>
                    <button type="button" role="menuitem" (click)="context().edit()">{{ labels().edit }}</button>
                    <button type="button" role="menuitem" (click)="context().remove()">{{ labels().delete }}</button>
                </ng-content>
            </div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'p-scheduler-context-menu',
        'data-slot': 'scheduler-context-menu',
        '[hidden]': '!context().visible'
    },
    providers: [{ provide: SCHEDULER_CONTEXT_MENU_CONTEXT, useFactory: () => inject(SchedulerContextMenu).context }]
})
export class SchedulerContextMenu extends SchedulerOverlayBase {
    protected override target() {
        return this.state.contextMenu();
    }

    override close(): void {
        this.state.contextMenu.set(null);
    }

    /** The context menu context. */
    readonly context = computed(() => {
        const target = this.state.contextMenu();
        return {
            event: target?.event,
            visible: target != null,
            close: () => this.state.contextMenu.set(null),
            edit: () => this.state.requestEdit(target?.event),
            remove: () => this.state.requestRemove(target?.event)
        };
    });
}
