import { buttonBlockDefinition } from "./ButtonBlock";
import { videoBlockDefinition } from "./VideoBlock";
import { galleryBlockDefinition } from "./GalleryBlock";
import { testimonialBlockDefinition } from "./TestimonialBlock";
import { faqBlockDefinition } from "./FAQBlock";
import type { BlockDefinition, BlockKind } from "./types";

/**
 * The one place a new block gets wired into the app. To add a block:
 *   1. Create /components/blocks/<Name>Block/ following the pattern in
 *      any existing block (index/types/config/preview/settings/styles/
 *      animation.tsx — see design-system/architecture/blocks.md).
 *   2. Import its definition here and add one line to this record.
 *
 * Nothing else changes — profile-view.tsx and link-form-dialog.tsx both
 * dispatch through `getBlockDefinition`, never through a per-kind
 * if/else, so adding a block never touches existing ones.
 *
 * Kinds not listed here (SOCIAL, WHATSAPP, EMAIL, LOCATION, PRODUCT,
 * FORM, MUSIC) still render through the legacy inline path in
 * profile-view.tsx / link-form-dialog.tsx until they're migrated to this
 * same pattern in a future pass.
 */
// Each block owns its own TMeta (ButtonBlockMeta, VideoBlockMeta, ...); the
// registry itself only needs to dispatch generically, so it's stored and
// consumed through a common Record<string, unknown> view — every block's
// own settings.tsx/preview.tsx still work with its narrow, specific type.
type AnyBlockDefinition = BlockDefinition<Record<string, unknown>>;

export const BLOCK_REGISTRY: Partial<Record<BlockKind, AnyBlockDefinition>> = {
  LINK: buttonBlockDefinition,
  VIDEO: videoBlockDefinition,
  GALLERY: galleryBlockDefinition,
  TESTIMONIAL: testimonialBlockDefinition,
  FAQ: faqBlockDefinition,
} as unknown as Partial<Record<BlockKind, AnyBlockDefinition>>;

export function getBlockDefinition(kind: BlockKind): AnyBlockDefinition | undefined {
  return BLOCK_REGISTRY[kind];
}

/** Kinds available to add from "Nuevo bloque" that use the new architecture. */
export function listMigratedBlockKinds(): BlockKind[] {
  return Object.keys(BLOCK_REGISTRY) as BlockKind[];
}
