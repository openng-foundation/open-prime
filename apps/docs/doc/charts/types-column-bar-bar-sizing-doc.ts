import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-column-bar-bar-sizing-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Set <i>barThickness</i> to fix bar width in pixels. <i>maxBarThickness</i> caps the auto-calculated width when the chart is wide. <i>minBarLength</i> ensures bars for very small values stay visible. Use <i>categoryGap</i> to control
                spacing between groups.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-bar [data]="data" categoryXField="lane" valueYField="parcels" [barThickness]="24" [categoryGap]="0.3" [borderRadius]="4" color="#5daeea" />
                        <p-chart-x-axis />
                        <p-chart-y-axis label="Parcels per hour" />
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
export class ColumnBarBarSizingDoc {
    readonly data = [
        { lane: 'Dock 1', parcels: 80 },
        { lane: 'Dock 2', parcels: 55 },
        { lane: 'Dock 3', parcels: 92 },
        { lane: 'Dock 4', parcels: 40 },
        { lane: 'Dock 5', parcels: 68 },
        { lane: 'Dock 6', parcels: 75 },
        { lane: 'Dock 7', parcels: 88 },
        { lane: 'Dock 8', parcels: 50 }
    ];
}
