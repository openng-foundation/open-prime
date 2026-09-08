import { AppConfigService } from '@/service/appconfigservice';
import { SPARKED_DEMO_URL, SPARKED_REPO_URL } from '@/utils/constants';
import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { AnimateOnScrollModule } from '@openng/optimus-ui/animateonscroll';

@Component({
    selector: 'template-section',
    standalone: true,
    imports: [CommonModule, AnimateOnScrollModule],
    template: `
        <section class="landing-template py-20">
            <div class="section-header">Application Template</div>
            <p class="section-detail">Sparked is a free, MIT licensed admin template built with Optimus UI. Clone it and start shipping.</p>
            <div class="mt-16 px-8 lg:px-20 flex justify-center">
                <div class="template-showcase animate-duration-500" pAnimateOnScroll enterClass="animate-fadein">
                    <div class="template-frame box">
                        <div class="template-frame-bar">
                            <span class="template-frame-dot"></span>
                            <span class="template-frame-dot"></span>
                            <span class="template-frame-dot"></span>
                            <span class="template-frame-url">sparked.openng.org</span>
                        </div>
                        <a [href]="sparkedDemoUrl" target="_blank" rel="noopener noreferrer" class="template-frame-body" aria-label="Open the Sparked live demo">
                            <img [src]="screenshot()" alt="Sparked admin dashboard built with Optimus UI" width="1440" height="900" loading="lazy" />
                        </a>
                    </div>
                    <div class="template-highlights">
                        <div class="template-highlight">
                            <i class="pi pi-th-large"></i>
                            <span>Dashboard, CRUD and UI kit pages</span>
                        </div>
                        <div class="template-highlight">
                            <i class="pi pi-lock"></i>
                            <span>Auth, error and 404 screens</span>
                        </div>
                        <div class="template-highlight">
                            <i class="pi pi-palette"></i>
                            <span>Theme configurator, light and dark</span>
                        </div>
                    </div>
                    <div class="template-actions">
                        <a [href]="sparkedDemoUrl" target="_blank" rel="noopener noreferrer" class="linkbox linkbox-primary">
                            <i class="pi pi-external-link mr-2"></i>
                            Live Demo
                        </a>
                        <a [href]="sparkedRepoUrl" target="_blank" rel="noopener noreferrer" class="linkbox">
                            <i class="pi pi-github mr-2"></i>
                            Source Code
                        </a>
                    </div>
                </div>
            </div>
        </section>
    `
})
export class TemplateSectionComponent {
    private readonly configService = inject(AppConfigService);

    readonly sparkedDemoUrl = SPARKED_DEMO_URL;

    readonly sparkedRepoUrl = SPARKED_REPO_URL;

    readonly screenshot = computed(() => (this.configService.appState().darkTheme ? '/demo/landing/sparked-dark.png' : '/demo/landing/sparked-light.png'));
}
