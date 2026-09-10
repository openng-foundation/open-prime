import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type FillValue } from '@openng/optimus-ui/charts';
import { portfolioFactors as data } from '@/doc/charts/data/portfolioFactors';

const MOMENTUM_GRADIENT: FillValue = {
    linearGradient: { direction: 'vertical' },
    stops: [
        { offset: 0, color: '#7c8cff' },
        { offset: 0.6, color: '#c084fc' },
        { offset: 1, color: '#ff6fae' }
    ]
};

interface EtfMeta {
    name: string;
    ticker: string;
    color: string;
    description: string;
}

const ETF_META: Record<string, EtfMeta> = {
    value: { name: 'Vanguard Value', ticker: 'VTV', color: '#5daeea', description: 'Large-cap low P/E · bank & energy heavy' },
    growth: { name: 'Vanguard Growth', ticker: 'VUG', color: '#5ccf9f', description: 'Large-cap tech/consumer discretionary' },
    momentum: { name: 'iShares Momentum', ticker: 'MTUM', color: '#c084fc', description: '12-mo price strength screen · rotates quarterly' }
};

const META_BY_ID: Record<string, EtfMeta> = { vtv: ETF_META.value, vug: ETF_META.growth, mtum: ETF_META.momentum };

@Component({
    selector: 'types-radar-radar-us-equity-factor-tilts-vtv-vug-mtum-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                <i>curve="smooth"</i> renders each series as a spline polygon on a <i>gridShape="circle"</i> grid. A <i>GradientColor</i> object passed to <i>color</i> applies a violet-to-pink gradient fill to one series;
                <i>lineDash</i> distinguishes another with a dashed stroke. A custom <i>ChartTooltip</i> shows each series' tilt against a baseline value, coloring positive and negative deltas.
            </p>
            <p>#### SvgRadarPortfolioFactorsDemo.ts</p>
            <p>#### portfolioFactors.ts</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg [animation]="{ duration: 700 }">
                        <p-chart-radar id="vtv" [data]="data" categoryXField="factor" valueYField="value" name="VTV" [color]="etf.value.color" [fillOpacity]="0.15" [lineStrokeWidth]="2" curve="smooth" />
                        <p-chart-radar id="vug" [data]="data" categoryXField="factor" valueYField="growth" name="VUG" [color]="etf.growth.color" [fillOpacity]="0.15" [lineStrokeWidth]="1.8" [lineDash]="[6, 4]" curve="smooth" />
                        <p-chart-radar id="mtum" [data]="data" categoryXField="factor" valueYField="momentum" name="MTUM" [color]="momentumGradient" [fillOpacity]="0.25" [lineStrokeWidth]="2.2" curve="smooth" />
                        <p-chart-x-axis />
                        <p-chart-y-axis gridShape="circle" [tickCount]="5" />
                        <p-chart-tooltip mode="shared" />
                        <p-chart-hover />
                        <p-chart-legend position="top" [interactive]="false">
                            <ng-template pChartLegendItemDef let-ctx>
                                @let m = metaFor(ctx.datasetId);
                                @if (m) {
                                    <span style="display:flex;align-items:flex-start;gap:8px;font-size:11px">
                                        <span [style]="'width:10px;height:10px;border-radius:2px;margin-top:2px;flex-shrink:0;background:' + ctx.color"></span>
                                        <div>
                                            <div style="font-weight:600">{{ m.ticker }} · {{ m.name }}</div>
                                            <div style="opacity:0.55;font-size:10px">{{ m.description }}</div>
                                        </div>
                                    </span>
                                }
                            </ng-template>
                        </p-chart-legend>
                        <p-chart-annotation>
                            <ng-template pChartAnnotationDef let-ctx>
                                <svg:g>
                                    <svg:text [attr.x]="ctx.chartArea.x + ctx.chartArea.width" [attr.y]="ctx.chartArea.y + 10" text-anchor="end" font-size="11" font-weight="600" opacity="0.85">MTUM → 95 Momentum tilt</svg:text>
                                    <svg:text [attr.x]="ctx.chartArea.x + ctx.chartArea.width" [attr.y]="ctx.chartArea.y + 25" text-anchor="end" font-size="10" opacity="0.5">Factor scores vs broad-market baseline 60</svg:text>
                                </svg:g>
                            </ng-template>
                        </p-chart-annotation>
                        <p-chart-title text="US Equity Factor Tilts — VTV · VUG · MTUM" />
                        <p-chart-caption text="MTUM scores 95 on Momentum — the sharpest single-factor tilt in the set · VTV skews Value and Low-Volatility · VUG leads Growth and Size" />
                        <p-chart-export-menu filename="us-factor-etf-radar" />
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
export class RadarRadarUsEquityFactorTiltsVtvVugMtumDoc {
    readonly data = data;
    readonly etf = ETF_META;
    readonly momentumGradient = MOMENTUM_GRADIENT;

    metaFor(datasetId: string): EtfMeta | undefined {
        return META_BY_ID[datasetId];
    }
}
