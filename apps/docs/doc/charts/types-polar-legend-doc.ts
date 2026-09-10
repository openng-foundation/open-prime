import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-polar-legend-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Add <i>ChartLegend</i> to display an interactive legend. Each <i>ChartPolar</i> series appears as a separate entry; click any item to toggle that series.</p>
            <p>For full configuration see <a href="/charts/configuration/legend">Legend</a>.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="display: flex; justify-content: center">
                    <p-chart-svg [width]="460" [height]="460">
                        <p-chart-polar [data]="data" categoryXField="direction" valueYField="speed" name="Wind Speed" />
                        <p-chart-x-axis />
                        <p-chart-y-axis />
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
export class PolarLegendDoc {
    readonly data = [
        { direction: 'N', speed: 12 },
        { direction: 'NE', speed: 8 },
        { direction: 'E', speed: 15 },
        { direction: 'SE', speed: 20 },
        { direction: 'S', speed: 18 },
        { direction: 'SW', speed: 25 },
        { direction: 'W', speed: 22 },
        { direction: 'NW', speed: 10 }
    ];
}
