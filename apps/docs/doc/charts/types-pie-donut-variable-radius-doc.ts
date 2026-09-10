import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type TooltipRow, type TooltipValueContext } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-pie-donut-variable-radius-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Set <i>sliceRadiusValue</i> to a numeric data field to vary each slice's outer radius independently. Use equal angle weights when the categories are cyclical, then let radius carry the magnitude. That shape is known as a Nightingale
                or rose chart.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="display: flex; justify-content: center">
                    <p-chart-svg [width]="460" [height]="460">
                        <p-chart-pie [data]="data" valueField="samples" categoryField="direction" sliceRadiusValue="gust" [innerRadius]="0.24" [startAngle]="-90" />
                        <p-chart-data-labels display="label" lineStyle="angled" [fontSize]="11" />
                        <p-chart-tooltip [valueFormatter]="tooltipRows" />
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
export class PieDonutVariableRadiusDoc {
    readonly data = [
        { direction: 'N', samples: 1, gust: 18 },
        { direction: 'NE', samples: 1, gust: 12 },
        { direction: 'E', samples: 1, gust: 21 },
        { direction: 'SE', samples: 1, gust: 15 },
        { direction: 'S', samples: 1, gust: 19 },
        { direction: 'SW', samples: 1, gust: 26 },
        { direction: 'W', samples: 1, gust: 32 },
        { direction: 'NW', samples: 1, gust: 24 }
    ];

    readonly tooltipRows = (_value: number, ctx: TooltipValueContext): TooltipRow[] => {
        const item = this.data[ctx.index ?? -1];

        if (!item) return [];

        return [
            { label: 'Direction', value: item.direction },
            { label: 'Peak gust', value: `${item.gust} kt` }
        ];
    };
}
