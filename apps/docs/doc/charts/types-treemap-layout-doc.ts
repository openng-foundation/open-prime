import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-treemap-layout-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Set <i>layout</i> to control the tiling algorithm. <i>squarify</i> (default) minimizes aspect ratio; cells are as square as possible. <i>slice</i> creates horizontal strips, <i>dice</i> creates vertical strips, and
                <i>sliceDice</i> alternates between them by depth level.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-treemap [data]="data" categoryField="name" valueField="population" layout="slice" />
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
export class TreemapLayoutDoc {
    readonly data = [
        { name: 'Asia', population: 4700 },
        { name: 'Africa', population: 1400 },
        { name: 'Europe', population: 750 },
        { name: 'N. America', population: 580 },
        { name: 'S. America', population: 430 },
        { name: 'Oceania', population: 45 }
    ];
}
