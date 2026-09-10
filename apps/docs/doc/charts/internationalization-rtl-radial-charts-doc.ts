import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'internationalization-rtl-radial-charts-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>RTL also applies to pie and donut charts. Legend items are right-aligned, text direction is reversed, and tooltip positioning follows the RTL flow.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="460" dir="rtl">
                    <p-chart-pie [data]="data" categoryField="label" valueField="value" name="المبيعات" />
                    <p-chart-legend position="bottom" />
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
export class RtlRadialChartsDoc {
    readonly data = [
        { label: 'إلكترونيات', value: 38 },
        { label: 'ملابس', value: 24 },
        { label: 'أثاث', value: 18 },
        { label: 'طعام', value: 12 },
        { label: 'أخرى', value: 8 }
    ];
}
