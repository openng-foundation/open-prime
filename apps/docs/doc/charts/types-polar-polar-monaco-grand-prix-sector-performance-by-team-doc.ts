import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type TooltipRenderContext } from '@openng/optimus-ui/charts';
import { ferrariData, mercedesData, redBullData, sectors } from '@/doc/charts/data/f1Sectors';

const TEAMS = [
    { name: 'Red Bull', data: redBullData, color: '#5daeea' },
    { name: 'Ferrari', data: ferrariData, color: '#ff7a66' },
    { name: 'Mercedes', data: mercedesData, color: '#4ecdc4' }
];

interface TeamRow {
    name: string;
    color: string;
    score: number;
}

@Component({
    selector: 'types-polar-polar-monaco-grand-prix-sector-performance-by-team-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Three <i>ChartPolar</i> series placed directly inside <i>ChartCanvas</i> render as grouped side-by-side radial bars within each angular sector, with no <i>ChartStacked</i> wrapper. The <i>color</i> array assigns a distinct hue per
                team; the <i>mode="shared"</i> tooltip compares all three teams for the hovered sector and ranks them with a gap against the sector leader.
            </p>
            <p>#### SvgPolarF1SectorsDemo.ts</p>
            <p>#### f1Sectors.ts</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg [animation]="{ duration: 750 }">
                        <p-chart-polar [data]="redBull" categoryXField="sector" valueYField="score" name="Red Bull" color="#5daeea" [borderRadius]="3" [spacing]="4" [innerRadius]="0.28" />
                        <p-chart-polar [data]="ferrari" categoryXField="sector" valueYField="score" name="Ferrari" color="#ff7a66" [borderRadius]="3" [spacing]="4" />
                        <p-chart-polar [data]="mercedes" categoryXField="sector" valueYField="score" name="Mercedes" color="#4ecdc4" [borderRadius]="3" [spacing]="4" />
                        <p-chart-x-axis />
                        <p-chart-y-axis [tickCount]="3" [gridOpacity]="0.25" />
                        <p-chart-tooltip mode="shared">
                            <ng-template pChartTooltipDef let-ctx>
                                @let t = tip(ctx);
                                @if (t) {
                                    <div style="padding:10px 14px;min-width:230px;background:rgba(10,10,10,0.82);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-radius:8px;border:1px solid rgba(255,255,255,0.1);color:#fff">
                                        <div style="font-weight:700;font-size:13px;margin-bottom:2px">{{ ctx.label }}</div>
                                        <div style="font-size:11px;opacity:0.5;margin-bottom:8px">{{ t.sectorLabel }}</div>
                                        @for (row of t.rows; track row.name; let rank = $index) {
                                            <div style="margin-top:5px">
                                                <div style="display:flex;align-items:center;gap:7px;font-size:12px;margin-bottom:3px">
                                                    <span [style]="'font-size:10px;opacity:' + (rank === 0 ? '0.6' : '0')">▲</span>
                                                    <span [style]="'width:8px;height:8px;border-radius:2px;flex-shrink:0;background:' + row.color"></span>
                                                    <span style="flex:1;opacity:0.8">{{ row.name }}</span>
                                                    <span style="font-family:ui-monospace,monospace;font-weight:700">{{ row.score }}</span>
                                                    @if (rank > 0) {
                                                        <span style="font-size:10px;opacity:0.45;width:32px;text-align:right">−{{ t.best - row.score }}</span>
                                                    }
                                                </div>
                                                <div style="height:3px;border-radius:2px;background:rgba(255,255,255,0.08);overflow:hidden;margin-left:15px">
                                                    <div [style]="'height:100%;border-radius:2px;background:' + row.color + ';width:' + row.score + '%'"></div>
                                                </div>
                                            </div>
                                        }
                                    </div>
                                }
                            </ng-template>
                        </p-chart-tooltip>
                        <p-chart-annotation>
                            <ng-template pChartAnnotationDef let-ctx>
                                <svg:g>
                                    <svg:text [attr.x]="ctx.center.x" [attr.y]="ctx.center.y - 2" text-anchor="middle" dominant-baseline="auto" font-size="12" font-weight="700" opacity="0.85">Monaco</svg:text>
                                    <svg:text [attr.x]="ctx.center.x" [attr.y]="ctx.center.y + 12" text-anchor="middle" dominant-baseline="auto" font-size="10" opacity="0.4">GP sectors</svg:text>
                                </svg:g>
                            </ng-template>
                        </p-chart-annotation>
                        <p-chart-hover [brightness]="1.1" />
                        <p-chart-legend position="bottom" />
                        <p-chart-title text="Monaco Grand Prix — Sector Performance by Team" />
                        <p-chart-caption text="Red Bull rules the tunnel (S4–S5) by 16+ points · Ferrari's mechanical grip dominates Monaco's three slowest hairpins · illustrative from F1 telemetry" />
                        <p-chart-export-menu filename="monaco-gp-sector-performance" />
                        <p-chart-accessibility />
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
export class PolarPolarMonacoGrandPrixSectorPerformanceByTeamDoc {
    readonly redBull = redBullData;
    readonly ferrari = ferrariData;
    readonly mercedes = mercedesData;

    tip(ctx: TooltipRenderContext): { sectorLabel: string; rows: TeamRow[]; best: number } | null {
        const sectorMeta = sectors.find((s) => s.sector === ctx.label);

        if (!sectorMeta) return null;

        const rows = TEAMS.map((t) => ({ name: t.name, color: t.color, score: t.data.find((d) => d.sector === ctx.label)?.score ?? 0 })).sort((a, b) => b.score - a.score);

        return { sectorLabel: sectorMeta.label, rows, best: rows[0].score };
    }
}
