import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, svgNode, type PointRenderContext, type SvgNode } from '@openng/optimus-ui/charts';

interface Point {
    effort: number;
    impact: number;
    grade: string;
}

@Component({
    selector: 'types-scatter-bubble-custom-markers-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Replace built-in shapes with custom content through the <i>pChartMarkerDef</i> seam. In SVG mode, use an <i>&lt;ng-template pChartMarkerDef let-ctx&gt;</i> template returning <i>svg:</i>-prefixed markup centered at the origin; the
                chart handles translation to each point's position. In Canvas mode, pass a <i>renderMarker</i> function that draws at the origin and returns <i>null</i> (the context is pre-translated to the point).
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-scatter id="custom" [data]="data" valueXField="effort" valueYField="impact" [markerSize]="12" [renderMarker]="renderMarker" />
                        <p-chart-x-axis label="Implementation effort (points)" />
                        <p-chart-y-axis label="Estimated ARR impact ($K)" />
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
export class ScatterBubbleCustomMarkersDoc {
    readonly data: Point[] = [
        { effort: 8, impact: 42, grade: 'B' },
        { effort: 14, impact: 56, grade: 'A' },
        { effort: 22, impact: 63, grade: 'A' },
        { effort: 31, impact: 48, grade: 'C' },
        { effort: 39, impact: 76, grade: 'A' },
        { effort: 46, impact: 68, grade: 'B' }
    ];

    readonly renderMarker = (context: PointRenderContext<Point>): SvgNode => {
        const s = context.size;

        return svgNode('g', {}, [
            svgNode('circle', { r: s + 2, fill: '#7c8cff', opacity: 0.2 }),
            svgNode('circle', { r: s, fill: 'var(--p-content-background, #ffffff)', stroke: '#7c8cff', 'stroke-width': 2 }),
            svgNode('text', { 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': 9, fill: '#7c8cff', 'font-weight': 'bold' }, [context.data.grade])
        ]);
    };
}
