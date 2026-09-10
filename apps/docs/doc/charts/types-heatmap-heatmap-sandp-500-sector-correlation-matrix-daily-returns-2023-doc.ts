import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, svgNode, type HeatmapCellContext, type SvgNode, type TooltipRow, type TooltipValueContext } from '@openng/optimus-ui/charts';
import { sp500Correlation } from '@/doc/charts/data/sp500Correlation';

type CorrCell = { row: string; col: string; corr: number };

function interpret(r: number): { label: string; tone: string } {
    if (r >= 0.8) return { label: 'Strongly correlated', tone: '#e5484d' };

    if (r >= 0.6) return { label: 'Moderately correlated', tone: '#ffad5a' };

    if (r >= 0.4) return { label: 'Weakly correlated', tone: '#5daeea' };

    return { label: 'Near-independent', tone: '#94a3b8' };
}

function strengthTag(row: number, col: number, v: number): string {
    if (row === col) return 'SELF';

    if (v >= 0.8) return 'STRONG';

    if (v >= 0.6) return 'MOD';

    if (v >= 0.4) return 'WEAK';

    return 'INDEP';
}

@Component({
    selector: 'types-heatmap-heatmap-sandp-500-sector-correlation-matrix-daily-returns-2023-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                A five-stop ocean <i>colorRange</i> paired with an explicit <i>colorScale</i> clamps the gradient to the full correlation domain so the diagonal reads darkest and near-zero values land at the midpoint. A custom cell renderer stamps
                each coefficient and strength tag inside the cell; <i>ChartColorLegend</i> renders a continuous gradient bar below. The tooltip pairs each value with a color-coded interpretive label based on the coefficient range.
            </p>
            <p>#### SvgHeatmapSp500CorrelationDemo.ts</p>
            <p>#### sp500Correlation.ts</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-heatmap
                            [data]="data"
                            categoryXField="col"
                            categoryYField="row"
                            valueField="corr"
                            [colorRange]="['#eef6ff', '#b8e2ff', '#5bc8f5', '#2176ff', '#2531a8']"
                            [colorScale]="[0, 0.25, 0.5, 0.75, 1]"
                            [renderContent]="renderCell"
                            [spacing]="3"
                            [borderRadius]="4"
                        />
                        <p-chart-x-axis [showLine]="false" [showTicks]="false" [gridLines]="false" />
                        <p-chart-y-axis [showLine]="false" [showTicks]="false" [gridLines]="false" />
                        <p-chart-color-legend position="bottom" [height]="10" [borderRadius]="5" />
                        <p-chart-tooltip [valueFormatter]="tooltipRows" />
                        <p-chart-hover />
                        <p-chart-title text="S&P 500 sector correlation matrix — daily returns, 2023" />
                        <p-chart-caption text="Pearson ρ of daily total returns across 9 SPDR sector ETFs · Source: state-street-global-advisors data" />
                        <p-chart-export-menu filename="sp500-sector-correlation-2023" />
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
export class HeatmapHeatmapSandp500SectorCorrelationMatrixDailyReturns2023Doc {
    readonly data = sp500Correlation;

    readonly tooltipRows = (_value: number, ctx: TooltipValueContext): TooltipRow[] => {
        const item = this.data[ctx.index!];
        const diagonal = item.row === item.col;
        const interp = interpret(item.corr);

        return [{ label: 'Correlation (ρ)', value: item.corr.toFixed(2) }, diagonal ? { label: 'Self-correlation (diagonal)', value: '' } : { label: 'Interpretation', value: interp.label, color: interp.tone }];
    };

    readonly renderCell = (cell: HeatmapCellContext<CorrCell>): SvgNode | null => {
        if (cell.value == null) return null;

        const cx = cell.x + cell.width / 2;
        const cy = cell.y + cell.height / 2;
        const isDiagonal = cell.row === cell.col;

        if (isDiagonal) {
            return svgNode('g', { style: 'pointer-events:none' }, [
                svgNode('rect', { x: cell.x + 2, y: cell.y + 2, width: cell.width - 4, height: cell.height - 4, rx: 2, fill: 'rgba(255,255,255,0.22)' }),
                svgNode('text', { x: cx, y: cy + 1, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': '10', 'font-weight': '500', fill: 'rgba(255,255,255,0.5)' }, ['1.00'])
            ]);
        }

        const onDark = cell.value >= 0.55;
        const primary = onDark ? '#ffffff' : '#0f172a';
        const secondary = onDark ? 'rgba(255,255,255,0.78)' : 'rgba(15,23,42,0.62)';
        const tag = strengthTag(cell.row, cell.col, cell.value);

        return svgNode('g', { style: 'pointer-events:none' }, [
            svgNode('text', { x: cx, y: cy - 2, 'text-anchor': 'middle', 'dominant-baseline': 'auto', 'font-size': '11', 'font-weight': '700', fill: primary }, [cell.value.toFixed(2)]),
            svgNode('text', { x: cx, y: cy + 9, 'text-anchor': 'middle', 'dominant-baseline': 'auto', 'font-size': '8', 'font-weight': '600', 'letter-spacing': '0.5', fill: secondary }, [tag])
        ]);
    };
}
