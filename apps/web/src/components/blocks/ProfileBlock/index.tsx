import type { BlockDefinition } from "../types";
import { PROFILE_BLOCK_DEFAULT_META, PROFILE_BLOCK_DESCRIPTION, PROFILE_BLOCK_ICON, PROFILE_BLOCK_LABEL } from "./config";
import { ProfileBlockPreview } from "./preview";
import { ProfileBlockSettings } from "./settings";
import type { ProfileBlockMeta } from "./types";

export const profileBlockDefinition: BlockDefinition<ProfileBlockMeta> = {
  kind: "PROFILE",
  label: PROFILE_BLOCK_LABEL,
  description: PROFILE_BLOCK_DESCRIPTION,
  icon: PROFILE_BLOCK_ICON,
  defaultMeta: PROFILE_BLOCK_DEFAULT_META,
  interactive: true,
  Preview: ProfileBlockPreview,
  Settings: ProfileBlockSettings,
};
