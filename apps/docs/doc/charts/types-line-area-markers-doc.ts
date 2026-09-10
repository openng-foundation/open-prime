import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-line-area-markers-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Set <i>showMarkers</i> to display point markers at each data vertex. Use <i>markerShape</i> to differentiate series. Built-in shapes are <i>circle</i>, <i>square</i>, <i>triangle</i>, <i>cross</i>, and <i>star</i>. Set
                <i>markerSize</i> to control the radius and <i>pointRotation</i> to rotate the marker shape.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-line [data]="data" categoryXField="month" valueYField="desktop" name="Desktop" showMarkers [markerSize]="6" markerShape="circle" />
                        <p-chart-line [data]="data" categoryXField="month" valueYField="mobile" name="Mobile" showMarkers [markerSize]="8" markerShape="star" />
                        <p-chart-line [data]="data" categoryXField="month" valueYField="tablet" name="Tablet" showMarkers [markerSize]="7" markerShape="triangle" />
                        <p-chart-x-axis />
                        <p-chart-y-axis />
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
export class LineAreaMarkersDoc {
    readonly data = [
        { month: 'Jan', desktop: 186, mobile: 80, tablet: 45 },
        { month: 'Feb', desktop: 305, mobile: 200, tablet: 98 },
        { month: 'Mar', desktop: 237, mobile: 120, tablet: 67 },
        { month: 'Apr', desktop: 73, mobile: 190, tablet: 110 },
        { month: 'May', desktop: 209, mobile: 130, tablet: 85 },
        { month: 'Jun', desktop: 214, mobile: 140, tablet: 92 }
    ];
}
