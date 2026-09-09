import { DOCUMENT } from '@angular/common';
import { ElementRef, Signal, effect, inject, signal } from '@angular/core';
import type { CaretPosition, TextEditorSubmenu } from '@openng/optimus-ui/types/texteditor';

/**
 * The interactive entries of a popover. Slash and mention popovers are listboxes, block and table
 * menus are menus; both are navigated the same way, so both selectors are collected.
 */
function entriesOf(host: HTMLElement): HTMLElement[] {
    return Array.from(host.querySelectorAll<HTMLElement>('[role="option"], [role="menuitem"]')).filter(
        (entry) =>
            !entry.hasAttribute('disabled') &&
            entry.getAttribute('aria-disabled') !== 'true' &&
            /* A submenu is projected inside its parent menu, so the parent's own query would
               otherwise collect the child's entries as if they were its own. */
            entry.closest('[data-scope="texteditor"]') === host
    );
}

/**
 * Whether another open popover is nested inside this one. The innermost surface owns the keyboard:
 * without this, one Escape closes both halves of a menu and one Enter activates two entries.
 */
function hasOpenChild(host: HTMLElement): boolean {
    return Array.from(host.querySelectorAll<HTMLElement>('[data-scope="texteditor"][data-part$="submenu"]')).some((child) => !child.hasAttribute('hidden'));
}

/**
 * What a popover surface needs to behave like one.
 */
export interface PopoverKeysOptions {
    /**
     * Whether the popover is open. Listeners are attached only while it is.
     */
    open: Signal<boolean>;
    /**
     * Called on Escape and on a click outside the popover.
     */
    onDismiss: () => void;
    /**
     * Called with the id of the active entry, for `aria-activedescendant` on the editing region.
     */
    onActiveDescendant?: (id: string | null) => void;
    /**
     * Whether the popover owns Arrow and Enter. A floating toolbar does not: it holds buttons the
     * user tabs through, not a list.
     * @defaultValue true
     */
    navigable?: boolean;
}

/**
 * Wires arrow-key navigation, Enter activation and Escape / click-outside dismissal into the
 * calling component. Call it from a constructor: it uses the component's own injector.
 *
 * The active entry is marked with `data-p-focus` rather than focused outright, because the caret has
 * to stay in the document while the user arrows through a slash or mention menu - otherwise typing
 * more of the query would go nowhere.
 *
 * @group Function
 */
export function usePopoverKeys(options: PopoverKeysOptions): void {
    const host = inject<ElementRef<HTMLElement>>(ElementRef);
    const document = inject(DOCUMENT);
    const activeIndex = signal(0);
    const navigable = options.navigable !== false;

    const syncActive = () => {
        const entries = entriesOf(host.nativeElement);
        const active = entries[Math.min(activeIndex(), Math.max(entries.length - 1, 0))];

        entries.forEach((entry) => entry.removeAttribute('data-p-focus'));

        if (!active) {
            options.onActiveDescendant?.(null);

            return;
        }

        active.setAttribute('data-p-focus', '');
        active.scrollIntoView({ block: 'nearest' });

        if (!active.id) active.id = `p-text-editor-option-${Math.random().toString(36).slice(2, 8)}`;

        options.onActiveDescendant?.(active.id);
    };

    const onKeyDown = (event: KeyboardEvent) => {
        if (!options.open() || hasOpenChild(host.nativeElement)) return;

        if (event.key === 'Escape') {
            event.preventDefault();
            options.onDismiss();

            return;
        }

        if (!navigable) return;

        const entries = entriesOf(host.nativeElement);

        if (!entries.length) return;

        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();

            const delta = event.key === 'ArrowDown' ? 1 : -1;

            activeIndex.update((index) => (index + delta + entries.length) % entries.length);
            syncActive();

            return;
        }

        if (event.key === 'Enter') {
            event.preventDefault();
            entries[Math.min(activeIndex(), entries.length - 1)]?.click();
        }
    };

    effect((onCleanup) => {
        if (!options.open()) {
            options.onActiveDescendant?.(null);

            return;
        }

        activeIndex.set(0);
        queueMicrotask(syncActive);

        const onPointerDown = (event: Event) => {
            if (host.nativeElement.contains(event.target as Node)) return;

            /* A click inside a submenu is a click inside its parent as far as the DOM is concerned,
               but not when the submenu is teleported: check both. */
            if (Array.from(host.nativeElement.querySelectorAll<HTMLElement>('[data-scope="texteditor"]')).some((child) => child.contains(event.target as Node))) return;

            options.onDismiss();
        };

        document.addEventListener('mousedown', onPointerDown, true);
        document.addEventListener('keydown', onKeyDown, true);

        onCleanup(() => {
            document.removeEventListener('mousedown', onPointerDown, true);
            document.removeEventListener('keydown', onKeyDown, true);
        });
    });
}

