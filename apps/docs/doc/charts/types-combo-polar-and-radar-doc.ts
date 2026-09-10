import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-combo-polar-and-radar-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Place <i>ChartPolar</i> and <i>ChartRadar</i> as siblings inside a single chart. Both share a unified radial grid, and categories are merged. Assign distinct <i>color</i> values to create visual hierarchy: a neutral fill for the
                background series and a strong accent for the foreground outline.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="display: flex; justify-content: center">
                    <p-chart-svg [width]="460" [height]="460">
                        <p-chart-polar id="pressure" [data]="polarData" categoryXField="queue" valueYField="pressure" name="Incident pressure" color="rgba(148,163,184,0.45)" />
                        <p-chart-radar id="readiness" [data]="radarData" categoryXField="queue" valueYField="readiness" name="Automation readiness" color="#5ccf9f" [fillOpacity]="0.18" [lineStrokeWidth]="2.5" [showMarkers]="true" [markerSize]="5" />
                        <p-chart-x-axis />
                        <p-chart-y-axis />
                        <p-chart-legend position="top" />
                        <p-chart-tooltip />
                        <p-chart-hover [brightness]="1.15" />
                        <p-chart-title text="Support coverage: incident pressure vs automation readiness" />
                        <p-chart-caption text="Grey polar sectors show incident pressure by queue. The mint radar outline shows automation readiness on the same axes, making coverage gaps visible where pressure is high but readiness trails." />
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
export class ComboPolarAndRadarDoc {
    readonly radarData = [
        { queue: 'Login', readiness: 88 },
        { queue: 'Billing', readiness: 74 },
        { queue: 'Search', readiness: 82 },
        { queue: 'Checkout', readiness: 91 },
        { queue: 'Mobile', readiness: 77 },
        { queue: 'Integrations', readiness: 69 }
    ];

    readonly polarData = [
        { queue: 'Login', pressure: 54 },
        { queue: 'Billing', pressure: 72 },
        { queue: 'Search', pressure: 45 },
        { queue: 'Checkout', pressure: 82 },
        { queue: 'Mobile', pressure: 61 },
        { queue: 'Integrations', pressure: 76 }
    ];
}
