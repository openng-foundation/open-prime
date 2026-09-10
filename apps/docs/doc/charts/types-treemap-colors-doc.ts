import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-treemap-colors-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Pass an array to <i>color</i> to assign a palette to cells; colors cycle by index across items or groups. Pass a static value to <i>color</i> to apply a single color to all cells.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-treemap [data]="data" categoryField="name" valueField="population" [color]="colors" />
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
export class TreemapColorsDoc {
    readonly colors = ['#5daeea', '#4ecdc4', '#ffad5a', '#7c8cff', '#ff6fae', '#94a3b8'];
    readonly data = [
        { name: 'Asia', population: 4700 },
        { name: 'Africa', population: 1400 },
        { name: 'Europe', population: 750 },
        { name: 'N. America', population: 580 },
        { name: 'S. America', population: 430 },
        { name: 'Oceania', population: 45 }
    ];
}
