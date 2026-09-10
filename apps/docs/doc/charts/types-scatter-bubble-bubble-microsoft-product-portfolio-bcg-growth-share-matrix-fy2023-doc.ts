import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type AnnotationContext, type TickValue, type TooltipRow, type TooltipValueContext } from '@openng/optimus-ui/charts';
import { cashCows, dogs, questionMarks, stars, TOTAL_REVENUE } from '@/doc/charts/data/bcgMatrix';

const QUADRANTS = {
    stars: { name: 'Stars', emoji: '⭐', color: '#10a981', desc: 'High share · high growth', data: stars },
    questions: { name: 'Question Marks', emoji: '❓', color: '#ffad5a', desc: 'Low share · high growth', data: questionMarks },
    cows: { name: 'Cash Cows', emoji: '💰', color: '#5daeea', desc: 'High share · low growth', data: cashCows },
    dogs: { name: 'Dogs', emoji: '🐕', color: '#e5484d', desc: 'Low share · low growth', data: dogs }
};

const SHARE_THRESHOLD = 1.0;
const GROWTH_THRESHOLD = 10;

const quadrantTotals = Object.fromEntries(Object.entries(QUADRANTS).map(([, q]) => [q.name, { count: q.data.length, revenue: q.data.reduce((s, p) => s + p.revenue, 0) }])) as Record<string, { count: number; revenue: number }>;

function tint(color: string, a: number) {
    return `${color}${Math.round(a * 255)
        .toString(16)
        .padStart(2, '0')}`;
}

interface QuadrantRect {
    x: number;
    y: number;
    width: number;
    height: number;
    fill: string;
}

interface QuadrantPill {
    rectX: number;
    rectY: number;
    rectW: number;
    pillH: number;
    fill: string;
    stroke: string;
    anchorX: number;
    anchorY: number;
    anchor: string;
    vAlign: string;
    fontSize: number;
    color: string;
    text: string;
}

