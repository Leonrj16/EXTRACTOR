import type { BlockDefinition } from "../types";
import { DIVIDER_BLOCK_DEFAULT_META, DIVIDER_BLOCK_DESCRIPTION, DIVIDER_BLOCK_ICON, DIVIDER_BLOCK_LABEL } from "./config";
import { DividerBlockPreview } from "./preview";
import { DividerBlockSettings } from "./settings";
import type { DividerBlockMeta } from "./types";

export const dividerBlockDefinition: BlockDefinition<DividerBlockMeta> = {
  kind: "DIVIDER",
  label: DIVIDER_BLOCK_LABEL,
  description: DIVIDER_BLOCK_DESCRIPTION,
  icon: DIVIDER_BLOCK_ICON,
  defaultMeta: DIVIDER_BLOCK_DEFAULT_META,
  Preview: DividerBlockPreview,
  Settings: DividerBlockSettings,
};
