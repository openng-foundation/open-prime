import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type AnnotationContext } from '@openng/optimus-ui/charts';

const DATA = [
    { month: 'Jan', bookings: 42 },
    { month: 'Feb', bookings: 58 },
    { month: 'Mar', bookings: 35 },
    { month: 'Apr', bookings: 74 },
    { month: 'May', bookings: 61 },
    { month: 'Jun', bookings: 89 }
];

interface Badge {
    cx: number;
    cy: number;
    bw: number;
    bh: number;
    top: number;
    color: string;
    text: string;
    fs: number;
}

@Component({
    selector: 'configuration-annotation-multiple-annotations-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Add multiple <i>ChartAnnotation</i> components to layer independent overlays. Each renders in document order, so later annotations appear on top.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="460">
                    <p-chart-bar [data]="data" categoryXField="month" valueYField="bookings" color="#5daeea" [borderRadius]="4" />
                    <p-chart-x-axis />
                    <p-chart-y-axis />
                    <p-chart-annotation>
                        <ng-template pChartAnnotationDef let-ctx>
                            @let b = badge(ctx, 'peak');
                            @if (b) {
                                <svg:g>
                                    <svg:line [attr.x1]="b.cx" [attr.y1]="b.top + b.bh" [attr.x2]="b.cx" [attr.y2]="b.cy" [attr.stroke]="b.color" stroke-width="1" opacity="0.4" />
                                    <svg:rect [attr.x]="b.cx - b.bw / 2" [attr.y]="b.top" [attr.width]="b.bw" [attr.height]="b.bh" rx="3" [attr.fill]="b.color" />
                                    <svg:text [attr.x]="b.cx" [attr.y]="b.top + b.bh / 2" text-anchor="middle" dominant-baseline="central" fill="white" [attr.font-size]="b.fs" font-weight="600">{{ b.text }}</svg:text>
                                </svg:g>
                            }
                        </ng-template>
                    </p-chart-annotation>
                    <p-chart-annotation>
                        <ng-template pChartAnnotationDef let-ctx>
                            @let b = badge(ctx, 'trough');
                            @if (b) {
                                <svg:g>
                                    <svg:line [attr.x1]="b.cx" [attr.y1]="b.top + b.bh" [attr.x2]="b.cx" [attr.y2]="b.cy" [attr.stroke]="b.color" stroke-width="1" opacity="0.4" />
                                    <svg:rect [attr.x]="b.cx - b.bw / 2" [attr.y]="b.top" [attr.width]="b.bw" [attr.height]="b.bh" rx="3" [attr.fill]="b.color" />
                                    <svg:text [attr.x]="b.cx" [attr.y]="b.top + b.bh / 2" text-anchor="middle" dominant-baseline="central" fill="white" [attr.font-size]="b.fs" font-weight="600">{{ b.text }}</svg:text>
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
export class AnnotationMultipleAnnotationsDoc {
    readonly data = DATA;

    badge(ctx: AnnotationContext, kind: 'peak' | 'trough'): Badge | null {
        const { xScale, yScale, chartArea, responsive } = ctx;

        if (!xScale || !yScale || !chartArea) return null;

        const idx = kind === 'peak' ? DATA.reduce((m, d, i) => (d.bookings > DATA[m].bookings ? i : m), 0) : DATA.reduce((m, d, i) => (d.bookings < DATA[m].bookings ? i : m), 0);

        const cx = xScale(idx);
        const cy = yScale(DATA[idx].bookings);
        const bw = responsive.pick({ xs: 36, sm: 40, md: 44 });
        const bh = responsive.pick({ xs: 14, sm: 16, md: 18 });

        return {
            cx,
            cy,
            bw,
            bh,
            top: Math.max(cy - 8 - bh, chartArea.y + 2),
            color: kind === 'peak' ? '#5daeea' : '#ff7a66',
            text: `${kind === 'peak' ? '▲' : '▼'} ${DATA[idx].bookings}`,
            fs: responsive.pick({ xs: 9, sm: 10, md: 11 })
        };
    }
}
