import { describe, expect, it } from 'vitest';
import { itemContext, readCategory, resolveColorAccessor, resolveDashAccessor, resolveScalarAccessor } from './core/accessor';
import { brighten, contrastingTextColor, interpolateScale, mixColors, parseColor, resolveColorScale, withOpacity } from './core/color';
import { areaPath, curvePath, splitAtGaps } from './core/curve';
import { aggregate, kMeans, lttb, minMax } from './core/decimate';
import { getEasing, registerEasing } from './core/easing';
import { angleInSweep, arcPath, isMarkerShapeName, markerPath, resolveBorderRadius, roundedRectPath } from './core/geometry';
import { computeLayout, resolveSize, responsiveTier, rotatedBounds } from './core/layout';
import { resolveTheme, seriesColorAt } from './core/palette';
import { bandScale, linearScale, logScale, unionCategories } from './core/scale';
import { aggregateCategory, stackSeries, waterfallSteps } from './core/stack';
import { floorToUnit, linearTicks, niceStep, skipCollisions, timeTicks } from './core/ticks';
import { formatNumberTick, formatTimeTick } from './core/format';
import { paintSvgNode, serializeSvgNode, svgNode } from './core/svg-node';

// The engine is the half of Charts that has no DOM in it: scales, ticks, curves, stacking and
// decimation. It is also the half where a wrong answer is silent -- a chart still draws, it just
// draws a lie -- so this is where the tests belong.

describe('scales', () => {
    it('centres a category on its band and finds it back from a pixel', () => {
        const scale = bandScale(['Jan', 'Feb', 'Mar'], { start: 0, end: 300 });

        expect(scale.scale('Feb')).toBeGreaterThan(scale.scale('Jan'));
        expect(scale.invert(scale.scale('Feb'))).toBe('Feb');
        expect(scale.bandStart('Jan')).toBeLessThan(scale.scale('Jan'));
    });

    it('reports NaN for a category it does not have, rather than position zero', () => {
        const scale = bandScale(['Jan'], { start: 0, end: 100 });

        // Falling back to 0 would silently draw the mark at the axis origin.
        expect(Number.isNaN(scale.scale('Nope'))).toBe(true);
    });

    it('widens a flat domain so a constant series still renders', () => {
        const scale = linearScale(42, 42, { start: 0, end: 100 });

        expect(scale.domain[0]).toBeLessThan(42);
        expect(scale.domain[1]).toBeGreaterThan(42);
        expect(Number.isFinite(scale.scale(42))).toBe(true);
    });

    it('maps a linear domain onto the pixel range in both directions', () => {
        const scale = linearScale(0, 100, { start: 0, end: 200 });

        expect(scale.scale(50)).toBeCloseTo(100);
        expect(scale.invert(100)).toBeCloseTo(50);
    });

    it('clamps a log domain up off zero instead of rejecting it', () => {
        const scale = logScale(0, 1000, { start: 0, end: 100 });

        expect(scale.domain[0]).toBeGreaterThan(0);
        expect(Number.isNaN(scale.scale(0))).toBe(true);
        expect(Number.isFinite(scale.scale(100))).toBe(true);
    });

    it('gives an inverted range a positive bandwidth', () => {
        // Every y axis is inverted -- screen y grows downward while a value axis runs bottom to top
        // -- and doing the arithmetic on the signed span produced a negative bandwidth that clamped
        // to zero. Nothing noticed until a heatmap read the y band's width and every cell came out
        // zero-height.
        const inverted = bandScale(['Mon', 'Tue'], { start: 210, end: 10 }, 0.2, 0.1);

        expect(inverted.bandwidth).toBeGreaterThan(0);
        expect(inverted.step).toBeGreaterThan(0);
    });

    it('places bands in the range direction, ascending or descending', () => {
        const ascending = bandScale(['a', 'b'], { start: 0, end: 200 }, 0.2, 0.1);
        const descending = bandScale(['a', 'b'], { start: 200, end: 0 }, 0.2, 0.1);

        expect(ascending.scale('a')).toBeLessThan(ascending.scale('b'));
        expect(descending.scale('a')).toBeGreaterThan(descending.scale('b'));
    });

    it('returns the smaller coordinate from bandStart whichever way the range runs', () => {
        // So a caller can draw a rectangle from it without knowing the direction.
        const descending = bandScale(['a', 'b'], { start: 200, end: 0 }, 0.2, 0.1);

        expect(descending.bandStart('a')).toBeLessThan(descending.scale('a'));
        expect(descending.scale('a') - descending.bandStart('a')).toBeCloseTo(descending.bandwidth / 2);
    });

    it('inverts a pixel back to its category on a descending range', () => {
        const descending = bandScale(['a', 'b', 'c'], { start: 300, end: 0 }, 0.2, 0.1);

        for (const category of ['a', 'b', 'c']) expect(descending.invert(descending.scale(category))).toBe(category);
    });

    it('unions categories across series in first-seen order', () => {
        expect(unionCategories([['a', 'b'], ['b', 'c'], ['a']])).toEqual(['a', 'b', 'c']);
    });
});

