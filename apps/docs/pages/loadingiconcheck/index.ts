import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnDestroy, PLATFORM_ID, inject, signal } from '@angular/core';
import { Button } from '@openng/optimus-ui/button';
import { CascadeSelect } from '@openng/optimus-ui/cascadeselect';
import { MultiSelect } from '@openng/optimus-ui/multiselect';
import { Select } from '@openng/optimus-ui/select';

interface Probe {
    group: string;
    label: string;
    expectation: string;
    found: boolean;
    classes: string;
    animationName: string;
    animationDuration: string;
    animationIterationCount: string;
    verdict: 'spinning' | 'pulsing' | 'frozen' | 'no animation' | 'no icon';
}

/**
 * Manual verification page for the loading indicator fix.
 *
 * The library used two spinner mechanisms with opposite reduced motion
 * behavior: a font icon whose animation @openng/icons cancels under
 * prefers-reduced-motion, and an inline SVG that had no guard at all. This page
 * probes the computed animation of every variant so the difference is a
 * readable value rather than something you have to squint at.
 *
 * Not linked from the docs menu on purpose. Reach it at /loadingiconcheck.
 */
@Component({
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, Select, MultiSelect, CascadeSelect, Button],
    styles: [
        `
            .lic-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 0.8rem;
            }

            .lic-table th,
            .lic-table td {
                border: 1px solid var(--p-content-border-color);
                padding: 0.4rem 0.6rem;
                text-align: left;
                vertical-align: top;
            }

            .lic-table code {
                font-size: 0.75rem;
                word-break: break-all;
            }

            .lic-card {
                border: 1px solid var(--p-content-border-color);
                border-radius: 6px;
                padding: 1rem;
            }

            .lic-pill {
                display: inline-block;
                border-radius: 999px;
                padding: 0.1rem 0.6rem;
                font-size: 0.7rem;
                font-weight: 600;
            }

            .lic-pill.ok {
                background: #dcfce7;
                color: #166534;
            }

            .lic-pill.bad {
                background: #fee2e2;
                color: #991b1b;
            }

            .lic-pill.warn {
                background: #fef3c7;
                color: #92400e;
            }
        `
    ],
    template: `
        <div class="doc">
            <div class="doc-main">
                <div class="doc-intro">
                    <h1>Loading icon check</h1>
                    <p>Manual verification harness for the select family loading spinner fix. Not part of the documented pages.</p>
                </div>

                <section class="py-4">
                    <div class="lic-card">
                        <h3 class="mt-0">1. Reduced motion state</h3>
                        <p>
                            <code>prefers-reduced-motion: reduce</code> is currently
                            <span class="lic-pill" [class.ok]="reducedMotion()" [class.warn]="!reducedMotion()">{{ reducedMotion() ? 'ON' : 'OFF' }}</span>
                        </p>
                        <p class="text-sm">
                            Turn it on in Chrome DevTools: open the command menu (<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd>), run <em>Show Rendering</em>, then set <em>Emulate CSS media feature prefers-reduced-motion</em> to <em>reduce</em>. On
                            GNOME: <code>gsettings set org.gnome.desktop.interface enable-animations false</code>. The table below re-measures itself when the preference flips.
                        </p>
                        <p-button label="Re-measure" severity="secondary" size="small" (click)="measure()" />
                    </div>
                </section>

                <section class="py-4">
                    <h3>2. Defect 1 — one mechanism, one reduced motion policy</h3>
                    <p class="text-sm">
                        Read the <strong>animation</strong> columns, not the pictures. With the preference OFF every row must animate. With it ON every row except the first must report <code>p-busy-fade</code>, the cross fade that replaces rotation.
                        The first row is a bare <code>.pi-spin</code> with no loading icon class, so nothing outranks the rule <code>@openng/icons</code> ships — it is there to show what the select family used to do, and what any consumer still gets
                        from a bare <code>.pi-spin</code>.
                    </p>

                    <div class="flex flex-wrap gap-6 my-4 items-end">
                        <div class="flex flex-col gap-2 items-center" data-probe-group="Defect 1" data-probe="bare .pi-spin (unprotected)" data-probe-expect="frozen under reduced motion">
                            <span class="pi pi-spinner pi-spin" style="font-size: 1.5rem"></span>
                            <small>bare .pi-spin</small>
                        </div>

                        <div class="flex flex-col gap-2 items-center" data-probe-group="Defect 1" data-probe="pre-fix select markup, now covered by the new rule" data-probe-expect="pulses under reduced motion">
                            <span class="p-select-loading-icon pi pi-spinner pi-spin" style="font-size: 1.5rem"></span>
                            <small>p-select-loading-icon + .pi-spin</small>
                        </div>
                    </div>

                    <div class="flex flex-wrap gap-6 my-4 items-start" data-after-scope>
                        <div class="flex flex-col gap-2" data-probe-group="Defect 1" data-probe="p-select [loading] (live)" data-probe-expect="pulses under reduced motion">
                            <p-select [options]="cities" optionLabel="name" placeholder="Select" [loading]="true" [style]="{ width: '12rem' }" />
                            <small>p-select</small>
                        </div>

                        <div class="flex flex-col gap-2" data-probe-group="Defect 1" data-probe="p-multiselect [loading] (live)" data-probe-expect="pulses under reduced motion">
                            <p-multiselect [options]="cities" optionLabel="name" placeholder="MultiSelect" [loading]="true" [style]="{ width: '12rem' }" />
                            <small>p-multiselect</small>
                        </div>

                        <div class="flex flex-col gap-2" data-probe-group="Defect 1" data-probe="p-cascadeselect [loading] (live)" data-probe-expect="pulses under reduced motion">
                            <p-cascadeselect [options]="countries" optionLabel="cname" optionGroupLabel="name" [optionGroupChildren]="['states', 'cities']" placeholder="CascadeSelect" [loading]="true" [style]="{ width: '12rem' }" />
                            <small>p-cascadeselect</small>
                        </div>

                        <div class="flex flex-col gap-2" data-probe-group="Defect 1" data-probe="p-button [loading] (live, reference)" data-probe-expect="pulses under reduced motion">
                            <p-button label="Button" [loading]="true" />
                            <small>p-button (reference)</small>
                        </div>
                    </div>
                </section>

                <section class="py-4">
                    <h3>3. Defect 2 — a custom [loadingIcon] keeps its classes</h3>
                    <p class="text-sm">
                        Every row below passes <code>loadingIcon="pi pi-cog"</code>. The rendered class attribute must contain <code>pi-spin</code>, <code>pi</code> and <code>pi-cog</code> as three separate tokens. Before the fix select emitted
                        <code>pi-spinpi pi-cog</code> and cascadeselect emitted <code>pi pi-cogpi-spin</code> — both class names destroyed.
                    </p>

                    <div class="flex flex-wrap gap-6 my-4 items-start" data-after-scope>
                        <div class="flex flex-col gap-2" data-probe-group="Defect 2" data-probe="p-select [loadingIcon]" data-probe-expect="pi-spin + pi + pi-cog, separate">
                            <p-select [options]="cities" optionLabel="name" placeholder="Select" [loading]="true" loadingIcon="pi pi-cog" [style]="{ width: '12rem' }" />
                            <small>p-select</small>
                        </div>

                        <div class="flex flex-col gap-2" data-probe-group="Defect 2" data-probe="p-multiselect [loadingIcon]" data-probe-expect="pi-spin + pi + pi-cog, separate">
                            <p-multiselect [options]="cities" optionLabel="name" placeholder="MultiSelect" [loading]="true" loadingIcon="pi pi-cog" [style]="{ width: '12rem' }" />
                            <small>p-multiselect</small>
                        </div>

                        <div class="flex flex-col gap-2" data-probe-group="Defect 2" data-probe="p-cascadeselect [loadingIcon]" data-probe-expect="pi-spin + pi + pi-cog, separate">
                            <p-cascadeselect
                                [options]="countries"
                                optionLabel="cname"
                                optionGroupLabel="name"
                                [optionGroupChildren]="['states', 'cities']"
                                placeholder="CascadeSelect"
                                [loading]="true"
                                loadingIcon="pi pi-cog"
                                [style]="{ width: '12rem' }"
                            />
                            <small>p-cascadeselect</small>
                        </div>

                        <div class="flex flex-col gap-2" data-probe-group="Defect 2" data-probe="p-button [loadingIcon]" data-probe-expect="pi-spin + pi + pi-cog, separate">
                            <p-button label="Button" [loading]="true" loadingIcon="pi pi-cog" />
                            <small>p-button (reference)</small>
                        </div>
                    </div>
                </section>

                <section class="py-4">
                    <h3>4. Defect 3 — no literal "undefined" class</h3>
                    <p class="text-sm">
                        Scans every element rendered by the live components above for a class attribute containing <code>undefined</code>. Before the fix cascadeselect emitted <code>p-cascadeselect-loading-icon undefined pi pi-spinner pi-spin</code>.
                    </p>
                    <p>
                        Elements scanned: <strong>{{ scannedCount() }}</strong> &nbsp;·&nbsp; offenders:
                        <span class="lic-pill" [class.ok]="undefinedClasses().length === 0" [class.bad]="undefinedClasses().length > 0">{{ undefinedClasses().length }}</span>
                    </p>
                    <ul *ngIf="undefinedClasses().length" class="text-sm">
                        <li *ngFor="let value of undefinedClasses()">
                            <code>{{ value }}</code>
                        </li>
                    </ul>
                </section>

                <section class="py-4">
                    <h3>5. Defect 4 — no index classes from buttonstyle</h3>
                    <p class="text-sm">
                        <code>buttonstyle</code>'s <code>spinnerIcon</code> iterated <code>cx('icon')</code> with <code>Object.entries</code>, but <code>cx()</code> resolves to a class string, so it walked the characters and emitted one class per
                        index. A loading button shipped <code>0 1 10 11 &hellip; 31</code> into its class attribute.
                    </p>
                    <p>
                        Numeric class tokens found:
                        <span class="lic-pill" [class.ok]="numericClasses().length === 0" [class.bad]="numericClasses().length > 0">{{ numericClasses().length }}</span>
                    </p>
                    <ul *ngIf="numericClasses().length" class="text-sm">
                        <li *ngFor="let value of numericClasses()">
                            <code>{{ value }}</code>
                        </li>
                    </ul>
                </section>

                <section class="py-4">
                    <h3>6. Measurements</h3>
                    <table class="lic-table">
                        <thead>
                            <tr>
                                <th>Group</th>
                                <th>Probe</th>
                                <th>Verdict</th>
                                <th>animation-name</th>
                                <th>duration</th>
                                <th>iterations</th>
                                <th>class attribute</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr *ngFor="let probe of probes()">
                                <td>{{ probe.group }}</td>
                                <td>
                                    {{ probe.label }}
                                    <br />
                                    <small>expect: {{ probe.expectation }}</small>
                                </td>
                                <td>
                                    <span class="lic-pill" [class.ok]="probe.verdict === 'spinning' || probe.verdict === 'pulsing'" [class.bad]="probe.verdict === 'frozen' || probe.verdict === 'no icon'">{{ probe.verdict }}</span>
                                </td>
                                <td>
                                    <code>{{ probe.animationName }}</code>
                                </td>
                                <td>
                                    <code>{{ probe.animationDuration }}</code>
                                </td>
                                <td>
                                    <code>{{ probe.animationIterationCount }}</code>
                                </td>
                                <td>
                                    <code>{{ probe.classes }}</code>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </section>

                <section class="py-4">
                    <div class="lic-card">
                        <h3 class="mt-0">7. Seeing the real "before"</h3>
                        <p class="text-sm">
                            The two hand written probes in section 2 reproduce the pre-fix class strings, but the live components on this page always run the patched source. To watch the actual regression, stash the fix and reload — the dev server
                            resolves <code>@openng/optimus-ui/*</code> straight to <code>packages/optimus-ui/src</code>, so no rebuild is needed.
                        </p>
                        <pre class="text-sm"><code>git stash push -- packages/optimus-ui/src   # before
git stash pop                              # after</code></pre>
                        <p class="text-sm">
                            With the fix stashed and the preference ON you should see: the three select rows report <code>fa-spin / 0.001s / 1</code> (frozen), section 3 shows <code>pi-spinpi pi-cog</code> and <code>pi pi-cogpi-spin</code>, and
                            section 4 finds one offender.
                        </p>
                    </div>
                </section>
            </div>
        </div>
    `
})
export class LoadingIconCheckDemo implements AfterViewInit, OnDestroy {
    private host = inject(ElementRef<HTMLElement>);

