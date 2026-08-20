import type { BlockDefinition } from "../types";
import { CONTACT_BLOCK_DEFAULT_META, CONTACT_BLOCK_DESCRIPTION, CONTACT_BLOCK_ICON, CONTACT_BLOCK_LABEL } from "./config";
import { ContactBlockPreview } from "./preview";
import { ContactBlockSettings } from "./settings";
import type { ContactBlockMeta } from "./types";

export const contactBlockDefinition: BlockDefinition<ContactBlockMeta> = {
  kind: "FORM",
  label: CONTACT_BLOCK_LABEL,
  description: CONTACT_BLOCK_DESCRIPTION,
  icon: CONTACT_BLOCK_ICON,
  defaultMeta: CONTACT_BLOCK_DEFAULT_META,
  interactive: true,
  Preview: ContactBlockPreview,
  Settings: ContactBlockSettings,
};
