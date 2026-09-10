import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-pie-donut-sorted-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Set <i>sort</i> to reorder slices before rendering. Use <i>value-desc</i> to place the largest incident cause first, or <i>label-asc</i> for alphabetical order. Sort does not affect the underlying data, only the visual arrangement.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="display: flex; justify-content: center">
                    <p-chart-svg [width]="460" [height]="460">
                        <p-chart-pie [data]="data" valueField="minutes" categoryField="cause" sort="value-desc" />
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
export class PieDonutSortedDoc {
    readonly data = [
        { cause: 'Deploy regression', minutes: 18 },
        { cause: 'Database saturation', minutes: 41 },
        { cause: 'Third-party API', minutes: 26 },
        { cause: 'Traffic spike', minutes: 22 },
        { cause: 'Config drift', minutes: 9 },
        { cause: 'Unknown', minutes: 6 }
    ];
}
