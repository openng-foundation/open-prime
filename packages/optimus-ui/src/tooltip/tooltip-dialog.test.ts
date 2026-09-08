import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { AutoFocus } from '@openng/optimus-ui/autofocus';
import { Dialog } from '@openng/optimus-ui/dialog';
import type { MotionEvent } from '@openng/optimus-ui-motion';
import { Tooltip } from './tooltip';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [Dialog, Tooltip],
    template: `
        <input #outside pTooltip="Tooltip" tooltipPosition="bottom" tooltipEvent="both" />
        <p-dialog [visible]="true" [focusOnShow]="false" [draggable]="false" [resizable]="false" [motionOptions]="noMotion" [maskMotionOptions]="noMotion" appendTo="self">
            <input #inside pTooltip="Tooltip" tooltipPosition="bottom" tooltipEvent="both" />
            <span class="decoration">Content</span>
        </p-dialog>
    `
})
class DialogTooltipTestComponent {
    @ViewChild('outside', { read: Tooltip }) outside!: Tooltip;
    @ViewChild('inside', { read: Tooltip }) inside!: Tooltip;
    @ViewChild(Dialog) dialog!: Dialog;
    noMotion = { disabled: true };
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [AutoFocus, Dialog, Tooltip],
    template: `
        <p-dialog [visible]="true" [focusOnShow]="false" [draggable]="false" [resizable]="false" [motionOptions]="motion" [maskMotionOptions]="{ disabled: true }" appendTo="self">
            <input pTooltip="Autofocus tooltip" tooltipEvent="focus" tooltipPosition="bottom" [pAutoFocus]="true" />
        </p-dialog>
    `
})
class AutofocusTooltipTestComponent {
    animations: Animation[] = [];
    motion = {
        safe: false,
        onEnter: (event?: MotionEvent) => {
            // Hold the real entrance at its initial frame so slow test machines
            // still exercise the original autofocus-during-opening regression.
            this.animations = event!.element.getAnimations();
            this.animations.forEach((animation) => animation.pause());
            event!.element.querySelector('input')!.focus();
        }
    };
}

