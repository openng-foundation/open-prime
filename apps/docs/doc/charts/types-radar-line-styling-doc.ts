import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-radar-line-styling-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Set <i>lineStrokeWidth</i> to control polygon stroke thickness. Set <i>lineStyle</i> to <i>dashed</i> or <i>dotted</i> for a preset dash pattern, or use <i>lineDash</i> to define a custom pattern with
                <i>[dashLength, gapLength]</i> for distinguishing series when color alone is not enough.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-radar id="heavy" [data]="data" categoryXField="attribute" valueYField="reliability" [lineStrokeWidth]="3" [fillOpacity]="0.15" [markerSize]="6" name="Reliability" />
                        <p-chart-radar id="swift" [data]="data" categoryXField="attribute" valueYField="growth" [lineStrokeWidth]="1.5" lineStyle="dashed" [fillOpacity]="0.1" [markerSize]="3" name="Growth" />
                        <p-chart-radar id="balanced" [data]="data" categoryXField="attribute" valueYField="balanced" [lineStrokeWidth]="2" lineStyle="dotted" [fillOpacity]="0.2" [markerSize]="4" name="Balanced" />
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
export class RadarLineStylingDoc {
    readonly data = [
        { attribute: 'Latency', reliability: 94, growth: 66, balanced: 82 },
        { attribute: 'Release Pace', reliability: 58, growth: 92, balanced: 78 },
        { attribute: 'Cost Control', reliability: 86, growth: 63, balanced: 80 },
        { attribute: 'Activation', reliability: 62, growth: 90, balanced: 84 },
        { attribute: 'Compliance', reliability: 90, growth: 70, balanced: 81 },
        { attribute: 'Support Load', reliability: 78, growth: 75, balanced: 83 }
    ];
}
