import type { ThemeCategory, ThemeDefinition } from "../types";
import metaJson from "./theme.json";

const meta = { ...metaJson, categories: metaJson.categories as ThemeCategory[] };

export const luxuryBlackTheme: ThemeDefinition = {
  key: "luxury-black",
  layout: "list",
  meta,
  colors: {
    primary: "#f5f5f4",
    secondary: "#d4d4d8",
    accent: "#d4af37",
    background: "#0a0a0a",
    surface: "rgba(212,175,55,0.06)",
    text: "#f5f5f4",
    textMuted: "#a3a3a3",
  },
  typography: {
    font: "plus-jakarta-sans",
    headingWeight: 600,
    bodyWeight: 400,
    letterSpacing: "wide",
    lineHeight: "normal",
    textTransform: "uppercase",
  },
  buttons: { treatment: "outline", shape: "square" },
  cards: { radius: "sm", shadow: "soft", border: "solid" },
  animations: { entrance: "fade", hover: "lift" },
  effects: { background: { type: "solid" }, glow: false },
};
