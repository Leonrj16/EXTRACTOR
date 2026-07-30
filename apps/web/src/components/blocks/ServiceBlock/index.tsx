import type { BlockDefinition } from "../types";
import { SERVICE_BLOCK_DEFAULT_META, SERVICE_BLOCK_DESCRIPTION, SERVICE_BLOCK_ICON, SERVICE_BLOCK_LABEL } from "./config";
import { ServiceBlockPreview } from "./preview";
import { ServiceBlockSettings } from "./settings";
import type { ServiceBlockMeta } from "./types";

export const serviceBlockDefinition: BlockDefinition<ServiceBlockMeta> = {
  kind: "SERVICE",
  label: SERVICE_BLOCK_LABEL,
  description: SERVICE_BLOCK_DESCRIPTION,
  icon: SERVICE_BLOCK_ICON,
  defaultMeta: SERVICE_BLOCK_DEFAULT_META,
  Preview: ServiceBlockPreview,
  Settings: ServiceBlockSettings,
};
