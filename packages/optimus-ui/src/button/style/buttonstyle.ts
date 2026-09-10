import { Injectable } from '@angular/core';
import { style } from '@openng/optimus-ui-styles/button';
import { BaseStyle } from '@openng/optimus-ui/base';

/*
 * Shared by `icon` and `spinnerIcon` so the built-in spinner lands in the same
 * slot as a regular icon without either definition drifting from the other.
 */
const iconPositionClasses = ({ instance }) => ({
    [`p-button-icon-${instance.iconPos || instance.buttonProps?.iconPos}`]: instance.label || instance.buttonProps?.label,
    'p-button-icon-left': ((instance.iconPos === 'left' || instance.buttonProps?.iconPos === 'left') && instance.label) || instance.buttonProps?.label,
    'p-button-icon-right': ((instance.iconPos === 'right' || instance.buttonProps?.iconPos === 'right') && instance.label) || instance.buttonProps?.label,
    'p-button-icon-top': ((instance.iconPos === 'top' || instance.buttonProps?.iconPos === 'top') && instance.label) || instance.buttonProps?.label,
    'p-button-icon-bottom': ((instance.iconPos === 'bottom' || instance.buttonProps?.iconPos === 'bottom') && instance.label) || instance.buttonProps?.label
});

const classes = {
    root: ({ instance }) => [
        'p-button p-component',
        {
            'p-button-icon-only': instance.hasIcon && !instance.label && !instance.buttonProps?.label && !instance.badge,
            'p-button-vertical': (instance.iconPos === 'top' || instance.iconPos === 'bottom') && instance.label,
            'p-button-loading': instance.loading || instance.buttonProps?.loading,
            'p-button-link': instance.link || instance.buttonProps?.link,
            [`p-button-${instance.severity || instance.buttonProps?.severity}`]: instance.severity || instance.buttonProps?.severity,
            'p-button-raised': instance.raised || instance.buttonProps?.raised,
            'p-button-rounded': instance.rounded || instance.buttonProps?.rounded,
            'p-button-text': instance.text || instance.variant === 'text' || instance.buttonProps?.text || instance.buttonProps?.variant === 'text',
            'p-button-outlined': instance.outlined || instance.variant === 'outlined' || instance.buttonProps?.outlined || instance.buttonProps?.variant === 'outlined',
            'p-button-sm': instance.size === 'small' || instance.buttonProps?.size === 'small',
            'p-button-lg': instance.size === 'large' || instance.buttonProps?.size === 'large',
            'p-button-plain': instance.plain || instance.buttonProps?.plain,
            'p-button-fluid': instance.hasFluid
        }
    ],
    loadingIcon: 'p-button-loading-icon',
    icon: ({ instance }) => ['p-button-icon', iconPositionClasses({ instance }), instance.icon, instance.buttonProps?.icon],
    // `cx('icon')` resolves to a class string, so iterating it with
    // Object.entries walked the characters and emitted one class per index.
    spinnerIcon: ({ instance }) => ['p-button-loading-icon', iconPositionClasses({ instance })],
    label: 'p-button-label'
};

@Injectable()
export class ButtonStyle extends BaseStyle {
    name = 'button';

    style = style;

    classes = classes;
}

/**
 *
 * Button is an extension to standard button element with icons and theming.
 *
 * [Live Demo](https://optimus.openng.org/button/)
 *
 * @module buttonstyle
 *
 */
export enum ButtonClasses {
    /**
     * Class name of the root element
     */
    root = 'p-button',
    /**
     * Class name of the loading icon element
     */
    loadingIcon = 'p-button-loading-icon',
    /**
     * Class name of the icon element
     */
    icon = 'p-button-icon',
    /**
     * Class name of the label element
     */
    label = 'p-button-label'
}

export interface ButtonStyle extends BaseStyle {}
