import { DISCORD_URL, GITHUB_DISCUSSIONS_URL, GITHUB_REPO_URL, SPARKED_DEMO_URL } from '@/utils/constants';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'footer-section',
    standalone: true,
    imports: [CommonModule, RouterModule, NgOptimizedImage],
    template: `
        <section class="landing-footer pt-20 px-8 lg:px-20">
            <div class="landing-footer-container">
                <div class="flex flex-wrap z-10">
                    <div class="w-6/12 lg:w-3/12 flex">
                        <ul class="list-none p-0 m-0">
                            <li class="font-bold mb-8">General</li>
                            <li class="mb-6">
                                <a [routerLink]="['installation']" class="text-surface-500 dark:text-surface-400 font-medium hover:text-primary rounded transition-all duration-300"> Get Started </a>
                            </li>
                            <li class="mb-6">
                                <a [routerLink]="['templates']" class="text-surface-500 dark:text-surface-400 font-medium hover:text-primary rounded transition-all duration-300"> Templates </a>
                            </li>
                        </ul>
                    </div>
                    <div class="w-6/12 lg:w-3/12 flex">
                        <ul class="list-none p-0 m-0">
                            <li class="font-bold mb-8">Support</li>
                            <li class="mb-6">
                                <a [href]="githubDiscussionsUrl" target="_blank" rel="noopener noreferrer" class="text-surface-500 dark:text-surface-400 font-medium hover:text-primary rounded transition-all duration-300">GitHub Discussions</a>
                            </li>
                            <li class="mb-6">
                                <a [href]="discordUrl" target="_blank" rel="noopener noreferrer" class="text-surface-500 dark:text-surface-400 font-medium hover:text-primary rounded transition-all duration-300">Discord</a>
                            </li>
                        </ul>
                    </div>
                    <div class="w-6/12 lg:w-3/12 flex">
                        <ul class="list-none p-0 m-0">
                            <li class="font-bold mt-8 lg:mt-0 mb-8">Theming</li>
                            <li class="mb-6">
                                <a [routerLink]="'/theming'" class="text-surface-500 dark:text-surface-400 font-medium hover:text-primary rounded transition-all duration-300">Styled Mode</a>
                            </li>
                        </ul>
                    </div>
                    <div class="w-6/12 lg:w-3/12 flex">
                        <ul class="list-none p-0 m-0">
                            <li class="font-bold mt-8 lg:mt-0 mb-8">Resources</li>
                            <li class="mb-6">
                                <a [href]="githubRepoUrl" target="_blank" rel="noopener noreferrer" class="text-surface-500 dark:text-surface-400 font-medium hover:text-primary rounded transition-all duration-300">Source Code</a>
                            </li>
                            <li class="mb-6">
                                <a [href]="sparkedDemoUrl" target="_blank" rel="noopener noreferrer" class="text-surface-500 dark:text-surface-400 font-medium hover:text-primary rounded transition-all duration-300">Sparked Demo</a>
                            </li>
                            <li class="mb-6">
                                <a href="mailto:contact@openng.org" target="_blank" rel="noopener noreferrer" class="text-surface-500 dark:text-surface-400 font-medium hover:text-primary rounded transition-all duration-300">Contact Us</a>
                            </li>
                        </ul>
                    </div>
                </div>

                <hr class="section-divider" />

                <div class="flex flex-wrap justify-between py-12 gap-8">
                    <img ngSrc="logo.svg" height="40" width="200" alt="" class="dark:invert" />
                    <div class="flex items-center gap-2">
                        <a [href]="githubRepoUrl" target="_blank" rel="noopener noreferrer" class="linkbox linkbox-icon">
                            <i class="pi pi-github"></i>
                        </a>
                        <a [href]="discordUrl" target="_blank" rel="noopener noreferrer" class="linkbox linkbox-icon">
                            <i class="pi pi-discord"></i>
                        </a>
                        <a [href]="githubDiscussionsUrl" class="linkbox linkbox-icon">
                            <i class="pi pi-comments"></i>
                        </a>
                    </div>
                </div>
            </div>
        </section>
    `
})
export class FooterSectionComponent {
    readonly githubRepoUrl = GITHUB_REPO_URL;
    readonly githubDiscussionsUrl = GITHUB_DISCUSSIONS_URL;
    readonly discordUrl = DISCORD_URL;

    readonly sparkedDemoUrl = SPARKED_DEMO_URL;
}
