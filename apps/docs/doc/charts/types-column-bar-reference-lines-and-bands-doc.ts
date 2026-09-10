import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-column-bar-reference-lines-and-bands-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Add <i>ChartReferenceLine</i> for threshold and divider lines. Add <i>ChartReferenceBand</i> to highlight value ranges such as targets, capacity limits, or threshold zones.</p>
            <p>For full configuration see <a href="/charts/configuration/reference-lines-bands">Reference Lines &amp; Bands</a>.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-bar [data]="data" categoryXField="week" valueYField="throughput" color="#5daeea" [borderRadius]="4" />
                        <p-chart-x-axis />
                        <p-chart-y-axis label="Shipments/hour" />
                        <p-chart-reference-line [y]="40" [stroke]="TARGET_COLOR" [lineStrokeWidth]="2" [lineDash]="[6, 3]" label="Target" />
                        <p-chart-reference-band [y1]="35" [y2]="45" [fill]="TARGET_COLOR" [fillOpacity]="0.08" />
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
export class ColumnBarReferenceLinesAndBandsDoc {
    readonly data = [
        { week: 'W1', throughput: 32 },
        { week: 'W2', throughput: 28 },
        { week: 'W3', throughput: 45 },
        { week: 'W4', throughput: 38 },
        { week: 'W5', throughput: 52 },
        { week: 'W6', throughput: 41 }
    ];

    readonly TARGET_COLOR = '#ffad5a';
}
