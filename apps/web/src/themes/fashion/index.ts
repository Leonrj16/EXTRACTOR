import type { ThemeCategory, ThemeDefinition } from "../types";
import metaJson from "./theme.json";

const meta = { ...metaJson, categories: metaJson.categories as ThemeCategory[] };

export const fashionTheme: ThemeDefinition = {
  key: "fashion",
  layout: "grid",
  meta,
  colors: {
    primary: "#ffffff",
    secondary: "#e5e5e5",
    accent: "#ec4899",
    background: "#000000",
    surface: "rgba(255,255,255,0.05)",
    text: "#ffffff",
    textMuted: "#e5e5e5",
  },
  typography: {
    font: "plus-jakarta-sans",
    headingWeight: 600,
    bodyWeight: 400,
    letterSpacing: "wide",
    lineHeight: "normal",
    textTransform: "uppercase",
  },
  buttons: { treatment: "minimal", shape: "square" },
  cards: { radius: "none", shadow: "none", border: "subtle" },
  animations: { entrance: "zoom", hover: "scale" },
  effects: { background: { type: "solid" }, glow: false },
};
