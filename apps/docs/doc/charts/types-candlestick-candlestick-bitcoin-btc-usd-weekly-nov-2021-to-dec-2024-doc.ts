import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type AnnotationContext, type TickValue, type TooltipRow, type TooltipValueContext } from '@openng/optimus-ui/charts';
import { btcCycle } from '@/doc/charts/data/btcCycle';

const BEAR_START = Date.parse('2021-11-08');
const BEAR_END = Date.parse('2022-11-20');
const PRIOR_ATH = 68700;

const EVENTS = [
    { ts: Date.parse('2022-11-13'), label: 'FTX collapse', color: '#e5484d' },
    { ts: Date.parse('2024-01-10'), label: 'Spot ETF approved', color: '#5daeea' },
    { ts: Date.parse('2024-04-19'), label: 'Halving #4', color: '#a78bfa' }
];

@Component({
    selector: 'types-candlestick-candlestick-bitcoin-btc-usd-weekly-nov-2021-to-dec-2024-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                <i>type="logarithmic"</i> on <i>ChartYAxis</i> keeps multi-cycle price ranges readable without compressing the earlier data. <i>ChartReferenceBand</i> shades a bear market window; three <i>ChartAnnotation</i> pins mark major market
                events, each colored by category. The tooltip shows weekly OHLC plus the week's dollar and percent change, with numbers formatted using <i>toLocaleString</i>.
            </p>
            <p>#### SvgCandlestickBtcCycleDemo.ts</p>
            <p>#### btcCycle.ts</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg [animation]="{ duration: 400 }">
                        <p-chart-candlestick [data]="data" categoryXField="ts" openField="open" highField="high" lowField="low" closeField="close" upColor="#10a981" downColor="#e5484d" [barWidthRatio]="0.6" />
                        <p-chart-reference-band [x1]="bearStart" [x2]="bearEnd" label="2022 bear market" fill="#e5484d" [fillOpacity]="0.06" labelPosition="start" />
                        <p-chart-reference-line [y]="priorAth" label="Prior ATH · $68.7k" stroke="#ffad5a" [lineStrokeWidth]="1.2" [lineDash]="[6, 4]" labelPosition="start" labelBackground="#ffad5a" labelColor="#fff" [labelPadding]="5" />
                        <p-chart-annotation>
                            <ng-template pChartAnnotationDef let-ctx>
                                @if (ctx.xScale && ctx.chartArea) {
                                    <svg:g pointer-events="none">
                                        @for (ev of eventPins(ctx); track ev.label) {
                                            <svg:g>
                                                <svg:line [attr.x1]="ev.x" [attr.y1]="ev.top" [attr.x2]="ev.x" [attr.y2]="ev.bottom" [attr.stroke]="ev.color" stroke-dasharray="3 3" stroke-width="1" opacity="0.55" />
                                                <svg:rect [attr.x]="ev.rx" [attr.y]="ev.ry" [attr.width]="ev.w" [attr.height]="ev.bh" rx="3" [attr.fill]="ev.color" opacity="0.92" />
                                                <svg:text [attr.x]="ev.x" [attr.y]="ev.ty" text-anchor="middle" dominant-baseline="central" fill="#fff" [attr.font-size]="ev.fs" font-weight="600">{{ ev.label }}</svg:text>
                                            </svg:g>
                                        }
                                    </svg:g>
                                }
                            </ng-template>
                        </p-chart-annotation>
                        <p-chart-tooltip [valueFormatter]="tooltipRows" />
                        <p-chart-hover />
                        <p-chart-zoom mode="x" />
                        <p-chart-navigator />
                        <p-chart-x-axis type="time" gapless />
                        <p-chart-y-axis type="logarithmic" position="right" [tickFormat]="formatPrice" />
                        <p-chart-title text="Bitcoin (BTC/USD) — Weekly, Nov 2021 → Dec 2024" />
                        <p-chart-caption text="Log-scale Y-axis compresses the full cycle · reference band shades the bear market · macro events marked on top" />
                        <p-chart-export-menu filename="btc-cycle-2021-2024" />
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
export class CandlestickCandlestickBitcoinBtcUsdWeeklyNov2021ToDec2024Doc {
    readonly data = btcCycle;
    readonly bearStart = BEAR_START;
    readonly bearEnd = BEAR_END;
    readonly priorAth = PRIOR_ATH;

    readonly formatPrice = (v: TickValue) => {
        const n = Number(v);

        if (n >= 1000) return `$${(n / 1000).toFixed(0)}k`;

        return `$${n}`;
    };

    eventPins(ctx: AnnotationContext) {
        const xScale = ctx.xScale!;
        const area = ctx.chartArea;
        const fs = ctx.responsive.pick({ xs: 7, sm: 8, md: 9 });
        const bh = ctx.responsive.pick({ xs: 11, sm: 12, md: 14 });
        const charW = ctx.responsive.pick({ xs: 4.8, sm: 5.5, md: 6.2 });
        const padX = ctx.responsive.pick({ xs: 6, sm: 7, md: 8 });
        const rowGap = ctx.responsive.pick({ xs: 14, sm: 16, md: 18 });

        return EVENTS.map((ev, i) => {
            const x = xScale(ev.ts);

            if (x < area.x || x > area.x + area.width) return null;

            const labelY = area.y + 12 + (i % 2) * rowGap;
            const w = ev.label.length * charW + padX;

            return {
                label: ev.label,
                color: ev.color,
                x,
                top: area.y,
                bottom: area.y + area.height,
                rx: x - w / 2,
                ry: labelY - bh / 2,
                w,
                bh,
                ty: labelY,
                fs
            };
        }).filter((p): p is NonNullable<typeof p> => p !== null);
    }

    readonly tooltipRows = (_value: number, ctx: TooltipValueContext): TooltipRow[] => {
        const item = ctx.index != null ? this.data[ctx.index] : undefined;

        if (!item) return [];

        const change = item.close - item.open;
        const pct = (change / item.open) * 100;
        const changeColor = change >= 0 ? '#10a981' : '#e5484d';
        const fmt = (n: number) => `$${n.toLocaleString('en-US')}`;

        return [
            { label: 'Open', value: fmt(item.open) },
            { label: 'High', value: fmt(item.high) },
            { label: 'Low', value: fmt(item.low) },
            { label: 'Close', value: fmt(item.close) },
            { label: 'Δ Week', value: `${change >= 0 ? '+' : ''}${fmt(Math.abs(change))} (${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%)`, color: changeColor }
        ];
    };
}
