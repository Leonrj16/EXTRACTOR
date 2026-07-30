import type { BlockDefinition } from "../types";
import { EMAIL_BLOCK_DEFAULT_META, EMAIL_BLOCK_DESCRIPTION, EMAIL_BLOCK_ICON, EMAIL_BLOCK_LABEL } from "./config";
import { EmailBlockPreview } from "./preview";
import { EmailBlockSettings } from "./settings";
import type { EmailBlockMeta } from "./types";

export const emailBlockDefinition: BlockDefinition<EmailBlockMeta> = {
  kind: "EMAIL",
  label: EMAIL_BLOCK_LABEL,
  description: EMAIL_BLOCK_DESCRIPTION,
  icon: EMAIL_BLOCK_ICON,
  defaultMeta: EMAIL_BLOCK_DEFAULT_META,
  Preview: EmailBlockPreview,
  Settings: EmailBlockSettings,
};
