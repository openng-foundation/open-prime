import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type TreemapCellContext } from '@openng/optimus-ui/charts';

interface Stock {
    name: string;
    value: number;
    change: number;
}

@Component({
    selector: 'types-treemap-custom-content-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Replace default cell labels with fully custom content through the <i>pChartTreemapCellDef</i> seam. In SVG mode, use an <i>&lt;ng-template pChartTreemapCellDef let-ctx&gt;</i> template returning <i>svg:</i>-prefixed markup. In Canvas
                mode, pass a <i>renderContent</i> function; the context is pre-clipped to the cell bounds, so draw directly and return <i>null</i>. Both expose the cell's position, dimensions, value, color, and label fields.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-treemap [data]="data" categoryField="name" valueField="value" [color]="palette">
                            <ng-template pChartTreemapCellDef let-ctx>
                                @if (ctx.width >= 60 && ctx.height >= 40) {
                                    <svg:text [attr.x]="ctx.x + 10" [attr.y]="ctx.y + 22" fill="#f8fafc" font-size="14" font-weight="700" font-family="system-ui, sans-serif" pointer-events="none">{{ ctx.label }}</svg:text>
                                    <svg:rect [attr.x]="ctx.x + 10" [attr.y]="ctx.y + 30" [attr.width]="badgeW(ctx)" [attr.height]="20" rx="10" [attr.fill]="badgeBg(ctx)" />
                                    <svg:text
                                        [attr.x]="ctx.x + 10 + badgeW(ctx) / 2"
                                        [attr.y]="ctx.y + 40"
                                        [attr.fill]="changeColor(ctx)"
                                        font-size="11"
                                        font-weight="700"
                                        font-family="system-ui, sans-serif"
                                        text-anchor="middle"
                                        dominant-baseline="central"
                                        pointer-events="none"
                                    >
                                        {{ changeText(ctx) }}
                                    </svg:text>
                                    @if (ctx.height > 70) {
                                        <svg:text [attr.x]="ctx.x + 10" [attr.y]="ctx.y + ctx.height - 12" fill="#94a3b8" font-size="11" font-family="system-ui, sans-serif" pointer-events="none">{{ valueText(ctx) }}</svg:text>
                                    }
                                }
                            </ng-template>
                        </p-chart-treemap>
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
export class TreemapCustomContentDoc {
    readonly palette = ['#1f4f7a', '#25667f', '#344c93', '#2d5d72', '#3b6b63', '#4b5f78'];
    readonly data: Stock[] = [
        { name: 'AAPL', value: 2900, change: 1.2 },
        { name: 'MSFT', value: 2800, change: -0.8 },
        { name: 'GOOGL', value: 1700, change: 2.1 },
        { name: 'AMZN', value: 1600, change: -1.5 },
        { name: 'NVDA', value: 1200, change: 3.4 },
        { name: 'META', value: 900, change: 0.6 }
    ];

    private positive(ctx: TreemapCellContext): boolean {
        return (ctx.data as Stock).change >= 0;
    }

    changeColor(ctx: TreemapCellContext): string {
        return this.positive(ctx) ? '#34d399' : '#fb7185';
    }

    badgeBg(ctx: TreemapCellContext): string {
        return this.positive(ctx) ? 'rgba(16,169,129,0.24)' : 'rgba(229,72,77,0.24)';
    }

    changeText(ctx: TreemapCellContext): string {
        const d = ctx.data as Stock;

        return `${this.positive(ctx) ? '▲' : '▼'} ${Math.abs(d.change).toFixed(1)}%`;
    }

    badgeW(ctx: TreemapCellContext): number {
        return this.changeText(ctx).length * 7 + 16;
    }

    valueText(ctx: TreemapCellContext): string {
        return `$${((ctx.data as Stock).value / 1000).toFixed(1)}T`;
    }
}
