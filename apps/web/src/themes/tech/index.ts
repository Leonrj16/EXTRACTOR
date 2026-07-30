import type { ThemeCategory, ThemeDefinition } from "../types";
import metaJson from "./theme.json";

const meta = { ...metaJson, categories: metaJson.categories as ThemeCategory[] };

export const techTheme: ThemeDefinition = {
  key: "tech",
  layout: "list",
  meta,
  colors: {
    primary: "#e2e8f0",
    secondary: "#64748b",
    accent: "#22d3ee",
    background: "#030712",
    surface: "rgba(34,211,238,0.06)",
    text: "#e2e8f0",
    textMuted: "#94a3b8",
  },
  typography: {
    font: "space-grotesk",
    headingWeight: 600,
    bodyWeight: 400,
    letterSpacing: "normal",
    lineHeight: "normal",
    textTransform: "none",
  },
  buttons: { treatment: "glow", shape: "rounded" },
  cards: { radius: "lg", shadow: "glow", border: "subtle" },
  animations: { entrance: "pulse", hover: "glow" },
  effects: { background: { type: "mesh" }, glow: true },
};
