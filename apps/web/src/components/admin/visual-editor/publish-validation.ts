import { LINK_TYPE_LABELS, type LinkItem, type LinkType } from "@/types/link";
import type { ProfileData } from "@/types/profile";

export interface ValidationIssue {
  severity: "error" | "warning";
  message: string;
  linkId?: string;
}

/** Kinds whose whole point is taking the visitor somewhere — worth a
 * warning (not a hard error, some are legitimately still "coming soon"
 * placeholders) when they have no URL to go to. */
const URL_ORIENTED_TYPES: LinkType[] = ["LINK", "SOCIAL", "PRODUCT", "VIDEO", "MUSIC", "LOCATION"];

function linkLabel(link: LinkItem) {
  return link.title.trim() || LINK_TYPE_LABELS[link.type];
}

/**
 * Runs before "Publicar" (see design-system/architecture/visual-editor.md
 * — "Publicación"). Pure and synchronous: the workspace calls it against
 * the state already in memory, no extra request. Errors block publishing;
 * warnings don't, they're surfaced so the user can decide.
 */
export function validateForPublish(profile: ProfileData, links: LinkItem[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!profile.displayName.trim()) {
    issues.push({ severity: "error", message: "Falta el nombre a mostrar del perfil." });
  }
  if (!profile.avatarUrl) {
    issues.push({ severity: "warning", message: "No subiste una foto de perfil." });
  }
  if (!profile.seoTitle?.trim()) {
    issues.push({ severity: "warning", message: "Falta un título SEO — ayuda a que tu página se vea mejor al compartirla." });
  }
  if (!profile.seoDescription?.trim()) {
    issues.push({ severity: "warning", message: "Falta una descripción SEO." });
  }

  const activeLinks = links.filter((l) => l.isActive);
  if (activeLinks.length === 0) {
    issues.push({ severity: "error", message: "No tienes ningún bloque activo para mostrar." });
  }

  for (const link of activeLinks) {
    if (!link.title.trim()) {
      issues.push({
        severity: "error",
        message: `Un bloque de tipo "${LINK_TYPE_LABELS[link.type]}" no tiene título.`,
        linkId: link.id,
      });
    }

    if (URL_ORIENTED_TYPES.includes(link.type) && !link.url) {
      issues.push({
        severity: "warning",
        message: `El bloque "${linkLabel(link)}" no tiene un enlace configurado.`,
        linkId: link.id,
      });
    }

    if (link.type === "HERO" && !link.imageUrl) {
      issues.push({ severity: "warning", message: `El bloque Hero "${linkLabel(link)}" no tiene imagen de portada.`, linkId: link.id });
    }
    if (link.type === "PRODUCT" && !link.imageUrl) {
      issues.push({ severity: "warning", message: `El producto "${linkLabel(link)}" no tiene foto.`, linkId: link.id });
    }
    if (link.type === "GALLERY") {
      const images = (link.metadata as { images?: string[] } | null)?.images;
      if (!images || images.length === 0) {
        issues.push({ severity: "warning", message: `La galería "${linkLabel(link)}" no tiene imágenes.`, linkId: link.id });
      }
    }
  }

  return issues;
}
