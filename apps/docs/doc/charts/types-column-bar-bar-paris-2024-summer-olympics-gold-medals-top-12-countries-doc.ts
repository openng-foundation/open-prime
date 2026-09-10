import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type AnnotationContext, type GradientColor } from '@openng/optimus-ui/charts';
import { olympicGold as data } from '@/doc/charts/data/olympicGold';

const BADGE_COLORS = ['#5daeea', '#5daeea', '#7c8cff', '#4ecdc4'];
const BADGE_LABELS = ['#1', '#1', '#3', '#4'];

interface Badge {
    cx: number;
    cy: number;
    fill: string;
    label: string;
}

@Component({
    selector: 'types-column-bar-bar-paris-2024-summer-olympics-gold-medals-top-12-countries-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                A four-stop ranking gradient passed to <i>color</i> gives every bar a polished competitive scale without tying the chart to medal-metal colors. <i>ChartAnnotation</i> uses <i>xScale</i>/<i>yScale</i> to place rank badges above the
                podium bars in place of data labels. Hover any bar to see rank and medal count.
            </p>
            <p>#### SvgBarOlympicGoldDemo.ts</p>
            <p>#### olympicGold.ts</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="460" [animation]="{ duration: 700 }">
                    <p-chart-bar [data]="data" categoryXField="country" valueYField="gold" [color]="rankGradient" [borderRadius]="3" />
                    <p-chart-annotation>
                        <ng-template pChartAnnotationDef let-ctx>
                            <svg:g>
                                @for (b of badges(ctx); track b.label + b.cx) {
                                    <svg:rect [attr.x]="b.cx - 12" [attr.y]="b.cy - 8" [attr.width]="24" [attr.height]="16" rx="3" [attr.fill]="b.fill" />
                                    <svg:text [attr.x]="b.cx" [attr.y]="b.cy" text-anchor="middle" dominant-baseline="central" fill="white" font-size="9" font-weight="700">{{ b.label }}</svg:text>
                                }
                            </svg:g>
                        </ng-template>
                    </p-chart-annotation>
                    <p-chart-tooltip />
                    <p-chart-hover />
                    <p-chart-x-axis [tickRotation]="-25" />
                    <p-chart-y-axis />
                    <p-chart-title text="Paris 2024 Summer Olympics - Gold Medals, Top 12 Countries" />
                    <p-chart-caption text="Source: International Olympic Committee, official Paris 2024 medal table" />
                    <p-chart-export-menu filename="paris-2024-gold-medals" />
                    <p-chart-accessibility />
                </p-chart-svg>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ColumnBarBarParis2024SummerOlympicsGoldMedalsTop12CountriesDoc {
    readonly data = data;

    readonly rankGradient: GradientColor = {
        linearGradient: { direction: 'vertical' },
        stops: [
            { offset: 0, color: '#b7e4ff' },
            { offset: 0.32, color: '#5daeea' },
            { offset: 0.68, color: '#7c8cff' },
            { offset: 1, color: '#2531a8' }
        ]
    };

    badges(ctx: AnnotationContext): Badge[] {
        if (!ctx.xScale || !ctx.yScale) return [];

        return [0, 1, 2, 3].map((idx) => ({
            cx: ctx.xScale!(idx),
            cy: ctx.yScale!(data[idx].gold) - 14,
            fill: BADGE_COLORS[idx],
            label: BADGE_LABELS[idx]
        }));
    }
}
