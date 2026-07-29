export type LinkType =
  | "LINK"
  | "SOCIAL"
  | "WHATSAPP"
  | "EMAIL"
  | "LOCATION"
  | "PRODUCT"
  | "FORM"
  | "VIDEO"
  | "MUSIC";

export interface LinkMetadata {
  price?: string;
  currency?: string;
}

export interface LinkItem {
  id: string;
  type: LinkType;
  title: string;
  url: string | null;
  icon: string | null;
  imageUrl: string | null;
  metadata: LinkMetadata | null;
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
};
