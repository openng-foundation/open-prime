import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-treemap-declarative-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Define cells inline using <i>ChartTreemapGroup</i> and <i>ChartItem</i> children instead of a data array. <i>ChartTreemapGroup</i> creates a parent container; set <i>label</i> and <i>color</i>. Nest <i>ChartItem</i> children inside
                each group to define the leaf cells. This pattern maps directly to the <i>group</i> + drilldown hierarchy; each <i>ChartTreemapGroup</i> becomes a drillable parent when <i>drilldown</i> is set on <i>ChartTreemap</i>.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-treemap [drilldown]="true" rootLabel="Company Budget">
                            <p-chart-treemap-group label="Engineering">
                                <p-chart-item [value]="42" category="Frontend" />
                                <p-chart-item [value]="38" category="Backend" />
                                <p-chart-item [value]="25" category="DevOps" />
                                <p-chart-item [value]="18" category="QA" />
                            </p-chart-treemap-group>
                            <p-chart-treemap-group label="Marketing">
                                <p-chart-item [value]="30" category="Digital" />
                                <p-chart-item [value]="22" category="Brand" />
                                <p-chart-item [value]="14" category="Events" />
                            </p-chart-treemap-group>
                            <p-chart-treemap-group label="Operations">
                                <p-chart-item [value]="28" category="HR" />
                                <p-chart-item [value]="20" category="Finance" />
                                <p-chart-item [value]="16" category="Legal" />
                            </p-chart-treemap-group>
                        </p-chart-treemap>
                        <p-chart-tooltip />
                        <p-chart-breadcrumb />
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
export class TreemapDeclarativeDoc {}
