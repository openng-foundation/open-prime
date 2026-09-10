import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-line-area-curve-types-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Set <i>curve</i> to control how the line interpolates between points. <i>linear</i> draws straight segments. <i>smooth</i> uses monotone cubic interpolation that never overshoots. <i>spline</i> uses a Catmull-Rom spline with
                configurable <i>tension</i> for a looser curve. The step variants (<i>step</i>, <i>step-before</i>, <i>step-after</i>) draw discrete horizontal transitions, useful for state and threshold data.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-line [data]="data" categoryXField="hour" valueYField="linear" curve="linear" showMarkers [markerSize]="4" name="Linear" />
                        <p-chart-line [data]="data" categoryXField="hour" valueYField="smooth" curve="smooth" showMarkers [markerSize]="4" name="Smooth" />
                        <p-chart-line [data]="data" categoryXField="hour" valueYField="step" curve="step" showMarkers [markerSize]="4" name="Step" />
                        <p-chart-line [data]="data" categoryXField="hour" valueYField="stepBefore" curve="step-before" showMarkers [markerSize]="4" name="Step Before" />
                        <p-chart-line [data]="data" categoryXField="hour" valueYField="stepAfter" curve="step-after" showMarkers [markerSize]="4" name="Step After" />
                        <p-chart-line [data]="data" categoryXField="hour" valueYField="spline" curve="smooth" [tension]="0.3" showMarkers [markerSize]="4" name="Spline (tension: 0.3)" />
                        <p-chart-x-axis />
                        <p-chart-y-axis />
                        <p-chart-legend position="bottom" />
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
export class LineAreaCurveTypesDoc {
    readonly data = [
        { hour: '6am', linear: 12, smooth: 22, step: 32, stepBefore: 42, stepAfter: 52, spline: 62 },
        { hour: '8am', linear: 15, smooth: 26, step: 35, stepBefore: 45, stepAfter: 55, spline: 66 },
        { hour: '10am', linear: 19, smooth: 30, step: 38, stepBefore: 48, stepAfter: 58, spline: 70 },
        { hour: '12pm', linear: 24, smooth: 34, step: 44, stepBefore: 54, stepAfter: 64, spline: 74 },
        { hour: '2pm', linear: 26, smooth: 36, step: 46, stepBefore: 56, stepAfter: 66, spline: 76 },
        { hour: '4pm', linear: 23, smooth: 32, step: 42, stepBefore: 52, stepAfter: 62, spline: 72 },
        { hour: '6pm', linear: 20, smooth: 28, step: 38, stepBefore: 48, stepAfter: 58, spline: 68 },
        { hour: '8pm', linear: 16, smooth: 24, step: 34, stepBefore: 44, stepAfter: 54, spline: 64 }
    ];
}
