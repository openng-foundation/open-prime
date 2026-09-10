import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type TooltipRow, type TooltipValueContext } from '@openng/optimus-ui/charts';
import { browsers, useBrowserPlayback, yearlyData } from '@/doc/charts/data/globalBrowser';

@Component({
    selector: 'types-pie-donut-donut-browser-market-share-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Press Play or drag the year slider; <i>sort="value-desc"</i> continuously reorders slices so rank changes animate alongside values. The tooltip shows each browser's share against a fixed baseline, and the legend updates live with each
                year's figures.
            </p>
            <p>#### SvgDonutGlobalBrowserDemo.ts</p>
            <p>#### globalBrowser.ts</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div class="year-slider">
                    <button type="button" class="play-btn" [class.playing]="playback.isPlaying()" (click)="playback.togglePlay()">
                        <i class="pi" [class.pi-pause]="playback.isPlaying()" [class.pi-play]="!playback.isPlaying()"></i>
                        {{ playback.isPlaying() ? 'Pause' : 'Play' }}
                    </button>
                    <span class="year-value">{{ playback.selectedYear() }}</span>
                    <input type="range" class="year-range" min="2009" max="2023" step="1" [value]="playback.selectedYear()" [style.--fill]="fill()" (input)="onSlide($event)" />
                </div>
                <div style="height: 460px">
                    <p-chart-svg [animation]="{ duration: 500 }">
                        <p-chart-pie id="browsers" [data]="playback.data()" valueField="share" categoryField="browser" [color]="colors" [innerRadius]="0.55" [spacing]="2" [borderRadius]="3" sort="value-desc" />
                        <p-chart-annotation>
                            <ng-template pChartAnnotationDef let-ctx>
                                <svg:g text-anchor="middle">
                                    <svg:text [attr.x]="ctx.center.x" [attr.y]="ctx.center.y - 26" font-size="11" opacity="0.45" dominant-baseline="central">Browser</svg:text>
                                    <svg:text [attr.x]="ctx.center.x" [attr.y]="ctx.center.y" font-size="26" font-weight="bold" dominant-baseline="central">{{ playback.selectedYear() }}</svg:text>
                                    <svg:text [attr.x]="ctx.center.x" [attr.y]="ctx.center.y + 28" font-size="11" opacity="0.5" dominant-baseline="central">Market Share</svg:text>
                                </svg:g>
                            </ng-template>
                        </p-chart-annotation>
                        <p-chart-data-labels display="label-percentage" [minPercentage]="4" />
                        <p-chart-tooltip [valueFormatter]="tooltipRows" />
                        <p-chart-hover [offset]="6" [brightness]="1.08" />
                        <p-chart-title text="Global browser market share 2009–2023" />
                        <p-chart-caption text="Source: StatCounter GlobalStats · Microsoft = IE (2009–2019) + Edge (2020–2023)" />
                        <p-chart-export-menu filename="browser-market-share" />
                        <p-chart-accessibility />
                    </p-chart-svg>
                </div>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    styles: [
        `
            .year-slider {
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 12px;
                margin-bottom: 1rem;
            }

            .year-slider .play-btn {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 4px 12px;
                font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
                font-size: 12px;
                font-weight: 500;
                letter-spacing: 0.03em;
                text-transform: uppercase;
                border: 1px solid transparent;
                border-radius: 6px;
                background: transparent;
                color: var(--p-surface-500);
                cursor: pointer;
                transition:
                    color 0.15s,
                    background 0.15s,
                    border-color 0.15s;
            }

            .year-slider .play-btn:hover {
                color: var(--p-surface-900);
                border-color: var(--p-surface-200);
                background: var(--p-surface-100);
            }

            :host-context(.p-dark) .year-slider .play-btn {
                color: var(--p-surface-400);
            }

            :host-context(.p-dark) .year-slider .play-btn:hover {
                color: var(--p-surface-100);
                border-color: var(--p-surface-700);
                background: var(--p-surface-800);
            }

            .year-slider .play-btn.playing {
                font-weight: 600;
                color: var(--p-primary-color);
                border-color: color-mix(in srgb, var(--p-primary-color) 30%, transparent);
                background: color-mix(in srgb, var(--p-primary-color) 10%, transparent);
            }

            .year-slider .play-btn .pi {
                font-size: 10px;
            }

            .year-slider .year-value {
                font-size: 14px;
                font-weight: 600;
                width: 40px;
                text-align: center;
                font-variant-numeric: tabular-nums;
            }

            .year-slider .year-range {
                flex: 1 1 0;
                min-width: 0;
                height: 16px;
                -webkit-appearance: none;
                appearance: none;
                background: transparent;
                cursor: pointer;
            }

            .year-slider .year-range:focus {
                outline: none;
            }

            .year-slider .year-range::-webkit-slider-runnable-track {
                height: 3px;
                border-radius: 3px;
                background: linear-gradient(to right, var(--p-slider-range-background, var(--p-primary-color)) var(--fill, 0%), var(--p-slider-track-background, var(--p-content-border-color)) var(--fill, 0%));
            }

            .year-slider .year-range::-webkit-slider-thumb {
                -webkit-appearance: none;
                margin-top: -6.5px;
                width: 16px;
                height: 16px;
                border-radius: 50%;
                background: var(--p-slider-handle-background, var(--p-content-background, #fff));
                border: 1px solid var(--p-content-border-color);
                box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
            }

            .year-slider .year-range::-moz-range-track {
                height: 3px;
                border-radius: 3px;
                background: var(--p-slider-track-background, var(--p-content-border-color));
            }

            .year-slider .year-range::-moz-range-progress {
                height: 3px;
                border-radius: 3px;
                background: var(--p-slider-range-background, var(--p-primary-color));
            }

            .year-slider .year-range::-moz-range-thumb {
                width: 16px;
                height: 16px;
                border-radius: 50%;
                background: var(--p-slider-handle-background, var(--p-content-background, #fff));
                border: 1px solid var(--p-content-border-color);
                box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
            }
        `
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PieDonutDonutBrowserMarketShareDoc {
    readonly playback = useBrowserPlayback();
    readonly colors = ['#5daeea', '#36b7d6', '#ffad5a', '#7c8cff', '#ff7a66'];

    /** Filled portion of the slider track (`--fill`), matching the Vue Slider's range background. */
    readonly fill = computed(() => `${((this.playback.selectedYear() - 2009) / (2023 - 2009)) * 100}%`);

    onSlide(event: Event): void {
        this.playback.setYear(Number((event.target as HTMLInputElement).value));
    }

    readonly tooltipRows = (value: number, ctx: TooltipValueContext): TooltipRow[] => {
        const idx = browsers.indexOf(ctx.label);
        const base = yearlyData[2009][idx] ?? 0;
        const delta = value - base;
        const rows: TooltipRow[] = [{ label: `Share (${this.playback.selectedYear()})`, value: `${value.toFixed(0)}%` }];

        if (this.playback.selectedYear() !== 2009) {
            const arrow = delta >= 0 ? '▲' : '▼';

            rows.push({ label: 'Change vs 2009', value: `${arrow} ${delta >= 0 ? '+' : ''}${delta.toFixed(0)}pp`, color: delta >= 0 ? '#10a981' : '#e5484d' });
        }

        return rows;
    };
}
