import type { ThemeCategory, ThemeDefinition } from "../types";
import metaJson from "./theme.json";

const meta = { ...metaJson, categories: metaJson.categories as ThemeCategory[] };

export const midnightDarkTheme: ThemeDefinition = {
  key: "midnight-dark",
  layout: "list",
  meta,
  colors: {
    primary: "#f9fafb",
    secondary: "#9ca3af",
    accent: "#818cf8",
    background: "#0a0a0f",
    surface: "rgba(255,255,255,0.04)",
    text: "#f9fafb",
    textMuted: "#9ca3af",
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
  cards: { radius: "lg", shadow: "soft", border: "subtle" },
  animations: { entrance: "fade", hover: "lift" },
  effects: { background: { type: "solid" }, glow: false },
};
