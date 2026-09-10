import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-column-bar-declarative-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Define bars inline using <i>ChartItem</i> children instead of a data array. Each <i>ChartItem</i> accepts <i>categoryX</i> and <i>valueY</i>, or <i>categoryY</i> and <i>valueX</i> for horizontal bars, and optionally <i>open</i> for
                floating bar definitions.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-bar>
                            <p-chart-item categoryX="Promoters" [valueY]="42" color="#10a981" />
                            <p-chart-item categoryX="Passives" [valueY]="28" color="#5daeea" />
                            <p-chart-item categoryX="Neutral" [valueY]="18" color="#ffd166" />
                            <p-chart-item categoryX="At Risk" [valueY]="8" color="#ffad5a" />
                            <p-chart-item categoryX="Detractors" [valueY]="4" color="#e5484d" />
                        </p-chart-bar>
                        <p-chart-x-axis />
                        <p-chart-y-axis label="Survey responses (%)" />
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
export class ColumnBarDeclarativeDoc {}
