import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-polar-grouped-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Place multiple <i>ChartPolar</i> components as siblings; each series automatically positions its bars within each angular sector. Useful for comparing two or more datasets across the same categories on a shared radial axis.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="display: flex; justify-content: center">
                    <p-chart-svg [width]="460" [height]="460">
                        <p-chart-polar [data]="morningData" categoryXField="direction" valueYField="speed" name="Morning" />
                        <p-chart-polar [data]="afternoonData" categoryXField="direction" valueYField="speed" name="Afternoon" />
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
export class PolarGroupedDoc {
    readonly morningData = [
        { direction: 'N', speed: 8 },
        { direction: 'NE', speed: 5 },
        { direction: 'E', speed: 10 },
        { direction: 'SE', speed: 14 },
        { direction: 'S', speed: 12 },
        { direction: 'SW', speed: 18 },
        { direction: 'W', speed: 15 },
        { direction: 'NW', speed: 6 }
    ];

    readonly afternoonData = [
        { direction: 'N', speed: 4 },
        { direction: 'NE', speed: 3 },
        { direction: 'E', speed: 5 },
        { direction: 'SE', speed: 6 },
        { direction: 'S', speed: 6 },
        { direction: 'SW', speed: 7 },
        { direction: 'W', speed: 7 },
        { direction: 'NW', speed: 4 }
    ];
}
