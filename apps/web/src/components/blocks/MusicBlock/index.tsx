import type { BlockDefinition } from "../types";
import { MUSIC_BLOCK_DEFAULT_META, MUSIC_BLOCK_DESCRIPTION, MUSIC_BLOCK_ICON, MUSIC_BLOCK_LABEL } from "./config";
import { MusicBlockPreview } from "./preview";
import { MusicBlockSettings } from "./settings";
import type { MusicBlockMeta } from "./types";

export const musicBlockDefinition: BlockDefinition<MusicBlockMeta> = {
  kind: "MUSIC",
  label: MUSIC_BLOCK_LABEL,
  description: MUSIC_BLOCK_DESCRIPTION,
  icon: MUSIC_BLOCK_ICON,
  defaultMeta: MUSIC_BLOCK_DEFAULT_META,
  interactive: true,
  Preview: MusicBlockPreview,
  Settings: MusicBlockSettings,
};
