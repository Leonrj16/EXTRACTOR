import type { BlockDefinition } from "../types";
import { WHATSAPP_BLOCK_DEFAULT_META, WHATSAPP_BLOCK_DESCRIPTION, WHATSAPP_BLOCK_ICON, WHATSAPP_BLOCK_LABEL } from "./config";
import { WhatsAppBlockPreview } from "./preview";
import { WhatsAppBlockSettings } from "./settings";
import type { WhatsAppBlockMeta } from "./types";

export const whatsAppBlockDefinition: BlockDefinition<WhatsAppBlockMeta> = {
  kind: "WHATSAPP",
  label: WHATSAPP_BLOCK_LABEL,
  description: WHATSAPP_BLOCK_DESCRIPTION,
  icon: WHATSAPP_BLOCK_ICON,
  defaultMeta: WHATSAPP_BLOCK_DEFAULT_META,
  Preview: WhatsAppBlockPreview,
  Settings: WhatsAppBlockSettings,
};
