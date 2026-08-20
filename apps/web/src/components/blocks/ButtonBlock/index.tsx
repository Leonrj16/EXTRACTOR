import type { BlockDefinition } from "../types";
import { BUTTON_BLOCK_DEFAULT_META, BUTTON_BLOCK_DESCRIPTION, BUTTON_BLOCK_ICON, BUTTON_BLOCK_LABEL } from "./config";
import { ButtonBlockPreview } from "./preview";
import { ButtonBlockSettings } from "./settings";
import type { ButtonBlockMeta } from "./types";

export const buttonBlockDefinition: BlockDefinition<ButtonBlockMeta> = {
  kind: "LINK",
  label: BUTTON_BLOCK_LABEL,
  description: BUTTON_BLOCK_DESCRIPTION,
  icon: BUTTON_BLOCK_ICON,
  defaultMeta: BUTTON_BLOCK_DEFAULT_META,
  Preview: ButtonBlockPreview,
  Settings: ButtonBlockSettings,
};
