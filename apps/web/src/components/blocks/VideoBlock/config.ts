import { Video } from "lucide-react";
import type { VideoBlockMeta } from "./types";

export const VIDEO_BLOCK_DEFAULT_META: VideoBlockMeta = { source: "auto", autoplay: false };
export const VIDEO_BLOCK_ICON = Video;
export const VIDEO_BLOCK_LABEL = "Video";
export const VIDEO_BLOCK_DESCRIPTION =
  "Video embebido de YouTube o Vimeo, o un archivo MP4 con reproducción nativa.";
