import type { BlockDefinition } from "../types";
import { MAP_BLOCK_DEFAULT_META, MAP_BLOCK_DESCRIPTION, MAP_BLOCK_ICON, MAP_BLOCK_LABEL } from "./config";
import { MapBlockPreview } from "./preview";
import { MapBlockSettings } from "./settings";
import type { MapBlockMeta } from "./types";

export const mapBlockDefinition: BlockDefinition<MapBlockMeta> = {
  kind: "LOCATION",
  label: MAP_BLOCK_LABEL,
  description: MAP_BLOCK_DESCRIPTION,
  icon: MAP_BLOCK_ICON,
  defaultMeta: MAP_BLOCK_DEFAULT_META,
  interactive: true,
  Preview: MapBlockPreview,
  Settings: MapBlockSettings,
};
