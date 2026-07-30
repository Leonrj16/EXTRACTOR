export type LinkType =
  | "LINK"
  | "SOCIAL"
  | "WHATSAPP"
  | "EMAIL"
  | "LOCATION"
  | "PRODUCT"
  | "FORM"
  | "VIDEO"
  | "MUSIC"
  | "GALLERY"
  | "TESTIMONIAL"
  | "FAQ"
  | "PROFILE"
  | "HERO"
  | "SERVICE"
  | "PRICING"
  | "COUNTDOWN"
  | "FOOTER";

// Opaque JSON envelope — each block kind defines its own, more specific
// metadata shape in its own `types.ts` (e.g. blocks/GalleryBlock/types.ts)
// and narrows via `link.metadata as GalleryMetadata`. The index signature
// keeps that narrowing cast direct instead of requiring `as unknown as`.
export interface LinkMetadata {
  price?: string;
  currency?: string;
  [key: string]: unknown;
}

export interface LinkItem {
  id: string;
  type: LinkType;
  title: string;
  url: string | null;
  icon: string | null;
  imageUrl: string | null;
  metadata: LinkMetadata | null;
  // Shared style panel (padding/margin/background/border/radius/shadow/
  // align/width/opacity/animation) — see blocks/types.ts BlockStyleOverrides.
  styleOverrides: Record<string, unknown> | null;
  isActive: boolean;
  order: number;
}

export const LINK_TYPE_LABELS: Record<LinkType, string> = {
  LINK: "Enlace",
  SOCIAL: "Red social",
  WHATSAPP: "WhatsApp",
  EMAIL: "Email",
  LOCATION: "Ubicación",
  PRODUCT: "Producto",
  FORM: "Formulario de contacto",
  VIDEO: "Video (YouTube/Vimeo)",
  MUSIC: "Música (Spotify)",
  GALLERY: "Galería",
  TESTIMONIAL: "Testimonio",
  FAQ: "Preguntas frecuentes",
  PROFILE: "Perfil",
  HERO: "Portada (Hero)",
  SERVICE: "Servicio",
  PRICING: "Plan de precios",
  COUNTDOWN: "Cuenta regresiva",
  FOOTER: "Pie de página",
};
