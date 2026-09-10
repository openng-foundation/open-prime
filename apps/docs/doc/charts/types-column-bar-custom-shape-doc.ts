import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type BarShapeInfo } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-column-bar-custom-shape-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Set <i>renderShape</i> to replace the default rectangle with a custom SVG path. The callback receives the computed bar geometry (<i>x</i>, <i>y</i>, <i>width</i>, <i>height</i>, <i>value</i>, <i>category</i>, <i>dataIndex</i>, and
                <i>isNegative</i>) and returns an SVG path <i>d</i> string. Works in both SVG and Canvas renderers via <i>Path2D</i>.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="460">
                    <p-chart-bar [data]="data" categoryXField="stage" valueYField="accounts" [renderShape]="arrowShape" color="#7c8cff" />
                    <p-chart-x-axis />
                    <p-chart-y-axis label="Accounts" />
                </p-chart-svg>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ColumnBarCustomShapeDoc {
    readonly data = [
        { stage: 'Qualified', accounts: 68 },
        { stage: 'Demo', accounts: 54 },
        { stage: 'Pilot', accounts: 37 },
        { stage: 'Security', accounts: 28 },
        { stage: 'Closed won', accounts: 19 }
    ];

    readonly arrowShape = ({ x, y, width, height }: BarShapeInfo): string => {
        const cx = x + width / 2;
        const tipWidth = width * 1.0;
        const arrowHeight = Math.min(width * 0.4, height * 0.25);
        const top = y;
        const arrowStart = y + arrowHeight;
        const bottom = y + height;

        const shaftInset = width * 0.15;

        return [
            `M ${cx} ${top}`,
            `L ${x + width / 2 + tipWidth / 2} ${arrowStart}`,
            `L ${x + width - shaftInset} ${arrowStart}`,
            `L ${x + width - shaftInset} ${bottom}`,
            `L ${x + shaftInset} ${bottom}`,
            `L ${x + shaftInset} ${arrowStart}`,
            `L ${x + width / 2 - tipWidth / 2} ${arrowStart}`,
            'Z'
        ].join(' ');
    };
}
