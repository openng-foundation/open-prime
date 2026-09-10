import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, svgNode, type HeatmapCellContext, type SvgNode } from '@openng/optimus-ui/charts';

interface TeamScore {
    team: string;
    quarter: string;
    score: number;
}

function grade(score: number): string {
    if (score >= 90) return 'SLA';

    if (score >= 80) return 'OK';

    if (score >= 70) return 'WATCH';

    return 'RISK';
}

@Component({
    selector: 'types-heatmap-custom-content-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Draw custom content inside each cell through the <i>pChartHeatmapCellDef</i> seam. In SVG mode, use an <i>&lt;ng-template pChartHeatmapCellDef let-ctx&gt;</i> template returning <i>svg:</i>-prefixed markup. In Canvas mode, pass a
                <i>renderContent</i> function; the context is pre-clipped to the cell bounds, so draw directly and return <i>null</i>. Both expose the cell's position, dimensions, value, resolved color, and row/column labels.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-heatmap [data]="data" categoryXField="quarter" categoryYField="team" valueField="score" [colorRange]="['#eef6ff', '#5bc8f5', '#2531a8']" [colorScale]="[65, 80, 95]" [renderContent]="renderContent" />
                        <p-chart-x-axis [showLine]="false" [showTicks]="false" [gridLines]="false" />
                        <p-chart-y-axis [showLine]="false" [showTicks]="false" [gridLines]="false" />
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
export class HeatmapCustomContentDoc {
    readonly data: TeamScore[] = [
        { team: 'Billing', quarter: 'Q1', score: 88 },
        { team: 'Billing', quarter: 'Q2', score: 82 },
        { team: 'Billing', quarter: 'Q3', score: 91 },
        { team: 'Billing', quarter: 'Q4', score: 86 },
        { team: 'Platform', quarter: 'Q1', score: 76 },
        { team: 'Platform', quarter: 'Q2', score: 69 },
        { team: 'Platform', quarter: 'Q3', score: 84 },
        { team: 'Platform', quarter: 'Q4', score: 79 },
        { team: 'Mobile', quarter: 'Q1', score: 92 },
        { team: 'Mobile', quarter: 'Q2', score: 87 },
        { team: 'Mobile', quarter: 'Q3', score: 95 },
        { team: 'Mobile', quarter: 'Q4', score: 90 },
        { team: 'Enterprise', quarter: 'Q1', score: 71 },
        { team: 'Enterprise', quarter: 'Q2', score: 78 },
        { team: 'Enterprise', quarter: 'Q3', score: 74 },
        { team: 'Enterprise', quarter: 'Q4', score: 83 }
    ];

    readonly renderContent = (context: HeatmapCellContext<TeamScore>): SvgNode => {
        const value = context.value ?? 0;
        const cx = context.x + context.width / 2;
        const cy = context.y + context.height / 2;
        const textColor = value >= 78 ? '#ffffff' : '#0f172a';

        return svgNode('g', {}, [
            svgNode('text', { x: cx, y: cy - 6, 'text-anchor': 'middle', 'dominant-baseline': 'auto', 'font-size': '15', 'font-weight': '700', fill: textColor }, [String(value)]),
            svgNode('text', { x: cx, y: cy + 12, 'text-anchor': 'middle', 'dominant-baseline': 'auto', 'font-size': '11', fill: textColor, opacity: '0.7' }, [grade(value)])
        ]);
    };
}