describe('ticks', () => {
    it('snaps a step to a number a reader recognises', () => {
        expect(niceStep(3.7)).toBe(5);
        expect(niceStep(0.021)).toBeCloseTo(0.02);
        expect(niceStep(120)).toBe(100);
    });

    it('snaps to the nearest nice step rather than rounding up', () => {
        // A span of 20 over 8 ticks is 2.5. Rounding up gives 40/42.5/45; the nearest nice value
        // gives 40/42/44, and half-steps on integer data read as a mistake.
        expect(niceStep(2.5)).toBe(2);
        expect(niceStep(2.4)).toBe(2);
        expect(niceStep(3.5)).toBe(5);
    });

    it('keeps integer ticks on an integer domain', () => {
        for (const tick of linearTicks(40, 60, 8)) expect(Number.isInteger(tick)).toBe(true);
    });

    it('lands linear ticks on round numbers covering the domain', () => {
        const ticks = linearTicks(0, 97, 5);

        expect(ticks[0]).toBe(0);
        expect(ticks[ticks.length - 1]).toBeGreaterThanOrEqual(97);
        expect(ticks.every((t) => Number.isInteger(t / 20))).toBe(true);
    });

    it('does not leave a floating-point tail on a fractional tick', () => {
        // The bug this guards: 0.1 + 0.2 accumulating into 0.30000000000000004 on a label.
        const ticks = linearTicks(0, 1, 10);

        for (const tick of ticks) expect(String(tick).length).toBeLessThan(6);
    });

    it('floors a month to the first of the month, not to an average month length', () => {
        const march = new Date(2024, 2, 17, 13, 45).getTime();
        const floored = new Date(floorToUnit(march, 'month', 1));

        expect(floored.getMonth()).toBe(2);
        expect(floored.getDate()).toBe(1);
    });

    it('keeps time ticks on calendar boundaries across a year', () => {
        const from = new Date(2024, 0, 1).getTime();
        const to = new Date(2024, 11, 31).getTime();
        const ticks = timeTicks(from, to, 6);

        expect(ticks.length).toBeGreaterThan(2);
        for (const tick of ticks) expect(new Date(tick).getDate()).toBe(1);
    });

    it('keeps the last label when a skip would drop it', () => {
        const kept = skipCollisions([0, 1, 2, 3, 4], (n) => n * 10, 25);

        expect(kept[0]).toBe(0);
        expect(kept[kept.length - 1]).toBe(4);
    });
});

describe('curves', () => {
    const rising = [
        { x: 0, y: 100 },
        { x: 10, y: 100 },
        { x: 20, y: 50 },
        { x: 30, y: 50 }
    ];

    it('emits a move followed by lines for a linear curve', () => {
        expect(curvePath(rising, 'linear')).toBe('M 0 100 L 10 100 L 20 50 L 30 50');
    });

    it('does not overshoot a plateau when smoothing', () => {
        // Monotone cubic is the whole reason 'smooth' is not a plain spline: an overshoot here
        // would draw the series above 100, a value it never reaches.
        const d = curvePath(rising, 'smooth');
        const ys = [...d.matchAll(/[-\d.]+ ([-\d.]+)[,\s]/g)].map((m) => parseFloat(m[1]));

        expect(Math.max(...ys)).toBeLessThanOrEqual(100.001);
        expect(Math.min(...ys)).toBeGreaterThanOrEqual(49.999);
    });

    it('closes an area into a single subpath', () => {
        const d = areaPath(
            rising,
            rising.map((p) => ({ x: p.x, y: 200 }))
        );

        expect(d.startsWith('M')).toBe(true);
        expect(d.endsWith('Z')).toBe(true);
        // One move only: a second would split the fill into two shapes.
        expect(d.match(/M /g)).toHaveLength(1);
    });

    it('breaks a line into runs at a null rather than bridging it', () => {
        const runs = splitAtGaps([
            { x: 0, y: 1, value: 1, category: 'a', dataIndex: 0 },
            { x: 1, y: 2, value: null, category: 'b', dataIndex: 1 },
            { x: 2, y: 3, value: 3, category: 'c', dataIndex: 2 }
        ]);

        expect(runs).toHaveLength(2);
        expect(runs[0][0].category).toBe('a');
        expect(runs[1][0].category).toBe('c');
    });

    it('steps before and after on opposite sides of the vertex', () => {
        expect(curvePath(rising.slice(0, 2), 'step-before')).toContain('L 0 100');
        expect(curvePath(rising.slice(1, 3), 'step-after')).toContain('L 20 100');
    });
});

