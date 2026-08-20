import type { ThemeCategory, ThemeDefinition } from "../types";
import metaJson from "./theme.json";

const meta = { ...metaJson, categories: metaJson.categories as ThemeCategory[] };

export const glassPremiumTheme: ThemeDefinition = {
  key: "glass-premium",
  layout: "list",
  meta,
  colors: {
    primary: "#ffffff",
    secondary: "#e5e7eb",
    accent: "#7c3aed",
    background: "#0f0f14",
    surface: "rgba(255,255,255,0.08)",
    text: "#ffffff",
    textMuted: "#c4c4cc",
  },
  typography: {
    font: "manrope",
    headingWeight: 600,
    bodyWeight: 400,
    letterSpacing: "normal",
    lineHeight: "normal",
    textTransform: "none",
  },
  buttons: { treatment: "glass", shape: "pill" },
  cards: { radius: "lg", shadow: "soft", border: "subtle" },
  animations: { entrance: "fade", hover: "lift" },
  effects: { background: { type: "glass" }, glow: false, blurPx: 24 },
};
