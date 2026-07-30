import type { BlockDefinition } from "../types";
import { PRODUCT_BLOCK_DEFAULT_META, PRODUCT_BLOCK_DESCRIPTION, PRODUCT_BLOCK_ICON, PRODUCT_BLOCK_LABEL } from "./config";
import { ProductBlockPreview } from "./preview";
import { ProductBlockSettings } from "./settings";
import type { ProductBlockMeta } from "./types";

export const productBlockDefinition: BlockDefinition<ProductBlockMeta> = {
  kind: "PRODUCT",
  label: PRODUCT_BLOCK_LABEL,
  description: PRODUCT_BLOCK_DESCRIPTION,
  icon: PRODUCT_BLOCK_ICON,
  defaultMeta: PRODUCT_BLOCK_DEFAULT_META,
  Preview: ProductBlockPreview,
  Settings: ProductBlockSettings,
};
