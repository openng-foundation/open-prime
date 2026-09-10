/**
 * Color parsing, mixing and gradient handling.
 *
 * The chart never assumes a color is a hex string. Application code passes CSS variables, `rgb()`,
 * `oklch()` and gradient objects, so anything that needs to *compute* with a color — brightening a
 * hovered mark, picking a contrasting label, interpolating a heat scale — first tries to parse it
 * and falls back to leaving it alone rather than producing a wrong color.
 */
import type { ColorValue, GradientColor, LinearGradientColor, RadialGradientColor } from '@openng/optimus-ui/types/charts';

/** A parsed color in the sRGB space, with alpha. */
export interface Rgba {
    r: number;
    g: number;
    b: number;
    a: number;
}

/** True when the value is a gradient definition rather than a color string. */
export function isGradient(value: ColorValue | undefined): value is GradientColor {
    return !!value && typeof value === 'object' && ('linearGradient' in value || 'radialGradient' in value);
}

/** True when the gradient is axis-aligned rather than radial. */
export function isLinearGradient(value: GradientColor): value is LinearGradientColor {
    return 'linearGradient' in value;
}

/** True when the gradient radiates from a center point. */
export function isRadialGradient(value: GradientColor): value is RadialGradientColor {
    return 'radialGradient' in value;
}

const HEX_SHORT = /^#([0-9a-f])([0-9a-f])([0-9a-f])([0-9a-f])?$/i;
const HEX_LONG = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})?$/i;
const RGB_FN = /^rgba?\(\s*([\d.]+%?)[\s,]+([\d.]+%?)[\s,]+([\d.]+%?)(?:[\s,/]+([\d.]+%?))?\s*\)$/i;

function channel(raw: string): number {
    return raw.endsWith('%') ? (parseFloat(raw) / 100) * 255 : parseFloat(raw);
}

function alpha(raw: string | undefined): number {
    if (raw == null) return 1;

    return raw.endsWith('%') ? parseFloat(raw) / 100 : parseFloat(raw);
}

/**
 * Parses a CSS color string into sRGB channels. Returns `null` for anything it cannot read — a CSS
 * variable, a named color, a modern color function — which is the signal to leave the value alone
 * rather than guess at it.
 */
export function parseColor(value: string): Rgba | null {
    const input = value.trim();

    const short = HEX_SHORT.exec(input);

    if (short) {
        return {
            r: parseInt(short[1] + short[1], 16),
            g: parseInt(short[2] + short[2], 16),
            b: parseInt(short[3] + short[3], 16),
            a: short[4] ? parseInt(short[4] + short[4], 16) / 255 : 1
        };
    }

    const long = HEX_LONG.exec(input);

    if (long) {
        return {
            r: parseInt(long[1], 16),
            g: parseInt(long[2], 16),
            b: parseInt(long[3], 16),
            a: long[4] ? parseInt(long[4], 16) / 255 : 1
        };
    }

    const fn = RGB_FN.exec(input);

    if (fn) {
        return { r: channel(fn[1]), g: channel(fn[2]), b: channel(fn[3]), a: alpha(fn[4]) };
    }

    return null;
}

function clamp255(n: number): number {
    return Math.min(255, Math.max(0, Math.round(n)));
}

/** Formats parsed channels back into a CSS color string. */
export function formatColor({ r, g, b, a }: Rgba): string {
    if (a >= 1) return `rgb(${clamp255(r)}, ${clamp255(g)}, ${clamp255(b)})`;

    return `rgba(${clamp255(r)}, ${clamp255(g)}, ${clamp255(b)}, ${Math.min(1, Math.max(0, a))})`;
}

/**
 * Applies a brightness multiplier, which is how a hovered mark lifts away from its neighbours.
 * An unparseable color is returned unchanged.
 */
export function brighten(value: string, factor: number): string {
    if (factor === 1) return value;

    const rgba = parseColor(value);

    if (!rgba) return value;

    return formatColor({ r: rgba.r * factor, g: rgba.g * factor, b: rgba.b * factor, a: rgba.a });
}

/** Multiplies a color's alpha, which is how the dim effect fades the non-hovered marks. */
export function withOpacity(value: string, opacity: number): string {
    if (opacity >= 1) return value;

    const rgba = parseColor(value);

    if (!rgba) return value;

    return formatColor({ ...rgba, a: rgba.a * opacity });
}

