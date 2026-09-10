import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'configuration-plugins-plugin-options-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>A plugin that takes configuration is written as a function that returns <i>defineChartPlugin(...)</i>. The options are ordinary function parameters, so they are type checked where the plugin is created.</p>
            <p>A <i>[plugin, options]</i> tuple is also accepted, and the options arrive on <i>ctx.options</i>. The tuple carries no type information for the options, so the function form is preferred for any plugin that takes configuration.</p>
            <p>### ChartPluginContext</p>
            <div class="doc-tablewrapper">
                <table class="doc-table">
                    <thead>
                        <tr>
                            <th>Member</th>
                            <th>Signature</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><i>getState</i></td>
                            <td><i>() =&gt; ChartState</i></td>
                            <td>Current computed chart state (plotting area, scales, descriptions)</td>
                        </tr>
                        <tr>
                            <td><i>getDatasets</i></td>
                            <td><i>() =&gt; Map&lt;string, DatasetRegistration&gt;</i></td>
                            <td>The registered datasets keyed by id</td>
                        </tr>
                        <tr>
                            <td><i>getHover</i></td>
                            <td><i>() =&gt; HoverState | null</i></td>
                            <td>The current hover state, or <i>null</i> when nothing is hovered</td>
                        </tr>
                        <tr>
                            <td><i>onFrame</i></td>
                            <td><i>(cb) =&gt; () =&gt; void</i></td>
                            <td>Subscribe to every render frame; returns an unsubscribe fn</td>
                        </tr>
                        <tr>
                            <td><i>onHover</i></td>
                            <td><i>(cb) =&gt; () =&gt; void</i></td>
                            <td>Subscribe to hover-state changes; returns an unsubscribe fn</td>
                        </tr>
                        <tr>
                            <td><i>registerOverlay</i></td>
                            <td><i>(render) =&gt; () =&gt; void</i></td>
                            <td>Register an overlay painter layered above the chart; returns a remover</td>
                        </tr>
                        <tr>
                            <td><i>getContainer</i></td>
                            <td><i>() =&gt; HTMLElement | null</i></td>
                            <td>The chart's container element, or <i>null</i> before mount</td>
                        </tr>
                        <tr>
                            <td><i>options</i></td>
                            <td><i>TOptions</i></td>
                            <td>Options passed at registration time</td>
                        </tr>
                        <tr>
                            <td><i>onUnmounted</i></td>
                            <td><i>(fn) =&gt; void</i></td>
                            <td>Register a cleanup callback run when the chart unmounts</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <p>### Overlay rendering</p>
            <p>
                <i>registerOverlay</i> runs on every frame (and on hover). In SVG mode the painter receives a fresh <i>&lt;g&gt;</i> to append into; in Canvas mode it receives the live 2D context. The examples below include SVG and Canvas variants
                through the same public demo ref, so the viewer toggle appears when both files exist. Always check which one is present:
            </p>
            <p>
                &gt; <strong>Reactivity.</strong> A plugin's returned API is read through the chart's <i>$plugins</i> getter. To keep a value live in the template, write it into an Angular <i>signal</i> inside <i>onFrame</i> and read that signal in
                your markup (the chart analogue of a subscription). Don't rely on the plugin object mutating in place.
            </p>
        </app-docsectiontext>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PluginsPluginOptionsDoc {}
