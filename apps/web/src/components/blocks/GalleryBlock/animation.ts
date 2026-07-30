import type { Variants } from "framer-motion";

// The gallery block opts out of the shared whileHover/whileTap scale
// (BlockFrame reads this) because it isn't a single clickable target —
// each thumbnail handles its own hover state instead.
export const GALLERY_BLOCK_INTERACTIVE = true;

export const LIGHTBOX_OVERLAY_VARIANTS: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const LIGHTBOX_IMAGE_VARIANTS: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1 },
};
