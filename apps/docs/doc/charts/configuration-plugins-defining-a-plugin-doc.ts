import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'configuration-plugins-defining-a-plugin-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                <i>defineChartPlugin(name, install, options?)</i> returns a plugin. The <i>install</i> function receives a <i>ChartPluginContext</i> and returns the plugin's public API under <i>api</i>. A plugin that only paints an overlay can return
                nothing.
            </p>
        </app-docsectiontext>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PluginsDefiningAPluginDoc {}
