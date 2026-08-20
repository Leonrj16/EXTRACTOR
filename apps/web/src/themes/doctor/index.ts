import type { ThemeCategory, ThemeDefinition } from "../types";
import metaJson from "./theme.json";

const meta = { ...metaJson, categories: metaJson.categories as ThemeCategory[] };

export const doctorTheme: ThemeDefinition = {
  key: "doctor",
  layout: "list",
  meta,
  colors: {
    primary: "#0f172a",
    secondary: "#64748b",
    accent: "#0ea5e9",
    background: "#f8fafc",
    surface: "#ffffff",
    text: "#0f172a",
    textMuted: "#64748b",
  },
  typography: {
    font: "dm-sans",
    headingWeight: 600,
    bodyWeight: 400,
    letterSpacing: "normal",
    lineHeight: "normal",
    textTransform: "none",
  },
  buttons: { treatment: "filled", shape: "rounded" },
  cards: { radius: "md", shadow: "soft", border: "subtle" },
  animations: { entrance: "fade", hover: "lift" },
  effects: { background: { type: "solid" }, glow: false },
};
