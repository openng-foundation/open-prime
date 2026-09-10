import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-line-area-declarative-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Define data points inline using <i>ChartItem</i> children instead of a data array. Each <i>ChartItem</i> accepts <i>categoryX</i> and <i>valueY</i>, or <i>categoryY</i> and <i>valueX</i> for horizontal lines, and <i>color</i>.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-line showMarkers curve="smooth">
                            <p-chart-item [valueY]="120" categoryX="Q1" />
                            <p-chart-item [valueY]="185" categoryX="Q2" />
                            <p-chart-item [valueY]="156" categoryX="Q3" />
                            <p-chart-item [valueY]="210" categoryX="Q4" />
                        </p-chart-line>
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
export class LineAreaDeclarativeDoc {}
