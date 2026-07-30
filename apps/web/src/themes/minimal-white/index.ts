import type { ThemeCategory, ThemeDefinition } from "../types";
import metaJson from "./theme.json";

const meta = { ...metaJson, categories: metaJson.categories as ThemeCategory[] };

export const minimalWhiteTheme: ThemeDefinition = {
  key: "minimal-white",
  layout: "list",
  meta,
  colors: {
    primary: "#111827",
    secondary: "#6b7280",
    accent: "#2563eb",
    background: "#ffffff",
    surface: "#f9fafb",
    text: "#111827",
    textMuted: "#6b7280",
  },
  typography: {
    font: "inter",
    headingWeight: 600,
    bodyWeight: 400,
    letterSpacing: "normal",
    lineHeight: "normal",
    textTransform: "none",
  },
  buttons: { treatment: "minimal", shape: "rounded" },
  cards: { radius: "md", shadow: "none", border: "subtle" },
  animations: { entrance: "fade", hover: "lift" },
  effects: { background: { type: "solid" }, glow: false },
};
