import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, svgNode, type PointRenderContext, type SvgNode } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-line-area-custom-markers-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Replace built-in markers with custom content through the <i>pChartMarkerDef</i> seam. In SVG mode, use an <i>&lt;ng-template pChartMarkerDef let-ctx&gt;</i> template returning <i>svg:</i>-prefixed markup centered at the origin; the
                chart handles translation to each point position. In Canvas mode, pass a <i>renderMarker</i> function that draws at the origin and returns <i>null</i> (the context is pre-translated to the point). Both receive the full
                <i>PointRenderContext</i>; use <i>ctx.index</i> or <i>ctx.data</i> to vary the marker per point.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-line [data]="data" categoryXField="month" valueYField="health" [showMarkers]="true" [markerSize]="12" [renderMarker]="renderMarker" />
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
export class LineAreaCustomMarkersDoc {
    readonly data = [
        { month: 'Jan', health: 42 },
        { month: 'Feb', health: 48 },
        { month: 'Mar', health: 55 },
        { month: 'Apr', health: 52 },
        { month: 'May', health: 65 },
        { month: 'Jun', health: 72 }
    ];

    readonly renderMarker = (context: PointRenderContext): SvgNode => {
        const s = context.size;

        return svgNode('g', {}, [
            svgNode('circle', { r: s + 2, fill: '#5daeea', opacity: 0.2 }),
            svgNode('circle', { r: s, fill: 'var(--p-content-background)', stroke: '#5daeea', 'stroke-width': 2 }),
            svgNode('text', { 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': 9, fill: '#5daeea', 'font-weight': 'bold' }, [String(context.value)])
        ]);
    };
}
