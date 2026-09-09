/**
 *
 * TextEditor Design Tokens
 *
 * @module texteditor
 *
 */

import type { ColorScheme as CS, DesignTokens, ExtendedCSS, ExtendedTokens } from '..';

/**
 * Design Token Sections
 */
export declare namespace TextEditorTokenSections {
    interface Root {
        /**
         * Background of root
         *
         * @designToken texteditor.background
         */
        background?: string;
        /**
         * Color of root
         *
         * @designToken texteditor.color
         */
        color?: string;
        /**
         * Border color of root, also used for the toolbar separator, table cells and horizontal rules
         *
         * @designToken texteditor.border.color
         */
        borderColor?: string;
        /**
         * Border radius of root, overlays, code blocks, images and chips
         *
         * @designToken texteditor.border.radius
         */
        borderRadius?: string;
        /**
         * Transition duration of root
         *
         * @designToken texteditor.transition.duration
         */
        transitionDuration?: string;
        /**
         * Opacity of the disabled editor and of disabled toolbar items
         *
         * @designToken texteditor.disabled.opacity
         */
        disabledOpacity?: string;
    }
    interface Toolbar {
        /**
         * Background of the toolbar
         *
         * @designToken texteditor.toolbar.background
         */
        background?: string;
    }
    interface Content {
        /**
         * Padding of the editable region
         *
         * @designToken texteditor.content.padding
         */
        padding?: string;
    }
    interface Heading {
        /**
         * Color of headings inside the content
         *
         * @designToken texteditor.heading.color
         */
        color?: string;
    }
    interface Muted {
        /**
         * Color of placeholders, toolbar icons and low-emphasis elements
         *
         * @designToken texteditor.muted.color
         */
        color?: string;
    }
    interface Emphasis {
        /**
         * Background of code blocks, blockquotes, active toolbar items and table headers
         *
         * @designToken texteditor.emphasis.background
         */
        background?: string;
        /**
         * Color of emphasized elements, such as a hovered toolbar item
         *
         * @designToken texteditor.emphasis.color
         */
        color?: string;
    }
    interface Highlight {
        /**
         * Background of mention chips and highlighted elements
         *
         * @designToken texteditor.highlight.background
         */
        background?: string;
        /**
         * Color of text inside highlighted elements
         *
         * @designToken texteditor.highlight.color
         */
        color?: string;
    }
    interface Accent {
        /**
         * Accent color for links, active cell outlines, blockquote borders, drop indicators,
         * checkboxes and mention markers
         *
         * @designToken texteditor.accent.color
         */
        color?: string;
        /**
         * Contrast color paired with the accent, such as the checkbox checkmark
         *
         * @designToken texteditor.accent.contrast.color
         */
        contrastColor?: string;
    }
    interface Danger {
        /**
         * Color of destructive actions such as delete operations
         *
         * @designToken texteditor.danger.color
         */
        color?: string;
    }
    interface Selection {
        /**
         * Background of the text selection and of the preserved selection highlight
         *
         * @designToken texteditor.selection.background
         */
        background?: string;
        /**
         * Color of selected text
         *
         * @designToken texteditor.selection.color
         */
        color?: string;
    }
    interface Overlay {
        /**
         * Background of popover menus, context toolbars and overlay panels
         *
         * @designToken texteditor.overlay.background
         */
        background?: string;
        /**
         * Box shadow of popover menus, context toolbars and overlay panels
         *
         * @designToken texteditor.overlay.shadow
         */
        shadow?: string;
    }
    interface Code {
        /**
         * Font family of inline code and code blocks
         *
         * @designToken texteditor.code.font.family
         */
        fontFamily?: string;
    }
    interface Focus {
        /**
         * Width of the focus ring
         *
         * @designToken texteditor.focus.ring.width
         */
        ringWidth?: string;
        /**
         * Style of the focus ring
         *
         * @designToken texteditor.focus.ring.style
         */
        ringStyle?: string;
        /**
         * Color of the focus ring
         *
         * @designToken texteditor.focus.ring.color
         */
        ringColor?: string;
        /**
         * Offset of the focus ring
         *
         * @designToken texteditor.focus.ring.offset
         */
        ringOffset?: string;
    }

    type ColorScheme = CS<TextEditorDesignTokens>;
    type CSS = ExtendedCSS;
    type Extend = ExtendedTokens;
}

/**
 * Design Tokens
 */
export interface TextEditorDesignTokens extends ExtendedCSS, DesignTokens<TextEditorDesignTokens> {
    /**
     * Used to pass tokens of the root section
     */
    root?: TextEditorTokenSections.Root;
    /**
     * Used to pass tokens of the toolbar section
     */
    toolbar?: TextEditorTokenSections.Toolbar;
    /**
     * Used to pass tokens of the content section
     */
    content?: TextEditorTokenSections.Content;
    /**
     * Used to pass tokens of the heading section
     */
    heading?: TextEditorTokenSections.Heading;
    /**
     * Used to pass tokens of the muted section
     */
    muted?: TextEditorTokenSections.Muted;
    /**
     * Used to pass tokens of the emphasis section
     */
    emphasis?: TextEditorTokenSections.Emphasis;
    /**
     * Used to pass tokens of the highlight section
     */
    highlight?: TextEditorTokenSections.Highlight;
    /**
     * Used to pass tokens of the accent section
     */
    accent?: TextEditorTokenSections.Accent;
    /**
     * Used to pass tokens of the danger section
     */
    danger?: TextEditorTokenSections.Danger;
    /**
     * Used to pass tokens of the selection section
     */
    selection?: TextEditorTokenSections.Selection;
    /**
     * Used to pass tokens of the overlay section
     */
    overlay?: TextEditorTokenSections.Overlay;
    /**
     * Used to pass tokens of the code section
     */
    code?: TextEditorTokenSections.Code;
    /**
     * Used to pass tokens of the focus section
     */
    focus?: TextEditorTokenSections.Focus;
    /**
     * Used to pass tokens of the color scheme section
     */
    colorScheme?: CS<TextEditorDesignTokens>;
}
