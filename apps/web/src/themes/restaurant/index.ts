import type { ThemeCategory, ThemeDefinition } from "../types";
import metaJson from "./theme.json";

const meta = { ...metaJson, categories: metaJson.categories as ThemeCategory[] };

export const restaurantTheme: ThemeDefinition = {
  key: "restaurant",
  layout: "list",
  meta,
  colors: {
    primary: "#fffbeb",
    secondary: "#fde68a",
    accent: "#b45309",
    background: "#1c1917",
    surface: "rgba(180,83,9,0.1)",
    text: "#fffbeb",
    textMuted: "#fde68a",
  },
  typography: {
    font: "outfit",
    headingWeight: 600,
    bodyWeight: 400,
    letterSpacing: "normal",
    lineHeight: "normal",
    textTransform: "none",
  },
  buttons: { treatment: "soft", shape: "pill" },
  cards: { radius: "lg", shadow: "soft", border: "none" },
  animations: { entrance: "slide", hover: "lift" },
  effects: { background: { type: "gradient", value: "linear-gradient(160deg, #1c1917, #451a03)" }, glow: false },
};
