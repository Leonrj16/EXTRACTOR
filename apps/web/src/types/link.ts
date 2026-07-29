export type LinkType = "LINK" | "SOCIAL" | "WHATSAPP" | "EMAIL" | "LOCATION" | "PRODUCT" | "FORM";

export interface LinkItem {
  id: string;
  type: LinkType;
  title: string;
  url: string | null;
  icon: string | null;
  imageUrl: string | null;
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
  FORM: "Formulario",
};