    private platformId = inject(PLATFORM_ID);

    reducedMotion = signal(false);

    probes = signal<Probe[]>([]);

    undefinedClasses = signal<string[]>([]);

    numericClasses = signal<string[]>([]);

    scannedCount = signal(0);

    cities = [
        { name: 'New York', code: 'NY' },
        { name: 'Rome', code: 'RM' }
    ];

    countries = [
        {
            name: 'Australia',
            code: 'AU',
            states: [{ name: 'New South Wales', cities: [{ cname: 'Sydney', code: 'A-SY' }] }]
        }
    ];

    private mediaQuery?: MediaQueryList;

    private onPreferenceChange = () => {
        this.reducedMotion.set(!!this.mediaQuery?.matches);
        this.measure();
    };

    ngAfterViewInit() {
        if (!isPlatformBrowser(this.platformId)) {
            return;
        }

        this.mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        this.mediaQuery.addEventListener('change', this.onPreferenceChange);
        this.reducedMotion.set(this.mediaQuery.matches);

        // The overlay driven components settle a frame after view init.
        setTimeout(() => this.measure());
    }

    ngOnDestroy() {
        this.mediaQuery?.removeEventListener('change', this.onPreferenceChange);
    }

    measure() {
        if (!isPlatformBrowser(this.platformId)) {
            return;
        }

        const root = this.host.nativeElement as HTMLElement;

        this.probes.set(Array.from(root.querySelectorAll<HTMLElement>('[data-probe]')).map((wrapper) => this.readProbe(wrapper)));
        this.scanForUndefined(root);
    }