/**
 * A counter that ticks while `open` is true and the page scrolls or resizes.
 *
 * Anchored surfaces are positioned in viewport coordinates, and geometry is not a signal: without
 * this, a popover stays where it was opened while the element it belongs to scrolls away.
 *
 * @group Function
 */
export function useAnchorTick(open: Signal<boolean>): Signal<number> {
    const document = inject(DOCUMENT);
    const tick = signal(0);

    effect((onCleanup) => {
        if (!open()) return;

        const bump = () => tick.update((value) => value + 1);
        const view = document.defaultView;

        view?.addEventListener('scroll', bump, { capture: true, passive: true });
        view?.addEventListener('resize', bump, { passive: true });

        onCleanup(() => {
            view?.removeEventListener('scroll', bump, { capture: true });
            view?.removeEventListener('resize', bump);
        });
    });

    return tick.asReadonly();
}

/**
 * Places a floating surface next to the caret, flipping it above the line and pulling it back
 * inside the viewport when it would not fit below or to the right.
 *
 * @group Function
 */
export function caretAnchorStyle(caret: CaretPosition | null, size = { width: 260, height: 240 }): Record<string, string> {
    if (!caret) return { display: 'none' };

    const view = typeof window === 'undefined' ? { innerWidth: 1024, innerHeight: 768 } : window;
    const below = caret.bottom + size.height <= view.innerHeight;
    const left = Math.min(caret.left, Math.max(view.innerWidth - size.width - 8, 8));

    return {
        position: 'fixed',
        left: `${Math.max(left, 8)}px`,
        top: below ? `${caret.bottom + 6}px` : `${Math.max(caret.top - size.height - 6, 8)}px`
    };
}

/**
 * Places a floating surface next to an element, used by the menus that open from a trigger rather
 * than from the caret.
 *
 * @group Function
 */
export function anchorStyle(anchor: HTMLElement | null, size = { width: 240, height: 280 }): Record<string, string> {
    /* Geometry only exists in a browser: on the server there is no layout to measure, and the
       popover is closed there anyway. */
    if (!anchor || typeof anchor.getBoundingClientRect !== 'function') return { display: 'none' };

    const rect = anchor.getBoundingClientRect();

    return caretAnchorStyle({ top: rect.top, bottom: rect.bottom, left: rect.left, width: rect.width, height: rect.height }, size);
}

/**
 * The submenu controller a menu shares with its submenu half, so `submenu.open('turnInto')` in one
 * drives the other.
 *
 * @group Interface
 */
export interface SubmenuController extends TextEditorSubmenu {
    /**
     * Name of the open submenu, as a signal, for templates that read it directly.
     */
    activeSignal: Signal<string | null>;
    /**
     * Element the open submenu is anchored to, as a signal.
     */
    anchorSignal: Signal<HTMLElement | null>;
}

/**
 * Builds a submenu controller.
 *
 * @group Function
 */
export function createSubmenuController(): SubmenuController {
    const active = signal<string | null>(null);
    const anchor = signal<HTMLElement | null>(null);

    return {
        activeSignal: active.asReadonly(),
        anchorSignal: anchor.asReadonly(),
        active: () => active(),
        anchor: () => anchor(),
        open: (name: string, anchorElement?: HTMLElement) => {
            active.set(name);
            anchor.set(anchorElement ?? null);
        },
        close: () => {
            active.set(null);
            anchor.set(null);
        }
    };
}
