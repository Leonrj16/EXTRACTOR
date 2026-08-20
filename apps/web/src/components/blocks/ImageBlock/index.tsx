import type { BlockDefinition } from "../types";
import { IMAGE_BLOCK_DEFAULT_META, IMAGE_BLOCK_DESCRIPTION, IMAGE_BLOCK_ICON, IMAGE_BLOCK_LABEL } from "./config";
import { ImageBlockPreview } from "./preview";
import { ImageBlockSettings } from "./settings";
import type { ImageBlockMeta } from "./types";

export const imageBlockDefinition: BlockDefinition<ImageBlockMeta> = {
  kind: "IMAGE",
  label: IMAGE_BLOCK_LABEL,
  description: IMAGE_BLOCK_DESCRIPTION,
  icon: IMAGE_BLOCK_ICON,
  defaultMeta: IMAGE_BLOCK_DEFAULT_META,
  Preview: ImageBlockPreview,
  Settings: ImageBlockSettings,
};
