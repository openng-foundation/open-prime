import { describe, expect, it } from 'vitest';
import { computed, signal, type Signal } from '@angular/core';
import type { AxisScale, BarSeriesProps, BaseAxisProps, ChartTheme, LineSeriesProps, SvgNode } from '@openng/optimus-ui/types/charts';
import { bandScale, linearScale } from './core/scale';
import { defaultLightTheme, LIGHT_SERIES_PALETTE, seriesColorAt } from './core/palette';
import { serializeSvgNode } from './core/svg-node';
import type { ChartContext, SeriesRegistration } from './charts-registry';
import type { ResolvedSeries, SeriesPoint } from './charts-state';
import { buildScene } from './render/build-scene';
import type { DrawContext } from './render/scene';
import { resolveAxis } from './render/axis';

// The scene is where the engine's numbers become marks. Testing it directly -- with a hand-built
// context rather than a mounted component -- is what lets these assertions be about geometry
// instead of about Angular.

const AREA = { x: 40, y: 10, width: 400, height: 200 };

function drawContext(overrides: Partial<DrawContext> = {}): DrawContext {
    return {
        area: AREA,
        scales: new Map<string, AxisScale>([
            ['x:default', bandScale(['Jan', 'Feb', 'Mar'], { start: AREA.x, end: AREA.x + AREA.width }, 0.2, 0.1)],
            ['y:default', linearScale(0, 100, { start: AREA.y + AREA.height, end: AREA.y })]
        ]),
        theme: defaultLightTheme as ChartTheme,
        isDark: false,
        fontFamily: 'system-ui, sans-serif',
        fontSize: 12,
        direction: 'ltr',
        locale: 'en-US',
        progress: 1,
        hover: null,
        hoverEffect: null,
        isItemVisible: () => true,
        chartId: 'chart-1',
        // A fixed width per character keeps the collision assertions deterministic, which a real
        // font measurement in a headless environment would not be.
        measureText: (text, fontSize) => text.length * fontSize * 0.6,
        seriesColor: (seriesIndex) => seriesColorAt(LIGHT_SERIES_PALETTE, seriesIndex),
        ...overrides
    };
}

function points(values: (number | null)[], categories = ['Jan', 'Feb', 'Mar']): SeriesPoint[] {
    return values.map((value, i) => ({ category: categories[i] ?? String(i), value, base: 0, dataIndex: i }));
}

function series(type: ResolvedSeries['type'], props: object, values: (number | null)[], overrides: Partial<ResolvedSeries> = {}): ResolvedSeries {
    const registration: SeriesRegistration = {
        id: overrides.id ?? `${type}-1`,
        type,
        props: computed(() => props) as never,
        seriesIndex: signal(overrides.seriesIndex ?? 0)
    };

    const resolved: ResolvedSeries = {
        id: registration.id,
        type,
        seriesIndex: overrides.seriesIndex ?? 0,
        points: overrides.points ?? points(values),
        categories: ['Jan', 'Feb', 'Mar'],
        xAxisId: 'default',
        yAxisId: 'default',
        categoryAxis: 'x',
        continuousX: false,
        yCategories: [],
        visible: overrides.visible ?? true,
        registration
    };

    return resolved;
}

function fakeContext(axes: { axis: 'x' | 'y'; id: string; props: BaseAxisProps & { position?: string } }[] = [], features: { type: string; props: object }[] = []): ChartContext {
    const noop = () => () => {};

    return {
        renderer: 'svg',
        chartArea: signal(AREA),
        width: signal(480),
        height: signal(220),
        scales: signal(new Map()),
        domains: signal(new Map()),
        xScale: signal(undefined),
        yScale: signal(undefined),
        theme: signal(defaultLightTheme as ChartTheme),
        isDark: signal(false),
        textColor: signal('#0f172a'),
        fontFamily: signal('system-ui, sans-serif'),
        fontSize: signal(12),
        direction: signal('ltr'),
        locale: signal('en-US'),
        progress: signal(1),
        hover: signal(null),
        hiddenDatasets: signal(new Set<string>()),
        hiddenItems: signal(new Map()),
        registerSeries: noop,
        registerFeature: noop,
        registerAxis: noop,
        reserve: noop,
        series: signal([]),
        features: signal(features.map((entry) => ({ type: entry.type, props: computed(() => entry.props) })) as never),
        axes: signal(axes.map((entry) => ({ axis: entry.axis, id: entry.id, props: computed(() => entry.props) })) as never),
        feature: ((type: string) => computed(() => features.filter((entry) => entry.type === type).map((entry) => ({ type, props: computed(() => entry.props) }))[0])) as never,
        isDatasetVisible: () => true,
        isItemVisible: () => true,
        toggleDataset: () => {},
        toggleItems: () => {},
        setHover: () => {},
        requestRender: () => {}
    } as unknown as ChartContext;
}

