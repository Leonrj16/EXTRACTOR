import type { Variants } from "framer-motion";

/**
 * Single source of entrance animation variants — both the legacy
 * per-theme animation (`Appearance.animation`) and each block's own
 * `styleOverrides.animation` resolve through this map, so "fade" means
 * the exact same motion everywhere instead of two components drifting
 * apart with subtly different easing.
 */
export const ENTRANCE_VARIANTS: Record<string, Variants> = {
  fade: { hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } },
  slide: { hidden: { opacity: 0, x: -24 }, visible: { opacity: 1, x: 0 } },
  scale: {
    hidden: { opacity: 0, scale: 0.85 },
    visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 15 } },
  },
  // The following 6 are the Theme Engine's animation catalog
  // (themes/types.ts AnimationPreset) — added here rather than in a
  // second module so blocks and themes share one Framer Motion source.
  zoom: {
    hidden: { opacity: 0, scale: 0.6 },
    visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 260, damping: 20 } },
  },
  glow: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
  },
  float: {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
  },
  parallax: {
    hidden: { opacity: 0, x: 32, y: 16 },
    visible: { opacity: 1, x: 0, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
  },
  ripple: {
    hidden: { opacity: 0, scale: 1.15 },
    visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 200, damping: 14 } },
  },
  pulse: {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 400, damping: 10 } },
  },
  none: { hidden: { opacity: 1 }, visible: { opacity: 1 } },
};

// The page-level appearance editor calls the scale-in preset "bounce"
// (see design-editor.tsx ANIMATIONS) — kept as an alias instead of a
// second variants map so renaming the block-level option to "scale"
// (matching the spec's own wording) didn't require a data migration.
const ALIASES: Record<string, keyof typeof ENTRANCE_VARIANTS> = {
  bounce: "scale",
};

export function resolveEntranceVariant(name: string | undefined | null): Variants {
  if (!name) return ENTRANCE_VARIANTS.fade;
  const key = ALIASES[name] ?? name;
  return ENTRANCE_VARIANTS[key] ?? ENTRANCE_VARIANTS.fade;
}

/** Shared hover/tap feel for non-interactive blocks (buttons, cards). */
export const BLOCK_HOVER_TAP = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
} as const;
