import type { ThemeCategory, ThemeDefinition } from "../types";
import metaJson from "./theme.json";

const meta = { ...metaJson, categories: metaJson.categories as ThemeCategory[] };

export const creatorTheme: ThemeDefinition = {
  key: "creator",
  layout: "grid",
  meta,
  colors: {
    primary: "#fdf4ff",
    secondary: "#f5d0fe",
    accent: "#ec4899",
    background: "#581c87",
    surface: "rgba(255,255,255,0.08)",
    text: "#fdf4ff",
    textMuted: "#f5d0fe",
  },
  typography: {
    font: "poppins",
    headingWeight: 700,
    bodyWeight: 400,
    letterSpacing: "normal",
    lineHeight: "normal",
    textTransform: "none",
  },
  buttons: { treatment: "3d", shape: "pill" },
  cards: { radius: "lg", shadow: "glow", border: "none" },
  animations: { entrance: "zoom", hover: "scale" },
  effects: { background: { type: "gradient", value: "linear-gradient(160deg, #581c87, #db2777)" }, glow: true },
};
