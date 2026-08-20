export type ServiceIconKey = "sparkles" | "zap" | "star" | "heart" | "shield" | "award" | "clock" | "users";

export interface ServiceBlockMeta {
  icon?: ServiceIconKey;
  description?: string;
  price?: string;
  currency?: string;
  buttonLabel?: string;
}
