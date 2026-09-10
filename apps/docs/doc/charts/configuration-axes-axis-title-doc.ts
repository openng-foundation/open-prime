import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'configuration-axes-axis-title-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Set <i>label</i> to display a title alongside the axis.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="460">
                    <p-chart-bar [data]="data" categoryXField="month" valueYField="arr" color="#5daeea" />
                    <p-chart-x-axis label="Month" />
                    <p-chart-y-axis label="Expansion ARR ($K)" />
                </p-chart-svg>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AxesAxisTitleDoc {
    readonly data = [
        { month: 'Jan', arr: 42 },
        { month: 'Feb', arr: 55 },
        { month: 'Mar', arr: 48 },
        { month: 'Apr', arr: 72 },
        { month: 'May', arr: 63 },
        { month: 'Jun', arr: 58 }
    ];
}