describe('accessors', () => {
    const ctx = (index: number, datum: Record<string, unknown> = {}) => itemContext(datum, index, 0, 's1', 1, 'cat');

    it('cycles a colour array so a short palette covers a long series', () => {
        const palette = ['red', 'green', 'blue'];

        expect(resolveColorAccessor(palette, ctx(0))).toBe('red');
        expect(resolveColorAccessor(palette, ctx(4))).toBe('green');
    });

    it('clips a scalar array to the series default instead of reusing element zero', () => {
        // Reusing element 0 for item 5 would look like data.
        expect(resolveScalarAccessor([4, 6], ctx(5), 99)).toBe(99);
        expect(resolveScalarAccessor([4, 6], ctx(1), 99)).toBe(6);
    });

    it('reads a field name off the datum but leaves a colour string alone', () => {
        expect(resolveScalarAccessor('score', ctx(0, { score: 7 }))).toBe(7);
        expect(resolveColorAccessor('#5daeea', ctx(0, { '#5daeea': 'no' }))).toBe('#5daeea');
        expect(resolveColorAccessor('brand', ctx(0, { brand: 'teal' }))).toBe('teal');
    });

    it('falls back to the series default when a callback returns undefined', () => {
        expect(resolveScalarAccessor<Record<string, unknown>, number>(() => undefined, ctx(0), 12)).toBe(12);
    });

    it('resolves a named dash pattern to pixels', () => {
        expect(resolveDashAccessor('dashed', ctx(0))).toEqual([5, 5]);
        expect(resolveDashAccessor([2, 2], ctx(0))).toEqual([2, 2]);
    });

    it('falls back to the array index when no category field resolves', () => {
        expect(readCategory(undefined, {}, 3, 0, 's1')).toBe('3');
    });
});

describe('colour', () => {
    it('parses the hex and rgb forms it can compute with', () => {
        expect(parseColor('#5daeea')).toEqual({ r: 93, g: 174, b: 234, a: 1 });
        expect(parseColor('rgba(0, 0, 0, 0.5)')).toEqual({ r: 0, g: 0, b: 0, a: 0.5 });
        expect(parseColor('#fff')).toEqual({ r: 255, g: 255, b: 255, a: 1 });
    });

    it('leaves a colour it cannot parse untouched rather than guessing', () => {
        // A CSS variable has no value here; producing one would be inventing a colour.
        expect(parseColor('var(--p-chart-color-0)')).toBeNull();
        expect(brighten('var(--p-chart-color-0)', 1.4)).toBe('var(--p-chart-color-0)');
        expect(withOpacity('oklch(0.7 0.1 220)', 0.3)).toBe('oklch(0.7 0.1 220)');
    });

    it('brightens and fades a parseable colour', () => {
        expect(brighten('#808080', 1.5)).toBe('rgb(192, 192, 192)');
        expect(withOpacity('#000000', 0.5)).toBe('rgba(0, 0, 0, 0.5)');
    });

    it('picks a label colour that reads against the fill', () => {
        expect(contrastingTextColor('#ffffff')).toBe('#0f172a');
        expect(contrastingTextColor('#0f172a')).toBe('#ffffff');
    });

    it('clamps a heat scale at its ends instead of extrapolating', () => {
        const scale = [0, 50, 100];
        const range = ['#000000', '#808080', '#ffffff'];

        expect(interpolateScale(-10, scale, range)).toBe('#000000');
        expect(interpolateScale(200, scale, range)).toBe('#ffffff');
        expect(interpolateScale(25, scale, range)).toBe(mixColors('#000000', '#808080', 0.5));
    });

    it('resolves a colour scale in the documented priority order', () => {
        expect(resolveColorScale({ colorScale: [0, 10], colorRange: ['a', 'b'], min: 0, max: 100, fallbackRange: ['z'] }).scale).toEqual([0, 10]);
        expect(resolveColorScale({ colorRange: ['a', 'b'], min: 0, max: 100, fallbackRange: ['z'] }).scale).toEqual([0, 100]);
        expect(resolveColorScale({ color: 'teal', min: 0, max: 100, fallbackRange: ['z'] }).opacityMapped).toBe(true);
        expect(resolveColorScale({ min: 0, max: 100, fallbackRange: ['y', 'z'] }).range).toEqual(['y', 'z']);
    });
});

