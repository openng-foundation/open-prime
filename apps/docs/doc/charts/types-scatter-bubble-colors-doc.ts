import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type ItemContext } from '@openng/optimus-ui/charts';

interface AccountSignal {
    adoption: number;
    renewal: number;
    status: 'healthy' | 'watch' | 'risk';
}

const COLORS = {
    healthy: '#5ccf9f',
    watch: '#ffad5a',
    risk: '#ff7a66'
};

@Component({
    selector: 'types-scatter-bubble-colors-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Pass a static color, array (cycles by index), field name, or function to <i>color</i> to control point fill. Use a static value for a uniform series color or a callback for per-point coloring based on data.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-scatter id="colored" [data]="data" valueXField="adoption" valueYField="renewal" [color]="colorFn" [markerSize]="8" />
                        <p-chart-x-axis label="Product adoption (%)" />
                        <p-chart-y-axis label="Renewal likelihood (%)" />
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
export class ScatterBubbleColorsDoc {
    readonly data: AccountSignal[] = [
        { adoption: 91, renewal: 94, status: 'healthy' },
        { adoption: 84, renewal: 88, status: 'healthy' },
        { adoption: 78, renewal: 74, status: 'watch' },
        { adoption: 72, renewal: 68, status: 'watch' },
        { adoption: 66, renewal: 59, status: 'watch' },
        { adoption: 61, renewal: 52, status: 'risk' },
        { adoption: 55, renewal: 49, status: 'risk' },
        { adoption: 48, renewal: 42, status: 'risk' },
        { adoption: 86, renewal: 76, status: 'watch' },
        { adoption: 93, renewal: 91, status: 'healthy' },
        { adoption: 69, renewal: 63, status: 'watch' },
        { adoption: 58, renewal: 55, status: 'risk' }
    ];
    readonly colorFn = ({ datum }: ItemContext) => COLORS[(datum as AccountSignal).status];
}
