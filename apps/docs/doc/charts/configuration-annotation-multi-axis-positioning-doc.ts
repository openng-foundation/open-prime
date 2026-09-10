import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type AnnotationContext } from '@openng/optimus-ui/charts';

const DATA = [
    { month: 'Jan', arr: 4200, temp: 2 },
    { month: 'Feb', arr: 4800, temp: 4 },
    { month: 'Mar', arr: 5500, temp: 9 },
    { month: 'Apr', arr: 5200, temp: 14 },
    { month: 'May', arr: 6500, temp: 19 },
    { month: 'Jun', arr: 7200, temp: 23 }
];

interface Snap {
    cx: number;
    yRev: number;
    yTemp: number;
    yMid: number;
    fsA: number;
    fsB: number;
    sub: string;
}

@Component({
    selector: 'configuration-annotation-multi-axis-positioning-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>On charts with multiple Y axes, use <i>getScale('axisId')</i> to retrieve the scale for a specific axis by its registered ID. Use this to position annotations relative to a secondary axis value.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="460">
                    <p-chart-line [data]="data" categoryXField="month" valueYField="arr" name="Expansion ARR" color="#5daeea" yAxisId="arr" />
                    <p-chart-line [data]="data" categoryXField="month" valueYField="temp" name="Temp (°C)" color="#ffad5a" yAxisId="temp" [lineDash]="[4, 3]" />
                    <p-chart-x-axis />
                    <p-chart-y-axis id="arr" label="Expansion ARR" />
                    <p-chart-y-axis id="temp" position="right" label="Temp (°C)" />
                    <p-chart-annotation>
                        <ng-template pChartAnnotationDef let-ctx>
                            @let s = snapshot(ctx);
                            @if (s) {
                                <svg:g>
                                    <svg:line [attr.x1]="s.cx" [attr.y1]="s.yRev" [attr.x2]="s.cx" [attr.y2]="s.yTemp" stroke="#7c8cff" stroke-width="1.5" stroke-dasharray="3 2" opacity="0.5" />
                                    <svg:circle [attr.cx]="s.cx" [attr.cy]="s.yRev" r="5" fill="none" stroke="#5daeea" stroke-width="2" />
                                    <svg:circle [attr.cx]="s.cx" [attr.cy]="s.yTemp" r="5" fill="none" stroke="#ffad5a" stroke-width="2" />
                                    <svg:text [attr.x]="s.cx + 10" [attr.y]="s.yMid" fill="#7c8cff" [attr.font-size]="s.fsA" font-weight="600">May snapshot</svg:text>
                                    <svg:text [attr.x]="s.cx + 10" [attr.y]="s.yMid + 14" fill="#7c8cff" [attr.font-size]="s.fsB" opacity="0.7">{{ s.sub }}</svg:text>
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
export class AnnotationMultiAxisPositioningDoc {
    readonly data = DATA;

    snapshot(ctx: AnnotationContext): Snap | null {
        const { xScale, yScale, getScale, responsive } = ctx;

        if (!xScale || !yScale || !getScale) return null;

        const tempScale = getScale('temp');

        if (!tempScale) return null;

        const idx = DATA.findIndex((d) => d.month === 'May');
        const may = DATA[idx];
        const cx = xScale(idx);
        const yRev = yScale(may.arr);
        const yTemp = tempScale(may.temp);

        return {
            cx,
            yRev,
            yTemp,
            yMid: (yRev + yTemp) / 2,
            fsA: responsive.pick({ xs: 9, sm: 10, md: 11 }),
            fsB: responsive.pick({ xs: 8, sm: 9, md: 10 }),
            sub: `$${(may.arr / 1000).toFixed(1)}k · ${may.temp}°C`
        };
    }
}
