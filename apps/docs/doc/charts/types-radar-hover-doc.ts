import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-radar-hover-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Add <i>ChartHover</i> to apply visual feedback on hover. Set <i>brightness</i> to lighten the hovered series, and set <i>dimOpacity</i> below <i>1</i> only when you want the rest to fade. Hovering operates at the dataset level. The
                entire polygon highlights, not individual vertices. Vertex markers enlarge to <i>markerSize × 1.3</i> on hover.
            </p>
            <p>For full configuration see <a href="/charts/configuration/hover">Hover</a>.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-radar id="current" [data]="data" categoryXField="capability" valueYField="current" [fillOpacity]="0.2" name="Current" />
                        <p-chart-radar id="benchmark" [data]="data" categoryXField="capability" valueYField="benchmark" [fillOpacity]="0.2" name="Benchmark" />
                        <p-chart-x-axis />
                        <p-chart-y-axis />
                        <p-chart-hover [brightness]="1.2" />
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
export class RadarHoverDoc {
    readonly data = [
        { capability: 'Onboarding', current: 84, benchmark: 72 },
        { capability: 'Retention', current: 76, benchmark: 88 },
        { capability: 'Governance', current: 69, benchmark: 91 },
        { capability: 'Insights', current: 82, benchmark: 80 },
        { capability: 'Automation', current: 74, benchmark: 86 },
        { capability: 'Support', current: 88, benchmark: 79 }
    ];
}
