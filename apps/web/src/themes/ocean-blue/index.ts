import type { ThemeCategory, ThemeDefinition } from "../types";
import metaJson from "./theme.json";

const meta = { ...metaJson, categories: metaJson.categories as ThemeCategory[] };

export const oceanBlueTheme: ThemeDefinition = {
  key: "ocean-blue",
  layout: "list",
  meta,
  colors: {
    primary: "#ffffff",
    secondary: "#bfdbfe",
    accent: "#0ea5e9",
    background: "#0c4a6e",
    surface: "rgba(255,255,255,0.06)",
    text: "#ffffff",
    textMuted: "#bfdbfe",
  },
  typography: {
    font: "dm-sans",
    headingWeight: 700,
    bodyWeight: 400,
    letterSpacing: "normal",
    lineHeight: "normal",
    textTransform: "none",
  },
  buttons: { treatment: "filled", shape: "rounded" },
  cards: { radius: "md", shadow: "soft", border: "subtle" },
  animations: { entrance: "slide", hover: "lift" },
  effects: { background: { type: "gradient", value: "linear-gradient(160deg, #082f49, #0c4a6e 60%, #0369a1)" }, glow: false },
};
