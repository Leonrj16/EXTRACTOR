export type PricingPeriod = "once" | "month" | "year";

export interface PricingBlockMeta {
  price?: string;
  currency?: string;
  period?: PricingPeriod;
  features?: string[];
  buttonLabel?: string;
  /** Renders the plan with an accent border/background to stand out. */
  highlighted?: boolean;
}