/** Flattens a scene into markup, which is the easiest thing to make assertions about. */
function markupOf(layers: { key: string; nodes: SvgNode[] }[]): string {
    return layers.map((layer) => layer.nodes.map(serializeSvgNode).join('')).join('');
}

/** Collects every node in a scene, at any depth. */
function allNodes(layers: { key: string; nodes: SvgNode[] }[]): SvgNode[] {
    const out: SvgNode[] = [];
    const walk = (node: SvgNode) => {
        out.push(node);
        for (const child of node.children) {
            if (typeof child !== 'string') walk(child);
        }
    };

    for (const layer of layers) {
        for (const node of layer.nodes) walk(node);
    }

    return out;
}

describe('scene composition', () => {
    const axes = [
        { axis: 'x' as const, id: 'default', props: { id: 'default', type: 'category' as const } },
        { axis: 'y' as const, id: 'default', props: { id: 'default', type: 'linear' as const } }
    ];

    it('grids the value axis but not the category axis by default', () => {
        // A grid line lets a reader carry a mark's height back to a number, and a category axis has
        // no number to carry back to -- so `gridLines: auto` means value-axis only.
        const scene = buildScene(fakeContext(axes), [series('line', { data: [{}, {}, {}] }, [10, 50, 90])], drawContext());
        const grid = scene.layers.find((layer) => layer.key === 'grid')!;
        const groups = grid.nodes.map((node) => String(node.attrs['data-axis-id']));

        expect(groups).toEqual(['default']);

        const lines = allNodes([grid]).filter((node) => String(node.attrs['class'] ?? '') === 'p-chart-grid-line');

        // Horizontal only: every grid line spans the full plot width.
        for (const line of lines) expect(line.attrs['x1']).not.toBe(line.attrs['x2']);
    });

    it('grids the category axis when asked to explicitly', () => {
        const withGrid = [
            { axis: 'x' as const, id: 'default', props: { id: 'default', type: 'category' as const, gridLines: true } },
            { axis: 'y' as const, id: 'default', props: { id: 'default', type: 'linear' as const } }
        ];
        const scene = buildScene(fakeContext(withGrid), [series('line', { data: [{}, {}, {}] }, [10, 50, 90])], drawContext());
        const lines = allNodes(scene.layers.filter((layer) => layer.key === 'grid')).filter((node) => String(node.attrs['class'] ?? '') === 'p-chart-grid-line');

        expect(lines.some((line) => line.attrs['x1'] === line.attrs['x2'])).toBe(true);
    });

    it('draws an axis, a grid and a line from one pass', () => {
        const ctx = drawContext();
        const context = fakeContext(axes);
        const line = series('line', { data: [{}, {}, {}], categoryXField: 'c', valueYField: 'v' } satisfies LineSeriesProps, [10, 50, 90]);

        const scene = buildScene(context, [line], ctx);
        const keys = scene.layers.map((layer) => layer.key);

        expect(keys).toContain('grid');
        expect(keys).toContain('axes');
        expect(keys).toContain('marks');
        // Grid under the marks, axes under them too: the z-order is the layer order.
        expect(keys.indexOf('grid')).toBeLessThan(keys.indexOf('marks'));
    });

    it('emits a line path that stays inside the plot area', () => {
        const scene = buildScene(fakeContext(axes), [series('line', { data: [{}, {}, {}] }, [10, 50, 90])], drawContext());
        const path = allNodes(scene.layers).find((node) => node.tag === 'path' && String(node.attrs['class'] ?? '').includes('p-chart-line'));

        expect(path).toBeDefined();

        const coords = [...String(path!.attrs['d']).matchAll(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g)].map((m) => [parseFloat(m[1]), parseFloat(m[2])]);

        expect(coords.length).toBeGreaterThan(0);

        for (const [x, y] of coords) {
            expect(x).toBeGreaterThanOrEqual(AREA.x - 1);
            expect(x).toBeLessThanOrEqual(AREA.x + AREA.width + 1);
            expect(y).toBeGreaterThanOrEqual(AREA.y - 1);
            expect(y).toBeLessThanOrEqual(AREA.y + AREA.height + 1);
        }
    });

    it('puts a higher value higher on screen', () => {
        // The y range is inverted on purpose -- SVG y grows downward -- and getting that backwards
        // draws every chart upside down, which is why it is asserted rather than assumed.
        const scene = buildScene(fakeContext(axes), [series('line', { data: [{}, {}, {}] }, [10, 50, 90])], drawContext());
        const path = allNodes(scene.layers).find((node) => node.tag === 'path' && String(node.attrs['class'] ?? '').includes('p-chart-line'))!;
        const ys = [...String(path.attrs['d']).matchAll(/-?\d+(?:\.\d+)? (-?\d+(?:\.\d+)?)/g)].map((m) => parseFloat(m[1]));

        expect(ys[0]).toBeGreaterThan(ys[ys.length - 1]);
    });

    it('omits the fill until fillOpacity asks for one', () => {
        const line = { data: [{}, {}, {}] } satisfies LineSeriesProps;
        const withoutFill = buildScene(fakeContext(axes), [series('line', line, [10, 50, 90])], drawContext());

        expect(markupOf(withoutFill.layers)).not.toContain('p-chart-area');

        const withFill = buildScene(fakeContext(axes), [series('line', { ...line, fillOpacity: 0.4 }, [10, 50, 90])], drawContext());

        expect(markupOf(withFill.layers)).toContain('p-chart-area');
    });

    it('breaks a line at a null instead of bridging it', () => {
        const scene = buildScene(fakeContext(axes), [series('line', { data: [{}, {}, {}] }, [10, null, 90])], drawContext());
        const paths = allNodes(scene.layers).filter((node) => node.tag === 'path' && String(node.attrs['class'] ?? '').includes('p-chart-line'));

        // Two runs, not one path straight through the gap.
        expect(paths).toHaveLength(2);
    });

    it('bridges the gap when connectNulls asks it to', () => {
        const scene = buildScene(fakeContext(axes), [series('line', { data: [{}, {}, {}], connectNulls: 'connect' }, [10, null, 90])], drawContext());
        const paths = allNodes(scene.layers).filter((node) => node.tag === 'path' && String(node.attrs['class'] ?? '').includes('p-chart-line'));

        expect(paths).toHaveLength(1);
    });

    it('draws bars from the baseline, with a negative bar the other way', () => {
        const scaled = drawContext({
            scales: new Map<string, AxisScale>([
                ['x:default', bandScale(['Jan', 'Feb', 'Mar'], { start: AREA.x, end: AREA.x + AREA.width }, 0.2, 0.1)],
                ['y:default', linearScale(-50, 100, { start: AREA.y + AREA.height, end: AREA.y })]
            ])
        });
        const scene = buildScene(fakeContext(axes), [series('bar', { data: [{}, {}, {}] } satisfies BarSeriesProps, [50, -30, 90])], scaled);
        const bars = allNodes(scene.layers).filter((node) => String(node.attrs['data-slot']) === 'chart-bar');

        expect(bars).toHaveLength(3);

        const baseline = scaled.scales.get('y:default')!.scale(0);
        const tops = bars.map((bar) => [...String(bar.attrs['d']).matchAll(/-?\d+(?:\.\d+)?\s(-?\d+(?:\.\d+)?)/g)].map((m) => parseFloat(m[1])));

        // The positive bars sit above the baseline and the negative one below it.
        expect(Math.min(...tops[0])).toBeLessThan(baseline);
        expect(Math.max(...tops[1])).toBeGreaterThan(baseline);
    });

    it('divides a band between grouped bar series without overlapping them', () => {
        const first = series('bar', { data: [{}, {}, {}] }, [50, 60, 70], { id: 'bar-a', seriesIndex: 0 });
        const second = series('bar', { data: [{}, {}, {}] }, [30, 40, 50], { id: 'bar-b', seriesIndex: 1 });
        const scene = buildScene(fakeContext(axes), [first, second], drawContext());
        const bars = allNodes(scene.layers).filter((node) => String(node.attrs['data-slot']) === 'chart-bar');
        const firstJan = bars.find((bar) => bar.attrs['data-series'] === 'bar-a' && bar.attrs['data-index'] === 0)!;
        const secondJan = bars.find((bar) => bar.attrs['data-series'] === 'bar-b' && bar.attrs['data-index'] === 0)!;

        const xOf = (node: SvgNode) => parseFloat(String(node.attrs['d']).match(/M (-?\d+(?:\.\d+)?)/)![1]);

        // Side by side, which is the documented default for bar series with no ChartStacked.
        expect(xOf(firstJan)).toBeLessThan(xOf(secondJan));
    });

    it('skips a hidden series but keeps drawing the rest', () => {
        const visible = series('line', { data: [{}, {}, {}] }, [10, 50, 90], { id: 'line-a' });
        const hidden = series('line', { data: [{}, {}, {}] }, [20, 30, 40], { id: 'line-b', visible: false, seriesIndex: 1 });
        const markup = markupOf(buildScene(fakeContext(axes), [visible, hidden], drawContext()).layers);

        expect(markup).toContain('data-series="line-a"');
        expect(markup).not.toContain('data-series="line-b"');
    });

    it('never emits a path with a non-finite coordinate', () => {
        // The bug this guards: a bare <p-chart-y-axis /> defaulted to a category scale, so every
        // y position came out NaN and the browser rejected `M NaN NaN L NaN NaN` once per mark.
        const scene = buildScene(fakeContext(axes), [series('line', { data: [{}, {}, {}] }, [10, 50, 90]), series('bar', { data: [{}, {}, {}] }, [20, 40, 60], { id: 'bar-x', seriesIndex: 1 })], drawContext());

        for (const node of allNodes(scene.layers)) {
            for (const [name, value] of Object.entries(node.attrs)) {
                if (value == null) continue;
                expect(String(value), `${node.tag}.${name}`).not.toMatch(/NaN|Infinity/);
            }
        }
    });

    it('draws nothing rather than NaN geometry when a scale is missing', () => {
        const withoutScales = drawContext({ scales: new Map() });
        const scene = buildScene(fakeContext(axes), [series('line', { data: [{}, {}, {}] }, [10, 50, 90])], withoutScales);

        expect(markupOf(scene.layers)).not.toContain('NaN');
    });

    it('draws nothing rather than NaN geometry when the value axis is categorical', () => {
        // Two band scales leave no numbers to measure a bar against.
        const bothBands = drawContext({
            scales: new Map<string, AxisScale>([
                ['x:default', bandScale(['Jan', 'Feb', 'Mar'], { start: AREA.x, end: AREA.x + AREA.width }, 0.2, 0.1)],
                ['y:default', bandScale(['a', 'b'], { start: AREA.y + AREA.height, end: AREA.y }, 0.2, 0.1)]
            ])
        });
        const scene = buildScene(fakeContext(axes), [series('bar', { data: [{}, {}, {}] }, [20, 40, 60])], bothBands);

        expect(markupOf(scene.layers)).not.toContain('NaN');
    });

    it('skips a category the axis domain does not contain', () => {
        // A category absent from the domain has no position, so it is a gap rather than a NaN point.
        const partial = drawContext({
            scales: new Map<string, AxisScale>([
                ['x:default', bandScale(['Jan', 'Mar'], { start: AREA.x, end: AREA.x + AREA.width }, 0, 0.05)],
                ['y:default', linearScale(0, 100, { start: AREA.y + AREA.height, end: AREA.y })]
            ])
        });
        const scene = buildScene(fakeContext(axes), [series('line', { data: [{}, {}, {}] }, [10, 50, 90])], partial);
        const paths = allNodes(scene.layers).filter((node) => node.tag === 'path' && String(node.attrs['class'] ?? '').includes('p-chart-line'));

        expect(markupOf(scene.layers)).not.toContain('NaN');
        // Jan and Mar are placed, Feb is not, so the line breaks into two runs.
        expect(paths).toHaveLength(2);
    });

    it('draws nothing at all when the plot area has collapsed', () => {
        const collapsed = drawContext({ area: { x: 0, y: 0, width: 0, height: 0 } });
        const scene = buildScene(fakeContext(axes), [series('line', { data: [{}] }, [10])], collapsed);

        expect(scene.layers).toHaveLength(0);
    });

    it('carries the public data attributes every mark is meant to expose', () => {
        const scene = buildScene(fakeContext(axes), [series('bar', { data: [{}, {}, {}] }, [50, 60, 70])], drawContext());
        const bar = allNodes(scene.layers).find((node) => String(node.attrs['data-slot']) === 'chart-bar')!;

        // These are the documented styling and testing hooks, so they are part of the contract
        // rather than an implementation detail.
        expect(bar.attrs['data-series']).toBe('bar-1');
        expect(bar.attrs['data-index']).toBe(0);
        expect(bar.attrs['data-category']).toBe('Jan');
    });

    it('colours a waterfall by direction and leaves the total neutral', () => {
        // A waterfall exists to show what went up and what came down, so painting every step the
        // same colour defeats the chart.
        const registration: SeriesRegistration = {
            id: 'wf',
            type: 'bar',
            props: computed(() => ({ data: [{}, {}, {}] })) as never,
            seriesIndex: signal(0),
            waterfall: { totalField: 'total' }
        };
        const resolved: ResolvedSeries = {
            id: 'wf',
            type: 'bar',
            seriesIndex: 0,
            points: [
                { category: 'Jan', value: 100, base: 0, dataIndex: 0 },
                { category: 'Feb', value: 70, base: 100, dataIndex: 1 },
                { category: 'Mar', value: 70, base: 0, dataIndex: 2, isTotal: true }
            ],
            categories: ['Jan', 'Feb', 'Mar'],
            xAxisId: 'default',
            yAxisId: 'default',
            categoryAxis: 'x',
            continuousX: false,
            yCategories: [],
            visible: true,
            registration
        };

        const scene = buildScene(fakeContext(axes), [resolved], drawContext());
        const bars = allNodes(scene.layers).filter((node) => String(node.attrs['data-slot']) === 'chart-bar');
        const directions = bars.map((bar) => bar.attrs['data-direction']);

        expect(directions).toEqual(['positive', 'negative', 'total']);
        expect(bars[0].attrs['fill']).toBe(defaultLightTheme.positive);
        expect(bars[1].attrs['fill']).toBe(defaultLightTheme.negative);
        // The summary is neither a rise nor a fall, so it keeps the series colour.
        expect(bars[2].attrs['fill']).toBe(seriesColorAt(LIGHT_SERIES_PALETTE, 0));
    });

    it('registers a gradient definition when a series is filled with one', () => {
        const gradient = {
            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
            stops: [
                { offset: 0, color: '#5daeea' },
                { offset: 1, color: 'transparent' }
            ]
        };
        const scene = buildScene(fakeContext(axes), [series('line', { data: [{}, {}, {}], color: gradient, fillOpacity: 1 }, [10, 50, 90])], drawContext());
        const def = scene.defs.find((node) => node.tag === 'linearGradient');

        expect(def).toBeDefined();
        expect(def!.children).toHaveLength(2);
        expect(markupOf(scene.layers)).toContain(`url(#${def!.attrs['id']})`);
    });

    it('grows marks out of the baseline while the entrance animation runs', () => {
        // Animating the geometry rather than the opacity means every mark on screen mid-animation
        // is at a real value, rather than a final value shown faintly.
        const half = drawContext({ progress: 0.5 });
        const full = drawContext({ progress: 1 });
        const heightOf = (ctx: DrawContext) => {
            const scene = buildScene(fakeContext(axes), [series('bar', { data: [{}] }, [100], { points: points([100], ['Jan']) })], ctx);
            const bar = allNodes(scene.layers).find((node) => String(node.attrs['data-slot']) === 'chart-bar')!;
            const ys = [...String(bar.attrs['d']).matchAll(/-?\d+(?:\.\d+)?\s(-?\d+(?:\.\d+)?)/g)].map((m) => parseFloat(m[1]));

            return Math.max(...ys) - Math.min(...ys);
        };

        expect(heightOf(half)).toBeLessThan(heightOf(full));
        expect(heightOf(half)).toBeGreaterThan(0);
    });
});

