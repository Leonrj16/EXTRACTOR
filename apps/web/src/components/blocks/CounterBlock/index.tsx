import type { BlockDefinition } from "../types";
import { COUNTER_BLOCK_DEFAULT_META, COUNTER_BLOCK_DESCRIPTION, COUNTER_BLOCK_ICON, COUNTER_BLOCK_LABEL } from "./config";
import { CounterBlockPreview } from "./preview";
import { CounterBlockSettings } from "./settings";
import type { CounterBlockMeta } from "./types";

export const counterBlockDefinition: BlockDefinition<CounterBlockMeta> = {
  kind: "COUNTER",
  label: COUNTER_BLOCK_LABEL,
  description: COUNTER_BLOCK_DESCRIPTION,
  icon: COUNTER_BLOCK_ICON,
  defaultMeta: COUNTER_BLOCK_DEFAULT_META,
  Preview: CounterBlockPreview,
  Settings: CounterBlockSettings,
};
