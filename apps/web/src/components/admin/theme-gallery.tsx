"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminFetch } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { getResolvedDefinition } from "@/themes/resolve-theme";
import { THEME_CATEGORY_LABELS, type ThemeCategory } from "@/themes/types";
import type { ThemeData } from "@/types/profile";
import { ThemePreviewCard } from "./theme-preview-card";

const CATEGORY_OPTIONS = Object.keys(THEME_CATEGORY_LABELS) as ThemeCategory[];

interface SuggestResult {
  themeId: string | null;
  name: string | null;
  matched: boolean;
  reason: string;
}

interface ThemeGalleryProps {
  themes: ThemeData[];
  activeThemeId: string;
  favoriteThemeKeys: string[];
  onApply: (themeId: string) => void;
  onToggleFavorite: (themeKey: string) => Promise<void> | void;
  onDuplicate: (theme: ThemeData) => void;
}

export function ThemeGallery({
  themes,
  activeThemeId,
  favoriteThemeKeys,
  onApply,
  onToggleFavorite,
  onDuplicate,
}: ThemeGalleryProps) {
  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState<ThemeCategory[]>([]);
  const [prompt, setPrompt] = useState("");
  const [suggesting, setSuggesting] = useState(false);
  const [suggestion, setSuggestion] = useState<SuggestResult | null>(null);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return themes.filter((theme) => {
      const definition = getResolvedDefinition(theme.key, theme.layout, theme.baseConfig);
      const matchesQuery =
        !normalizedQuery ||
        theme.name.toLowerCase().includes(normalizedQuery) ||
        definition.meta.tagline.toLowerCase().includes(normalizedQuery);
      const matchesCategory =
        categories.length === 0 || definition.meta.categories.some((c) => categories.includes(c));
      return matchesQuery && matchesCategory;
    });
  }, [themes, query, categories]);

  function toggleCategory(category: ThemeCategory) {
    setCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    );
  }

  async function handleSuggest() {
    if (!prompt.trim()) return;
    setSuggesting(true);
    setSuggestion(null);
    try {
      const result = await adminFetch<SuggestResult>("/admin/themes/suggest", {
        method: "POST",
        body: JSON.stringify({ prompt }),
      });
      setSuggestion(result);
    } catch {
      toast.error("No se pudo generar una sugerencia");
    } finally {
      setSuggesting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Temas inteligentes — arquitectura preparada para IA, hoy resuelto
          con matching por palabras clave (ver ThemeAiService en el backend). */}
      <div className="flex flex-col gap-2 rounded-xl border border-border-subtle bg-surface-2 p-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Sparkles className="size-4 text-brand-purple" />
          Temas inteligentes
        </div>
        <p className="text-xs text-muted-foreground">
          Describe tu marca o rubro y te sugerimos el tema del catálogo que mejor encaja.
        </p>
        <div className="flex gap-2">
          <Input
            placeholder="Ej. un diseño elegante para un estudio jurídico"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSuggest()}
          />
          <Button size="sm" loading={suggesting} onClick={handleSuggest} className="shrink-0">
            Sugerir
          </Button>
        </div>
        {suggestion && (
          <div className="flex items-center justify-between gap-3 rounded-lg bg-surface-3 px-3 py-2 text-xs">
            <span className="text-muted-foreground">{suggestion.reason}</span>
            {suggestion.matched && suggestion.themeId && (
              <Button size="sm" variant="outline" onClick={() => onApply(suggestion.themeId!)}>
                Aplicar {suggestion.name}
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar tema…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORY_OPTIONS.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => toggleCategory(category)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              categories.includes(category)
                ? "border-transparent bg-gradient-aura text-white"
                : "border-border text-muted-foreground hover:bg-surface-3 hover:text-foreground",
            )}
          >
            {THEME_CATEGORY_LABELS[category]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Ningún tema coincide con tu búsqueda.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((theme) => (
            <ThemePreviewCard
              key={theme.id}
              theme={theme}
              isActive={theme.id === activeThemeId}
              isFavorite={favoriteThemeKeys.includes(theme.key)}
              onApply={() => onApply(theme.id)}
              onToggleFavorite={() => onToggleFavorite(theme.key)}
              onDuplicate={() => onDuplicate(theme)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
