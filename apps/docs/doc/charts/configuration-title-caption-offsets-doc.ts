import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

const ARR = [
    { month: 'Jan', arr: 42 },
    { month: 'Feb', arr: 55 },
    { month: 'Mar', arr: 48 },
    { month: 'Apr', arr: 63 },
    { month: 'May', arr: 58 },
    { month: 'Jun', arr: 71 }
];

@Component({
    selector: 'configuration-title-caption-offsets-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Use <i>offsetX</i> and <i>offsetY</i> to fine-tune the title position after alignment is applied. Accepts positive or negative pixel values.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="460">
                    <p-chart-bar [data]="data" categoryXField="month" valueYField="arr" color="#5daeea" />
                    <p-chart-x-axis />
                    <p-chart-y-axis />
                    <p-chart-title text="Expansion ARR" alignment="start" [offsetX]="20" [offsetY]="4" />
                    <p-chart-caption text="January - June 2026" alignment="start" [offsetX]="20" />
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
export class TitleCaptionOffsetsDoc {
    readonly data = ARR;
}
