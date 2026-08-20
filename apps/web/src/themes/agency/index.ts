import type { ThemeCategory, ThemeDefinition } from "../types";
import metaJson from "./theme.json";

const meta = { ...metaJson, categories: metaJson.categories as ThemeCategory[] };

export const agencyTheme: ThemeDefinition = {
  key: "agency",
  layout: "grid",
  meta,
  colors: {
    primary: "#ffffff",
    secondary: "#a1a1aa",
    accent: "#f43f5e",
    background: "#09090b",
    surface: "rgba(255,255,255,0.05)",
    text: "#ffffff",
    textMuted: "#a1a1aa",
  },
  typography: {
    font: "space-grotesk",
    headingWeight: 700,
    bodyWeight: 500,
    letterSpacing: "wide",
    lineHeight: "normal",
    textTransform: "uppercase",
  },
  buttons: { treatment: "outline", shape: "square" },
  cards: { radius: "none", shadow: "none", border: "solid" },
  animations: { entrance: "slide", hover: "lift" },
  effects: { background: { type: "solid" }, glow: false },
};
