import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

const HALO_COLOR = '#94a3b8';

@Component({
    selector: 'types-line-area-line-border-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Set <i>borderColor</i> and <i>borderStrokeWidth</i> to draw a halo stroke behind the main line. The halo renders wider than the line itself, which keeps lines readable when they cross area fills or other series. Use
                <i>borderDash</i> for a dashed halo and <i>borderCapStyle</i> to control its line endings independently from the main stroke.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-line [data]="data" categoryXField="month" valueYField="actual" name="Actual" [lineStrokeWidth]="2" [fillOpacity]="0.25" [borderColor]="haloColor" [borderStrokeWidth]="2" curve="smooth" />
                        <p-chart-line [data]="data" categoryXField="month" valueYField="forecast" name="Forecast" [lineStrokeWidth]="2" [fillOpacity]="0.25" [borderColor]="haloColor" [borderStrokeWidth]="2" curve="smooth" />
                        <p-chart-x-axis />
                        <p-chart-y-axis />
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
export class LineAreaLineBorderDoc {
    readonly haloColor = HALO_COLOR;
    readonly data = [
        { month: 'Jan', actual: 42, forecast: 38 },
        { month: 'Feb', actual: 55, forecast: 50 },
        { month: 'Mar', actual: 48, forecast: 54 },
        { month: 'Apr', actual: 63, forecast: 58 },
        { month: 'May', actual: 71, forecast: 65 },
        { month: 'Jun', actual: 67, forecast: 72 }
    ];
}
