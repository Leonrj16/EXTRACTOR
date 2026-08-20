import type { BlockDefinition } from "../types";
import { FAQ_BLOCK_DEFAULT_META, FAQ_BLOCK_DESCRIPTION, FAQ_BLOCK_ICON, FAQ_BLOCK_LABEL } from "./config";
import { FaqBlockPreview } from "./preview";
import { FaqBlockSettings } from "./settings";
import type { FaqBlockMeta } from "./types";

export const faqBlockDefinition: BlockDefinition<FaqBlockMeta> = {
  kind: "FAQ",
  label: FAQ_BLOCK_LABEL,
  description: FAQ_BLOCK_DESCRIPTION,
  icon: FAQ_BLOCK_ICON,
  defaultMeta: FAQ_BLOCK_DEFAULT_META,
  interactive: true,
  Preview: FaqBlockPreview,
  Settings: FaqBlockSettings,
};
