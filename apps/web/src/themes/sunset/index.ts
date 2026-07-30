import type { ThemeCategory, ThemeDefinition } from "../types";
import metaJson from "./theme.json";

const meta = { ...metaJson, categories: metaJson.categories as ThemeCategory[] };

export const sunsetTheme: ThemeDefinition = {
  key: "sunset",
  layout: "list",
  meta,
  colors: {
    primary: "#fff7ed",
    secondary: "#fed7aa",
    accent: "#f97316",
    background: "#7c2d12",
    surface: "rgba(255,255,255,0.07)",
    text: "#fff7ed",
    textMuted: "#fed7aa",
  },
  typography: {
    font: "poppins",
    headingWeight: 600,
    bodyWeight: 400,
    letterSpacing: "normal",
    lineHeight: "normal",
    textTransform: "none",
  },
  buttons: { treatment: "gradient", shape: "pill" },
  cards: { radius: "lg", shadow: "soft", border: "none" },
  animations: { entrance: "slide", hover: "lift" },
  effects: { background: { type: "gradient", value: "linear-gradient(160deg, #7c2d12, #f97316 65%, #facc15)" }, glow: false },
};
