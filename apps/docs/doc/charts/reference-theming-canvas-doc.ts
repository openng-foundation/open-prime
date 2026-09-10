import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { defaultDarkTheme, defaultLightTheme, ChartsModule, type TickValue } from '@openng/optimus-ui/charts';

const marketLightTheme = {
    ...defaultLightTheme,
    series: ['#5daeea', '#ffad5a', '#7c8cff'],
    axes: ['#64748b', '#64748b'],
    grid: '#d7e2ea',
    gridMinor: '#eef3f7',
    tickLabel: '#475569',
    titleColor: '#0f172a',
    captionColor: '#64748b',
    tooltipBackground: '#ffffff',
    tooltipBorder: '#b7c7d6',
    tooltipColor: '#0f172a',
    legendColor: '#334155',
    crosshairColor: '#5daeea',
    hoverBrightness: 1.08,
    dimOpacity: 0.38
};

const marketDarkTheme = {
    ...defaultDarkTheme,
    series: ['#6bbbed', '#ffb76d', '#909dff'],
    axes: ['#94a3b8', '#94a3b8'],
    grid: '#243447',
    gridMinor: '#172235',
    tickLabel: '#cbd5e1',
    titleColor: '#f8fafc',
    captionColor: '#94a3b8',
    tooltipBackground: '#111827',
    tooltipBorder: '#3b4a5f',
    tooltipColor: '#f8fafc',
    legendColor: '#dbeafe',
    crosshairColor: '#6bbbed',
    hoverBrightness: 1.12,
    dimOpacity: 0.5
};

@Component({
    selector: 'reference-theming-canvas-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                The canvas renderer doesn't read CSS variables, so theming is done through the <i>theme</i> input on <i>&lt;p-chart-canvas&gt;</i>. The input accepts a partial <i>ChartTheme</i> object. All fields are optional and merge over the
                built-in defaults.
            </p>
            <p>### Creating a Custom Theme</p>
            <p>The library exports <i>defaultLightTheme</i> and <i>defaultDarkTheme</i> as a base. Spread and override only what is needed in a dedicated theme file.</p>
            <p>Then bind it to the charts.</p>
            <p>### Canvas Palette Override</p>
            <p>
                Canvas does not repaint drawn marks from CSS selectors. Pass a reactive <i>theme</i> object to <i>ChartCanvas</i> when the palette, grid, axes, tooltip, legend, or crosshair should change. The example below toggles between light and
                dark theme objects built from <i>defaultLightTheme</i> and <i>defaultDarkTheme</i>; the chart repaints because the bound <i>theme</i> input changes.
            </p>
            <p>### More Than 14 Series Colors</p>
            <p>Pass a <i>series</i> array longer than 14. The canvas renderer cycles through all entries using modulo before wrapping.</p>
            <p>### Light &amp; Dark</p>
            <p>
                Because canvas charts are DOM-free, they don't react to CSS changes on their own. The correct theme object must be passed based on the active color scheme. The simplest approach is to detect dark mode in JS and swap between the light
                and dark themes reactively, similar to how Chart.js handles theming.
            </p>
            <p>Since <i>theme</i> is a signal, updating it is all that's needed. The chart re-renders on its own. This logic can be extracted into a service and reused across canvas charts.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div class="canvas-theme-demo" [class]="'canvas-theme-demo--' + activeMode()">
                    <div class="canvas-theme-demo__toolbar">
                        <div>
                            <span>Canvas theme object</span>
                            <strong>{{ modeLabel() }}</strong>
                        </div>
                        <div class="canvas-theme-demo__actions" role="group" aria-label="Canvas theme mode">
                            <button type="button" [class.active]="activeMode() === 'light'" (click)="activeMode.set('light')">Light</button>
                            <button type="button" [class.active]="activeMode() === 'dark'" (click)="activeMode.set('dark')">Dark</button>
                        </div>
                    </div>

                    <p-chart-canvas [theme]="activeTheme()" [height]="430" [animation]="{ duration: 500, easing: 'easeOutCubic' }">
                        <p-chart-bar [data]="marginData" categoryXField="month" valueYField="software" name="Software ARR" [borderRadius]="5" />
                        <p-chart-bar [data]="marginData" categoryXField="month" valueYField="services" name="Services ARR" [borderRadius]="5" />
                        <p-chart-line [data]="marginData" categoryXField="month" valueYField="margin" yAxisId="margin" name="Gross margin" [lineStrokeWidth]="3" [showMarkers]="true" curve="smooth" />
                        <p-chart-x-axis />
                        <p-chart-y-axis label="ARR" [tickFormat]="money" />
                        <p-chart-y-axis id="margin" position="right" label="Margin" [tickFormat]="percent" [chartPaddingMin]="0.12" />
                        <p-chart-tooltip mode="shared" [crosshair]="true" />
                        <p-chart-legend position="bottom" />
                        <p-chart-hover />
                        <p-chart-title text="Revenue desk palette override" />
                        <p-chart-caption text="The buttons swap the Canvas theme object, repainting bars, line, axes, grid, tooltip, legend, and crosshair." />
                        <p-chart-export-menu filename="canvas-theme-palette-override" />
                        <p-chart-accessibility />
                    </p-chart-canvas>
                </div>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ThemingCanvasDoc {
    readonly activeMode = signal<'light' | 'dark'>('light');
    readonly activeTheme = computed(() => (this.activeMode() === 'dark' ? marketDarkTheme : marketLightTheme));
    readonly modeLabel = computed(() => (this.activeMode() === 'dark' ? 'Dark desk' : 'Light desk'));
    readonly marginData = [
        { month: 'Jan', software: 62, services: 38, margin: 54 },
        { month: 'Feb', software: 69, services: 42, margin: 56 },
        { month: 'Mar', software: 74, services: 47, margin: 59 },
        { month: 'Apr', software: 88, services: 52, margin: 61 },
        { month: 'May', software: 96, services: 61, margin: 63 },
        { month: 'Jun', software: 112, services: 68, margin: 66 }
    ];
    readonly money = (value: TickValue) => `$${Number(value).toFixed(0)}k`;
    readonly percent = (value: TickValue) => `${Number(value).toFixed(0)}%`;
}
