import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'configuration-data-labels-min-percentage-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Set <i>minPercentage</i> to hide labels on slices or segments smaller than a threshold. Applies to pie, donut, polar, and radar charts.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div class="flex justify-center">
                    <p-chart-svg [width]="460" [height]="460">
                        <p-chart-pie [data]="data" categoryField="language" valueField="usage" name="Language Usage" />
                        <p-chart-legend position="bottom" />
                        <p-chart-data-labels display="percentage" [minPercentage]="5" />
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
export class DataLabelsMinPercentageDoc {
    readonly data = [
        { language: 'JavaScript', usage: 62 },
        { language: 'Python', usage: 18 },
        { language: 'TypeScript', usage: 8 },
        { language: 'Java', usage: 5 },
        { language: 'Go', usage: 3 },
        { language: 'Rust', usage: 2 },
        { language: 'Other', usage: 2 }
    ];
}
