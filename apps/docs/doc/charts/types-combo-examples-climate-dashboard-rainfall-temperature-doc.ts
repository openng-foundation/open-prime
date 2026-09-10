import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type TickValue } from '@openng/optimus-ui/charts';
import { comboClimateDashboard } from '@/doc/charts/data/comboClimateDashboard';

@Component({
    selector: 'types-combo-examples-climate-dashboard-rainfall-temperature-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                A dual-axis combo where two variables with incompatible units share a category axis. Rainfall renders as bars against the left axis (<i>yAxisId="rainfall"</i>, formatted as mm), while max and min temperature render as smoothed lines
                against the right axis (<i>yAxisId="temperature"</i>, formatted as °C). A <i>ChartReferenceLine</i> pins the annual mean temperature on the temperature axis. Shared-mode tooltip aligns all three readings on hover.
            </p>
            <p>#### SvgComboClimateDashboardDemo.ts</p>
            <p>#### comboClimateDashboard.ts</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg [animation]="{ duration: 600, easing: 'easeOutCubic' }">
                        <p-chart-bar [data]="data" categoryXField="month" valueYField="rainfall" name="Rainfall" color="#36b7d6" yAxisId="rainfall" [borderRadius]="{ topLeft: 4, topRight: 4 }" />
                        <p-chart-line
                            [data]="data"
                            categoryXField="month"
                            valueYField="tempMax"
                            name="Max temperature"
                            color="#ffad5a"
                            yAxisId="temperature"
                            curve="smooth"
                            [showMarkers]="true"
                            [markerSize]="5"
                            [lineStrokeWidth]="2.5"
                            [fillOpacity]="0"
                        />
                        <p-chart-line
                            [data]="data"
                            categoryXField="month"
                            valueYField="tempMin"
                            name="Min temperature"
                            color="#5daeea"
                            yAxisId="temperature"
                            curve="smooth"
                            [showMarkers]="true"
                            [markerSize]="5"
                            [lineStrokeWidth]="2"
                            [lineDash]="[4, 4]"
                            [fillOpacity]="0"
                        />
                        <p-chart-x-axis [chartPaddingMin]="0.05" [chartPaddingMax]="0.05" />
                        <p-chart-y-axis id="rainfall" position="left" label="Rainfall (mm)" [tickFormat]="formatMm" />
                        <p-chart-y-axis id="temperature" position="right" label="Temperature (°C)" [tickFormat]="formatDeg" />
                        <p-chart-reference-line yAxisId="temperature" [y]="annualMeanTemp" stroke="#ffad5a66" [lineDash]="[2, 4]" label="Annual mean 11.6°" />
                        <p-chart-legend position="top" />
                        <p-chart-tooltip mode="shared" [crosshair]="true" />
                        <p-chart-hover />
                        <p-chart-title text="London climate normals 1991–2020" />
                        <p-chart-caption text="Rainfall as vertical bars on the left axis, monthly temperature extremes on the right axis. Source: Met Office." />
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
export class ComboExamplesClimateDashboardRainfallTemperatureDoc {
    readonly data = comboClimateDashboard;
    readonly annualMeanTemp = 11.6;
    readonly formatMm = (v: TickValue) => `${v} mm`;
    readonly formatDeg = (v: TickValue) => `${v}°`;
}
