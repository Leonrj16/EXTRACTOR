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