/** Mixes two colors in sRGB. Returns the first unchanged when either cannot be parsed. */
export function mixColors(from: string, to: string, t: number): string {
    const a = parseColor(from);
    const b = parseColor(to);

    if (!a || !b) return t < 0.5 ? from : to;

    return formatColor({
        r: a.r + (b.r - a.r) * t,
        g: a.g + (b.g - a.g) * t,
        b: a.b + (b.b - a.b) * t,
        a: a.a + (b.a - a.a) * t
    });
}

/**
 * Relative luminance per WCAG 2.x, used to decide whether a label on a filled mark should be dark
 * or light.
 */
export function relativeLuminance(value: string): number | null {
    const rgba = parseColor(value);

    if (!rgba) return null;

    const linear = (c: number) => {
        const s = c / 255;

        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };

    return 0.2126 * linear(rgba.r) + 0.7152 * linear(rgba.g) + 0.0722 * linear(rgba.b);
}

/**
 * The contrast ratio between two colours, as WCAG defines it.
 *
 * Between 1 (identical) and 21 (black on white). It is what decides a label's colour, because a
 * luminance threshold does not: a mid-tone fill sits near the threshold, and which side it lands on
 * has nothing to do with which text is actually easier to read on it.
 */
export function contrastRatio(a: string, b: string): number | null {
    const first = relativeLuminance(a);
    const second = relativeLuminance(b);

    if (first == null || second == null) return null;

    const lighter = Math.max(first, second);
    const darker = Math.min(first, second);

    return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Picks the label colour that reads against a given fill, which is what `auto-contrast` resolves to.
 *
 * Chosen by measuring both candidates rather than by thresholding the fill's luminance. The
 * threshold was wrong in the middle of the range, and that is exactly where a chart palette lives:
 * on a mid blue like `#5daeea`, white gives a ratio of about 2.2 and dark slate about 4.7, and a
 * luminance test still picked white. An unparseable fill falls back to the dark option, which suits
 * the light background a chart usually sits on.
 */
export function contrastingTextColor(background: string, dark = '#0f172a', light = '#ffffff'): string {
    const onDark = contrastRatio(background, dark);
    const onLight = contrastRatio(background, light);

    if (onDark == null || onLight == null) return dark;

    return onDark >= onLight ? dark : light;
}

/**
 * Interpolates a value against a multi-stop color scale. `scale` holds the breakpoints and `range`
 * the colors at them; a value outside the domain clamps to the nearest end rather than extrapolating
 * into a color that is not in the palette.
 */
export function interpolateScale(value: number, scale: readonly number[], range: readonly string[]): string {
    if (range.length === 0) return 'transparent';
    if (range.length === 1 || scale.length < 2) return range[0];

    if (value <= scale[0]) return range[0];

    const lastStop = scale[scale.length - 1];

    if (value >= lastStop) return range[Math.min(range.length - 1, scale.length - 1)];

    for (let i = 1; i < scale.length; i++) {
        if (value > scale[i]) continue;

        const span = scale[i] - scale[i - 1];
        const t = span === 0 ? 0 : (value - scale[i - 1]) / span;
        const from = range[Math.min(i - 1, range.length - 1)];
        const to = range[Math.min(i, range.length - 1)];

        return mixColors(from, to, t);
    }

    return range[range.length - 1];
}

/** Spreads breakpoints evenly across a domain, one per color of a range. */
export function evenStops(min: number, max: number, count: number): number[] {
    if (count <= 1) return [min];

    const step = (max - min) / (count - 1);

    return Array.from({ length: count }, (_, i) => min + step * i);
}

/**
 * Builds the color scale a heatmap or value-colored treemap uses, following the documented
 * resolution order: an explicit scale with an explicit range wins, then a range with breakpoints
 * derived from the data, then a single color mapped by opacity, and finally the default heat ramp.
 */
export function resolveColorScale(options: { colorScale?: number[]; colorRange?: string[]; color?: string; min: number; max: number; fallbackRange: readonly string[] }): { scale: number[]; range: string[]; opacityMapped: boolean } {
    const { colorScale, colorRange, color, min, max, fallbackRange } = options;

    if (colorScale?.length && colorRange?.length) {
        return { scale: colorScale, range: colorRange, opacityMapped: false };
    }

    if (colorRange?.length) {
        return { scale: evenStops(min, max, colorRange.length), range: colorRange, opacityMapped: false };
    }

    if (color) {
        return { scale: [min, max], range: [color, color], opacityMapped: true };
    }

    return { scale: evenStops(min, max, fallbackRange.length), range: [...fallbackRange], opacityMapped: false };
}
