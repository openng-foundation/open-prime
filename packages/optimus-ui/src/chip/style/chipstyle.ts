import { Injectable } from '@angular/core';
import { style } from '@openng/optimus-ui-styles/chip';
import { BaseStyle } from '@openng/optimus-ui/base';

const inlineStyles = {
    root: ({ instance }) => ({
        display: !instance.visible ? 'none' : null
    })
};

const classes = {
    root: ({ instance }) => [
        'p-chip p-component',
        {
            'p-disabled': instance.disabled
        }
    ],
    image: 'p-chip-image',
    icon: 'p-chip-icon',
    label: 'p-chip-label',
    removeIcon: 'p-chip-remove-icon'
};

@Injectable()
export class ChipStyle extends BaseStyle {
    name = 'chip';

    style = style;

    classes = classes;

    inlineStyles = inlineStyles;
}

/**
 *
 * Chip represents people using icons, labels and images.
 *
 * [Live Demo](https://optimus.openng.org/chip)
 *
 * @module chipstyle
 *
 */
export enum ChipClasses {
    /**
     * Class name of the root element
     */
    root = 'p-chip',
    /**
     * Class name of the image element
     */
    image = 'p-chip-image',
    /**
     * Class name of the icon element
     */
    icon = 'p-chip-icon',
    /**
     * Class name of the label element
     */
    label = 'p-chip-label',
    /**
     * Class name of the remove icon element
     */
    removeIcon = 'p-chip-remove-icon'
}

export interface ChipStyle extends BaseStyle {}
