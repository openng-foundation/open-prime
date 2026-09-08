import { isEmpty, isNotEmpty, isObject, matchRegex, minifyCSS, omit, resolve } from '@openng/optimus-ui-utils/object';
import { dt, toVariables } from '../helpers/index';
import { CALC_REGEX, EXPR_REGEX, getRule, toTokenKey, VAR_REGEX } from './sharedUtils';

export default {
    regex: {
        rules: {
            class: {
                pattern: /^\.([a-zA-Z][\w-]*)$/,
                resolve(value: string) {
                    return { type: 'class', selector: value, matched: this.pattern.test(value.trim()) };
                }
            },
            attr: {
                pattern: /^\[(.*)\]$/,
                resolve(value: string) {
                    return { type: 'attr', selector: `:root${value},:host${value}`, matched: this.pattern.test(value.trim()) };
                }
            },
            media: {
                pattern: /^@media (.*)$/,
                resolve(value: string) {
                    return { type: 'media', selector: value, matched: this.pattern.test(value.trim()) };
                }
            },
            system: {
                pattern: /^system$/,
                resolve(value: string) {
                    return { type: 'system', selector: '@media (prefers-color-scheme: dark)', matched: this.pattern.test(value.trim()) };
                }
            },
            custom: {
                resolve(value: string) {
                    return { type: 'custom', selector: value, matched: true };
                }
            }
        },
        resolve(value: any) {
            const rules = Object.keys(this.rules)
                .filter((k) => k !== 'custom')
                .map((r) => (this.rules as any)[r]);

            return [value].flat().map((v) => rules.map((r) => r.resolve(v)).find((rr) => rr.matched) ?? this.rules.custom.resolve(v));
        }
    },
    _toVariables(theme: any, options: any) {
        return toVariables(theme, { prefix: options?.prefix });
    },
    getCommon({ name = '', theme = {}, params, set, defaults }: any) {
        const { preset, options } = theme;
        let primitive_css, primitive_tokens, semantic_css, semantic_tokens, global_css, global_tokens, style;

        // @todo - check if options is not empty
        if (isNotEmpty(preset) && options.transform !== 'strict') {
            const { primitive, semantic, extend } = preset;
            const colorScheme = semantic?.colorScheme;
            const sRest: any = omit(semantic, 'colorScheme');
            const eColorScheme = extend?.colorScheme;
            const eRest: any = omit(extend, 'colorScheme');
            const dark = colorScheme?.dark;
            const csRest: any = omit(colorScheme, 'dark');
            const eDark = eColorScheme?.dark;
            const ecsRest: any = omit(eColorScheme, 'dark');
            const prim_var: any = isNotEmpty(primitive) ? this._toVariables({ primitive }, options) : {};
            const sRest_var: any = isNotEmpty(sRest) ? this._toVariables({ semantic: sRest }, options) : {};
            const csRest_var: any = isNotEmpty(csRest) ? this._toVariables({ light: csRest }, options) : {};
            const csDark_var: any = isNotEmpty(dark) ? this._toVariables({ dark }, options) : {};
            const eRest_var: any = isNotEmpty(eRest) ? this._toVariables({ semantic: eRest }, options) : {};
            const ecsRest_var: any = isNotEmpty(ecsRest) ? this._toVariables({ light: ecsRest }, options) : {};
            const ecsDark_var: any = isNotEmpty(eDark) ? this._toVariables({ dark: eDark }, options) : {};

            const [prim_css, prim_tokens] = [prim_var.declarations ?? '', prim_var.tokens];
            const [sRest_css, sRest_tokens] = [sRest_var.declarations ?? '', sRest_var.tokens || []];
            const [csRest_css, csRest_tokens] = [csRest_var.declarations ?? '', csRest_var.tokens || []];
            const [csDark_css, csDark_tokens] = [csDark_var.declarations ?? '', csDark_var.tokens || []];
            const [eRest_css, eRest_tokens] = [eRest_var.declarations ?? '', eRest_var.tokens || []];
            const [ecsRest_css, ecsRest_tokens] = [ecsRest_var.declarations ?? '', ecsRest_var.tokens || []];
            const [ecsDark_css, ecsDark_tokens] = [ecsDark_var.declarations ?? '', ecsDark_var.tokens || []];

            primitive_css = this.transformCSS(name, prim_css, 'light', 'variable', options, set, defaults);
            primitive_tokens = prim_tokens;

            const semantic_light_css = this.transformCSS(name, `${csRest_css}${sRest_css}`, 'light', 'variable', options, set, defaults);
            const semantic_dark_css = this.transformCSS(name, `${csDark_css}`, 'dark', 'variable', options, set, defaults);

            semantic_css = `${semantic_light_css}${semantic_dark_css}`;
            semantic_tokens = [...new Set([...sRest_tokens, ...csRest_tokens, ...csDark_tokens])];

            const global_light_css = this.transformCSS(name, `${ecsRest_css}${eRest_css}color-scheme:light`, 'light', 'variable', options, set, defaults);
            const global_dark_css = this.transformCSS(name, `${ecsDark_css}color-scheme:dark`, 'dark', 'variable', options, set, defaults);

            global_css = `${global_light_css}${global_dark_css}`;
            global_tokens = [...new Set([...eRest_tokens, ...ecsRest_tokens, ...ecsDark_tokens])];

            style = resolve(preset.css, { dt }) as string;
        }

        return {
            primitive: {
                css: primitive_css,
                tokens: primitive_tokens
            },
            semantic: {
                css: semantic_css,
                tokens: semantic_tokens
            },
            global: {
                css: global_css,
                tokens: global_tokens
            },
            style
        };
    },
    getPreset({ name = '', preset = {}, options, params, set, defaults, selector }: any) {
        let p_css, p_tokens, p_style;

        if (isNotEmpty(preset) && options.transform !== 'strict') {
            const _name = name.replace('-directive', '');
            const { colorScheme, extend, css } = preset;
            const vRest: any = omit(preset, 'colorScheme', 'extend', 'css');
            const eColorScheme = extend?.colorScheme;
            const evRest: any = omit(extend, 'colorScheme');
            const dark = colorScheme?.dark;
            const csRest: any = omit(colorScheme, 'dark');
            const ecsDark = eColorScheme?.dark;
            const ecsRest: any = omit(eColorScheme, 'dark');
            const vRest_var: any = isNotEmpty(vRest) ? this._toVariables({ [_name]: { ...vRest, ...evRest } }, options) : {};
            const csRest_var: any = isNotEmpty(csRest) ? this._toVariables({ [_name]: { ...csRest, ...ecsRest } }, options) : {};
            const csDark_var: any = isNotEmpty(dark) ? this._toVariables({ [_name]: { ...dark, ...ecsDark } }, options) : {};

            const [vRest_css, vRest_tokens] = [vRest_var.declarations ?? '', vRest_var.tokens || []];
            const [csRest_css, csRest_tokens] = [csRest_var.declarations ?? '', csRest_var.tokens || []];
            const [csDark_css, csDark_tokens] = [csDark_var.declarations ?? '', csDark_var.tokens || []];

            const light_variable_css = this.transformCSS(_name, `${csRest_css}${vRest_css}`, 'light', 'variable', options, set, defaults, selector);
            const dark_variable_css = this.transformCSS(_name, csDark_css, 'dark', 'variable', options, set, defaults, selector);

            p_css = `${light_variable_css}${dark_variable_css}`;
            p_tokens = [...new Set([...vRest_tokens, ...csRest_tokens, ...csDark_tokens])];

            p_style = resolve(css, { dt }) as string;
        }

        return {
            css: p_css,
            tokens: p_tokens,
            style: p_style
        };
    },
    getPresetC({ name = '', theme = {}, params, set, defaults }: any) {
        const { preset, options } = theme;
        const cPreset = preset?.components?.[name];

        return this.getPreset({ name, preset: cPreset, options, params, set, defaults });
    },
    // @deprecated - use getPresetC instead
    getPresetD({ name = '', theme = {}, params, set, defaults }: any) {
        const dName = name.replace('-directive', '');
        const { preset, options } = theme;
        const dPreset = preset?.components?.[dName] || preset?.directives?.[dName];

        return this.getPreset({ name: dName, preset: dPreset, options, params, set, defaults });
    },
    applyDarkColorScheme(options: any) {
        return !(options.darkModeSelector === 'none' || options.darkModeSelector === false);
    },
    getColorSchemeOption(options: any, defaults: any) {
        return this.applyDarkColorScheme(options) ? this.regex.resolve(options.darkModeSelector === true ? defaults.options.darkModeSelector : (options.darkModeSelector ?? defaults.options.darkModeSelector)) : [];
    },
    getLayerOrder(name: string, options: any = {}, params: any, defaults: any) {
        const { cssLayer } = options;

        if (cssLayer) {
            const order = resolve(cssLayer.order || cssLayer.name || 'optimus', params);

            return `@layer ${order}`;
        }

        return '';
    },
    getCommonStyleSheet({ name = '', theme = {}, params, props = {}, set, defaults }: any) {
        const common = this.getCommon({ name, theme, params, set, defaults });
        const _props = Object.entries(props)
            .reduce((acc: any, [k, v]) => acc.push(`${k}="${v}"`) && acc, [])
            .join(' ');

        return Object.entries(common || {})
            .reduce((acc: any, [key, value]) => {
                if (isObject(value) && Object.hasOwn(value, 'css')) {
                    const _css = minifyCSS((value as any).css);
                    const id = `${key}-variables`;

                    acc.push(`<style type="text/css" data-optimus-style-id="${id}" ${_props}>${_css}</style>`);
                }

                return acc;
            }, [])
            .join('');
    },
    getStyleSheet({ name = '', theme = {}, params, props = {}, set, defaults }: any) {
        const options = { name, theme, params, set, defaults };
        const preset_css = (name.includes('-directive') ? this.getPresetD(options) : this.getPresetC(options))?.css;
        const _props = Object.entries(props)
            .reduce((acc: any, [k, v]) => acc.push(`${k}="${v}"`) && acc, [])
            .join(' ');

        return preset_css ? `<style type="text/css" data-optimus-style-id="${name}-variables" ${_props}>${minifyCSS(preset_css)}</style>` : '';
    },
    createTokens(obj: any = {}, defaults: any, parentKey: string = '', parentPath: string = '', tokens: any = {}) {
        const computedFn = function (this: any, colorScheme: string, tokenPathMap: any = {}, stack: string[] = []) {
            if (stack.includes(this.path)) {
                console.warn(`Circular reference detected at ${this.path}`);

                return {
                    colorScheme,
                    path: this.path,
                    paths: tokenPathMap,
                    value: undefined
                };
            }

            stack.push(this.path);
            tokenPathMap['name'] = this.path;
            tokenPathMap['binding'] ||= {};

            let computedValue: any = this.value;

            if (typeof this.value === 'string' && EXPR_REGEX.test(this.value)) {
                const val = this.value.trim();
                const _val = val.replace(EXPR_REGEX, (v: any) => {
                    const refPath = v.slice(1, -1);
                    const refToken = this.tokens[refPath];

                    if (!refToken) {
                        console.warn(`Token not found for path: ${refPath}`);

                        return `__UNRESOLVED__`;
                    }

                    const computed = refToken.computed(colorScheme, tokenPathMap, stack);

                    if (Array.isArray(computed) && computed.length === 2) {
                        return `light-dark(${computed[0].value},${computed[1].value})`;
                    } else {
                        return computed?.value ?? `__UNRESOLVED__`;
                    }
                });

                computedValue = CALC_REGEX.test(_val.replace(VAR_REGEX, '0')) ? `calc(${_val})` : _val;
            }

            if (isEmpty(tokenPathMap['binding'])) {
                delete tokenPathMap['binding'];
            }

            stack.pop();

            return {
                colorScheme,
                path: this.path,
                paths: tokenPathMap,
                value: computedValue.includes('__UNRESOLVED__') ? undefined : computedValue
            };
        };

        const traverse = (obj: any, parentKey: string, parentPath: string) => {
            Object.entries(obj).forEach(([key, value]) => {
                const currentKey = matchRegex(key, defaults.variable.excludedKeyRegex) ? parentKey : parentKey ? `${parentKey}.${toTokenKey(key)}` : toTokenKey(key);

                const currentPath = parentPath ? `${parentPath}.${key}` : key;

                if (isObject(value)) {
                    traverse(value, currentKey, currentPath);
                } else {
                    if (!tokens[currentKey]) {
                        tokens[currentKey] = {
                            paths: [],
                            computed: (colorScheme: string, tokenPathMap: any = {}, stack: string[] = []) => {
                                if (tokens[currentKey].paths.length === 1) {
                                    return tokens[currentKey].paths[0].computed(tokens[currentKey].paths[0].scheme, tokenPathMap['binding'], stack);
                                } else if (colorScheme && colorScheme !== 'none') {
                                    for (let i = 0; i < tokens[currentKey].paths.length; i++) {
                                        const p = tokens[currentKey].paths[i];

                                        if (p.scheme === colorScheme) {
                                            return p.computed(colorScheme, tokenPathMap['binding'], stack);
                                        }
                                    }
                                }

                                return tokens[currentKey].paths.map((p: any) => p.computed(p.scheme, tokenPathMap[p.scheme], stack));
                            }
                        };
                    }

                    tokens[currentKey].paths.push({
                        path: currentPath,
                        value,
                        scheme: currentPath.includes('colorScheme.light') ? 'light' : currentPath.includes('colorScheme.dark') ? 'dark' : 'none',
                        computed: computedFn,
                        tokens
                    });
                }
            });
        };

        traverse(obj, parentKey, parentPath);

        return tokens;
    },
    getTokenValue(tokens: any, path: string, defaults: any) {
        const normalizePath = (str: string) => {
            const strArr = str.split('.');

            return strArr.filter((s) => !matchRegex(s.toLowerCase(), defaults.variable.excludedKeyRegex)).join('.');
        };

        const token = normalizePath(path);
        const colorScheme = path.includes('colorScheme.light') ? 'light' : path.includes('colorScheme.dark') ? 'dark' : undefined;
        const computedValues = [tokens[token as any]?.computed(colorScheme)].flat().filter((computed) => computed);

        return computedValues.length === 1
            ? computedValues[0].value
            : computedValues.reduce((acc = {}, computed) => {
                  const { colorScheme: cs, ...rest } = computed;

                  acc[cs] = rest;

                  return acc;
              }, undefined);
    },
    getSelectorRule(selector1: any, selector2: any, type: string, css: string) {
        return type === 'class' || type === 'attr' ? getRule(isNotEmpty(selector2) ? `${selector1}${selector2},${selector1} ${selector2}` : selector1, css) : getRule(selector1, getRule(selector2 ?? ':root,:host', css));
    },
    transformCSS(name: string, css: string, mode?: string, type?: string, options: any = {}, set?: any, defaults?: any, selector?: string) {
        if (isNotEmpty(css)) {
            const { cssLayer } = options;

            if (type !== 'style') {
                const colorSchemeOption = this.getColorSchemeOption(options, defaults);

                css =
                    mode === 'dark'
                        ? colorSchemeOption.reduce((acc, { type, selector: _selector }) => {
                              if (isNotEmpty(_selector)) {
                                  acc += _selector.includes('[CSS]') ? _selector.replace('[CSS]', css) : this.getSelectorRule(_selector, selector, type, css);
                              }

                              return acc;
                          }, '')
                        : getRule(selector ?? ':root,:host', css);
            }

            if (cssLayer) {
                const layerOptions = {
                    name: 'optimus',
                    order: 'optimus'
                };

                isObject(cssLayer) && (layerOptions.name = resolve((cssLayer as any).name, { name, type }));

                if (isNotEmpty(layerOptions.name)) {
                    css = getRule(`@layer ${layerOptions.name}`, css);
                    set?.layerNames(layerOptions.name);
                }
            }

            return css;
        }

        return '';
    }
};
