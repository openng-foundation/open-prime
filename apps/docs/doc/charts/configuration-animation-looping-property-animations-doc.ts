import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type NamedAnimationSpec } from '@openng/optimus-ui/charts';

@Component({
    selector: 'configuration-animation-looping-property-animations-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Pass <i>animations</i> (a map of named entries) to continuously interpolate dataset properties (<i>opacity</i>, <i>tension</i>, <i>lineStrokeWidth</i>, <i>lineDashOffset</i>, …). These run independently of the entrance animation. Each
                entry targets one or more renderer properties via the <i>properties</i> array. Set <i>loop: true</i> to repeat, and <i>alternate: true</i> so the value bounces between <i>from</i> and <i>to</i> instead of snapping back.
            </p>
            <p>### Per-Dataset Overrides</p>
            <p>
                Each dataset component (<i>&lt;p-chart-bar&gt;</i>, <i>&lt;p-chart-line&gt;</i>, …) also accepts its own <i>animations</i> input. Per-dataset entries are scoped to that series only and override chart-level entries with the same key.
            </p>
            <p>### Hover and Property Animations</p>
            <p>
                When hover state and a looping <i>animations</i> entry target the same property, hover wins. For example, if <i>opacity</i> is animated to fade between <i>1.0</i> and <i>0.3</i> while the user hovers a different dataset, the
                hovered-out series shows the hover-dim value rather than the current property-animation value.
            </p>
            <p>This keeps interactive feedback responsive and predictable regardless of any background property animations.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="460">
                    <p-chart-bar [data]="barData" categoryXField="month" valueYField="bookings" color="#ffad5a" [borderRadius]="4" [animations]="barAnims" />
                    <p-chart-line id="activation" [data]="lineData" categoryXField="month" valueYField="activation" color="#5daeea" [showMarkers]="false" curve="spline" yAxisId="right" [animations]="lineAnims" />
                    <p-chart-x-axis />
                    <p-chart-y-axis id="default" />
                    <p-chart-y-axis id="right" position="right" />
                </p-chart-svg>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnimationLoopingPropertyAnimationsDoc {
    readonly barAnims: Record<string, NamedAnimationSpec> = { opacity: { properties: ['opacity'], from: 1, to: 0.4, duration: 1400, easing: 'easeInOutCubic', loop: true, alternate: true } };
    readonly lineAnims: Record<string, NamedAnimationSpec> = { tension: { properties: ['tension'], from: 1, to: 0, duration: 2000, easing: 'easeInOutCubic', loop: true, alternate: true } };

    readonly barData = [
        { month: 'Jan', bookings: 4200 },
        { month: 'Feb', bookings: 3800 },
        { month: 'Mar', bookings: 5100 },
        { month: 'Apr', bookings: 4600 },
        { month: 'May', bookings: 6200 },
        { month: 'Jun', bookings: 5800 }
    ];

    readonly lineData = [
        { month: 'Jan', activation: 40 },
        { month: 'Feb', activation: 55 },
        { month: 'Mar', activation: 35 },
        { month: 'Apr', activation: 65 },
        { month: 'May', activation: 50 },
        { month: 'Jun', activation: 75 }
    ];
}
