import type { ThemeCategory, ThemeDefinition } from "../types";
import metaJson from "./theme.json";

const meta = { ...metaJson, categories: metaJson.categories as ThemeCategory[] };

export const purpleNeonTheme: ThemeDefinition = {
  key: "purple-neon",
  layout: "list",
  meta,
  colors: {
    primary: "#f5f3ff",
    secondary: "#c4b5fd",
    accent: "#d946ef",
    background: "#0b0518",
    surface: "rgba(217,70,239,0.08)",
    text: "#f5f3ff",
    textMuted: "#c4b5fd",
  },
  typography: {
    font: "space-grotesk",
    headingWeight: 700,
    bodyWeight: 500,
    letterSpacing: "normal",
    lineHeight: "normal",
    textTransform: "none",
  },
  buttons: { treatment: "glow", shape: "rounded" },
  cards: { radius: "lg", shadow: "glow", border: "solid" },
  animations: { entrance: "pulse", hover: "glow" },
  effects: { background: { type: "gradient", value: "linear-gradient(160deg, #2e1065, #86198f)" }, glow: true },
};
