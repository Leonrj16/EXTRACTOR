import type { ThemeCategory, ThemeDefinition } from "../types";
import metaJson from "./theme.json";

const meta = { ...metaJson, categories: metaJson.categories as ThemeCategory[] };

export const portfolioTheme: ThemeDefinition = {
  key: "portfolio",
  layout: "grid",
  meta,
  colors: {
    primary: "#18181b",
    secondary: "#71717a",
    accent: "#18181b",
    background: "#ffffff",
    surface: "#f4f4f5",
    text: "#18181b",
    textMuted: "#71717a",
  },
  typography: {
    font: "inter",
    headingWeight: 600,
    bodyWeight: 400,
    letterSpacing: "normal",
    lineHeight: "normal",
    textTransform: "none",
  },
  buttons: { treatment: "minimal", shape: "square" },
  cards: { radius: "sm", shadow: "none", border: "subtle" },
  animations: { entrance: "fade", hover: "none" },
  effects: { background: { type: "solid" }, glow: false },
};
