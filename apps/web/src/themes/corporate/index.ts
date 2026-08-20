import type { ThemeCategory, ThemeDefinition } from "../types";
import metaJson from "./theme.json";

const meta = { ...metaJson, categories: metaJson.categories as ThemeCategory[] };

export const corporateTheme: ThemeDefinition = {
  key: "corporate",
  layout: "list",
  meta,
  colors: {
    primary: "#0f172a",
    secondary: "#475569",
    accent: "#2563eb",
    background: "#f1f5f9",
    surface: "#ffffff",
    text: "#0f172a",
    textMuted: "#475569",
  },
  typography: {
    font: "inter",
    headingWeight: 600,
    bodyWeight: 400,
    letterSpacing: "normal",
    lineHeight: "normal",
    textTransform: "none",
  },
  buttons: { treatment: "filled", shape: "rounded" },
  cards: { radius: "md", shadow: "soft", border: "subtle" },
  animations: { entrance: "fade", hover: "lift" },
  effects: { background: { type: "solid" }, glow: false },
};
