import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type TooltipRow, type TooltipValueContext } from '@openng/optimus-ui/charts';
import { GRAND_TOTAL, type Row, alphabetRevenue } from '@/doc/charts/data/alphabetRevenue';

@Component({
    selector: 'types-treemap-treemap-alphabet-inc-q3-2024-revenue-by-segment-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                <i>nodeId</i> and <i>parentField</i> fields build a two-level corporate hierarchy; <i>drilldown</i> and <i>ChartBreadcrumb</i> wire click-to-drill navigation with a back-nav crumb at the top. The <i>levels</i> config tunes per-depth
                styling: depth-0 groups get a wider header strip and depth-1 leaves get tighter borders, so visual weight shifts from structure to cell values. The custom <i>ChartTooltip</i> computes segment YoY, percentage of the parent group, and
                percentage of total revenue on the fly.
            </p>
            <p>#### SvgTreemapAlphabetRevenueDemo.ts</p>
            <p>#### alphabetRevenue.ts</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg [animation]="{ duration: 500 }">
                        <p-chart-treemap
                            [data]="data"
                            categoryField="label"
                            valueField="value"
                            nodeId="id"
                            parentField="parent"
                            [drilldown]="true"
                            rootLabel="Alphabet · Q3 2024"
                            [color]="palette"
                            [levels]="levels"
                            [groupPadding]="4"
                            [spacing]="3"
                            borderColor="rgba(255,255,255,0.15)"
                            [borderRadius]="3"
                        />
                        <p-chart-data-labels [formatter]="yoyLabel" />
                        <p-chart-breadcrumb />
                        <p-chart-tooltip [valueFormatter]="tooltipRows" />
                        <p-chart-hover />
                        <p-chart-title text="Alphabet Inc. — Q3 2024 Revenue by Segment" />
                        <p-chart-caption text="Click Google Services to drill in · breadcrumb navigates back · cells show YoY growth and revenue" />
                        <p-chart-export-menu filename="alphabet-q3-2024-revenue" />
                        <p-chart-accessibility />
                    </p-chart-svg>
                </div>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreemapTreemapAlphabetIncQ32024RevenueBySegmentDoc {
    readonly data = alphabetRevenue;
    readonly palette = ['#4285F4', '#34A853', '#FBBC04', '#EA4335'];
    readonly levels = [
        { depth: 0, padding: 6, showHeader: true, headerHeight: 22, borderStrokeWidth: 0, colorByPoint: true },
        { depth: 1, padding: 2, showHeader: false, borderStrokeWidth: 1 }
    ];

    readonly yoyLabel = (_v: number, _p: number | undefined, _name: string | undefined, d: unknown): string => (d as Row).yoyLabel;

    readonly tooltipRows = (_value: number, ctx: TooltipValueContext): TooltipRow[] => {
        const row = alphabetRevenue.find((d) => d.label === ctx.label);

        if (!row) return [];

        const reportedValue = row.parent === null && row.value === 0 ? alphabetRevenue.filter((d) => d.parent === row.id).reduce((s, d) => s + d.value, 0) : row.value;
        const parentTotal = row.parent ? alphabetRevenue.filter((d) => d.parent === row.parent).reduce((s, d) => s + d.value, 0) : GRAND_TOTAL;

        return [
            { label: 'Revenue', value: `$${reportedValue.toFixed(1)}B` },
            { label: 'YoY', value: row.yoy > 0 ? `+${row.yoy}%` : `${row.yoy}%`, color: row.yoy > 0 ? '#4ade80' : row.yoy < 0 ? '#f87171' : '#94a3b8' },
            { label: '% of parent', value: `${((reportedValue / parentTotal) * 100).toFixed(1)}%` },
            { label: '% of Alphabet', value: `${((reportedValue / GRAND_TOTAL) * 100).toFixed(1)}%` }
        ];
    };
}
