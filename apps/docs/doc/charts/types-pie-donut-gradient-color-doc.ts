import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-pie-donut-gradient-color-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Pass a radial gradient object to <i>color</i> instead of a flat hex value. Each gradient defines <i>stops</i> with offset and color pairs; keep the palette controlled so the effect reads as depth, not decoration.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="display: flex; justify-content: center">
                    <p-chart-svg [width]="460" [height]="460">
                        <p-chart-pie [data]="data" valueField="cost" categoryField="workload" [color]="colors" />
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
export class PieDonutGradientColorDoc {
    readonly data = [
        { workload: 'Compute', cost: 38 },
        { workload: 'Data platform', cost: 24 },
        { workload: 'AI training', cost: 16 },
        { workload: 'Storage', cost: 12 },
        { workload: 'Network', cost: 10 }
    ];

    readonly colors = [
        {
            radialGradient: { cx: 0.5, cy: 0.5, r: 1.0 },
            stops: [
                { offset: 0, color: '#b8e2ff' },
                { offset: 0.58, color: '#5daeea' },
                { offset: 1, color: '#2176ff' }
            ]
        },
        {
            radialGradient: { cx: 0.5, cy: 0.5, r: 1.0 },
            stops: [
                { offset: 0, color: '#b9f4ee' },
                { offset: 0.62, color: '#4ecdc4' },
                { offset: 1, color: '#0f9f99' }
            ]
        },
        {
            radialGradient: { cx: 0.5, cy: 0.5, r: 1.0 },
            stops: [
                { offset: 0, color: '#d8ddff' },
                { offset: 0.6, color: '#7c8cff' },
                { offset: 1, color: '#4f5fe8' }
            ]
        },
        {
            radialGradient: { cx: 0.5, cy: 0.5, r: 1.0 },
            stops: [
                { offset: 0, color: '#ffe7bf' },
                { offset: 0.58, color: '#ffad5a' },
                { offset: 1, color: '#e8752d' }
            ]
        },
        {
            radialGradient: { cx: 0.5, cy: 0.5, r: 1.0 },
            stops: [
                { offset: 0, color: '#ffd2e5' },
                { offset: 0.6, color: '#ff6fae' },
                { offset: 1, color: '#d93b84' }
            ]
        }
    ];
}