    private readProbe(wrapper: HTMLElement): Probe {
        const group = wrapper.dataset['probeGroup'] ?? '';
        const label = wrapper.dataset['probe'] ?? '';
        const expectation = wrapper.dataset['probeExpect'] ?? '';
        const icon = wrapper.querySelector<HTMLElement>('.p-icon-spin, .pi-spin, [class*="loading-icon"]');

        if (!icon) {
            return { group, label, expectation, found: false, classes: '', animationName: '-', animationDuration: '-', animationIterationCount: '-', verdict: 'no icon' };
        }

        const style = getComputedStyle(icon);
        const animationName = style.animationName;
        const animationDuration = style.animationDuration;
        const animationIterationCount = style.animationIterationCount;

        return {
            group,
            label,
            expectation,
            found: true,
            classes: icon.getAttribute('class') ?? '',
            animationName,
            animationDuration,
            animationIterationCount,
            verdict: this.verdictFor(animationName, animationDuration, animationIterationCount)
        };
    }

    private verdictFor(name: string, duration: string, iterationCount: string): Probe['verdict'] {
        if (!name || name === 'none') {
            return 'no animation';
        }

        // The primeicons reduced motion hack keeps the animation but runs it once
        // for 1ms, which reads as a permanently stopped spinner.
        const seconds = parseFloat(duration) || 0;

        if (iterationCount !== 'infinite' || seconds < 0.05) {
            return 'frozen';
        }

        return name === 'p-busy-fade' ? 'pulsing' : 'spinning';
    }

    private scanForUndefined(root: HTMLElement) {
        const scopes = Array.from(root.querySelectorAll<HTMLElement>('[data-after-scope]'));
        const undefinedOffenders: string[] = [];
        const numericOffenders: string[] = [];
        let scanned = 0;

        for (const scope of scopes) {
            for (const element of Array.from(scope.querySelectorAll<HTMLElement>('[class]'))) {
                scanned++;

                const value = element.getAttribute('class') ?? '';
                const tokens = value.split(/\s+/).filter(Boolean);
                const where = `<${element.tagName.toLowerCase()}> ${value}`;

                if (tokens.includes('undefined')) {
                    undefinedOffenders.push(where);
                }

                if (tokens.some((token) => /^\d+$/.test(token))) {
                    numericOffenders.push(where);
                }
            }
        }

        this.scannedCount.set(scanned);
        this.undefinedClasses.set(undefinedOffenders);
        this.numericClasses.set(numericOffenders);
    }
}
