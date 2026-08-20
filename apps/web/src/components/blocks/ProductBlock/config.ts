import { ShoppingBag } from "lucide-react";
import type { ProductBlockMeta } from "./types";

export const PRODUCT_BLOCK_DEFAULT_META: ProductBlockMeta = { currency: "USD", buttonLabel: "Comprar" };
export const PRODUCT_BLOCK_ICON = ShoppingBag;
export const PRODUCT_BLOCK_LABEL = "Producto";
export const PRODUCT_BLOCK_DESCRIPTION =
  "Una tarjeta de producto con imagen, precio (con descuento opcional) y botón de compra.";
