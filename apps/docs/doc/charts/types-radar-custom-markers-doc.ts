import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, svgNode, type PointRenderContext, type SvgNode } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-radar-custom-markers-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Replace built-in markers with fully custom content through the <i>pChartMarkerDef</i> seam. In SVG mode, use an <i>&lt;ng-template pChartMarkerDef let-ctx&gt;</i> template returning <i>svg:</i>-prefixed markup centered at the origin;
                the chart handles translation to each vertex position. In Canvas mode, pass a <i>renderMarker</i> function that draws at the origin and returns <i>null</i> (the context is pre-translated to the vertex).
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-radar id="custom" [data]="data" categoryXField="metric" valueYField="value" [fillOpacity]="0.15" [showMarkers]="true" [markerSize]="12" [renderMarker]="renderMarker" />
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
export class RadarCustomMarkersDoc {
    readonly data = [
        { metric: 'Activation', value: 85 },
        { metric: 'Reliability', value: 92 },
        { metric: 'Reporting', value: 78 },
        { metric: 'Security', value: 88 },
        { metric: 'Scale', value: 72 },
        { metric: 'Support', value: 80 }
    ];

    readonly renderMarker = (context: PointRenderContext): SvgNode => {
        const s = context.size;

        return svgNode('g', {}, [
            svgNode('circle', { r: s + 2, fill: '#5daeea', opacity: 0.2 }),
            svgNode('circle', { r: s, fill: 'var(--p-content-background)', stroke: '#5daeea', 'stroke-width': 2 }),
            svgNode('text', { 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': 8, fill: '#5daeea', 'font-weight': 'bold' }, [String(Math.round(context.value as number))])
        ]);
    };
}