describe('palette and theme', () => {
    it('cycles the series palette rather than repeating its last colour', () => {
        const palette = ['a', 'b', 'c'];

        expect(seriesColorAt(palette, 3)).toBe('a');
        expect(seriesColorAt(palette, -1)).toBe('c');
    });

    it('merges a partial theme over the defaults and keeps the base palette', () => {
        const theme = resolveTheme({ grid: '#123456' }, false);

        expect(theme.grid).toBe('#123456');
        expect(theme.series?.length).toBe(14);
    });

    it('uses the dark ramp when the scheme is dark', () => {
        expect(resolveTheme(undefined, true).series?.[0]).toBe('#6bbbed');
        expect(resolveTheme(undefined, false).series?.[0]).toBe('#5daeea');
    });
});

describe('layout', () => {
    it('subtracts every reservation from the plot area', () => {
        const { chartArea } = computeLayout({
            width: 400,
            height: 300,
            reservations: [
                { position: 'left', size: 40 },
                { position: 'bottom', size: 30 },
                { position: 'bottom', size: 20 }
            ]
        });

        expect(chartArea).toEqual({ x: 40, y: 0, width: 360, height: 250 });
    });

    it('clamps a plot area to zero instead of letting it go negative', () => {
        // A negative width propagates into every scale and draws marks outside the chart.
        const { chartArea } = computeLayout({ width: 50, height: 50, reservations: [{ position: 'left', size: 200 }] });

        expect(chartArea.width).toBe(0);
    });

    it('places a container width in the right responsive tier', () => {
        expect(responsiveTier(250)).toBe('xs');
        expect(responsiveTier(400)).toBe('sm');
        expect(responsiveTier(600)).toBe('md');
        expect(responsiveTier(900)).toBe('lg');
    });

    it('treats an explicit size as a maximum while responsive', () => {
        expect(resolveSize({ containerWidth: 300, containerHeight: 300, width: 500, height: 400 })).toEqual({ width: 300, height: 300 });
        expect(resolveSize({ containerWidth: 300, containerHeight: 300, width: 500, responsive: false }).width).toBe(500);
    });

    it('derives height from an aspect ratio when one is set', () => {
        expect(resolveSize({ containerWidth: 320, containerHeight: 999, aspectRatio: 16 / 9 }).height).toBeCloseTo(180);
    });

    it('grows the bounding box of a rotated label', () => {
        const flat = rotatedBounds(100, 12, 0);
        const tilted = rotatedBounds(100, 12, 45);

        expect(flat.height).toBe(12);
        expect(tilted.height).toBeGreaterThan(flat.height);
    });
});

describe('geometry', () => {
    it('tells a built-in marker name from custom path data', () => {
        expect(isMarkerShapeName('star')).toBe(true);
        expect(isMarkerShapeName('M 0 0 L 5 5')).toBe(false);
    });

    it('centres every built-in marker on the origin', () => {
        for (const shape of ['circle', 'square', 'triangle', 'cross', 'star'] as const) {
            const d = markerPath(shape, 6);
            const numbers = [...d.matchAll(/-?\d+(?:\.\d+)?/g)].map((m) => parseFloat(m[0]));

            expect(Math.min(...numbers)).toBeLessThan(0);
            expect(Math.max(...numbers)).toBeGreaterThan(0);
        }
    });

    it('normalises a border radius to four corners', () => {
        expect(resolveBorderRadius(4)).toEqual({ topLeft: 4, topRight: 4, bottomLeft: 4, bottomRight: 4 });
        expect(resolveBorderRadius({ topLeft: 2 }).bottomRight).toBe(0);
    });

    it('caps a corner radius so a big radius cannot invert a small bar', () => {
        const d = roundedRectPath(0, 0, 10, 4, 50);
        const arcRadii = [...d.matchAll(/A (\d+(?:\.\d+)?)/g)].map((m) => parseFloat(m[1]));

        for (const r of arcRadii) expect(r).toBeLessThanOrEqual(2);
    });

    it('draws a full-circle slice as two arcs so it does not vanish', () => {
        // A single arc whose start and end coincide is degenerate and renders nothing.
        const d = arcPath(50, 50, 0, 40, 0, 360);

        expect(d.match(/A /g)?.length).toBeGreaterThanOrEqual(2);
        expect(d.length).toBeGreaterThan(0);
    });

    it('handles a sweep that crosses zero degrees', () => {
        expect(angleInSweep(350, 340, 20)).toBe(true);
        expect(angleInSweep(10, 340, 20)).toBe(true);
        expect(angleInSweep(180, 340, 20)).toBe(false);
    });
});

