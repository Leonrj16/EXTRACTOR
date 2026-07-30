import type { BlockDefinition } from "../types";
import { VIDEO_BLOCK_DEFAULT_META, VIDEO_BLOCK_DESCRIPTION, VIDEO_BLOCK_ICON, VIDEO_BLOCK_LABEL } from "./config";
import { VideoBlockPreview } from "./preview";
import { VideoBlockSettings } from "./settings";
import type { VideoBlockMeta } from "./types";

export const videoBlockDefinition: BlockDefinition<VideoBlockMeta> = {
  kind: "VIDEO",
  label: VIDEO_BLOCK_LABEL,
  description: VIDEO_BLOCK_DESCRIPTION,
  icon: VIDEO_BLOCK_ICON,
  defaultMeta: VIDEO_BLOCK_DEFAULT_META,
  interactive: true,
  Preview: VideoBlockPreview,
  Settings: VideoBlockSettings,
};
