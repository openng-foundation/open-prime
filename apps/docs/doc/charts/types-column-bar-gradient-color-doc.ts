import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-column-bar-gradient-color-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Pass a linear gradient object to the <i>color</i> input to apply a gradient fill across all bars. For per-bar gradients, pass an array of gradient objects to <i>color</i>.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-bar [data]="data" categoryXField="region" valueYField="attainment" [color]="gradientColor" [borderRadius]="6" />
                        <p-chart-x-axis />
                        <p-chart-y-axis label="% of plan" />
                        <p-chart-reference-line [y]="90" stroke="#5daeea" [lineStrokeWidth]="1.5" [lineDash]="[5, 4]" label="Target" />
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
export class ColumnBarGradientColorDoc {
    readonly data = [
        { region: 'Americas', attainment: 96 },
        { region: 'EMEA', attainment: 88 },
        { region: 'APAC', attainment: 91 },
        { region: 'LATAM', attainment: 78 },
        { region: 'Public Sector', attainment: 84 }
    ];

    readonly gradientColor = {
        type: 'linear',
        direction: 'vertical',
        stops: [
            { offset: 0, color: '#7c8cff' },
            { offset: 0.5, color: '#4ecdc4' },
            { offset: 1, color: '#5ccf9f' }
        ]
    };
}
