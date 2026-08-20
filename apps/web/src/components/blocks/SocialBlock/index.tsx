import type { BlockDefinition } from "../types";
import { SOCIAL_BLOCK_DEFAULT_META, SOCIAL_BLOCK_DESCRIPTION, SOCIAL_BLOCK_ICON, SOCIAL_BLOCK_LABEL } from "./config";
import { SocialBlockPreview } from "./preview";
import { SocialBlockSettings } from "./settings";
import type { SocialBlockMeta } from "./types";

export const socialBlockDefinition: BlockDefinition<SocialBlockMeta> = {
  kind: "SOCIAL",
  label: SOCIAL_BLOCK_LABEL,
  description: SOCIAL_BLOCK_DESCRIPTION,
  icon: SOCIAL_BLOCK_ICON,
  defaultMeta: SOCIAL_BLOCK_DEFAULT_META,
  Preview: SocialBlockPreview,
  Settings: SocialBlockSettings,
};