describe('radial series', () => {
    const noAxes: { axis: 'x' | 'y'; id: string; props: BaseAxisProps & { position?: string } }[] = [];

    function pie(props: object, values: number[], labels: string[]): ResolvedSeries {
        const registration: SeriesRegistration = { id: 'pie-1', type: 'pie', props: computed(() => props) as never, seriesIndex: signal(0) };

        return {
            id: 'pie-1',
            type: 'pie',
            seriesIndex: 0,
            points: values.map((value, i) => ({ category: labels[i], value, base: 0, dataIndex: i })),
            categories: labels,
            xAxisId: 'default',
            yAxisId: 'default',
            categoryAxis: 'x',
            continuousX: false,
            yCategories: [],
            visible: true,
            registration
        };
    }

    const labels = ['a', 'b', 'c', 'd'];
    const data = labels.map((label, i) => ({ label, value: [40, 30, 20, 10][i], radius: [10, 20, 30, 40][i] }));

    it('sweeps a full circle from the slice values', () => {
        const scene = buildScene(fakeContext(noAxes), [pie({ data, valueField: 'value', categoryField: 'label' }, [40, 30, 20, 10], labels)], drawContext());
        const slices = allNodes(scene.layers).filter((node) => String(node.attrs['data-slot']) === 'chart-slice');

        expect(slices).toHaveLength(4);
        expect(markupOf(scene.layers)).not.toContain('NaN');
    });

    it('gives each slice its own colour rather than the series colour', () => {
        // A pie is one series whose slices are the categories, so the palette varies per slice.
        const scene = buildScene(fakeContext(noAxes), [pie({ data, valueField: 'value', categoryField: 'label' }, [40, 30, 20, 10], labels)], drawContext());
        const fills = allNodes(scene.layers)
            .filter((node) => String(node.attrs['data-slot']) === 'chart-slice')
            .map((node) => node.attrs['fill']);

        expect(new Set(fills).size).toBe(4);
    });

    it('takes the magnitude of a negative value instead of subtracting it', () => {
        // A negative share has no meaning in a part-to-whole chart, and letting it subtract would
        // distort every other slice.
        const mixed = labels.map((label, i) => ({ label, value: [40, -30, 20, 10][i] }));
        const scene = buildScene(fakeContext(noAxes), [pie({ data: mixed, valueField: 'value', categoryField: 'label' }, [40, -30, 20, 10], labels)], drawContext());

        expect(allNodes(scene.layers).filter((node) => String(node.attrs['data-slot']) === 'chart-slice')).toHaveLength(4);
    });

    it('scales a nightingale radius against the radius values, not the angle values', () => {
        // The bug this guards: a rose chart has equal angles, so scaling against those made every
        // slice reach the outer edge and the radius encoding vanished.
        const equalAngles = labels.map((label, i) => ({ label, value: 1, radius: [10, 20, 30, 40][i] }));
        const scene = buildScene(fakeContext(noAxes), [pie({ data: equalAngles, valueField: 'value', categoryField: 'label', sliceRadiusValue: 'radius' }, [1, 1, 1, 1], labels)], drawContext());
        const radii = allNodes(scene.layers)
            .filter((node) => String(node.attrs['data-slot']) === 'chart-slice')
            .map((node) => parseFloat(String(node.attrs['d']).match(/A ([\d.]+)/)![1]));

        expect(new Set(radii.map((r) => Math.round(r))).size).toBe(4);
        // The largest radius value reaches the outer edge, and the rest are read against it.
        expect(Math.max(...radii)).toBeGreaterThan(Math.min(...radii) * 3);
    });

    it('draws no cartesian axis on a radial-only chart', () => {
        // A stray <p-chart-x-axis /> left in a pie template should not grow an axis.
        const axesPresent = [
            { axis: 'x' as const, id: 'default', props: { id: 'default' } },
            { axis: 'y' as const, id: 'default', props: { id: 'default' } }
        ];
        const scene = buildScene(fakeContext(axesPresent), [pie({ data, valueField: 'value', categoryField: 'label' }, [40, 30, 20, 10], labels)], drawContext());

        expect(scene.layers.map((layer) => layer.key)).not.toContain('axes');
    });
});

