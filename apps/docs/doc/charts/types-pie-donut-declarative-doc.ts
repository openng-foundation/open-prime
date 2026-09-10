import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-pie-donut-declarative-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Define slices inline using <i>ChartItem</i> children instead of a data array. Each <i>ChartItem</i> accepts <i>value</i>, <i>category</i>, <i>color</i>, <i>borderRadius</i>, <i>borderColor</i>, and <i>borderStrokeWidth</i>.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="display: flex; justify-content: center">
                    <p-chart-svg [width]="460" [height]="460">
                        <p-chart-pie>
                            <p-chart-item [value]="55" category="Desktop" />
                            <p-chart-item [value]="32" category="Mobile" />
                            <p-chart-item [value]="13" category="Tablet" />
                        </p-chart-pie>
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
export class PieDonutDeclarativeDoc {}
