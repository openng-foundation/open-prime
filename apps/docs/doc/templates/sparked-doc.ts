import { SPARKED_DEMO_URL, SPARKED_REPO_URL } from '@/utils/constants';
import { AppConfigService } from '@/service/appconfigservice';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { Component, computed, inject } from '@angular/core';
import { ButtonModule } from '@openng/optimus-ui/button';

@Component({
    selector: 'sparked-doc',
    standalone: true,
    imports: [AppDocSectionText, ButtonModule],
    template: `
        <app-docsectiontext>
            <p>
                <a [href]="sparkedRepoUrl" target="_blank" rel="noopener noreferrer">Sparked</a> is a free, MIT licensed Angular application template built with Optimus UI. It is a ready-to-use starting point for admin-style applications: clone it,
                drop in your own routes and data, and ship.
            </p>
            <p>It ships with:</p>
            <ul>
                <li>An application shell with a responsive sidebar, topbar, footer and a theme configurator (light and dark mode, preset and color options)</li>
                <li>A dashboard page with stats, charts and sales/notification widgets</li>
                <li>A landing page with hero, features, highlights and pricing sections</li>
                <li>Auth pages (login, access denied, error) and a 404 page</li>
                <li>A CRUD sample page and a full UI kit showcase covering forms, tables, lists, charts, menus and overlays</li>
            </ul>
            <div class="flex flex-wrap gap-2 mt-4">
                <a pButton label="Live Demo" icon="pi pi-external-link" [href]="sparkedDemoUrl" target="_blank" rel="noopener noreferrer"></a>
                <a pButton label="Source Code" icon="pi pi-github" severity="secondary" [outlined]="true" [href]="sparkedRepoUrl" target="_blank" rel="noopener noreferrer"></a>
            </div>
            <img [src]="screenshot()" alt="Sparked dashboard built with Optimus UI" class="w-full mt-6 rounded-border border border-surface" loading="lazy" />
        </app-docsectiontext>
    `
})
export class SparkedDoc {
    private readonly configService = inject(AppConfigService);

    readonly sparkedDemoUrl = SPARKED_DEMO_URL;

    readonly sparkedRepoUrl = SPARKED_REPO_URL;

    readonly screenshot = computed(() => (this.configService.appState().darkTheme ? '/demo/landing/sparked-dark.png' : '/demo/landing/sparked-light.png'));
}
