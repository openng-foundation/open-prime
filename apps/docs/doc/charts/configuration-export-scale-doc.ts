import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'configuration-export-scale-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Set <i>scale</i> to control the pixel density of raster exports (PNG, JPEG, PDF). The default <i>2</i> produces a 2× retina-quality image. Set <i>scale</i> to <i>3</i> for print-quality exports or <i>1</i> for smaller file sizes.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="460">
                    <p-chart-bar [data]="data" categoryXField="segment" valueYField="lastQ" color="#5daeea" name="Last Q" />
                    <p-chart-bar [data]="data" categoryXField="segment" valueYField="currentQ" color="#ffad5a" name="Current Q" />
                    <p-chart-x-axis />
                    <p-chart-y-axis />
                    <p-chart-legend position="bottom" />
                    <p-chart-export-menu [scale]="3" filename="segment-retina-report" />
                </p-chart-svg>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExportScaleDoc {
    readonly data = [
        { segment: 'Starter', lastQ: 85, currentQ: 92 },
        { segment: 'Growth', lastQ: 72, currentQ: 68 },
        { segment: 'Scale', lastQ: 95, currentQ: 88 },
        { segment: 'Enterprise', lastQ: 63, currentQ: 78 }
    ];
}