describe('Tooltip in a dialog', () => {
    let fixture: ComponentFixture<DialogTooltipTestComponent>;
    let inside: Tooltip;
    let outside: Tooltip;
    let panel: HTMLElement;
    let animations: Animation[];
    let extraElements: HTMLElement[];

    const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

    beforeEach(async () => {
        TestBed.configureTestingModule({ imports: [DialogTooltipTestComponent, AutofocusTooltipTestComponent] });
        animations = [];
        extraElements = [];
        fixture = TestBed.createComponent(DialogTooltipTestComponent);
        fixture.detectChanges();
        await fixture.whenStable();
        inside = fixture.componentInstance.inside;
        outside = fixture.componentInstance.outside;
        panel = fixture.componentInstance.dialog.container()!;
        expect(panel).toBeTruthy();
    });

    afterEach(() => {
        fixture.destroy();
        animations.forEach((animation) => animation.cancel());
        extraElements.forEach((element) => element.remove());
    });

    function animate(element: Element, options: KeyframeAnimationOptions = {}) {
        const animation = element.animate([{ transform: 'translateX(80px)' }, { transform: 'translateX(0)' }], { duration: 10000, fill: 'both', ...options });
        animations.push(animation);
        return animation;
    }

    function enter(tooltip: Tooltip) {
        tooltip.el.nativeElement.dispatchEvent(new MouseEvent('mouseenter'));
        return tooltip.container as HTMLElement;
    }

    function leave(tooltip: Tooltip) {
        tooltip.el.nativeElement.dispatchEvent(new MouseEvent('mouseleave'));
    }

    function expectFreshFade(container: HTMLElement) {
        expect(container.style.display).toBe('inline-block');
        expect(container.style.opacity).toBe('0');
    }

    function expectAligned(tooltip: Tooltip) {
        const target = tooltip.el.nativeElement.getBoundingClientRect();
        const container = tooltip.container.getBoundingClientRect();
        expect(Math.abs(container.top - target.bottom)).toBeLessThan(1);
        expect(Math.abs(container.left + container.width / 2 - (target.left + target.width / 2))).toBeLessThan(1);
    }

    it('starts the full fade immediately on the page and in a settled dialog', () => {
        expectFreshFade(enter(outside));
        expectFreshFade(enter(inside));
    });

    it('ignores a real color transition on the tooltip target', () => {
        const target = inside.el.nativeElement as HTMLElement;
        target.style.backgroundColor = 'rgb(0, 0, 0)';
        expect(getComputedStyle(target).backgroundColor).toBe('rgb(0, 0, 0)');
        target.style.transition = 'background-color 10s';
        target.style.backgroundColor = 'rgb(255, 255, 255)';
        expect(target.getAnimations().length).toBeGreaterThan(0);
        expectFreshFade(enter(inside));
    });

    it('ignores finite and infinite animations on unrelated dialog content', () => {
        animate(panel.querySelector('.decoration')!);
        animate(panel.querySelector('.decoration')!, { iterations: Infinity });
        expectFreshFade(enter(inside));
    });

    it('waits longer than 100ms for dialog motion and aligns at its final position', async () => {
        const animation = animate(panel);
        const container = enter(inside);
        await wait(150);
        expect(container.style.display).toBe('none');
        animation.finish();
        await animation.finished;
        await Promise.resolve();
        expectFreshFade(container);
        expectAligned(inside);
    });

    it('waits for a dialog animation paused on its initial frame', async () => {
        const animation = animate(panel);
        animation.pause();
        const container = enter(inside);
        expect(container.style.display).toBe('none');
        animation.finish();
        await animation.finished;
        await Promise.resolve();
        expectFreshFade(container);
    });

    it('finds the dialog surface when its mask is appended to body', async () => {
        const mask = panel.parentElement!;
        document.body.appendChild(mask);
        extraElements.push(mask);
        expect(inside.el.nativeElement.closest('p-dialog')).toBeNull();
        const animation = animate(panel);
        const container = enter(inside);
        expect(container.style.display).toBe('none');
        animation.finish();
        await animation.finished;
        await Promise.resolve();
        expectFreshFade(container);
        expectAligned(inside);
    });

    it('waits for all nested ancestor dialog surfaces', async () => {
        const outer = document.createElement('div');
        outer.setAttribute('data-pc-name', 'dialog');
        panel.parentElement!.insertBefore(outer, panel);
        outer.appendChild(panel);
        extraElements.push(outer);
        const outerAnimation = animate(outer);
        const innerAnimation = animate(panel);
        const container = enter(inside);
        innerAnimation.finish();
        await innerAnimation.finished;
        await Promise.resolve();
        expect(container.style.display).toBe('none');
        outerAnimation.finish();
        await outerAnimation.finished;
        await Promise.resolve();
        expectFreshFade(container);
        expectAligned(inside);
    });

    it('does not wait indefinitely for infinite dialog motion', () => {
        animate(panel, { iterations: Infinity });
        expectFreshFade(enter(inside));
    });

    it('shows immediately when the animation API is unavailable', () => {
        Object.defineProperty(panel, 'getAnimations', { value: undefined, configurable: true });
        expectFreshFade(enter(inside));
    });

    it('reveals safely when a dialog animation is cancelled', async () => {
        const animation = animate(panel);
        const container = enter(inside);
        const cancelled = animation.finished.catch(() => undefined);
        animation.cancel();
        await cancelled;
        await Promise.resolve();
        expectFreshFade(container);
    });

    it('does not let a stale wait reveal a replacement tooltip early', async () => {
        const first = animate(panel);
        const oldContainer = enter(inside);
        leave(inside);
        first.cancel();
        const second = animate(panel);
        const newContainer = enter(inside);
        await wait(150);
        expect(oldContainer.isConnected).toBe(false);
        expect(newContainer.style.display).toBe('none');
        second.finish();
        await second.finished;
        await Promise.resolve();
        expectFreshFade(newContainer);
    });

    it('keeps a dismissed tooltip removed after the dialog settles', async () => {
        const animation = animate(panel);
        const container = enter(inside);
        leave(inside);
        animation.finish();
        await animation.finished;
        await Promise.resolve();
        expect(inside.container).toBeNull();
        expect(container.isConnected).toBe(false);
    });

    it('does not reveal a pending tooltip after the target is detached', async () => {
        const animation = animate(panel);
        const container = enter(inside);
        inside.el.nativeElement.remove();
        animation.finish();
        await animation.finished;
        await Promise.resolve();
        expect(container.style.display).toBe('none');
    });

    it('preserves configured show and hide delays on both paths', async () => {
        for (const tooltip of [outside, inside]) {
            tooltip.setOption({ showDelay: 40, hideDelay: 40 });
            expect(enter(tooltip)).toBeFalsy();
        }
        await vi.waitFor(() => {
            expect(outside.container?.style.display).toBe('inline-block');
            expect(inside.container?.style.display).toBe('inline-block');
        });
        for (const tooltip of [outside, inside]) {
            leave(tooltip);
            expect(tooltip.container).toBeTruthy();
        }
        await vi.waitFor(() => {
            expect(outside.container).toBeNull();
            expect(inside.container).toBeNull();
        });
    });

    it('retains the autofocus positioning fix during a real dialog entrance (PrimeNG #15485)', async () => {
        const focusFixture = TestBed.createComponent(AutofocusTooltipTestComponent);
        try {
            focusFixture.detectChanges();
            await focusFixture.whenStable();
            const tooltip = focusFixture.debugElement.query(By.directive(Tooltip)).injector.get(Tooltip);
            const input = tooltip.el.nativeElement as HTMLInputElement;
            const entrance = focusFixture.componentInstance.animations;
            expect(document.activeElement).toBe(input);
            expect(input.hasAttribute('autofocus')).toBe(true);
            expect(entrance.length).toBeGreaterThan(0);
            expect(entrance.every((animation) => animation.playState === 'paused')).toBe(true);
            await wait(150);
            expect(tooltip.container.style.display).toBe('none');
            entrance.forEach((animation) => animation.finish());
            await Promise.allSettled(entrance.map((animation) => animation.finished));
            await vi.waitFor(() => expect(tooltip.container.style.display).toBe('inline-block'));
            expectAligned(tooltip);
        } finally {
            focusFixture.destroy();
            focusFixture.componentInstance.animations.forEach((animation) => animation.cancel());
        }
    });
});
