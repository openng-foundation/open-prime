import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-radar-colors-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Set <i>color</i> to apply a color to the polygon stroke and its area fill. Supports hex, RGB, and CSS color values.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-radar id="startup" [data]="data" categoryXField="capability" valueYField="startup" color="#5daeea" [fillOpacity]="0.2" name="Startup" />
                        <p-chart-radar id="midMarket" [data]="data" categoryXField="capability" valueYField="midMarket" color="#ffad5a" [fillOpacity]="0.2" name="Mid-market" />
                        <p-chart-radar id="enterprise" [data]="data" categoryXField="capability" valueYField="enterprise" color="#4ecdc4" [fillOpacity]="0.2" name="Enterprise" />
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
export class RadarColorsDoc {
    readonly data = [
        { capability: 'Activation', startup: 88, midMarket: 74, enterprise: 69 },
        { capability: 'Reliability', startup: 70, midMarket: 84, enterprise: 93 },
        { capability: 'Governance', startup: 58, midMarket: 79, enterprise: 95 },
        { capability: 'Insights', startup: 76, midMarket: 87, enterprise: 82 },
        { capability: 'Launch Speed', startup: 92, midMarket: 78, enterprise: 65 },
        { capability: 'Support Fit', startup: 68, midMarket: 82, enterprise: 91 }
    ];
}
