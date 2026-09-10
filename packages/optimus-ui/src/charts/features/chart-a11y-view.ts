/**
 * The chart's accessible description and data table.
 *
 * Published by the root, always -- a chart is not accessible by choice. `ChartAccessibility` does
 * not render this; it registers the options this reads, which is why adding the element takes
 * control of the prose rather than switching accessibility on.
 *
 * Both live in the same component because they come from one derivation: the table is the numbers
 * and the description is a summary of the same numbers. Deriving them apart would eventually let
 * the sentence disagree with the table under it.
 */
import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, inject } from '@angular/core';
import type { ChartAccessibilityProps, DataTableCellContext, SeriesDescriptionContext } from '@openng/optimus-ui/types/charts';
import { CHART_CONTEXT } from '../charts-registry';

/**
 * A chart's screen-reader surface.
 *
 * @group Components
 */
@Component({
    selector: 'p-chart-a11y-view',
    standalone: true,
    template: `
        @if (enabled()) {
            <div class="p-chart-a11y" data-slot="chart-accessibility">
                <p class="p-chart-a11y-description" data-slot="chart-accessibility-description">{{ description() }}</p>
                @if (rows().length > 0) {
                    <table class="p-chart-a11y-table" data-slot="chart-accessibility-table">
                        <caption>
                            {{
                                caption()
                            }}
                        </caption>
                        <thead>
                            <tr>
                                @for (heading of headings(); track heading) {
                                    <th scope="col">{{ heading }}</th>
                                }
                            </tr>
                        </thead>
                        <tbody>
                            @for (row of rows(); track $index; let rowIndex = $index) {
                                <tr>
                                    @for (cell of row; track $index; let columnIndex = $index) {
                                        @if (columnIndex === 0) {
                                            <th scope="row">{{ formatCell(cell, columnIndex, rowIndex) }}</th>
                                        } @else {
                                            <td>{{ formatCell(cell, columnIndex, rowIndex) }}</td>
                                        }
                                    }
                                </tr>
                            }
                        </tbody>
                    </table>
                }
                @if (keyboardHint()) {
                    <p class="p-chart-a11y-hint" data-slot="chart-accessibility-hint">{{ keyboardHint() }}</p>
                }
            </div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    /*
     * Visually hidden rather than `display: none`.
     *
     * A hidden element is not read, which would defeat the purpose. Clipping it to one pixel keeps
     * it in the accessibility tree while taking no space -- the only way to publish a data table
     * that does not also appear under the chart.
     */
    host: {
        class: 'p-chart-a11y-host',
        style: 'position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap'
    }
})
export class ChartA11yView {
    private readonly context = inject(CHART_CONTEXT, { optional: true });

    /** The options a `ChartAccessibility` registered, if one is mounted. */
    private readonly props = computed<ChartAccessibilityProps>(() => this.context?.feature<ChartAccessibilityProps>('accessibility')()?.props() ?? {});

    protected readonly enabled = computed(() => this.props().enabled !== false);

    protected readonly caption = computed(() => this.context?.text().dataTable ?? 'Chart data');

    protected readonly keyboardHint = computed(() => (this.props().keyboardNavigation?.enabled === false ? '' : (this.context?.text().keyboardHint ?? '')));

    /**
     * The table's data, one row per category and one column per series.
     *
     * Read from the same CSV the export menu downloads, so a screen-reader user and someone opening
     * the spreadsheet are reading the same chart. Deriving it from the raw props instead would
     * publish rows a decimated or stacked chart never drew.
     */
    private readonly tableData = computed(() => {
        const csv = this.context?.toCsv() ?? '';

        if (csv === '') return { series: [] as { name: string; values: (number | null)[] }[], categories: [] as string[], headings: [] as string[] };

        const [header, ...body] = csv.split('\n').map(parseCsvRow);
        const limited = body.slice(0, this.props().dataTableMaxRows ?? 100);

        return {
            headings: header,
            categories: limited.map((row) => row[0]),
            series: header.slice(1).map((name, column) => ({
                name,
                values: limited.map((row) => {
                    const parsed = Number(row[column + 1]);

                    return row[column + 1] === '' || !Number.isFinite(parsed) ? null : parsed;
                })
            }))
        };
    });

    protected readonly headings = computed(() => this.tableData().headings);

    protected readonly rows = computed(() => {
        const data = this.tableData();

        return data.categories.map((category, rowIndex) => [category, ...data.series.map((entry) => entry.values[rowIndex] ?? '')]);
    });

    /**
     * The description.
     *
     * Series by series, with the extremes named: a sighted reader takes "rising, peaking in June"
     * from the shape in one glance, and a summary that only counted the points would not carry it.
     */
    protected readonly description = computed(() => {
        const explicit = this.props().description;

        if (explicit) return explicit;

        const series = this.context?.series() ?? [];
        const resolved = this.tableData();

        if (resolved.series.length === 0) return this.context?.text().chart ?? 'Chart';

        const type = this.props().typeDescription ?? (series.length === 1 ? `${series[0].type} chart` : 'combination chart');
        const formatter = this.props().seriesDescriptionFormatter;
        const sentences = resolved.series.map((entry, seriesIndex) => {
            if (formatter) return formatter({ name: entry.name, type: series[seriesIndex]?.type ?? 'line', pointCount: entry.values.filter((value) => value != null).length } satisfies SeriesDescriptionContext);

            const values = entry.values.filter((value): value is number => value != null);

            if (values.length === 0) return `${entry.name}: no data.`;

            const peak = resolved.categories[entry.values.indexOf(Math.max(...values))];

            return `${entry.name}: ${values.length} points, from ${Math.min(...values)} to ${Math.max(...values)}, peaking at ${peak}.`;
        });

        return `${type} with ${resolved.series.length} data series. ${sentences.join(' ')}`;
    });

    /** Runs one cell through the formatter, when one was given. */
    protected formatCell(value: string | number, columnIndex: number, rowIndex: number): string {
        const formatter = this.props().dataTableCellFormatter;

        if (!formatter) return String(value);

        return formatter({ value, column: this.headings()[columnIndex] ?? '', columnIndex, rowIndex, isNumeric: columnIndex > 0 } satisfies DataTableCellContext);
    }
}

/** Splits one CSV row, honouring the quoting the writer applied. */
function parseCsvRow(line: string): string[] {
    const cells: string[] = [];
    let cell = '';
    let quoted = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (quoted) {
            if (char === '"' && line[i + 1] === '"') {
                cell += '"';
                i++;
                continue;
            }

            if (char === '"') {
                quoted = false;
                continue;
            }

            cell += char;
            continue;
        }

        if (char === '"') {
            quoted = true;
            continue;
        }

        if (char === ',') {
            cells.push(cell);
            cell = '';
            continue;
        }

        cell += char;
    }

    cells.push(cell);

    return cells;
}
