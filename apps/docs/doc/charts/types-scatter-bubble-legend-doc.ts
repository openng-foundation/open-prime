import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-scatter-bubble-legend-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Add <i>ChartLegend</i> to display an interactive legend. Each <i>ChartScatter</i> series appears as a separate entry; click any item to toggle that series.</p>
            <p>For full configuration see <a href="/charts/configuration/legend">Legend</a>.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-scatter id="product-led" [data]="productLedData" valueXField="dealAge" valueYField="winRate" name="Product-led" color="#5daeea" [markerSize]="7" />
                        <p-chart-scatter id="partner" [data]="partnerData" valueXField="dealAge" valueYField="winRate" name="Partner" color="#4ecdc4" [markerSize]="7" />
                        <p-chart-scatter id="outbound" [data]="outboundData" valueXField="dealAge" valueYField="winRate" name="Outbound" color="#ffad5a" [markerSize]="7" />
                        <p-chart-x-axis label="Deal age (days)" />
                        <p-chart-y-axis label="Win rate (%)" />
                        <p-chart-legend position="bottom" />
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
export class ScatterBubbleLegendDoc {
    readonly productLedData = [
        { dealAge: 8, winRate: 31 },
        { dealAge: 15, winRate: 38 },
        { dealAge: 22, winRate: 43 },
        { dealAge: 30, winRate: 47 },
        { dealAge: 38, winRate: 45 },
        { dealAge: 47, winRate: 41 }
    ];
    readonly partnerData = [
        { dealAge: 10, winRate: 42 },
        { dealAge: 18, winRate: 49 },
        { dealAge: 27, winRate: 56 },
        { dealAge: 36, winRate: 58 },
        { dealAge: 45, winRate: 53 },
        { dealAge: 55, winRate: 48 }
    ];
    readonly outboundData = [
        { dealAge: 12, winRate: 26 },
        { dealAge: 20, winRate: 33 },
        { dealAge: 31, winRate: 37 },
        { dealAge: 43, winRate: 35 },
        { dealAge: 55, winRate: 30 },
        { dealAge: 68, winRate: 24 }
    ];
}
