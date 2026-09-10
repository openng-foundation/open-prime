import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type ResponsiveRule, type TickValue } from '@openng/optimus-ui/charts';
import { mobileChannelShare, mobileDashboardSummary, mobileRegionLoad, mobileRevenueTrend } from '@/doc/charts/data/mobileResponsiveDashboard';

const trendRules: ResponsiveRule[] = [
    {
        maxWidth: 520,
        props: {
            legend: { enabled: false },
            xAxis: { visible: false },
            dataLabels: { enabled: false }
        } as Record<string, Record<string, unknown>>
    },
    {
        maxWidth: 360,
        props: {
            yAxis: { visible: false },
            tooltip: { enabled: false }
        } as Record<string, Record<string, unknown>>
    }
];

const compactRules: ResponsiveRule[] = [
    {
        maxWidth: 420,
        props: {
            legend: { enabled: false },
            xAxis: { visible: false }
        } as Record<string, Record<string, unknown>>
    }
];

@Component({
    selector: 'reference-responsive-mobile-dashboard-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Real dashboards usually combine multiple panels, not one isolated chart. This mobile commerce example uses a revenue/conversion combo chart, a traffic donut, and regional support bars. Each panel owns <i>ChartResponsive</i> rules that
                hide legends or axes as the container shrinks, while the outer CSS grid collapses to one column without horizontal window overflow.
            </p>
            <p>#### SvgResponsiveMobileDashboardDemo.ts</p>
            <p>#### mobileResponsiveDashboard.ts</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div class="mobile-dashboard">
                    <div class="mobile-dashboard__summary" aria-label="Mobile commerce KPI summary">
                        <div>
                            <span>Revenue</span>
                            <strong>\${{ summary.revenue }}k</strong>
                        </div>
                        <div>
                            <span>Conversion</span>
                            <strong>{{ summary.conversion }}%</strong>
                        </div>
                        <div>
                            <span>Orders</span>
                            <strong>{{ summary.orders.toLocaleString() }}</strong>
                        </div>
                        <div>
                            <span>SLA</span>
                            <strong>{{ summary.sla }}%</strong>
                        </div>
                    </div>

                    <div class="mobile-dashboard__grid">
                        <section class="mobile-dashboard__panel mobile-dashboard__panel--wide">
                            <p-chart-svg [height]="360" [animation]="{ duration: 500, easing: 'easeOutCubic' }">
                                <p-chart-bar [data]="mobileRevenueTrend" categoryXField="window" valueYField="revenue" name="Revenue" color="#5daeea" [borderRadius]="5" />
                                <p-chart-line [data]="mobileRevenueTrend" categoryXField="window" valueYField="conversion" yAxisId="conversion" name="Conversion" color="#ffad5a" curve="smooth" [lineStrokeWidth]="2.5" />
                                <p-chart-x-axis />
                                <p-chart-y-axis label="Revenue" [tickFormat]="money" />
                                <p-chart-y-axis id="conversion" position="right" label="Conversion" [tickFormat]="percent" [chartPaddingMin]="0.15" />
                                <p-chart-legend position="bottom" />
                                <p-chart-tooltip mode="shared" [crosshair]="true" />
                                <p-chart-hover [brightness]="1.08" />
                                <p-chart-responsive [rules]="trendRules" [breakpoints]="{ xs: 280, sm: 460, md: 680 }" />
                                <p-chart-title text="Mobile checkout pulse" />
                                <p-chart-caption text="Container rules hide the legend and axes as the panel narrows; the plot keeps its width inside the phone viewport." />
                                <p-chart-accessibility />
                            </p-chart-svg>
                        </section>

                        <section class="mobile-dashboard__panel">
                            <p-chart-svg [height]="300">
                                <p-chart-pie [data]="mobileChannelShare" valueField="share" categoryField="channel" [innerRadius]="0.58" [color]="channelColors" name="Traffic mix" />
                                <p-chart-legend position="bottom" />
                                <p-chart-tooltip />
                                <p-chart-hover [brightness]="1.1" />
                                <p-chart-responsive [rules]="compactRules" />
                                <p-chart-title text="Mobile traffic mix" />
                                <p-chart-accessibility />
                            </p-chart-svg>
                        </section>

                        <section class="mobile-dashboard__panel mobile-dashboard__panel--wide">
                            <p-chart-svg [height]="310">
                                <p-chart-bar [data]="mobileRegionLoad" categoryXField="region" valueYField="tickets" name="Tickets" color="color" [borderRadius]="5" />
                                <p-chart-line [data]="mobileRegionLoad" categoryXField="region" valueYField="sla" yAxisId="sla" name="SLA" color="#7c8cff" [showMarkers]="true" [lineStrokeWidth]="2" />
                                <p-chart-x-axis />
                                <p-chart-y-axis label="Tickets" />
                                <p-chart-y-axis id="sla" position="right" label="SLA" [tickFormat]="percent" [chartPaddingMin]="0.12" />
                                <p-chart-legend position="bottom" />
                                <p-chart-tooltip mode="shared" />
                                <p-chart-hover />
                                <p-chart-responsive [rules]="compactRules" />
                                <p-chart-title text="Support load by region" />
                                <p-chart-accessibility />
                            </p-chart-svg>
                        </section>

                        <section class="mobile-dashboard__panel">
                            <p-chart-svg [height]="310">
                                <p-chart-bar [data]="mobileRevenueTrend" categoryXField="window" valueYField="orders" name="Orders" color="#4ecdc4" [borderRadius]="5" />
                                <p-chart-x-axis />
                                <p-chart-y-axis label="Orders" />
                                <p-chart-legend position="bottom" />
                                <p-chart-tooltip />
                                <p-chart-hover [brightness]="1.08" />
                                <p-chart-responsive [rules]="compactRules" />
                                <p-chart-title text="Order volume by hour" />
                                <p-chart-accessibility />
                            </p-chart-svg>
                        </section>
                    </div>
                </div>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResponsiveMobileDashboardDoc {
    readonly summary = mobileDashboardSummary;
    readonly mobileRevenueTrend = mobileRevenueTrend;
    readonly mobileChannelShare = mobileChannelShare;
    readonly mobileRegionLoad = mobileRegionLoad;
    readonly channelColors = mobileChannelShare.map((item) => item.color);
    readonly trendRules = trendRules;
    readonly compactRules = compactRules;
    readonly money = (value: TickValue) => `$${Number(value).toFixed(0)}k`;
    readonly percent = (value: TickValue) => `${Number(value).toFixed(0)}%`;
}
