import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type SegmentContext, type TooltipRow } from '@openng/optimus-ui/charts';
import { unemploymentAnnual } from '@/doc/charts/data/unemploymentAnnual';

const LONG_RUN_AVG = 5.7;

@Component({
    selector: 'types-line-area-area-us-unemployment-rate-2000-2024-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                <i>segmentColor</i> and <i>segmentFillColor</i> color each segment and its fill by severity, so crisis periods read red against the normal amber range. A <i>ChartReferenceLine</i> marks the long-run average;
                <i>ChartReferenceBand</i> shades the zone above it. <i>ChartAnnotation</i> draws a color key directly on the chart, leaving the legend space free.
            </p>
            <p>#### SvgAreaUnemploymentDemo.ts</p>
            <p>#### unemploymentAnnual.ts</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg [animation]="{ duration: 600 }">
                        <p-chart-line [data]="data" categoryXField="year" valueYField="rate" [fillOpacity]="1" [lineStrokeWidth]="2" showMarkers [markerSize]="3.5" curve="smooth" [segmentColor]="segmentColor" [segmentFillColor]="segmentFillColor" />
                        <p-chart-reference-line [y]="longRunAvg" label="25-yr avg" stroke="#5daeea" [lineDash]="[5, 4]" />
                        <p-chart-reference-band [y1]="7.5" [y2]="12" fill="#e5484d" [fillOpacity]="0.04" />
                        <p-chart-annotation>
                            <ng-template pChartAnnotationDef let-ctx>
                                <svg:g text-anchor="end">
                                    @for (item of legendItems; track item.label; let i = $index) {
                                        <svg:g [attr.transform]="'translate(0,' + (ctx.chartArea.y + 14 + i * 17) + ')'">
                                            <svg:rect [attr.x]="ctx.chartArea.x + ctx.chartArea.width - 12" [attr.y]="-5" [attr.width]="8" [attr.height]="8" [attr.fill]="item.color" />
                                            <svg:text [attr.x]="ctx.chartArea.x + ctx.chartArea.width - 18" [attr.y]="0" dy="1" opacity="0.6" font-size="11" dominant-baseline="middle">{{ item.label }}</svg:text>
                                        </svg:g>
                                    }
                                </svg:g>
                            </ng-template>
                        </p-chart-annotation>
                        <p-chart-tooltip [valueFormatter]="tooltipRows" />
                        <p-chart-hover />
                        <p-chart-x-axis [tickCount]="12" />
                        <p-chart-y-axis [tickCount]="6" />
                        <p-chart-title text="US civilian unemployment rate 2000–2024" />
                        <p-chart-caption text="Source: U.S. Bureau of Labor Statistics · Series LNS14000000 · Annual averages" />
                        <p-chart-export-menu filename="us-unemployment-2000-2024" />
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
export class LineAreaAreaUsUnemploymentRate20002024Doc {
    readonly data = unemploymentAnnual;
    readonly longRunAvg = LONG_RUN_AVG;
    readonly legendItems = [
        { color: '#10a981', label: '< 4.5% Low' },
        { color: '#ffad5a', label: '4.5–7.5% Elevated' },
        { color: '#e5484d', label: '> 7.5% Crisis' }
    ];
    readonly segmentColor = (ctx: SegmentContext) => {
        const peak = Math.max(ctx.p0.value ?? 0, ctx.p1.value ?? 0);

        if (peak > 7.5) return '#e5484d';

        if (peak < 4.5) return '#10a981';

        return '#ffad5a';
    };
    readonly segmentFillColor = (ctx: SegmentContext) => {
        const peak = Math.max(ctx.p0.value ?? 0, ctx.p1.value ?? 0);

        if (peak > 7.5) return 'rgba(229,72,77,0.15)';

        if (peak < 4.5) return 'rgba(16,185,129,0.13)';

        return 'rgba(245,158,11,0.12)';
    };
    readonly tooltipRows = (v: number): TooltipRow[] => {
        const diff = v - LONG_RUN_AVG;
        const diffColor = diff > 0 ? '#e5484d' : '#10a981';
        const arrow = diff > 0 ? '▲' : '▼';

        return [
            { label: 'Unemployment rate', value: `${v.toFixed(1)}%` },
            { label: `vs ${LONG_RUN_AVG}% avg`, value: `${arrow} ${Math.abs(diff).toFixed(1)}pp`, color: diffColor }
        ];
    };
}
