import type { BlockDefinition } from "../types";
import { PRICING_BLOCK_DEFAULT_META, PRICING_BLOCK_DESCRIPTION, PRICING_BLOCK_ICON, PRICING_BLOCK_LABEL } from "./config";
import { PricingBlockPreview } from "./preview";
import { PricingBlockSettings } from "./settings";
import type { PricingBlockMeta } from "./types";

export const pricingBlockDefinition: BlockDefinition<PricingBlockMeta> = {
  kind: "PRICING",
  label: PRICING_BLOCK_LABEL,
  description: PRICING_BLOCK_DESCRIPTION,
  icon: PRICING_BLOCK_ICON,
  defaultMeta: PRICING_BLOCK_DEFAULT_META,
  Preview: PricingBlockPreview,
  Settings: PricingBlockSettings,
};
