"use client";

import { Check, Copy, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getResolvedDefinition, resolveTheme } from "@/themes/resolve-theme";
import { resolveButtonTreatment } from "@/themes/shared/button-treatments";
import { THEME_CATEGORY_LABELS } from "@/themes/types";
import type { ThemeData } from "@/types/profile";

interface ThemePreviewCardProps {
  theme: ThemeData;
  isActive: boolean;
  isFavorite: boolean;
  onApply: () => void;
  onToggleFavorite: () => void;
  onDuplicate: () => void;
}

/**
 * A live-rendered miniature of a theme, built from its own real tokens —
 * this is the "preview.png" from the spec, deliberately not a static
 * image (see design-system/architecture/theme-engine.md): it can never
 * go stale, and it doubles as a correctness check that the theme's
 * tokens actually resolve to something.
 */
export function ThemePreviewCard({
  theme,
  isActive,
  isFavorite,
  onApply,
  onToggleFavorite,
  onDuplicate,
}: ThemePreviewCardProps) {
  const definition = getResolvedDefinition(theme.key, theme.layout, theme.baseConfig);
  const resolved = resolveTheme(definition, {}, null);
  const treatment = resolveButtonTreatment(resolved.buttonTreatment, resolved.primaryColor, resolved.secondaryColor);

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border transition-colors",
        isActive ? "border-brand-purple" : "border-border hover:border-border-hover",
      )}
    >
      <div
        className="relative flex h-40 flex-col items-center justify-center gap-2 overflow-hidden p-4"
        style={{ ...resolved.background.style, color: resolved.primaryColor, fontFamily: resolved.fontFamilyCss }}
      >
        {resolved.background.decoration === "aurora" && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div
              className="absolute left-[-30%] top-[-30%] size-[80%] rounded-full blur-[40px]"
              style={{ backgroundColor: `${resolved.primaryColor}40` }}
            />
            <div
              className="absolute right-[-30%] bottom-[-30%] size-[80%] rounded-full blur-[40px]"
              style={{ backgroundColor: `${resolved.accentColor}30` }}
            />
          </div>
        )}
        <div
          className="relative z-10 size-8 rounded-full border-2"
          style={{ borderColor: resolved.primaryColor, backgroundColor: `${resolved.primaryColor}22` }}
        />
        <span className="relative z-10 text-xs font-semibold" style={{ fontWeight: resolved.headingWeight }}>
          {theme.name}
        </span>
        <div
          className={`relative z-10 w-24 px-3 py-1.5 text-center text-[10px] font-medium ${treatment.className} ${resolved.buttonRadiusClass}`}
          style={{ ...treatment.style }}
        >
          Enlace
        </div>
        {isActive && (
          <span className="absolute right-2 top-2 z-10 flex size-6 items-center justify-center rounded-full bg-brand-purple text-white">
            <Check className="size-3.5" />
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold">{theme.name}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{definition.meta.tagline}</p>
          </div>
          <button
            type="button"
            onClick={onToggleFavorite}
            aria-label={isFavorite ? "Quitar de favoritos" : "Marcar favorito"}
            className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-surface-4 hover:text-brand-warning"
          >
            <Star className={cn("size-4", isFavorite && "fill-brand-warning text-brand-warning")} />
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {definition.meta.categories.map((category) => (
            <span
              key={category}
              className="rounded-full border border-border-subtle bg-surface-2 px-2 py-0.5 text-[10px] text-muted-foreground"
            >
              {THEME_CATEGORY_LABELS[category]}
            </span>
          ))}
        </div>

        <div className="mt-auto flex items-center gap-2 pt-2">
          <Button size="sm" className="flex-1" onClick={onApply} disabled={isActive}>
            {isActive ? "Aplicado" : "Aplicar tema"}
          </Button>
          <Button size="icon-sm" variant="outline" onClick={onDuplicate} aria-label="Duplicar tema">
            <Copy className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
