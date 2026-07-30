import type { ThemeCategory, ThemeDefinition } from "../types";
import metaJson from "./theme.json";

const meta = { ...metaJson, categories: metaJson.categories as ThemeCategory[] };

export const modernStartupTheme: ThemeDefinition = {
  key: "modern-startup",
  layout: "grid",
  meta,
  colors: {
    primary: "#ffffff",
    secondary: "#c7d2fe",
    accent: "#6366f1",
    background: "#4338ca",
    surface: "rgba(255,255,255,0.08)",
    text: "#ffffff",
    textMuted: "#c7d2fe",
  },
  typography: {
    font: "outfit",
    headingWeight: 700,
    bodyWeight: 400,
    letterSpacing: "normal",
    lineHeight: "normal",
    textTransform: "none",
  },
  buttons: { treatment: "gradient", shape: "rounded" },
  cards: { radius: "lg", shadow: "soft", border: "none" },
  animations: { entrance: "slide", hover: "lift" },
  effects: { background: { type: "gradient", value: "linear-gradient(160deg, #4f46e5, #7c3aed)" }, glow: false },
};
