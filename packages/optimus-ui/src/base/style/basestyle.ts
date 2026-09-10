import { inject, Injectable } from '@angular/core';
import { css as Css, dt, Theme } from '@openng/optimus-ui-styled';
import { style as base_style } from '@openng/optimus-ui-styles/base';
import { minifyCSS, resolve } from '@openng/optimus-ui-utils';
import { UseStyle } from '@openng/optimus-ui/usestyle';

const css = /*css*/ `
.p-hidden-accessible {
    border: 0;
    clip: rect(0 0 0 0);
    height: 1px;
    margin: -1px;
    overflow: hidden;
    padding: 0;
    position: absolute;
    width: 1px;
}

.p-hidden-accessible input,
.p-hidden-accessible select {
    transform: scale(0);
}

.p-overflow-hidden {
    overflow: hidden;
    padding-right: dt('scrollbar.width');
}

/*
 * A busy indicator is status feedback, not decoration, so a reduced motion
 * preference has to dampen it instead of removing it. Rotation is swapped for a
 * cross fade, which still reads as "working" without the continuous movement the
 * preference asks us to avoid.
 *
 * The compound selectors are deliberate. @openng/icons ships its own
 * prefers-reduced-motion rule for .pi-spin that collapses the animation to a
 * single 1ms iteration, which would otherwise freeze every font icon loading
 * indicator for the whole duration of the load. Matching the loading icon class
 * together with .pi-spin outranks that rule on specificity, so the outcome no
 * longer depends on stylesheet order.
 */
@media (prefers-reduced-motion: reduce) {
    .p-icon.p-icon-spin,
    .p-button-loading-icon .p-icon-spin,
    .p-button-loading-icon.pi-spin,
    .p-select-loading-icon.pi-spin,
    .p-multiselect-loading-icon.pi-spin,
    .p-cascadeselect-loading-icon.pi-spin,
    .p-dataview-loading-icon.pi-spin,
    .p-tree-loading-icon.pi-spin,
    .p-treetable-loading-icon.pi-spin,
    .p-datatable-loading-icon.pi-spin {
        animation: p-busy-fade 1.6s ease-in-out infinite;
    }
}

@keyframes p-busy-fade {
    0%,
    100% {
        opacity: 1;
    }
    50% {
        opacity: 0.35;
    }
}
`;

@Injectable({ providedIn: 'root' })
export class BaseStyle {
    name = 'base';

    useStyle: UseStyle = inject(UseStyle);

    css: string | undefined = undefined;

    style: any = undefined;

    classes = {};

    inlineStyles = {};

    load = (style, options = {}, transform = (cs) => cs) => {
        const computedStyle = transform(Css`${resolve(style, { dt })}`);

        return computedStyle ? this.useStyle.use(minifyCSS(computedStyle), { name: this.name, ...options }) : {};
    };

    loadCSS = (options = {}) => {
        return this.load(this.css, options);
    };

    loadStyle = (options: any = {}, style: string = '') => {
        return this.load(this.style, options, (computedStyle = '') => Theme.transformCSS(options.name || this.name, `${computedStyle}${Css`${style}`}`));
    };

    loadBaseCSS = (options = {}) => {
        return this.load(css, options);
    };

    loadBaseStyle = (options: any = {}, style: string = '') => {
        return this.load(base_style, options, (computedStyle = '') => Theme.transformCSS(options.name || this.name, `${computedStyle}${Css`${style}`}`));
    };

    getCommonTheme = (params?) => {
        return Theme.getCommon(this.name, params);
    };

    getComponentTheme = (params) => {
        return Theme.getComponent(this.name, params);
    };

    getPresetTheme = (preset, selector, params) => {
        return Theme.getCustomPreset(this.name, preset, selector, params);
    };

    getLayerOrderThemeCSS = () => {
        return Theme.getLayerOrderCSS(this.name);
    };

    getStyleSheet = (extendedCSS = '', props = {}) => {
        if (this.css) {
            const _css = resolve(this.css, { dt });
            const _style = minifyCSS(Css`${_css}${extendedCSS}`);
            const _props = Object.entries(props)
                .reduce<any>((acc, [k, v]) => acc.push(`${k}="${v}"`) && acc, [])
                .join(' ');

            return `<style type="text/css" data-optimus-style-id="${this.name}" ${_props}>${_style}</style>`;
        }

        return '';
    };

    getCommonThemeStyleSheet = (params, props = {}) => {
        return Theme.getCommonStyleSheet(this.name, params, props);
    };

    getThemeStyleSheet = (params, props = {}) => {
        let css = [Theme.getStyleSheet(this.name, params, props)];

        if (this.style) {
            const name = this.name === 'base' ? 'global-style' : `${this.name}-style`;
            const _css = Css`${resolve(this.style, { dt })}`;
            const _style = minifyCSS(Theme.transformCSS(name, _css as string));
            const _props = Object.entries(props)
                .reduce<any>((acc, [k, v]) => acc.push(`${k}="${v}"`) && acc, [])
                .join(' ');

            css.push(`<style type="text/css" data-optimus-style-id="${name}" ${_props}>${_style}</style>`);
        }

        return css.join('');
    };
}
