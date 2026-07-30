import type { BlockKind } from "./types";

export interface BlockCategory {
  key: string;
  label: string;
  kinds: BlockKind[];
}

/**
 * Grouping for the Visual Editor's Block Library panel (see
 * design-system/architecture/visual-editor.md). A kind can appear in more
 * than one category — the Gallery block already renders grid/carousel/
 * masonry (see GalleryBlock/config.ts), so it covers both "Galería" and
 * "Carrusel" instead of needing a second, near-duplicate block.
 *
 * Categories with an empty `kinds` array are ones the spec's taxonomy asks
 * for that don't have a real block behind them yet (Texto, Imagen,
 * Calendario, HTML personalizado, Contador, Separadores) — the panel shows
 * them as "Próximamente" instead of hiding them, so the requested category
 * list is visible today even though not every block exists. "Música" and
 * "Precios" aren't in the original spec list but are added here since
 * MusicBlock/PricingBlock already exist and need a home in the library.
 */
export const BLOCK_CATEGORIES: BlockCategory[] = [
  { key: "profile", label: "Perfil", kinds: ["PROFILE"] },
  { key: "hero", label: "Hero", kinds: ["HERO"] },
  { key: "buttons", label: "Botones", kinds: ["LINK"] },
  { key: "text", label: "Texto", kinds: [] },
  { key: "image", label: "Imagen", kinds: [] },
  { key: "video", label: "Video", kinds: ["VIDEO"] },
  { key: "music", label: "Música", kinds: ["MUSIC"] },
  { key: "gallery", label: "Galería", kinds: ["GALLERY"] },
  { key: "carousel", label: "Carrusel", kinds: ["GALLERY"] },
  { key: "products", label: "Productos", kinds: ["PRODUCT"] },
  { key: "pricing", label: "Precios", kinds: ["PRICING"] },
  { key: "services", label: "Servicios", kinds: ["SERVICE"] },
  { key: "testimonials", label: "Testimonios", kinds: ["TESTIMONIAL"] },
  { key: "faq", label: "FAQ", kinds: ["FAQ"] },
  { key: "form", label: "Formulario", kinds: ["FORM"] },
  { key: "map", label: "Mapa", kinds: ["LOCATION"] },
  { key: "calendar", label: "Calendario", kinds: [] },
  { key: "social", label: "Redes Sociales", kinds: ["SOCIAL", "WHATSAPP", "EMAIL"] },
  { key: "html", label: "HTML personalizado", kinds: [] },
  { key: "counter", label: "Contador", kinds: [] },
  { key: "countdown", label: "Cuenta regresiva", kinds: ["COUNTDOWN"] },
  { key: "divider", label: "Separadores", kinds: [] },
  { key: "footer", label: "Footer", kinds: ["FOOTER"] },
];
