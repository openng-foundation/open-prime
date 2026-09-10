import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'configuration-hover-scale-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Set <i>scale</i> to physically resize the hovered element. Unlike <i>brightness</i> which only adjusts color, <i>scale</i> grows or shrinks the element. <i>1.2</i> makes it 20% larger. Scale and brightness can be combined for a
                stronger pop effect.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="display: flex; justify-content: center">
                    <p-chart-svg [width]="460" [height]="460">
                        <p-chart-pie [data]="data" categoryField="category" valueField="value" name="Sales" />
                        <p-chart-legend position="bottom" />
                        <p-chart-hover [scale]="1.15" [brightness]="1.1" />
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
export class HoverScaleDoc {
    readonly data = [
        { category: 'Electronics', value: 38 },
        { category: 'Clothing', value: 24 },
        { category: 'Food', value: 19 },
        { category: 'Books', value: 12 },
        { category: 'Other', value: 7 }
    ];
}
