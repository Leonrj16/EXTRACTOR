import type { BlockDefinition } from "../types";
import { GALLERY_BLOCK_DEFAULT_META, GALLERY_BLOCK_DESCRIPTION, GALLERY_BLOCK_ICON, GALLERY_BLOCK_LABEL } from "./config";
import { GalleryBlockPreview } from "./preview";
import { GalleryBlockSettings } from "./settings";
import type { GalleryBlockMeta } from "./types";

export const galleryBlockDefinition: BlockDefinition<GalleryBlockMeta> = {
  kind: "GALLERY",
  label: GALLERY_BLOCK_LABEL,
  description: GALLERY_BLOCK_DESCRIPTION,
  icon: GALLERY_BLOCK_ICON,
  defaultMeta: GALLERY_BLOCK_DEFAULT_META,
  interactive: true,
  Preview: GalleryBlockPreview,
  Settings: GalleryBlockSettings,
};