describe('heatmap', () => {
    const axes = [
        { axis: 'x' as const, id: 'default', props: { id: 'default', type: 'category' as const } },
        { axis: 'y' as const, id: 'default', props: { id: 'default', type: 'category' as const } }
    ];

    const rows = ['Mon', 'Tue'];
    const cols = ['00', '04', '08'];
    const data = rows.flatMap((day) => cols.map((hour, i) => ({ day, hour, sessions: 10 + i * 5 })));

    function heatmap(props: object): ResolvedSeries {
        const registration: SeriesRegistration = { id: 'hm-1', type: 'heatmap', props: computed(() => props) as never, seriesIndex: signal(0) };

        return {
            id: 'hm-1',
            type: 'heatmap',
            seriesIndex: 0,
            points: data.map((row, i) => ({ category: row.hour, value: row.sessions, base: 0, dataIndex: i })),
            categories: data.map((row) => row.hour),
            yCategories: data.map((row) => row.day),
            xAxisId: 'default',
            yAxisId: 'default',
            categoryAxis: 'x',
            continuousX: false,
            visible: true,
            registration
        };
    }

    /** Both of a heatmap's axes are band scales, which no other cartesian series has. */
    function griddedContext(): DrawContext {
        return drawContext({
            scales: new Map<string, AxisScale>([
                ['x:default', bandScale(cols, { start: AREA.x, end: AREA.x + AREA.width }, 0.2, 0.1)],
                ['y:default', bandScale(rows, { start: AREA.y + AREA.height, end: AREA.y }, 0.2, 0.1)]
            ])
        });
    }

    it('draws a cell per data row with real geometry', () => {
        const scene = buildScene(fakeContext(axes), [heatmap({ data, categoryXField: 'hour', categoryYField: 'day', valueField: 'sessions' })], griddedContext());
        const cells = allNodes(scene.layers).filter((node) => String(node.attrs['data-slot']) === 'chart-heatmap-cell');

        expect(cells).toHaveLength(6);

        // The bug this guards: the cells existed in the DOM with correct colours but an empty path,
        // so the whole grid was invisible.
        for (const cell of cells) expect(String(cell.attrs['d'])).not.toBe('');
    });

    it('colours by value across the given range', () => {
        const scene = buildScene(fakeContext(axes), [heatmap({ data, categoryXField: 'hour', categoryYField: 'day', valueField: 'sessions', colorRange: ['#000000', '#ffffff'] })], griddedContext());
        const fills = allNodes(scene.layers)
            .filter((node) => String(node.attrs['data-slot']) === 'chart-heatmap-cell')
            .map((node) => String(node.attrs['fill']));

        expect(new Set(fills).size).toBeGreaterThan(1);
    });

    it('outlines a missing cell instead of filling it', () => {
        // A hole has to read as no reading, not as a reading of zero.
        const sparse = data.map((row, i) => (i === 1 ? { ...row, sessions: null } : row));
        const series = heatmap({ data: sparse, categoryXField: 'hour', categoryYField: 'day', valueField: 'sessions' });

        series.points[1] = { ...series.points[1], value: null };

        const scene = buildScene(fakeContext(axes), [series], griddedContext());
        const empty = allNodes(scene.layers).find((node) => node.attrs['data-empty'] === '');

        expect(empty).toBeDefined();
        expect(empty!.attrs['fill']).toBe('none');
        expect(String(empty!.attrs['stroke-dasharray'])).toBe('3 3');
    });

    it('contributes nothing to a value domain, since colour carries its value', () => {
        const scene = buildScene(fakeContext(axes), [heatmap({ data, categoryXField: 'hour', categoryYField: 'day', valueField: 'sessions' })], griddedContext());

        expect(markupOf(scene.layers)).not.toContain('NaN');
    });
});

