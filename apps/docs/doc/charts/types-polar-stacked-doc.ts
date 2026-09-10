import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-polar-stacked-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Wrap multiple <i>ChartPolar</i> components inside <i>ChartStacked</i> to stack bars radially outward. Each series accumulates on top of the previous one.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="display: flex; justify-content: center">
                    <p-chart-svg [width]="460" [height]="460">
                        <p-chart-stacked>
                            <p-chart-polar [data]="data" categoryXField="direction" valueYField="morning" name="Morning" />
                            <p-chart-polar [data]="data" categoryXField="direction" valueYField="afternoon" name="Afternoon" />
                        </p-chart-stacked>
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
export class PolarStackedDoc {
    readonly data = [
        { direction: 'N', morning: 8, afternoon: 4 },
        { direction: 'NE', morning: 5, afternoon: 3 },
        { direction: 'E', morning: 10, afternoon: 5 },
        { direction: 'SE', morning: 14, afternoon: 6 },
        { direction: 'S', morning: 12, afternoon: 6 },
        { direction: 'SW', morning: 18, afternoon: 7 },
        { direction: 'W', morning: 15, afternoon: 7 },
        { direction: 'NW', morning: 6, afternoon: 4 }
    ];
}
