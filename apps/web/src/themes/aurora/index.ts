import type { ThemeCategory, ThemeDefinition } from "../types";
import metaJson from "./theme.json";

const meta = { ...metaJson, categories: metaJson.categories as ThemeCategory[] };

export const auroraTheme: ThemeDefinition = {
  key: "aurora",
  layout: "list",
  meta,
  colors: {
    primary: "#f4f5fb",
    secondary: "#c4b5fd",
    accent: "#22d3ee",
    background: "#07080c",
    surface: "rgba(255,255,255,0.05)",
    text: "#f4f5fb",
    textMuted: "#a5a8c3",
  },
  typography: {
    font: "space-grotesk",
    headingWeight: 600,
    bodyWeight: 500,
    letterSpacing: "normal",
    lineHeight: "normal",
    textTransform: "none",
  },
  buttons: { treatment: "glow", shape: "pill" },
  cards: { radius: "lg", shadow: "glow", border: "subtle" },
  animations: { entrance: "float", hover: "glow" },
  effects: { background: { type: "aurora" }, glow: true },
};
