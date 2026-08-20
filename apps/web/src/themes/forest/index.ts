import type { ThemeCategory, ThemeDefinition } from "../types";
import metaJson from "./theme.json";

const meta = { ...metaJson, categories: metaJson.categories as ThemeCategory[] };

export const forestTheme: ThemeDefinition = {
  key: "forest",
  layout: "grid",
  meta,
  colors: {
    primary: "#f0fdf4",
    secondary: "#bbf7d0",
    accent: "#22c55e",
    background: "#052e1a",
    surface: "rgba(255,255,255,0.05)",
    text: "#f0fdf4",
    textMuted: "#bbf7d0",
  },
  typography: {
    font: "manrope",
    headingWeight: 600,
    bodyWeight: 400,
    letterSpacing: "normal",
    lineHeight: "relaxed",
    textTransform: "none",
  },
  buttons: { treatment: "soft", shape: "rounded" },
  cards: { radius: "md", shadow: "soft", border: "subtle" },
  animations: { entrance: "fade", hover: "lift" },
  effects: { background: { type: "gradient", value: "linear-gradient(160deg, #052e1a, #14532d)" }, glow: false },
};
