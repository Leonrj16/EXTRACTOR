import type { BlockDefinition } from "../types";
import { COUNTDOWN_BLOCK_DEFAULT_META, COUNTDOWN_BLOCK_DESCRIPTION, COUNTDOWN_BLOCK_ICON, COUNTDOWN_BLOCK_LABEL } from "./config";
import { CountdownBlockPreview } from "./preview";
import { CountdownBlockSettings } from "./settings";
import type { CountdownBlockMeta } from "./types";

export const countdownBlockDefinition: BlockDefinition<CountdownBlockMeta> = {
  kind: "COUNTDOWN",
  label: COUNTDOWN_BLOCK_LABEL,
  description: COUNTDOWN_BLOCK_DESCRIPTION,
  icon: COUNTDOWN_BLOCK_ICON,
  defaultMeta: COUNTDOWN_BLOCK_DEFAULT_META,
  interactive: true,
  Preview: CountdownBlockPreview,
  Settings: CountdownBlockSettings,
};
