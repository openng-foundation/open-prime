import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type AnnotationContext } from '@openng/optimus-ui/charts';

@Component({
    selector: 'configuration-annotation-basic-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Add <i>ChartAnnotation</i> to render custom content overlaid on the chart area. The annotation context (<i>let-ctx</i> in the template, or the <i>render</i> callback argument) provides the chart area bounds, scale functions, and theme
                context. Use these to position content at specific data values.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="460">
                    <p-chart-bar [data]="data" categoryXField="quarter" valueYField="bookings" color="#5ccf9f" [borderRadius]="4" />
                    <p-chart-x-axis />
                    <p-chart-y-axis />
                    <p-chart-annotation>
                        <ng-template pChartAnnotationDef let-ctx>
                            @let l = label(ctx);
                            @if (l) {
                                <svg:text [attr.x]="l.x" [attr.y]="l.y" text-anchor="end" [attr.font-size]="l.fs" opacity="0.6">{{ l.text }}</svg:text>
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
export class AnnotationBasicDoc {
    readonly data = [
        { quarter: 'Q1', bookings: 280 },
        { quarter: 'Q2', bookings: 340 },
        { quarter: 'Q3', bookings: 310 },
        { quarter: 'Q4', bookings: 520 }
    ];

    label(ctx: AnnotationContext): { x: number; y: number; fs: number; text: string } | null {
        const { chartArea, responsive } = ctx;

        if (!chartArea || !chartArea.width) return null;

        return {
            x: chartArea.x + chartArea.width - responsive.pick({ xs: 4, sm: 6, md: 8 }),
            y: chartArea.y + responsive.pick({ xs: 12, sm: 16, md: 20 }),
            fs: responsive.pick({ xs: 8, sm: 10, md: 13 }),
            text: responsive.pick({ xs: 'Q4 ↑', md: 'Q4 record high ↑' })
        };
    }
}