describe('stacking', () => {
    const inputs = [
        {
            id: 'a',
            order: 0,
            values: new Map([
                ['Q1', 10],
                ['Q2', -5]
            ])
        },
        {
            id: 'b',
            order: 1,
            values: new Map([
                ['Q1', 20],
                ['Q2', 15]
            ])
        }
    ];

    it('stacks absolute values from the bottom up', () => {
        const result = stackSeries(inputs, ['Q1'], 'normal');

        expect(result.get('a')!.get('Q1')).toEqual({ base: 0, top: 10 });
        expect(result.get('b')!.get('Q1')).toEqual({ base: 10, top: 30 });
    });

    it('stacks a negative value downward rather than cancelling it out', () => {
        // +15 on top of -5 must stay two visible bars, not a net 10 with the negative lost.
        const result = stackSeries(inputs, ['Q2'], 'normal');

        expect(result.get('a')!.get('Q2')).toEqual({ base: 0, top: -5 });
        expect(result.get('b')!.get('Q2')).toEqual({ base: 0, top: 15 });
    });

    it('normalises a percent stack by magnitude so mixed signs still total 100', () => {
        const mixed = [
            { id: 'a', order: 0, values: new Map([['Q1', 30]]) },
            { id: 'b', order: 1, values: new Map([['Q1', -70]]) }
        ];
        const result = stackSeries(mixed, ['Q1'], 'percent');

        expect(result.get('a')!.get('Q1')!.top).toBeCloseTo(30);
        expect(Math.abs(result.get('b')!.get('Q1')!.top)).toBeCloseTo(70);
    });

    it('leaves a hole where a category has no value', () => {
        const sparse = [{ id: 'a', order: 0, values: new Map<string, number | null>([['Q1', null]]) }];

        expect(stackSeries(sparse, ['Q1'], 'normal').get('a')!.has('Q1')).toBe(false);
    });

    it('spans a waterfall total from zero instead of continuing the chain', () => {
        const steps = waterfallSteps([100, -30, 20, null], [false, false, false, true]);

        expect(steps[0]).toMatchObject({ base: 0, top: 100 });
        expect(steps[1]).toMatchObject({ base: 100, top: 70, isNegative: true });
        expect(steps[2]).toMatchObject({ base: 70, top: 90 });
        expect(steps[3]).toMatchObject({ base: 0, top: 90, isTotal: true });
    });

    it('combines a category by the requested aggregate', () => {
        expect(aggregateCategory([1, 2, 3], 'sum')).toBe(6);
        expect(aggregateCategory([1, null, 3], 'max')).toBe(3);
        expect(aggregateCategory([], 'sum')).toBe(0);
    });
});

