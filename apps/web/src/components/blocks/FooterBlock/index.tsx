import type { BlockDefinition } from "../types";
import { FOOTER_BLOCK_DEFAULT_META, FOOTER_BLOCK_DESCRIPTION, FOOTER_BLOCK_ICON, FOOTER_BLOCK_LABEL } from "./config";
import { FooterBlockPreview } from "./preview";
import { FooterBlockSettings } from "./settings";
import type { FooterBlockMeta } from "./types";

export const footerBlockDefinition: BlockDefinition<FooterBlockMeta> = {
  kind: "FOOTER",
  label: FOOTER_BLOCK_LABEL,
  description: FOOTER_BLOCK_DESCRIPTION,
  icon: FOOTER_BLOCK_ICON,
  defaultMeta: FOOTER_BLOCK_DEFAULT_META,
  interactive: true,
  Preview: FooterBlockPreview,
  Settings: FooterBlockSettings,
};
