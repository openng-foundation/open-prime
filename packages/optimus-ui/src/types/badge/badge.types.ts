import type { PassThrough, PassThroughOption } from '@openng/optimus-ui/api';

/**
 * Custom passthrough(pt) options.
 * @see {@link Badge.pt}
 * @group Interface
 */

export interface BadgePassThroughOptions<I = unknown> {
    /**
     * Used to pass attributes to the host's DOM element.
     */
    host?: PassThroughOption<HTMLElement, I>;
    /**
     * Used to pass attributes to the root's DOM element.
     */
    root?: PassThroughOption<HTMLElement, I>;
}

/**
 * Defines valid pass-through options in Badge component.
 * @see {@link BadgePassThroughOptions}
 *
 * @template I Type of instance.
 */
export type BadgePassThrough<I = unknown> = PassThrough<I, BadgePassThroughOptions<I>>;

/**
 * Severity levels of the badge, also shared by the components that render one or follow the same severities, such as Tag, OverlayBadge and FileUpload.
 * @group Types
 */
export type BadgeSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast';
