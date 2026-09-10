import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-scatter-bubble-gradient-color-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Pass a gradient object to <i>color</i> to apply a gradient fill to every point. Radial gradients are centered at each point and sized to the point radius, which gives bubbles a sense of depth. Linear gradients span the full chart
                area, the same as bars and lines.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-scatter id="bubbles" [data]="data" valueXField="closeDays" valueYField="confidence" sizeField="arr" [color]="gradientColor" [minSize]="14" [maxSize]="42" />
                        <p-chart-x-axis label="Days to close" />
                        <p-chart-y-axis label="Forecast confidence (%)" />
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
export class ScatterBubbleGradientColorDoc {
    readonly data = [
        { closeDays: 12, confidence: 86, arr: 18 },
        { closeDays: 18, confidence: 79, arr: 28 },
        { closeDays: 24, confidence: 72, arr: 36 },
        { closeDays: 31, confidence: 66, arr: 44 },
        { closeDays: 38, confidence: 58, arr: 32 },
        { closeDays: 45, confidence: 51, arr: 24 },
        { closeDays: 52, confidence: 44, arr: 52 },
        { closeDays: 60, confidence: 39, arr: 40 },
        { closeDays: 68, confidence: 34, arr: 30 },
        { closeDays: 76, confidence: 28, arr: 20 }
    ];
    readonly gradientColor = {
        radialGradient: { cx: 0.45, cy: 0.35, r: 0.65 },
        stops: [
            { offset: 0, color: '#dbeafe', opacity: 0.95 },
            { offset: 0.55, color: '#5daeea', opacity: 0.82 },
            { offset: 1, color: '#7c8cff', opacity: 0.72 }
        ]
    };
}
