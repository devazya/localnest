/**
 * segment1Entrance.js
 * Shared page-entrance choreography for Home Segment 1 (§10 Motion Design):
 * header → greeting → search → Friend section → module row, each rising
 * 12px while fading in, with a 60ms stagger between groups. Centralized
 * here (matching the existing animations/ folder convention alongside
 * heroVariants.js, cardVariants.js) instead of repeating the transition
 * object across five components.
 *
 * `reduced` collapses to a flat 150ms opacity-only fade with no y
 * translation, per §12 accessibility (prefers-reduced-motion).
 */
export function fadeRise(index, reduced = false) {
  if (reduced) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.15 },
    };
  }
  return {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: index * 0.06 },
  };
}
