import { Tag } from "lucide-react";
import type { PricingBlockMeta } from "./types";

export const PRICING_BLOCK_DEFAULT_META: PricingBlockMeta = {
  currency: "USD",
  period: "month",
  features: [],
  buttonLabel: "Elegir plan",
};
export const PRICING_BLOCK_ICON = Tag;
export const PRICING_BLOCK_LABEL = "Plan de precios";
export const PRICING_BLOCK_DESCRIPTION =
  "Un plan con precio, lista de características y botón de llamada a la acción.";

export const PRICING_PERIOD_LABEL: Record<NonNullable<PricingBlockMeta["period"]>, string> = {
  once: "pago único",
  month: "/mes",
  year: "/año",
};
