/**
 * Accessor resolution.
 *
 * Nearly every styling prop is a `FieldAccessor`: a static value, a per-item array, a field name on
 * the datum, or a callback. One resolver handles all four so `color`, `markerSize` and
 * `borderRadius` behave identically, and the array semantics are decided here at the call site
 * rather than encoded in the type.
 */
import type { DashAccessor, DashPattern, DashPatternName, FieldAccessor, ItemContext } from '@openng/optimus-ui/types/charts';

/**
 * What an array-valued accessor means.
 *
 * - `cycle` — index modulo length, so a short palette repeats across a long series. This is what the
 *   color family wants: a 3-color array across 12 bars gives four runs of the palette.
 * - `clip` — an index past the end falls back to the series default. This is what a size or radius
 *   array wants: silently reusing element 0 for item 12 would look like data.
 */
export type ArrayMode = 'cycle' | 'clip';

/** How to resolve one accessor. */
export interface ResolveOptions<R> {
    /**
     * What an array means for this prop.
     */
    arrayMode: ArrayMode;
    /**
     * Value to use when the accessor yields nothing.
     */
    fallback?: R;
    /**
     * Whether a bare string should be read as a field name on the datum. A color prop must say no,
     * or `'#5daeea'` would be looked up as a property.
     */
    stringIsField?: boolean;
}

/** Reads a possibly dotted path off an object. */
export function readPath(datum: unknown, path: string): unknown {
    if (datum == null) return undefined;
    if (!path.includes('.')) return (datum as Record<string, unknown>)[path];

    let cursor: unknown = datum;

    for (const key of path.split('.')) {
        if (cursor == null || typeof cursor !== 'object') return undefined;
        cursor = (cursor as Record<string, unknown>)[key];
    }

    return cursor;
}

/**
 * Resolves an accessor for one item.
 *
 * A callback returning `undefined` deliberately means "use the series default", which is what lets
 * a per-item callback style only the items it cares about.
 */
export function resolveAccessor<T, R>(accessor: FieldAccessor<T, R> | undefined, ctx: ItemContext<T>, options: ResolveOptions<R>): R | undefined {
    const { arrayMode, fallback, stringIsField = true } = options;

    if (accessor == null) return fallback;

    if (typeof accessor === 'function') {
        const resolved = (accessor as (c: ItemContext<T>) => R | undefined)(ctx);

        return resolved === undefined ? fallback : resolved;
    }

    if (Array.isArray(accessor)) {
        const list = accessor as R[];

        if (list.length === 0) return fallback;

        if (arrayMode === 'cycle') {
            return list[((ctx.index % list.length) + list.length) % list.length];
        }

        return ctx.index < list.length ? list[ctx.index] : fallback;
    }

    if (typeof accessor === 'string' && stringIsField) {
        const read = readPath(ctx.datum, accessor);

        return read === undefined ? fallback : (read as R);
    }

    return accessor as R;
}

/** Resolves a color-family accessor, where arrays cycle and a bare string is a color. */
export function resolveColorAccessor<T, R>(accessor: FieldAccessor<T, R> | undefined, ctx: ItemContext<T>, fallback?: R): R | undefined {
    // A bare string here is a CSS color, not a field name — but a color that names no color at all
    // is far more likely to be a field name, so a plain identifier still resolves as one.
    const stringIsField = typeof accessor === 'string' && !looksLikeColor(accessor);

    return resolveAccessor(accessor, ctx, { arrayMode: 'cycle', fallback, stringIsField });
}

/** Resolves a scalar accessor, where arrays clip. */
export function resolveScalarAccessor<T, R>(accessor: FieldAccessor<T, R> | undefined, ctx: ItemContext<T>, fallback?: R): R | undefined {
    return resolveAccessor(accessor, ctx, { arrayMode: 'clip', fallback });
}

const COLOR_PREFIXES = ['#', 'rgb', 'hsl', 'oklch', 'oklab', 'lab', 'lch', 'var(', 'color-mix(', 'light-dark(', 'url(', 'transparent', 'currentcolor', 'none'];

/** A best-effort test for whether a string is meant as a color rather than a field name. */
export function looksLikeColor(value: string): boolean {
    const lower = value.trim().toLowerCase();

    return COLOR_PREFIXES.some((prefix) => lower.startsWith(prefix));
}

/** The named dash shortcuts, in the pixel patterns they stand for. */
export const DASH_PATTERNS: Record<DashPatternName, number[]> = {
    solid: [],
    dashed: [5, 5],
    dotted: [1, 3],
    dashdot: [5, 3, 1, 3],
    longdash: [10, 5]
};

/** Turns a dash pattern, named or numeric, into the numeric form a renderer needs. */
export function resolveDashPattern(pattern: DashPattern | undefined): number[] {
    if (pattern == null) return [];
    if (Array.isArray(pattern)) return pattern;

    return DASH_PATTERNS[pattern] ?? [];
}

/**
 * Resolves a dash accessor. This one is deliberately narrower than the rest: a scalar dash pattern
 * is itself a number array, so `[5, 5]` cannot be told apart from two single-element items, and the
 * array-cycle form is excluded rather than guessed at.
 */
export function resolveDashAccessor<T>(accessor: DashAccessor<T> | undefined, ctx: ItemContext<T>, fallback: number[] = []): number[] {
    if (accessor == null) return fallback;

    if (typeof accessor === 'function') {
        const resolved = accessor(ctx);

        return resolved === undefined ? fallback : resolveDashPattern(resolved);
    }

    if (Array.isArray(accessor)) return accessor;

    if (typeof accessor === 'string') {
        if (accessor in DASH_PATTERNS) return DASH_PATTERNS[accessor as DashPatternName];

        const read = readPath(ctx.datum, accessor);

        return read === undefined ? fallback : resolveDashPattern(read as DashPattern);
    }

    return fallback;
}

/** Builds an item context for one row of a dataset. */
export function itemContext<T>(datum: T, index: number, seriesIndex: number, seriesId: string, value: number | null, category?: string, extra?: Partial<ItemContext<T>>): ItemContext<T> {
    return { datum, index, seriesIndex, seriesId, value, category, ...extra };
}

/** Reads the numeric value a series binds to, through whatever accessor form was given. */
export function readNumeric<T>(accessor: FieldAccessor<T, number> | undefined, datum: T, index: number, seriesIndex: number, seriesId: string, fallbackField?: string): number | null {
    const ctx = itemContext(datum, index, seriesIndex, seriesId, null);
    const resolved = resolveScalarAccessor(accessor, ctx, undefined);

    if (typeof resolved === 'number') return Number.isFinite(resolved) ? resolved : null;

    if (resolved == null && fallbackField) {
        const read = readPath(datum, fallbackField);

        return typeof read === 'number' && Number.isFinite(read) ? read : null;
    }

    return null;
}

/** Reads the category label a series binds to, falling back to the array index. */
export function readCategory<T>(accessor: FieldAccessor<T, string> | undefined, datum: T, index: number, seriesIndex: number, seriesId: string): string {
    const ctx = itemContext(datum, index, seriesIndex, seriesId, null);
    // Widened deliberately: the prop is typed to string, but a field name resolves against real
    // data, where the same column may hold a Date or a number.
    const resolved: unknown = resolveAccessor(accessor, ctx, { arrayMode: 'clip' });

    if (typeof resolved === 'string') return resolved;
    if (resolved instanceof Date) return String(resolved.getTime());
    if (typeof resolved === 'number') return String(resolved);

    return String(index);
}
