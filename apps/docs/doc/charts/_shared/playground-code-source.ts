/**
 * What a playground publishes so the page can show the code its controls produce.
 *
 * A playground whose output could not be copied would be a toy: the point of moving the sliders is
 * to arrive at a configuration worth keeping, so the template that configuration corresponds to is
 * part of the demo rather than a nice extra.
 */
import type { Signal } from '@angular/core';

/** Implemented by every playground demo. */
export interface PlaygroundCodeSource {
    /**
     * The template the current control values correspond to.
     */
    readonly generatedCode: Signal<string>;
}
