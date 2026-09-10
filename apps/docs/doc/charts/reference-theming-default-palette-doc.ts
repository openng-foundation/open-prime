import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'reference-theming-default-palette-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                Charts ship with a 14-color categorical palette. The order is designed for adjacent contrast in pies, donuts, stacked bars, and legends: cool and warm colors alternate early, while softer secondary colors extend dense series without
                making normal charts feel busy. Dark mode uses the same hue families with a modest lift, so marks stay readable without becoming neon.
            </p>
            <div class="doc-tablewrapper">
                <table class="doc-table">
                    <thead>
                        <tr>
                            <th>Slot</th>
                            <th>CSS variable</th>
                            <th>Light</th>
                            <th>Dark</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>0</td>
                            <td><i>--p-chart-color-0</i></td>
                            <td>
                                &lt;span style="display:inline-block;width:0.75rem;height:0.75rem;margin-right:0.4rem;border:1px solid rgb(0 0 0 / 0.14);border-radius:0.2rem;vertical-align:-0.1rem;background:#5daeea;"&gt;&lt;/span&gt;<i>#5daeea</i>
                            </td>
                            <td>
                                &lt;span style="display:inline-block;width:0.75rem;height:0.75rem;margin-right:0.4rem;border:1px solid rgb(0 0 0 / 0.14);border-radius:0.2rem;vertical-align:-0.1rem;background:#6bbbed;"&gt;&lt;/span&gt;<i>#6bbbed</i>
                            </td>
                        </tr>
                        <tr>
                            <td>1</td>
                            <td><i>--p-chart-color-1</i></td>
                            <td>
                                &lt;span style="display:inline-block;width:0.75rem;height:0.75rem;margin-right:0.4rem;border:1px solid rgb(0 0 0 / 0.14);border-radius:0.2rem;vertical-align:-0.1rem;background:#ffad5a;"&gt;&lt;/span&gt;<i>#ffad5a</i>
                            </td>
                            <td>
                                &lt;span style="display:inline-block;width:0.75rem;height:0.75rem;margin-right:0.4rem;border:1px solid rgb(0 0 0 / 0.14);border-radius:0.2rem;vertical-align:-0.1rem;background:#ffb76d;"&gt;&lt;/span&gt;<i>#ffb76d</i>
                            </td>
                        </tr>
                        <tr>
                            <td>2</td>
                            <td><i>--p-chart-color-2</i></td>
                            <td>
                                &lt;span style="display:inline-block;width:0.75rem;height:0.75rem;margin-right:0.4rem;border:1px solid rgb(0 0 0 / 0.14);border-radius:0.2rem;vertical-align:-0.1rem;background:#ffd166;"&gt;&lt;/span&gt;<i>#ffd166</i>
                            </td>
                            <td>
                                &lt;span style="display:inline-block;width:0.75rem;height:0.75rem;margin-right:0.4rem;border:1px solid rgb(0 0 0 / 0.14);border-radius:0.2rem;vertical-align:-0.1rem;background:#ffdc7a;"&gt;&lt;/span&gt;<i>#ffdc7a</i>
                            </td>
                        </tr>
                        <tr>
                            <td>3</td>
                            <td><i>--p-chart-color-3</i></td>
                            <td>
                                &lt;span style="display:inline-block;width:0.75rem;height:0.75rem;margin-right:0.4rem;border:1px solid rgb(0 0 0 / 0.14);border-radius:0.2rem;vertical-align:-0.1rem;background:#4ecdc4;"&gt;&lt;/span&gt;<i>#4ecdc4</i>
                            </td>
                            <td>
                                &lt;span style="display:inline-block;width:0.75rem;height:0.75rem;margin-right:0.4rem;border:1px solid rgb(0 0 0 / 0.14);border-radius:0.2rem;vertical-align:-0.1rem;background:#61d8cf;"&gt;&lt;/span&gt;<i>#61d8cf</i>
                            </td>
                        </tr>
                        <tr>
                            <td>4</td>
                            <td><i>--p-chart-color-4</i></td>
                            <td>
                                &lt;span style="display:inline-block;width:0.75rem;height:0.75rem;margin-right:0.4rem;border:1px solid rgb(0 0 0 / 0.14);border-radius:0.2rem;vertical-align:-0.1rem;background:#7c8cff;"&gt;&lt;/span&gt;<i>#7c8cff</i>
                            </td>
                            <td>
                                &lt;span style="display:inline-block;width:0.75rem;height:0.75rem;margin-right:0.4rem;border:1px solid rgb(0 0 0 / 0.14);border-radius:0.2rem;vertical-align:-0.1rem;background:#909dff;"&gt;&lt;/span&gt;<i>#909dff</i>
                            </td>
                        </tr>
                        <tr>
                            <td>5</td>
                            <td><i>--p-chart-color-5</i></td>
                            <td>
                                &lt;span style="display:inline-block;width:0.75rem;height:0.75rem;margin-right:0.4rem;border:1px solid rgb(0 0 0 / 0.14);border-radius:0.2rem;vertical-align:-0.1rem;background:#c084fc;"&gt;&lt;/span&gt;<i>#c084fc</i>
                            </td>
                            <td>
                                &lt;span style="display:inline-block;width:0.75rem;height:0.75rem;margin-right:0.4rem;border:1px solid rgb(0 0 0 / 0.14);border-radius:0.2rem;vertical-align:-0.1rem;background:#cc99fd;"&gt;&lt;/span&gt;<i>#cc99fd</i>
                            </td>
                        </tr>
                        <tr>
                            <td>6</td>
                            <td><i>--p-chart-color-6</i></td>
                            <td>
                                &lt;span style="display:inline-block;width:0.75rem;height:0.75rem;margin-right:0.4rem;border:1px solid rgb(0 0 0 / 0.14);border-radius:0.2rem;vertical-align:-0.1rem;background:#ff6fae;"&gt;&lt;/span&gt;<i>#ff6fae</i>
                            </td>
                            <td>
                                &lt;span style="display:inline-block;width:0.75rem;height:0.75rem;margin-right:0.4rem;border:1px solid rgb(0 0 0 / 0.14);border-radius:0.2rem;vertical-align:-0.1rem;background:#ff82ba;"&gt;&lt;/span&gt;<i>#ff82ba</i>
                            </td>
                        </tr>
                        <tr>
                            <td>7</td>
                            <td><i>--p-chart-color-7</i></td>
                            <td>
                                &lt;span style="display:inline-block;width:0.75rem;height:0.75rem;margin-right:0.4rem;border:1px solid rgb(0 0 0 / 0.14);border-radius:0.2rem;vertical-align:-0.1rem;background:#9ccc3c;"&gt;&lt;/span&gt;<i>#9ccc3c</i>
                            </td>
                            <td>
                                &lt;span style="display:inline-block;width:0.75rem;height:0.75rem;margin-right:0.4rem;border:1px solid rgb(0 0 0 / 0.14);border-radius:0.2rem;vertical-align:-0.1rem;background:#aad64c;"&gt;&lt;/span&gt;<i>#aad64c</i>
                            </td>
                        </tr>
                        <tr>
                            <td>8</td>
                            <td><i>--p-chart-color-8</i></td>
                            <td>
                                &lt;span style="display:inline-block;width:0.75rem;height:0.75rem;margin-right:0.4rem;border:1px solid rgb(0 0 0 / 0.14);border-radius:0.2rem;vertical-align:-0.1rem;background:#ff7a66;"&gt;&lt;/span&gt;<i>#ff7a66</i>
                            </td>
                            <td>
                                &lt;span style="display:inline-block;width:0.75rem;height:0.75rem;margin-right:0.4rem;border:1px solid rgb(0 0 0 / 0.14);border-radius:0.2rem;vertical-align:-0.1rem;background:#ff8b76;"&gt;&lt;/span&gt;<i>#ff8b76</i>
                            </td>
                        </tr>
                        <tr>
                            <td>9</td>
                            <td><i>--p-chart-color-9</i></td>
                            <td>
                                &lt;span style="display:inline-block;width:0.75rem;height:0.75rem;margin-right:0.4rem;border:1px solid rgb(0 0 0 / 0.14);border-radius:0.2rem;vertical-align:-0.1rem;background:#36b7d6;"&gt;&lt;/span&gt;<i>#36b7d6</i>
                            </td>
                            <td>
                                &lt;span style="display:inline-block;width:0.75rem;height:0.75rem;margin-right:0.4rem;border:1px solid rgb(0 0 0 / 0.14);border-radius:0.2rem;vertical-align:-0.1rem;background:#4fc7df;"&gt;&lt;/span&gt;<i>#4fc7df</i>
                            </td>
                        </tr>
                        <tr>
                            <td>10</td>
                            <td><i>--p-chart-color-10</i></td>
                            <td>
                                &lt;span style="display:inline-block;width:0.75rem;height:0.75rem;margin-right:0.4rem;border:1px solid rgb(0 0 0 / 0.14);border-radius:0.2rem;vertical-align:-0.1rem;background:#a78bfa;"&gt;&lt;/span&gt;<i>#a78bfa</i>
                            </td>
                            <td>
                                &lt;span style="display:inline-block;width:0.75rem;height:0.75rem;margin-right:0.4rem;border:1px solid rgb(0 0 0 / 0.14);border-radius:0.2rem;vertical-align:-0.1rem;background:#b79dfb;"&gt;&lt;/span&gt;<i>#b79dfb</i>
                            </td>
                        </tr>
                        <tr>
                            <td>11</td>
                            <td><i>--p-chart-color-11</i></td>
                            <td>
                                &lt;span style="display:inline-block;width:0.75rem;height:0.75rem;margin-right:0.4rem;border:1px solid rgb(0 0 0 / 0.14);border-radius:0.2rem;vertical-align:-0.1rem;background:#5ccf9f;"&gt;&lt;/span&gt;<i>#5ccf9f</i>
                            </td>
                            <td>
                                &lt;span style="display:inline-block;width:0.75rem;height:0.75rem;margin-right:0.4rem;border:1px solid rgb(0 0 0 / 0.14);border-radius:0.2rem;vertical-align:-0.1rem;background:#6fdaad;"&gt;&lt;/span&gt;<i>#6fdaad</i>
                            </td>
                        </tr>
                        <tr>
                            <td>12</td>
                            <td><i>--p-chart-color-12</i></td>
                            <td>
                                &lt;span style="display:inline-block;width:0.75rem;height:0.75rem;margin-right:0.4rem;border:1px solid rgb(0 0 0 / 0.14);border-radius:0.2rem;vertical-align:-0.1rem;background:#fda4af;"&gt;&lt;/span&gt;<i>#fda4af</i>
                            </td>
                            <td>
                                &lt;span style="display:inline-block;width:0.75rem;height:0.75rem;margin-right:0.4rem;border:1px solid rgb(0 0 0 / 0.14);border-radius:0.2rem;vertical-align:-0.1rem;background:#fdb1bb;"&gt;&lt;/span&gt;<i>#fdb1bb</i>
                            </td>
                        </tr>
                        <tr>
                            <td>13</td>
                            <td><i>--p-chart-color-13</i></td>
                            <td>
                                &lt;span style="display:inline-block;width:0.75rem;height:0.75rem;margin-right:0.4rem;border:1px solid rgb(0 0 0 / 0.14);border-radius:0.2rem;vertical-align:-0.1rem;background:#94a3b8;"&gt;&lt;/span&gt;<i>#94a3b8</i>
                            </td>
                            <td>
                                &lt;span style="display:inline-block;width:0.75rem;height:0.75rem;margin-right:0.4rem;border:1px solid rgb(0 0 0 / 0.14);border-radius:0.2rem;vertical-align:-0.1rem;background:#a8b5c6;"&gt;&lt;/span&gt;<i>#a8b5c6</i>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <p>For SVG, override these variables where the chart lives. Use <i>light-dark()</i> when the page owns <i>color-scheme</i>.</p>
            <p>For Canvas, pass the same palette through <i>theme.series</i>.</p>
        </app-docsectiontext>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ThemingDefaultPaletteDoc {}
