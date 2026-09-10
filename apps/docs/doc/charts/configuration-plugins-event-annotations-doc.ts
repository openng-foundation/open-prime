import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, defineChartPlugin, type ChartPluginEntry } from '@openng/optimus-ui/charts';

interface EventMarker {
    at: number;
    label: string;
}

const annotations = (opts: { events: EventMarker[] }) =>
    defineChartPlugin('annotations', (ctx) => {
        ctx.registerOverlay(({ svg, area }) => {
            if (!svg) return;

            const events = opts.events;
            let bandCount = 0;

            for (const [, ds] of ctx.getDatasets()) {
                bandCount = ((ds.props as { data?: unknown[] }).data ?? []).length;
                break;
            }

            if (bandCount === 0) return;

            for (const ev of events) {
                const x = area.x + ((ev.at + 0.5) / bandCount) * area.width;
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');

                line.setAttribute('x1', String(x));
                line.setAttribute('y1', String(area.y));
                line.setAttribute('x2', String(x));
                line.setAttribute('y2', String(area.y + area.height));
                line.setAttribute('stroke', '#7c8cff');
                line.setAttribute('stroke-width', '1.5');
                line.setAttribute('stroke-dasharray', '4 3');
                svg.appendChild(line);

                const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');

                t.setAttribute('x', String(x + 4));
                t.setAttribute('y', String(area.y + 12));
                t.setAttribute('font-size', '11');
                t.setAttribute('font-weight', '600');
                t.setAttribute('fill', '#7c8cff');
                t.textContent = ev.label;
                svg.appendChild(t);
            }
        });
    });

@Component({
    selector: 'configuration-plugins-event-annotations-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Draws vertical markers and labels at given category positions: deploys, campaigns, incidents. The data series is untouched; the events live entirely in the overlay.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="420" [plugins]="plugins">
                    <p-chart-line [data]="data" categoryXField="day" valueYField="users" color="#5ccf9f" [showMarkers]="true" />
                    <p-chart-x-axis />
                    <p-chart-y-axis />
                </p-chart-svg>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PluginsEventAnnotationsDoc {
    readonly data = [
        { day: 'Mon', users: 1200 },
        { day: 'Tue', users: 1450 },
        { day: 'Wed', users: 1380 },
        { day: 'Thu', users: 2100 },
        { day: 'Fri', users: 2600 },
        { day: 'Sat', users: 2400 },
        { day: 'Sun', users: 2200 }
    ];

    readonly plugins: ChartPluginEntry[] = [
        annotations({
            events: [
                { at: 3, label: 'Launch' },
                { at: 5, label: 'Promo' }
            ]
        })
    ];
}
