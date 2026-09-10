import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-scatter-bubble-declarative-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Define data points inline using <i>ChartItem</i> children instead of a data array. Each <i>ChartItem</i> accepts <i>valueX</i> and <i>valueY</i> for coordinates, plus <i>color</i> for per-point color overrides.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-scatter name="Self-serve" color="#5daeea">
                            <p-chart-item [valueX]="32" [valueY]="58" />
                            <p-chart-item [valueX]="41" [valueY]="64" />
                            <p-chart-item [valueX]="48" [valueY]="71" />
                            <p-chart-item [valueX]="55" [valueY]="74" />
                            <p-chart-item [valueX]="63" [valueY]="79" />
                            <p-chart-item [valueX]="70" [valueY]="83" />
                        </p-chart-scatter>
                        <p-chart-scatter name="Sales-assisted" color="#7c8cff">
                            <p-chart-item [valueX]="44" [valueY]="68" />
                            <p-chart-item [valueX]="52" [valueY]="76" />
                            <p-chart-item [valueX]="59" [valueY]="81" />
                            <p-chart-item [valueX]="67" [valueY]="86" />
                            <p-chart-item [valueX]="75" [valueY]="90" />
                            <p-chart-item [valueX]="82" [valueY]="92" />
                        </p-chart-scatter>
                        <p-chart-x-axis label="Activation score" />
                        <p-chart-y-axis label="Week-8 retention (%)" />
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
export class ScatterBubbleDeclarativeDoc {}
