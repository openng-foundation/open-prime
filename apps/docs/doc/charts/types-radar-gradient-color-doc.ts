import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type FillValue } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-radar-gradient-color-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Pass a radial gradient object to <i>color</i> when the fill needs softer emphasis than a solid stroke. Keep the stops controlled so the gradient supports comparison instead of turning the radar into decoration.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-radar id="alice" [data]="data" categoryXField="capability" valueYField="current" [color]="aliceColor" [fillOpacity]="0.7" [lineStrokeWidth]="2" name="Current" />
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
export class RadarGradientColorDoc {
    readonly data = [
        { capability: 'Activation', current: 78, target: 88 },
        { capability: 'Reliability', current: 83, target: 92 },
        { capability: 'Governance', current: 66, target: 86 },
        { capability: 'Observability', current: 74, target: 90 },
        { capability: 'Release Pace', current: 88, target: 82 },
        { capability: 'Support Fit', current: 71, target: 89 }
    ];

    readonly aliceColor: FillValue = {
        radialGradient: {},
        stops: [
            { offset: 0, color: '#5daeea', opacity: 0.95 },
            { offset: 1, color: '#4ecdc4', opacity: 0.45 }
        ]
    };
}
