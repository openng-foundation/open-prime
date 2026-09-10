import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-polar-border-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Set <i>borderStrokeWidth</i> and <i>borderColor</i> to add a stroke around each bar. Use <i>borderRadius</i> for rounded bar arc corners. Set <i>borderDash</i> for a dashed stroke and <i>spacing</i> (in pixels) to introduce gaps
                between bars.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="display: flex; justify-content: center">
                    <p-chart-svg [width]="460" [height]="460">
                        <p-chart-polar [data]="data" categoryXField="direction" valueYField="speed" [borderStrokeWidth]="2" borderColor="#64748b" [borderRadius]="4" />
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
export class PolarBorderDoc {
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
