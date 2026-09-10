import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-radar-fill-opacity-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Set <i>fillOpacity</i> to control the polygon area fill. <i>0</i> draws only the stroke with no fill; <i>0.2</i> is the default semi-transparent fill. Higher values create a more solid polygon, which works well when series don't
                overlap.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-radar id="filled" [data]="data" categoryXField="capability" valueYField="value" [fillOpacity]="0.5" />
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
export class RadarFillOpacityDoc {
    readonly data = [
        { capability: 'Detection', value: 88 },
        { capability: 'Triage', value: 76 },
        { capability: 'Containment', value: 83 },
        { capability: 'Recovery', value: 68 },
        { capability: 'Comms', value: 80 },
        { capability: 'Postmortems', value: 72 }
    ];
}
