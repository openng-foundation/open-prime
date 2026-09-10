import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type TooltipRow, type TooltipValueContext } from '@openng/optimus-ui/charts';

const regions = [
    { region: 'Americas', arr: 92 },
    { region: 'EMEA', arr: 68 },
    { region: 'APAC', arr: 40 }
];

const segments = [
    { slice: 'Americas · Enterprise', region: 'Americas', segment: 'Enterprise', arr: 54 },
    { slice: 'Americas · Growth', region: 'Americas', segment: 'Growth', arr: 25 },
    { slice: 'Americas · Self-serve', region: 'Americas', segment: 'Self-serve', arr: 13 },
    { slice: 'EMEA · Enterprise', region: 'EMEA', segment: 'Enterprise', arr: 38 },
    { slice: 'EMEA · Growth', region: 'EMEA', segment: 'Growth', arr: 20 },
    { slice: 'EMEA · Self-serve', region: 'EMEA', segment: 'Self-serve', arr: 10 },
    { slice: 'APAC · Enterprise', region: 'APAC', segment: 'Enterprise', arr: 21 },
    { slice: 'APAC · Growth', region: 'APAC', segment: 'Growth', arr: 13 },
    { slice: 'APAC · Self-serve', region: 'APAC', segment: 'Self-serve', arr: 6 }
];

const PALETTE: Record<string, { base: string; enterprise: string; growth: string; selfServe: string }> = {
    Americas: { base: '#5daeea', enterprise: '#2176ff', growth: '#5daeea', selfServe: '#b8e2ff' },
    EMEA: { base: '#4ecdc4', enterprise: '#0f9f99', growth: '#4ecdc4', selfServe: '#b9f4ee' },
    APAC: { base: '#ffad5a', enterprise: '#e8752d', growth: '#ffad5a', selfServe: '#ffe7bf' }
};

@Component({
    selector: 'types-pie-donut-stacked-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Wrap multiple <i>ChartPie</i> components inside <i>ChartStacked</i> to create concentric rings. Use the inner ring for the parent categories and the outer ring for the child split. Set <i>gap</i> on <i>ChartStacked</i> to add spacing
                between rings.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="display: flex; justify-content: center">
                    <p-chart-svg [width]="460" [height]="460">
                        <p-chart-stacked [gap]="5">
                            <p-chart-pie id="arr-segments" [data]="segments" valueField="arr" categoryField="slice" [color]="segmentColors" [spacing]="1" />
                            <p-chart-pie id="arr-regions" [data]="regions" valueField="arr" categoryField="region" [color]="regionColors" [innerRadius]="0.42" [spacing]="2" />
                        </p-chart-stacked>
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
export class PieDonutStackedDoc {
    readonly regions = regions;
    readonly segments = segments;
    readonly regionColors = regions.map((item) => PALETTE[item.region].base);
    readonly segmentColors = segments.map((item) => {
        const region = PALETTE[item.region];

        if (item.segment === 'Enterprise') return region.enterprise;

        if (item.segment === 'Growth') return region.growth;

        return region.selfServe;
    });

    readonly tooltipRows = (value: number, ctx: TooltipValueContext): TooltipRow[] => {
        if (ctx.datasetId === 'arr-segments') {
            const item = segments[ctx.index ?? -1];

            if (!item) return [];

            return [
                { label: item.region, value: item.segment, color: PALETTE[item.region].base },
                { label: 'ARR', value: `$${value}M` }
            ];
        }

        const item = regions[ctx.index ?? -1];

        if (!item) return [];

        return [
            { label: 'Region', value: item.region, color: PALETTE[item.region].base },
            { label: 'ARR', value: `$${value}M` }
        ];
    };
}
