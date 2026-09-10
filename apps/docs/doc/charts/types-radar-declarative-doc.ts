import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-radar-declarative-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Define data points inline using <i>ChartItem</i> children instead of a data array. Each <i>ChartItem</i> accepts <i>categoryX</i>, <i>valueY</i>, and <i>color</i>.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-radar>
                            <p-chart-item categoryX="Speed" [valueY]="85" />
                            <p-chart-item categoryX="Reliability" [valueY]="92" />
                            <p-chart-item categoryX="Usability" [valueY]="78" />
                            <p-chart-item categoryX="Security" [valueY]="88" />
                            <p-chart-item categoryX="Scalability" [valueY]="72" />
                            <p-chart-item categoryX="Support" [valueY]="80" />
                        </p-chart-radar>
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
export class RadarDeclarativeDoc {}
