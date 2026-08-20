import type { CSSProperties } from "react";
import type { ButtonTreatment } from "../types";

export interface ResolvedButtonTreatment {
  className: string;
  style: CSSProperties;
}

/**
 * The 10 button treatments from the Theme Engine spec. A treatment is
 * the button's *visual finish* (fill, glass, gradient, glow...) — a
 * separate axis from its *shape* (rounded/pill/square, still driven by
 * Appearance.buttonStyle as before). Consumed today by ButtonBlock and
 * the theme gallery's preview card; adopting it in the other 17 blocks
 * is future work (see design-system/architecture/theme-engine.md).
 */
export function resolveButtonTreatment(
  treatment: ButtonTreatment,
  primaryColor: string,
  secondaryColor?: string,
): ResolvedButtonTreatment {
  switch (treatment) {
    case "outline":
      return {
        className: "",
        style: { backgroundColor: "transparent", border: `1.5px solid ${primaryColor}` },
      };
    case "glass":
      return {
        className: "backdrop-blur-md",
        style: { backgroundColor: `${primaryColor}1a`, border: `1px solid ${primaryColor}33` },
      };
    case "minimal":
      return {
        className: "underline-offset-4 hover:underline",
        style: { backgroundColor: "transparent" },
      };
    case "gradient":
      return {
        className: "",
        style: {
          backgroundImage: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor ?? primaryColor})`,
          color: "#ffffff",
        },
      };
    case "3d":
      return {
        className: "transition-transform active:translate-y-[2px] active:shadow-none",
        style: { backgroundColor: primaryColor, color: "#ffffff", boxShadow: "0 4px 0 rgba(0,0,0,0.35)" },
      };
    case "glow":
      return {
        className: "",
        style: { backgroundColor: primaryColor, color: "#ffffff", boxShadow: `0 0 24px ${primaryColor}88` },
      };
    case "floating":
      return {
        className: "shadow-lg transition-transform hover:-translate-y-0.5",
        style: { backgroundColor: primaryColor, color: "#ffffff" },
      };
    case "soft":
      return {
        className: "",
        style: { backgroundColor: `${primaryColor}1f` },
      };
    case "rounded":
      return {
        className: "rounded-full",
        style: { backgroundColor: primaryColor, color: "#ffffff" },
      };
    case "filled":
    default:
      return {
        className: "",
        style: { backgroundColor: `${primaryColor}14` },
      };
  }
}

export const BUTTON_TREATMENT_OPTIONS: Array<{ value: ButtonTreatment; label: string }> = [
  { value: "filled", label: "Relleno" },
  { value: "outline", label: "Contorno" },
  { value: "glass", label: "Vidrio" },
  { value: "minimal", label: "Minimal" },
  { value: "gradient", label: "Degradado" },
  { value: "3d", label: "3D" },
  { value: "glow", label: "Resplandor" },
  { value: "floating", label: "Flotante" },
  { value: "soft", label: "Suave" },
  { value: "rounded", label: "Redondeado sólido" },
];
