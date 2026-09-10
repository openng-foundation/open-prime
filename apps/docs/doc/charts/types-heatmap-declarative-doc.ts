import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-heatmap-declarative-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Define cells inline using <i>ChartItem</i> children instead of a data array. Each <i>ChartItem</i> accepts <i>categoryX</i> for the X axis category, <i>categoryY</i> for the Y axis category, and <i>value</i> for the cell intensity.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-heatmap>
                            <p-chart-item categoryY="Mon" categoryX="Morning" [value]="12" />
                            <p-chart-item categoryY="Mon" categoryX="Afternoon" [value]="45" />
                            <p-chart-item categoryY="Mon" categoryX="Evening" [value]="30" />
                            <p-chart-item categoryY="Tue" categoryX="Morning" [value]="25" />
                            <p-chart-item categoryY="Tue" categoryX="Afternoon" [value]="70" />
                            <p-chart-item categoryY="Tue" categoryX="Evening" [value]="55" />
                            <p-chart-item categoryY="Wed" categoryX="Morning" [value]="18" />
                            <p-chart-item categoryY="Wed" categoryX="Afternoon" [value]="60" />
                            <p-chart-item categoryY="Wed" categoryX="Evening" [value]="40" />
                        </p-chart-heatmap>
                        <p-chart-x-axis [showLine]="false" [showTicks]="false" [gridLines]="false" />
                        <p-chart-y-axis [showLine]="false" [showTicks]="false" [gridLines]="false" />
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
export class HeatmapDeclarativeDoc {}
