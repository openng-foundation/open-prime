import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

const topToBottomGradient = {
    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
    stops: [
        { offset: 0, color: 'rgba(93, 174, 234, 0.5)' },
        { offset: 1, color: 'rgba(93, 174, 234, 0.02)' }
    ]
};

const centerBrightGradient = {
    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
    stops: [
        { offset: 0, color: 'rgba(16, 169, 129, 0.05)' },
        { offset: 0.4, color: 'rgba(16, 169, 129, 0.5)' },
        { offset: 0.6, color: 'rgba(16, 169, 129, 0.5)' },
        { offset: 1, color: 'rgba(16, 169, 129, 0.05)' }
    ]
};

@Component({
    selector: 'types-line-area-gradient-color-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Pass a linear gradient object to <i>color</i> to apply a gradient to the line stroke and area fill. Define direction with normalized coordinates (<i>x1, y1</i> → <i>x2, y2</i>) and <i>stops</i> for color transitions.
                <i>{{ '{' }} x1: 0, y1: 0, x2: 0, y2: 1 {{ '}' }}</i> creates a top-to-bottom gradient. Line strokes default to horizontal; area fills default to vertical.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-line [data]="data" categoryXField="month" valueYField="pipeline" [color]="topToBottomGradient" name="Pipeline coverage" [fillOpacity]="1" />
                        <p-chart-line [data]="data" categoryXField="month" valueYField="confidence" [color]="centerBrightGradient" name="Renewal confidence" [fillOpacity]="1" />
                        <p-chart-x-axis />
                        <p-chart-y-axis />
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
export class LineAreaGradientColorDoc {
    readonly topToBottomGradient = topToBottomGradient;
    readonly centerBrightGradient = centerBrightGradient;
    readonly data = [
        { month: 'Jan', pipeline: 62, confidence: 48 },
        { month: 'Feb', pipeline: 66, confidence: 52 },
        { month: 'Mar', pipeline: 71, confidence: 56 },
        { month: 'Apr', pipeline: 69, confidence: 61 },
        { month: 'May', pipeline: 76, confidence: 65 },
        { month: 'Jun', pipeline: 82, confidence: 69 },
        { month: 'Jul', pipeline: 86, confidence: 73 },
        { month: 'Aug', pipeline: 84, confidence: 71 },
        { month: 'Sep', pipeline: 78, confidence: 67 },
        { month: 'Oct', pipeline: 74, confidence: 63 },
        { month: 'Nov', pipeline: 70, confidence: 59 },
        { month: 'Dec', pipeline: 77, confidence: 64 }
    ];
}
