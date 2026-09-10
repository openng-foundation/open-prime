/**
 * Easing presets and the registry that lets an application add its own by name.
 */
import type { EasingFunction, EasingPreset } from '@openng/optimus-ui/types/charts';

const C1 = 1.70158;
const C3 = C1 + 1;
const C4 = (2 * Math.PI) / 3;
const N1 = 7.5625;
const D1 = 2.75;

/** The bounce curve, shared by the three bounce presets. */
function bounceOut(t: number): number {
    if (t < 1 / D1) return N1 * t * t;
    if (t < 2 / D1) return N1 * (t -= 1.5 / D1) * t + 0.75;
    if (t < 2.5 / D1) return N1 * (t -= 2.25 / D1) * t + 0.9375;

    return N1 * (t -= 2.625 / D1) * t + 0.984375;
}

/** The built-in easing curves, keyed by the names the public animation props accept. */
export const EASING_PRESETS: Record<EasingPreset, EasingFunction> = {
    linear: (t) => t,
    easeOutQuad: (t) => 1 - (1 - t) * (1 - t),
    easeOutCubic: (t) => 1 - Math.pow(1 - t, 3),
    easeOutQuart: (t) => 1 - Math.pow(1 - t, 4),
    easeOutQuint: (t) => 1 - Math.pow(1 - t, 5),
    easeOutExpo: (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
    easeInOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    easeInOutQuart: (t) => (t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2),
    easeOutBack: (t) => 1 + C3 * Math.pow(t - 1, 3) + C1 * Math.pow(t - 1, 2),
    easeOutElastic: (t) => (t <= 0 ? 0 : t >= 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * C4) + 1),
    easeOutBounce: bounceOut,
    easeInBounce: (t) => 1 - bounceOut(1 - t),
    easeInOutBounce: (t) => (t < 0.5 ? (1 - bounceOut(1 - 2 * t)) / 2 : (1 + bounceOut(2 * t - 1)) / 2)
};

const registry = new Map<string, EasingFunction>();

/**
 * Registers a custom easing function globally by name. Call it once at application startup; a name
 * that collides with a built-in preset takes precedence over it.
 */
export function registerEasing(name: string, fn: EasingFunction): void {
    registry.set(name, fn);
}

/**
 * Retrieves an easing function by name, preferring a registered one over a built-in preset. An
 * unknown name falls back to the default curve rather than throwing, so a typo degrades to a
 * working animation instead of a broken chart.
 */
export function getEasing(name: string): EasingFunction {
    return registry.get(name) ?? EASING_PRESETS[name as EasingPreset] ?? EASING_PRESETS.easeOutQuart;
}

/** Resolves whatever an animation prop was given into a function. */
export function resolveEasing(easing: string | EasingFunction | undefined): EasingFunction {
    if (typeof easing === 'function') return easing;
    if (typeof easing === 'string') return getEasing(easing);

    return EASING_PRESETS.easeOutQuart;
}

/** Linear interpolation between two numbers. */
export function lerp(from: number, to: number, t: number): number {
    return from + (to - from) * t;
}
