import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type SegmentContext } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-line-area-segment-styling-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Set <i>segmentColor</i>, <i>segmentStrokeWidth</i>, <i>segmentDash</i>, or <i>segmentFillColor</i> to style individual line segments. Each input accepts a static value or a callback receiving the two endpoints (<i>p0</i> and
                <i>p1</i>) with their values and positions. Return <i>undefined</i> from a callback to fall back to the series default for that segment.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-line [data]="data" categoryXField="month" valueYField="price" showMarkers [markerSize]="5" [segmentColor]="segmentColor" [segmentStrokeWidth]="segmentWidth" curve="smooth" />
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
export class LineAreaSegmentStylingDoc {
    readonly data = [
        { month: 'Jan', price: 142 },
        { month: 'Feb', price: 155 },
        { month: 'Mar', price: 148 },
        { month: 'Apr', price: 163 },
        { month: 'May', price: 158 },
        { month: 'Jun', price: 172 },
        { month: 'Jul', price: 165 },
        { month: 'Aug', price: 178 },
        { month: 'Sep', price: 170 },
        { month: 'Oct', price: 185 },
        { month: 'Nov', price: 180 },
        { month: 'Dec', price: 195 }
    ];
    readonly segmentColor = (ctx: SegmentContext) => ((ctx.p1.value ?? 0) >= (ctx.p0.value ?? 0) ? '#10a981' : '#e5484d');
    readonly segmentWidth = () => 2.5;
}
