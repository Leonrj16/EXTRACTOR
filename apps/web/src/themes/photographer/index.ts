import type { ThemeCategory, ThemeDefinition } from "../types";
import metaJson from "./theme.json";

const meta = { ...metaJson, categories: metaJson.categories as ThemeCategory[] };

export const photographerTheme: ThemeDefinition = {
  key: "photographer",
  layout: "grid",
  meta,
  colors: {
    primary: "#ffffff",
    secondary: "#a3a3a3",
    accent: "#ffffff",
    background: "#000000",
    surface: "rgba(255,255,255,0.04)",
    text: "#ffffff",
    textMuted: "#a3a3a3",
  },
  typography: {
    font: "manrope",
    headingWeight: 500,
    bodyWeight: 400,
    letterSpacing: "wide",
    lineHeight: "normal",
    textTransform: "uppercase",
  },
  buttons: { treatment: "minimal", shape: "square" },
  cards: { radius: "none", shadow: "none", border: "subtle" },
  animations: { entrance: "fade", hover: "none" },
  effects: { background: { type: "solid" }, glow: false },
};
