import type { TextEditorDesignTokens, TextEditorTokenSections } from '@openng/optimus-ui-themes/types/texteditor';

export const root: TextEditorTokenSections.Root = {
    background: '{content.background}',
    color: '{text.color}',
    borderColor: '{content.border.color}',
    borderRadius: '{border.radius.md}',
    transitionDuration: '{transition.duration}',
    disabledOpacity: '0.6'
};

export const toolbar: TextEditorTokenSections.Toolbar = {
    background: '{content.background}'
};

export const content: TextEditorTokenSections.Content = {
    padding: '1rem'
};

export const heading: TextEditorTokenSections.Heading = {
    color: '{text.color}'
};

export const muted: TextEditorTokenSections.Muted = {
    color: '{text.muted.color}'
};

export const emphasis: TextEditorTokenSections.Emphasis = {
    background: '{content.hover.background}',
    color: '{text.hover.color}'
};

export const highlight: TextEditorTokenSections.Highlight = {
    background: '{highlight.background}',
    color: '{highlight.color}'
};

export const accent: TextEditorTokenSections.Accent = {
    color: '{primary.color}',
    contrastColor: '{primary.contrast.color}'
};

export const danger: TextEditorTokenSections.Danger = {
    color: '{red.500}'
};

export const selection: TextEditorTokenSections.Selection = {
    // Colour-mixed rather than a flat tint: the selection has to read over a heading, a code block
    // and a table cell, and only a translucent wash keeps the text underneath legible in all three.
    background: 'color-mix(in srgb, {primary.color} 25%, transparent)',
    color: 'inherit'
};

export const overlay: TextEditorTokenSections.Overlay = {
    background: '{overlay.popover.background}',
    shadow: '{overlay.popover.shadow}'
};

export const code: TextEditorTokenSections.Code = {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
};

export const focus: TextEditorTokenSections.Focus = {
    ringWidth: '{focus.ring.width}',
    ringStyle: '{focus.ring.style}',
    ringColor: '{primary.color}',
    ringOffset: '{focus.ring.offset}'
};

export const colorScheme: TextEditorDesignTokens['colorScheme'] = {
    light: {
        danger: {
            color: '{red.500}'
        }
    },
    dark: {
        danger: {
            color: '{red.400}'
        }
    }
};

export default {
    root,
    toolbar,
    content,
    heading,
    muted,
    emphasis,
    highlight,
    accent,
    danger,
    selection,
    overlay,
    code,
    focus,
    colorScheme
} satisfies TextEditorDesignTokens;
