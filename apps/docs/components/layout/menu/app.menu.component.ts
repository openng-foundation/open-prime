import { default as MenuData } from '@/assets/data/menu.json';
import { default as Versions } from '@/assets/data/versions.json';
import { AppConfiguratorComponent } from '@/components/layout/configurator/app.configurator.component';
import { AppConfigService } from '@/service/appconfigservice';
import { DISCORD_URL, GITHUB_DISCUSSIONS_URL, GITHUB_REPO_URL } from '@/utils/constants';
import { CommonModule } from '@angular/common';
import { afterNextRender, Component, computed, ElementRef, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { AutoComplete } from '@openng/optimus-ui/autocomplete';
import { DomHandler } from '@openng/optimus-ui/dom';
import { SelectModule } from '@openng/optimus-ui/select';
import { StyleClass } from '@openng/optimus-ui/styleclass';
import { Subscription } from 'rxjs';
import { AppMenuItemComponent } from './app.menuitem.component';

export interface MenuItem {
    name?: string;
    icon?: string;
    children?: MenuItem[];
    routerLink?: string;
    href?: string;
}

@Component({
    selector: 'app-menu',
    template: ` <aside>
        <nav>
            <ol class="layout-menu">
                <li *ngFor="let item of menu; let i = index" app-menuitem [item]="item" [root]="true"></li>

                <li class="drawer-quickaction drawer-quickaction-divider">
                    <a [href]="githubRepoUrl" target="_blank" rel="noopener noreferrer">
                        <div class="menu-icon">
                            <i class="pi pi-github"></i>
                        </div>
                        <span>GitHub</span>
                    </a>
                </li>
                <li class="drawer-quickaction">
                    <a [href]="discordUrl" target="_blank" rel="noopener noreferrer" aria-label="Optimus UI Discord" title="Optimus UI Discord">
                        <div class="menu-icon">
                            <i class="pi pi-discord"></i>
                        </div>
                        <span>Discord</span>
                    </a>
                </li>
                <li class="drawer-quickaction">
                    <a [href]="githubDiscussionsUrl" target="_blank" rel="noopener noreferrer">
                        <div class="menu-icon">
                            <i class="pi pi-comments"></i>
                        </div>
                        <span>Discussions</span>
                    </a>
                </li>
                <li class="drawer-quickaction">
                    <button type="button" (click)="toggleDarkMode()">
                        <div class="menu-icon">
                            <i class="pi" [ngClass]="{ 'pi-moon': isDarkMode(), 'pi-sun': !isDarkMode() }"></i>
                        </div>
                        <span>{{ isDarkMode() ? 'Light Mode' : 'Dark Mode' }}</span>
                    </button>
                </li>
                <li class="drawer-quickaction relative">
                    <button type="button" enterActiveClass="px-overlay-enter-active" enterFromClass="hidden" leaveActiveClass="px-overlay-leave-active" leaveToClass="hidden" pStyleClass="@next" [hideOnOutsideClick]="true">
                        <div class="menu-icon">
                            <i class="pi pi-palette"></i>
                        </div>
                        <span>Customize Theme</span>
                    </button>
                    <app-configurator />
                </li>
                <li class="drawer-quickaction drawer-version-row">
                    <div class="menu-icon">
                        <i class="pi pi-tag"></i>
                    </div>
                    <p-select
                        [(ngModel)]="selectedVersion"
                        [options]="versions"
                        [group]="true"
                        (onChange)="onVersionChange($event)"
                        [pt]="{
                            optionGroup: {
                                class: 'version-group'
                            }
                        }"
                    >
                    </p-select>
                </li>
            </ol>
        </nav>
    </aside>`,
    host: {
        class: 'layout-sidebar',
        '[class.active]': 'isActive()'
    },
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, SelectModule, StyleClass, AppConfiguratorComponent, AppMenuItemComponent]
})
export class AppMenuComponent implements OnDestroy {
    menu!: MenuItem[];

    readonly githubRepoUrl = GITHUB_REPO_URL;
    readonly githubDiscussionsUrl = GITHUB_DISCUSSIONS_URL;
    readonly discordUrl = DISCORD_URL;

    versions: any[] = Versions;
    selectedVersion = this.versions[0].items[0].value;

    private routerSubscription: Subscription;

    isActive = computed(() => this.configService.appState().menuActive);

    isDarkMode = computed(() => this.configService.appState().darkTheme);

    constructor(
        private configService: AppConfigService,
        private el: ElementRef,
        private router: Router
    ) {
        this.menu = MenuData.data;

        afterNextRender(() => {
            setTimeout(() => {
                this.scrollToActiveItem();
            }, 1);

            this.routerSubscription = this.router.events.subscribe((event) => {
                if (event instanceof NavigationEnd && this.isActive()) {
                    this.configService.hideMenu();
                    DomHandler.unblockBodyScroll('blocked-scroll');
                }
            });
        });
    }

    toggleDarkMode() {
        this.configService.appState.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
    }

    onVersionChange(event: any) {
        if (event?.value && event.value.startsWith('http')) {
            window.location.href = event.value;
        }
    }

    scrollToActiveItem() {
        let activeItem = DomHandler.findSingle(this.el.nativeElement, '.router-link-active');
        if (activeItem && !this.isInViewport(activeItem)) {
            activeItem.scrollIntoView({ block: 'center' });
        }
    }

    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return rect.top >= 0 && rect.left >= 0 && rect.bottom <= (window.innerHeight || (document.documentElement.clientHeight && rect.right <= (window.innerWidth || document.documentElement.clientWidth)));
    }

    ngOnDestroy() {
        if (this.routerSubscription) {
            this.routerSubscription.unsubscribe();
            this.routerSubscription = null;
        }
    }
}
