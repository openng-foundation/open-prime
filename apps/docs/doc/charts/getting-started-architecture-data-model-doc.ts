import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'getting-started-architecture-data-model-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Chart reads a flat array of objects. Bind field names to series inputs. The chart reads the values at render time.</p>
            <p>
                Each series binds its own <i>valueField</i>. The <i>categoryField</i> is the x-axis dimension and can be shared across all series. Series can also use separate data arrays when the sources differ. The category domain is the union
                across all series.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="400">
                    <p-chart-line [data]="data" categoryXField="month" valueYField="revenue" name="Revenue" curve="smooth" [showMarkers]="true" />
                    <p-chart-line [data]="data" categoryXField="month" valueYField="expenses" name="Expenses" curve="smooth" [showMarkers]="true" />
                    <p-chart-x-axis />
                    <p-chart-y-axis />
                    <p-chart-legend />
                    <p-chart-tooltip />
                </p-chart-svg>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArchitectureDataModelDoc {
    readonly data = [
        { month: 'Jan', revenue: 42, expenses: 31 },
        { month: 'Feb', revenue: 55, expenses: 38 },
        { month: 'Mar', revenue: 48, expenses: 35 },
        { month: 'Apr', revenue: 63, expenses: 44 },
        { month: 'May', revenue: 58, expenses: 40 },
        { month: 'Jun', revenue: 72, expenses: 51 },
        { month: 'Jul', revenue: 65, expenses: 47 },
        { month: 'Aug', revenue: 78, expenses: 55 }
    ];
}
