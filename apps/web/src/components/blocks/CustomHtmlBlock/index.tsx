import type { BlockDefinition } from "../types";
import {
  CUSTOM_HTML_BLOCK_DEFAULT_META,
  CUSTOM_HTML_BLOCK_DESCRIPTION,
  CUSTOM_HTML_BLOCK_ICON,
  CUSTOM_HTML_BLOCK_LABEL,
} from "./config";
import { CustomHtmlBlockPreview } from "./preview";
import { CustomHtmlBlockSettings } from "./settings";
import type { CustomHtmlBlockMeta } from "./types";

export const customHtmlBlockDefinition: BlockDefinition<CustomHtmlBlockMeta> = {
  kind: "CUSTOM_HTML",
  label: CUSTOM_HTML_BLOCK_LABEL,
  description: CUSTOM_HTML_BLOCK_DESCRIPTION,
  icon: CUSTOM_HTML_BLOCK_ICON,
  defaultMeta: CUSTOM_HTML_BLOCK_DEFAULT_META,
  interactive: true,
  Preview: CustomHtmlBlockPreview,
  Settings: CustomHtmlBlockSettings,
};