describe('axis resolution', () => {
    it('reserves more room for a rotated label than a flat one', () => {
        const ctx = drawContext();
        const scale = ctx.scales.get('x:default')!;
        const flat = resolveAxis(ctx, scale, { tickRotation: 0 }, 'bottom', 'category');
        const tilted = resolveAxis(ctx, scale, { tickRotation: -45 }, 'bottom', 'category');

        expect(tilted.reservation).toBeGreaterThan(flat.reservation);
    });

    it('rotates crowded labels rather than dropping them', () => {
        const crowded = drawContext({
            scales: new Map<string, AxisScale>([
                [
                    'x:default',
                    bandScale(
                        Array.from({ length: 40 }, (_, i) => `Category ${i}`),
                        { start: 0, end: 300 },
                        0.2,
                        0.1
                    )
                ]
            ])
        });
        const render = resolveAxis(crowded, crowded.scales.get('x:default')!, {}, 'bottom', 'category');

        // Rotation is preferred because a tilted label still says what it says.
        expect(render.rotation).not.toBe(0);
    });

    it('keeps every label when autoSkip is switched off', () => {
        const crowded = drawContext({
            scales: new Map<string, AxisScale>([
                [
                    'x:default',
                    bandScale(
                        Array.from({ length: 40 }, (_, i) => `Category ${i}`),
                        { start: 0, end: 300 },
                        0.2,
                        0.1
                    )
                ]
            ])
        });
        const skipped = resolveAxis(crowded, crowded.scales.get('x:default')!, {}, 'bottom', 'category');
        const kept = resolveAxis(crowded, crowded.scales.get('x:default')!, { autoSkip: false }, 'bottom', 'category');

        expect(kept.ticks.length).toBe(40);
        expect(skipped.ticks.length).toBeLessThan(40);
    });

    it('scales the automatic tick count with the axis length', () => {
        // A fixed count crowds a short chart and leaves a tall one sparse, so the count follows the
        // pixels available.
        const ctx = drawContext();
        const short = resolveAxis(ctx, linearScale(0, 100, { start: 80, end: 0 }), {}, 'left', 'linear');
        const tall = resolveAxis(ctx, linearScale(0, 100, { start: 600, end: 0 }), {}, 'left', 'linear');

        expect(tall.allTicks.length).toBeGreaterThan(short.allTicks.length);
    });

    it('honours an explicit tick count over the automatic one', () => {
        const ctx = drawContext();
        const render = resolveAxis(ctx, linearScale(0, 100, { start: 600, end: 0 }), { tickCount: 3 }, 'left', 'linear');

        expect(render.allTicks.length).toBeLessThanOrEqual(5);
    });

    it('drops a tick that falls outside the plot', () => {
        /*
         * The bug this guards: the domain is rounded for the tick count it can know, while the count
         * actually used comes from the axis' pixel length. When the two disagreed, the extra ticks
         * were drawn outside the plot -- a "185" label 39px above the top of the chart.
         */
        const ctx = drawContext();
        const scale = linearScale(166.5, 181.2, { start: 208, end: 0 });
        const render = resolveAxis(ctx, scale, {}, 'left', 'linear');

        expect(render.ticks.length).toBeGreaterThan(0);

        for (const tick of render.ticks) {
            expect(tick.position).toBeGreaterThanOrEqual(-0.5);
            expect(tick.position).toBeLessThanOrEqual(208.5);
        }
    });

    it('reserves nothing for an invisible axis', () => {
        const ctx = drawContext();
        const render = resolveAxis(ctx, ctx.scales.get('y:default')!, { visible: false }, 'left', 'linear');

        expect(render.reservation).toBe(0);
    });

    it('formats a value axis through the locale', () => {
        const german = resolveAxis(drawContext({ locale: 'de-DE' }), linearScale(0, 3000, { start: 200, end: 0 }), {}, 'left', 'linear');
        const english = resolveAxis(drawContext({ locale: 'en-US' }), linearScale(0, 3000, { start: 200, end: 0 }), {}, 'left', 'linear');

        // German groups with a dot and does not abbreviate at this magnitude; English abbreviates.
        expect(german.ticks.map((tick) => tick.label)).toContain('2.000');
        expect(english.ticks.map((tick) => tick.label)).toContain('2K');
    });

    it('keeps the thousands separator where a locale does not abbreviate', () => {
        // German compact renders 5000 as bare '5000', which is no shorter than '5.000' and has lost
        // the separator, so the plain grouped form has to win.
        const german = resolveAxis(drawContext({ locale: 'de-DE' }), linearScale(0, 5000, { start: 200, end: 0 }), {}, 'left', 'linear');

        expect(german.ticks.map((tick) => tick.label)).not.toContain('5000');
        expect(german.ticks.map((tick) => tick.label)).toContain('5.000');
    });
});
