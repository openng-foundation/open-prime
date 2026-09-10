import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type AnnotationContext, type TickValue } from '@openng/optimus-ui/charts';

const DATA = [
    { month: 'Jan', arr: 3200 },
    { month: 'Feb', arr: 4100 },
    { month: 'Mar', arr: 3800 },
    { month: 'Apr', arr: 5200 },
    { month: 'May', arr: 4800 },
    { month: 'Jun', arr: 6100 }
];

interface Peak {
    x: number;
    y: number;
    bx: number;
    by: number;
    bw: number;
    bh: number;
    label: string;
    fs: number;
}

@Component({
    selector: 'configuration-annotation-positioning-at-data-values-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Use <i>xScale</i> and <i>yScale</i> to convert data values to pixel positions. This is the primary use case: annotating a specific category, timestamp, or value with a label, icon, or shape.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="460">
                    <p-chart-line [data]="data" categoryXField="month" valueYField="arr" color="#5daeea" />
                    <p-chart-x-axis />
                    <p-chart-y-axis [tickFormat]="formatK" />
                    <p-chart-annotation>
                        <ng-template pChartAnnotationDef let-ctx>
                            @let p = peak(ctx);
                            @if (p) {
                                <svg:g>
                                    <svg:circle [attr.cx]="p.x" [attr.cy]="p.y" r="9" fill="none" stroke="#5daeea" stroke-width="2" opacity="0.45" />
                                    <svg:line [attr.x1]="p.x" [attr.y1]="p.by + p.bh" [attr.x2]="p.x" [attr.y2]="p.y - 10" stroke="#5daeea" stroke-width="1" opacity="0.4" />
                                    <svg:rect [attr.x]="p.bx" [attr.y]="p.by" [attr.width]="p.bw" [attr.height]="p.bh" rx="4" fill="#5daeea" />
                                    <svg:text [attr.x]="p.x" [attr.y]="p.by + p.bh / 2" text-anchor="middle" dominant-baseline="central" fill="white" [attr.font-size]="p.fs" font-weight="600">{{ p.label }}</svg:text>
                                </svg:g>
                            }
                        </ng-template>
                    </p-chart-annotation>
                </p-chart-svg>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnnotationPositioningAtDataValuesDoc {
    readonly data = DATA;
    readonly formatK = (v: TickValue): string => `$${(Number(v) / 1000).toFixed(0)}k`;

    peak(ctx: AnnotationContext): Peak | null {
        const { xScale, yScale, chartArea, responsive } = ctx;

        if (!xScale || !yScale || !chartArea) return null;

        let peakIndex = 0;

        for (let i = 1; i < DATA.length; i++) {
            if (DATA[i].arr > DATA[peakIndex].arr) peakIndex = i;
        }

        const p = DATA[peakIndex];
        const x = xScale(peakIndex);
        const y = yScale(p.arr);
        const bw = responsive.pick({ xs: 60, sm: 68, md: 76 });
        const bh = responsive.pick({ xs: 17, sm: 19, md: 22 });

        return { x, y, bx: x - bw / 2, by: Math.max(y - bh - 14, chartArea.y + 2), bw, bh, label: `Peak $${(p.arr / 1000).toFixed(1)}k`, fs: responsive.pick({ xs: 9, sm: 10, md: 11 }) };
    }
}
