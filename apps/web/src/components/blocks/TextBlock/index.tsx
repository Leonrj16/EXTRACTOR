import type { BlockDefinition } from "../types";
import { TEXT_BLOCK_DEFAULT_META, TEXT_BLOCK_DESCRIPTION, TEXT_BLOCK_ICON, TEXT_BLOCK_LABEL } from "./config";
import { TextBlockPreview } from "./preview";
import { TextBlockSettings } from "./settings";
import type { TextBlockMeta } from "./types";

export const textBlockDefinition: BlockDefinition<TextBlockMeta> = {
  kind: "TEXT",
  label: TEXT_BLOCK_LABEL,
  description: TEXT_BLOCK_DESCRIPTION,
  icon: TEXT_BLOCK_ICON,
  defaultMeta: TEXT_BLOCK_DEFAULT_META,
  Preview: TextBlockPreview,
  Settings: TextBlockSettings,
};
