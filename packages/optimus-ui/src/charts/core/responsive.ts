/**
 * The responsive helper a render context carries.
 *
 * A custom surface -- an annotation, a centre label -- has to scale with the chart the same way the
 * chart's own text does, and it has no other way to know how small the container currently is. The
 * tier itself comes from {@link responsiveTier}, so "small" means the same thing here as it does to
 * the title and the axis labels.
 */
import type { ResponsiveContext, ResponsiveTier } from '@openng/optimus-ui/types/charts';

/** The tiers in order, smallest first, which is the order `pick` falls back through. */
const TIERS: readonly ResponsiveTier[] = ['xs', 'sm', 'md', 'lg'];

/**
 * Builds the picker for a tier.
 *
 * `pick` walks *down* from the current tier to the smallest one that has a value, so a map naming
 * only `xs` and `md` still answers at `sm` and `lg`. Falling upward instead would make
 * `{ xs: 9, md: 13 }` jump to 13 the moment the chart left the extra-small tier, which is not what
 * "scale with the container" means.
 */
export function responsiveContext(tier: ResponsiveTier): ResponsiveContext {
    return {
        tier,
        pick: <T>(values: Partial<Record<ResponsiveTier, T>>): T => {
            const position = TIERS.indexOf(tier);

            for (let i = position; i >= 0; i--) {
                const value = values[TIERS[i]];

                if (value !== undefined) return value;
            }

            // Nothing at or below the current tier, so the smallest value given is the only answer
            // that is not a guess.
            for (const candidate of TIERS) {
                const value = values[candidate];

                if (value !== undefined) return value;
            }

            return undefined as T;
        }
    };
}
