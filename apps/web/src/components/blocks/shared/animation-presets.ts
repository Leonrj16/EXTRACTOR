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
  // The Visual Editor's animation panel adds these 2 — see
  // design-system/architecture/visual-editor.md.
  rotate: {
    hidden: { opacity: 0, rotate: -15, scale: 0.9 },
    visible: { opacity: 1, rotate: 0, scale: 1, transition: { type: "spring", stiffness: 260, damping: 18 } },
  },
  bounce: {
    hidden: { opacity: 0, y: -16 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 500, damping: 12 } },
  },
  none: { hidden: { opacity: 1 }, visible: { opacity: 1 } },
};

// No aliases anymore — "bounce" used to redirect to the "scale" preset
// (back when the page-level animation picker only offered that name for
// a scale-in effect); now that "bounce" is a real, distinct preset, a
// stored legacy "bounce" value plays an actual bounce, which is more
// correct than the old silent redirect.
const ALIASES: Record<string, keyof typeof ENTRANCE_VARIANTS> = {};

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

export type HoverEffect = "lift" | "scale" | "glow" | "none";

/** whileHover motion for a given hover effect — "glow" only changes
 * boxShadow, which BlockFrame layers on top of whatever static shadow
 * the block already has via resolveBlockStyle/resolveShadowStyle. */
export function resolveHoverEffect(effect: HoverEffect | undefined, glowColor: string) {
  switch (effect) {
    case "lift":
      return { whileHover: { y: -4 }, whileTap: { y: 0 } };
    case "glow":
      return { whileHover: { boxShadow: `0 0 24px ${glowColor}88` }, whileTap: {} };
    case "none":
      return { whileHover: undefined, whileTap: undefined };
    case "scale":
    default:
      return BLOCK_HOVER_TAP;
  }
}