describe('decimation', () => {
    const spiky = Array.from({ length: 500 }, (_, i) => ({ x: i, y: i === 250 ? 1000 : Math.sin(i / 10) * 10, index: i }));

    it('keeps the endpoints and hits the target count with lttb', () => {
        const out = lttb(spiky, 50);

        expect(out).toHaveLength(50);
        expect(out[0].index).toBe(0);
        expect(out[out.length - 1].index).toBe(499);
    });

    it('keeps a lone spike that plain sampling would step over', () => {
        // This is the whole point of decimating by shape rather than by stride.
        expect(lttb(spiky, 50).some((s) => s.index === 250)).toBe(true);
        expect(minMax(spiky, 50).some((s) => s.index === 250)).toBe(true);
    });

    it('preserves the exact vertical envelope with min-max', () => {
        const out = minMax(spiky, 50);

        expect(Math.max(...out.map((s) => s.y))).toBe(1000);
    });

    it('emits min-max points in the order they occur', () => {
        const out = minMax(spiky, 50);

        for (let i = 1; i < out.length; i++) expect(out[i].index).toBeGreaterThanOrEqual(out[i - 1].index);
    });

    it('returns the data untouched below the target', () => {
        expect(lttb(spiky.slice(0, 10), 50)).toHaveLength(10);
    });

    it('decimates a scatter cloud to the same output on every call', () => {
        // A cloud that shimmered between frames would be unusable, so the seeding is deterministic.
        const cloud = Array.from({ length: 400 }, (_, i) => ({ x: Math.cos(i) * 50, y: Math.sin(i) * 50, index: i }));

        expect(kMeans(cloud, 20).map((s) => s.index)).toEqual(kMeans(cloud, 20).map((s) => s.index));
    });

    it('returns real data points as cluster representatives', () => {
        const cloud = Array.from({ length: 100 }, (_, i) => ({ x: i, y: i * 2, index: i }));

        for (const sample of kMeans(cloud, 10)) expect(cloud[sample.index]).toEqual(sample);
    });

    it('aggregates a group by the named method', () => {
        expect(aggregate([1, 2, 3], 'sum')).toBe(6);
        expect(aggregate([1, 2, 3], 'average')).toBe(2);
        expect(aggregate([1, 2, 3], 'last')).toBe(3);
    });
});

describe('easing', () => {
    it('starts at zero and ends at one for every preset', () => {
        for (const name of ['linear', 'easeOutQuart', 'easeOutElastic', 'easeInOutBounce', 'easeOutExpo']) {
            const fn = getEasing(name);

            expect(fn(0)).toBeCloseTo(0, 5);
            expect(fn(1)).toBeCloseTo(1, 5);
        }
    });

    it('falls back to the default curve for an unknown name', () => {
        // A typo should degrade to a working animation, not throw mid-frame.
        expect(getEasing('nope')(0.5)).toBeCloseTo(getEasing('easeOutQuart')(0.5));
    });

    it('prefers a registered curve over a preset of the same name', () => {
        registerEasing('linear', () => 0.42);

        expect(getEasing('linear')(0.1)).toBe(0.42);
    });
});

describe('formatting', () => {
    it('abbreviates a large axis value and keeps a small one exact', () => {
        expect(formatNumberTick(1200000, 'en-US')).toBe('1.2M');
        expect(formatNumberTick(0.5, 'en-US')).toBe('0.5');
    });

    it('follows the locale for numerals and month names', () => {
        expect(formatNumberTick(1234.5, 'de-DE')).toBe('1234,5');
        expect(formatTimeTick(new Date(2024, 2, 3).getTime(), 'day', 'en-US')).toContain('Mar');
    });
});

describe('svg descriptors', () => {
    it('serialises a node tree to markup', () => {
        const node = svgNode('g', {}, [svgNode('circle', { r: 4, fill: '#5daeea' }), svgNode('text', { x: 0 }, ['12'])]);

        expect(serializeSvgNode(node)).toBe('<g><circle r="4" fill="#5daeea" /><text x="0">12</text></g>');
    });

    it('drops null attributes and escapes the values it keeps', () => {
        expect(serializeSvgNode(svgNode('text', { fill: null, 'aria-label': 'a "b" & c' }, []))).toBe('<text aria-label="a &quot;b&quot; &amp; c" />');
    });

    it('paints the same descriptor onto a canvas context', () => {
        const calls: string[] = [];
        const ctx = {
            save: () => calls.push('save'),
            restore: () => calls.push('restore'),
            beginPath: () => calls.push('beginPath'),
            arc: () => calls.push('arc'),
            fill: () => calls.push('fill'),
            stroke: () => calls.push('stroke'),
            translate: () => calls.push('translate'),
            rotate: () => {},
            scale: () => {},
            setLineDash: () => {},
            rect: () => {},
            moveTo: () => {},
            lineTo: () => {},
            closePath: () => {},
            fillText: (text: string) => calls.push(`fillText:${text}`),
            measureText: () => ({ width: 0 }),
            globalAlpha: 1,
            fillStyle: '',
            strokeStyle: '',
            lineWidth: 1,
            font: '',
            textAlign: 'left',
            textBaseline: 'alphabetic'
        } as unknown as CanvasRenderingContext2D;

        paintSvgNode(svgNode('g', { transform: 'translate(5, 5)' }, [svgNode('circle', { r: 4, fill: '#000' }), svgNode('text', { x: 0, y: 0, fill: '#000' }, ['7'])]), ctx);

        expect(calls).toContain('translate');
        expect(calls).toContain('arc');
        expect(calls).toContain('fillText:7');
    });
});
