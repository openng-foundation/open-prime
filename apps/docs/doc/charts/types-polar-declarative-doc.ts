import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-polar-declarative-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Define bars inline using <i>ChartItem</i> children instead of a data array. Each <i>ChartItem</i> accepts <i>categoryX</i>, <i>valueY</i>, and <i>color</i>.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="display: flex; justify-content: center">
                    <p-chart-svg [width]="460" [height]="460">
                        <p-chart-polar>
                            <p-chart-item categoryX="N" [valueY]="12" />
                            <p-chart-item categoryX="NE" [valueY]="8" />
                            <p-chart-item categoryX="E" [valueY]="15" />
                            <p-chart-item categoryX="SE" [valueY]="20" />
                            <p-chart-item categoryX="S" [valueY]="18" />
                            <p-chart-item categoryX="SW" [valueY]="25" />
                            <p-chart-item categoryX="W" [valueY]="22" />
                            <p-chart-item categoryX="NW" [valueY]="10" />
                        </p-chart-polar>
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
export class PolarDeclarativeDoc {}
