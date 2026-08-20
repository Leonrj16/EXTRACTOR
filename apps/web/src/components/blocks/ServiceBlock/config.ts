import { Award, Clock, Heart, Shield, Sparkles, Star, Users, Zap, type LucideIcon } from "lucide-react";
import type { ServiceBlockMeta, ServiceIconKey } from "./types";

export const SERVICE_BLOCK_DEFAULT_META: ServiceBlockMeta = { icon: "sparkles", currency: "USD" };
export const SERVICE_BLOCK_ICON = Sparkles;
export const SERVICE_BLOCK_LABEL = "Servicio";
export const SERVICE_BLOCK_DESCRIPTION =
  "Un servicio con ícono, descripción, precio y botón de contratación.";

export const SERVICE_ICON_MAP: Record<ServiceIconKey, LucideIcon> = {
  sparkles: Sparkles,
  zap: Zap,
  star: Star,
  heart: Heart,
  shield: Shield,
  award: Award,
  clock: Clock,
  users: Users,
};

export const SERVICE_ICON_OPTIONS = (Object.keys(SERVICE_ICON_MAP) as ServiceIconKey[]).map((value) => ({
  value,
  label: value.charAt(0).toUpperCase() + value.slice(1),
}));
