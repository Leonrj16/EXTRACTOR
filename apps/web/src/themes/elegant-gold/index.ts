import type { ThemeCategory, ThemeDefinition } from "../types";
import metaJson from "./theme.json";

const meta = { ...metaJson, categories: metaJson.categories as ThemeCategory[] };

export const elegantGoldTheme: ThemeDefinition = {
  key: "elegant-gold",
  layout: "list",
  meta,
  colors: {
    primary: "#1c1917",
    secondary: "#78716c",
    accent: "#b8860b",
    background: "#fdf6e3",
    surface: "#f5e6c8",
    text: "#1c1917",
    textMuted: "#78716c",
  },
  typography: {
    font: "plus-jakarta-sans",
    headingWeight: 600,
    bodyWeight: 400,
    letterSpacing: "wide",
    lineHeight: "normal",
    textTransform: "none",
  },
  buttons: { treatment: "outline", shape: "rounded" },
  cards: { radius: "md", shadow: "soft", border: "solid" },
  animations: { entrance: "fade", hover: "lift" },
  effects: { background: { type: "gradient", value: "linear-gradient(160deg, #fdf6e3, #f5e6c8)" }, glow: false },
};