@Component({
    selector: 'types-scatter-bubble-bubble-microsoft-product-portfolio-bcg-growth-share-matrix-fy2023-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                <i>sizeField</i> maps FY2023 segment revenue to bubble area so Azure's $80B footprint reads immediately against smaller segments. A <i>ChartAnnotation</i> with <i>placement="beforeData"</i> fills four quadrant regions with tinted
                backgrounds and two <i>ChartReferenceLine</i>s draw the dividers, all before the data renders. The custom legend renders a card per quadrant with a revenue aggregate; the custom tooltip stamps a colored quadrant chip and lists
                relative share, growth, and revenue.
            </p>
            <p>#### SvgBubbleBcgMatrixDemo.ts</p>
            <p>#### bcgMatrix.ts</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-annotation>
                            <ng-template pChartAnnotationDef let-ctx>
                                <svg:g>
                                    @for (r of quadrantRects(ctx); track r.fill) {
                                        <svg:rect [attr.x]="r.x" [attr.y]="r.y" [attr.width]="r.width" [attr.height]="r.height" [attr.fill]="r.fill" />
                                    }
                                    @for (p of quadrantPills(ctx); track p.text) {
                                        <svg:rect [attr.x]="p.rectX" [attr.y]="p.rectY" [attr.width]="p.rectW" [attr.height]="p.pillH" rx="4" ry="4" [attr.fill]="p.fill" [attr.stroke]="p.stroke" stroke-width="1.25" opacity="0.95" />
                                        <svg:text [attr.x]="p.anchorX" [attr.y]="p.anchorY" [attr.text-anchor]="p.anchor" [attr.dominant-baseline]="p.vAlign" [attr.font-size]="p.fontSize" font-weight="700" [attr.fill]="p.color" opacity="0.85">
                                            {{ p.text }}
                                        </svg:text>
                                    }
                                </svg:g>
                            </ng-template>
                        </p-chart-annotation>
                        <p-chart-scatter
                            id="questions"
                            [data]="quadrants.questions.data"
                            valueXField="share"
                            valueYField="growth"
                            sizeField="revenue"
                            [color]="quadrants.questions.color"
                            [name]="quadrants.questions.name"
                            [minSize]="14"
                            [maxSize]="46"
                        />
                        <p-chart-scatter id="stars" [data]="quadrants.stars.data" valueXField="share" valueYField="growth" sizeField="revenue" [color]="quadrants.stars.color" [name]="quadrants.stars.name" [minSize]="14" [maxSize]="46" />
                        <p-chart-scatter id="dogs" [data]="quadrants.dogs.data" valueXField="share" valueYField="growth" sizeField="revenue" [color]="quadrants.dogs.color" [name]="quadrants.dogs.name" [minSize]="14" [maxSize]="46" />
                        <p-chart-scatter id="cows" [data]="quadrants.cows.data" valueXField="share" valueYField="growth" sizeField="revenue" [color]="quadrants.cows.color" [name]="quadrants.cows.name" [minSize]="14" [maxSize]="46" />
                        <p-chart-reference-line [x]="shareThreshold" stroke="#94a3b8" [lineStrokeWidth]="1.25" [lineDash]="[4, 4]" />
                        <p-chart-reference-line [y]="growthThreshold" stroke="#94a3b8" [lineStrokeWidth]="1.25" [lineDash]="[4, 4]" />
                        <p-chart-tooltip [valueFormatter]="tooltipRows" />
                        <p-chart-legend position="top" [itemGap]="12" [height]="90">
                            <ng-template pChartLegendItemDef let-ctx>
                                <button
                                    (click)="ctx.onClick()"
                                    (mouseenter)="ctx.onMouseEnter()"
                                    (mouseleave)="ctx.onMouseLeave()"
                                    [style.opacity]="!ctx.visible ? 0.35 : ctx.isHovered ? 0.82 : 1"
                                    style="display: flex; flex-direction: column; align-items: flex-start; gap: 4px; padding: 4px 14px 6px; min-width: 120px; border: none; background: transparent; cursor: pointer; transition: opacity 0.15s; text-align: left"
                                >
                                    <span [style.color]="ctx.color" style="font-size: 10.5px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase">{{ ctx.label }}</span>
                                    <span [style.text-decoration]="!ctx.visible ? 'line-through' : 'none'" style="font-size: 18px; font-weight: 700; color: var(--p-chart-neutral-100, #0f172a); line-height: 1">\${{ totals(ctx.label).revenue }}B</span>
                                    <span style="position: relative; width: 100%; height: 3px; border-radius: 2px; background: rgba(148, 163, 184, 0.22); overflow: hidden">
                                        <span [style.width.%]="sharePct(ctx.label)" [style.background]="ctx.color" style="position: absolute; left: 0; top: 0; bottom: 0; border-radius: 2px"></span>
                                    </span>
                                    <span style="font-size: 10px; color: var(--p-chart-caption-color, #64748b)"
                                        >{{ sharePct(ctx.label).toFixed(0) }}% of revenue · {{ totals(ctx.label).count }} segment{{ totals(ctx.label).count === 1 ? '' : 's' }}</span
                                    >
                                </button>
                            </ng-template>
                        </p-chart-legend>
                        <p-chart-hover [brightness]="1.08" />
                        <p-chart-x-axis label="Relative market share (× largest competitor)" type="logarithmic" [tickFormat]="formatShare" />
                        <p-chart-y-axis label="Market growth rate (%)" [tickFormat]="formatGrowth" />
                        <p-chart-title text="Microsoft product portfolio — BCG Growth-Share Matrix, FY2023" />
                        <p-chart-caption text="Bubble = segment revenue ($B) · Log X · Source: Microsoft 10-K + IDC/Gartner/StatCounter share data" />
                        <p-chart-export-menu filename="microsoft-bcg-matrix-fy2023" />
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
export class ScatterBubbleBubbleMicrosoftProductPortfolioBcgGrowthShareMatrixFy2023Doc {
    readonly quadrants = QUADRANTS;
    readonly shareThreshold = SHARE_THRESHOLD;
    readonly growthThreshold = GROWTH_THRESHOLD;
    readonly formatShare = (v: TickValue) => `${Number(v)}×`;
    readonly formatGrowth = (v: TickValue) => `${Number(v)}%`;

    totals(label: string): { count: number; revenue: number } {
        return quadrantTotals[label] ?? { count: 0, revenue: 0 };
    }

    sharePct(label: string): number {
        return (this.totals(label).revenue / TOTAL_REVENUE) * 100;
    }

    readonly tooltipRows = (_value: number, ctx: TooltipValueContext): TooltipRow[] => {
        const quadrant = QUADRANTS[ctx.datasetId as keyof typeof QUADRANTS];

        if (!quadrant) return [];

        const product = quadrant.data[ctx.index!];

        if (!product) return [];

        return [
            { label: `${quadrant.emoji} ${product.name}`, value: '' },
            { label: 'Quadrant', value: quadrant.name, color: quadrant.color },
            { label: 'Relative market share', value: `${product.share}×` },
            { label: 'Market growth', value: `${product.growth >= 0 ? '+' : ''}${product.growth}%`, color: product.growth >= 0 ? '#10a981' : '#e5484d' },
            { label: 'Segment revenue', value: `$${product.revenue}B` },
            { label: quadrant.desc, value: '' }
        ];
    };

    quadrantRects(actx: AnnotationContext): QuadrantRect[] {
        if (!actx.xScale || !actx.yScale) return [];

        const area = actx.chartArea;
        const xSplit = actx.xScale(SHARE_THRESHOLD);
        const ySplit = actx.yScale(GROWTH_THRESHOLD);

        if (xSplit == null || ySplit == null) return [];

        return [
            { x: area.x, y: area.y, width: xSplit - area.x, height: ySplit - area.y, fill: tint(QUADRANTS.questions.color, 0.13) },
            { x: xSplit, y: area.y, width: area.x + area.width - xSplit, height: ySplit - area.y, fill: tint(QUADRANTS.stars.color, 0.13) },
            { x: area.x, y: ySplit, width: xSplit - area.x, height: area.y + area.height - ySplit, fill: tint(QUADRANTS.dogs.color, 0.13) },
            { x: xSplit, y: ySplit, width: area.x + area.width - xSplit, height: area.y + area.height - ySplit, fill: tint(QUADRANTS.cows.color, 0.13) }
        ];
    }

    quadrantPills(actx: AnnotationContext): QuadrantPill[] {
        if (!actx.xScale || !actx.yScale) return [];

        const area = actx.chartArea;
        const { pick } = actx.responsive;
        const pad = pick({ xs: 5, sm: 7, md: 10 });
        const fontSize = pick({ xs: 9, sm: 11, md: 12 });
        const pillH = pick({ xs: 15, sm: 18, md: 20 });
        const compact = pick({ xs: true, sm: true, md: false });
        const padX = pick({ xs: 5, md: 7 });
        const padY = 4;

        const pill = (fullText: string, emoji: string, anchorX: number, anchorY: number, anchor: 'start' | 'end', vAlign: 'hanging' | 'auto', color: string): QuadrantPill => {
            const text = compact ? emoji : fullText;
            const approxWidth = 16 + (text.length - 2) * (fontSize * 0.55);
            const rectX = anchor === 'start' ? anchorX - padX : anchorX - approxWidth - padX;
            const rectY = vAlign === 'hanging' ? anchorY - padY : anchorY - pillH + padY;

            return { rectX, rectY, rectW: approxWidth + padX * 2, pillH, fill: tint(color, 0.25), stroke: tint(color, 0.7), anchorX, anchorY, anchor, vAlign, fontSize, color, text };
        };

        return [
            pill('❓ Question Marks', '❓', area.x + pad, area.y + pad, 'start', 'hanging', QUADRANTS.questions.color),
            pill('⭐ Stars', '⭐', area.x + area.width - pad, area.y + pad, 'end', 'hanging', QUADRANTS.stars.color),
            pill('🐕 Dogs', '🐕', area.x + pad, area.y + area.height - pad, 'start', 'auto', QUADRANTS.dogs.color),
            pill('💰 Cash Cows', '💰', area.x + area.width - pad, area.y + area.height - pad, 'end', 'auto', QUADRANTS.cows.color)
        ];
    }
}
