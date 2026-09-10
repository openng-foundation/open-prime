import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-column-bar-border-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Set <i>borderStrokeWidth</i> and <i>borderColor</i> to stroke each bar. <i>borderRadius</i> rounds the corners: pass a number for uniform rounding or <i>{{ '{' }} topLeft, topRight, bottomLeft, bottomRight {{ '}' }}</i> for per-corner
                control. Use <i>borderDash</i> for a dashed stroke and <i>borderSkipped</i> to drop the border on specific edges.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-bar
                            [data]="data"
                            categoryXField="month"
                            valueYField="passed"
                            [borderStrokeWidth]="4"
                            [borderColor]="BORDER_COLOR"
                            [borderDash]="[6, 3]"
                            borderSkipped="bottom"
                            [borderRadius]="{
                                topLeft: 8,
                                topRight: 8,
                                bottomLeft: 0,
                                bottomRight: 0
                            }"
                        />
                        <p-chart-x-axis />
                        <p-chart-y-axis label="SLA checks passed" />
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
export class ColumnBarBorderDoc {
    readonly data = [
        { month: 'Jan', passed: 320 },
        { month: 'Feb', passed: 280 },
        { month: 'Mar', passed: 410 },
        { month: 'Apr', passed: 360 },
        { month: 'May', passed: 450 },
        { month: 'Jun', passed: 390 }
    ];

    readonly BORDER_COLOR = '#5daeea';
}
