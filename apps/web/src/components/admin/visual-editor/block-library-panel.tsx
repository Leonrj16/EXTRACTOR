"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Clock, Search, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { BLOCK_CATEGORIES } from "@/components/blocks/categories";
import { BLOCK_REGISTRY, getBlockDefinition } from "@/components/blocks/registry";
import type { BlockKind } from "@/components/blocks/types";

const FAVORITES_KEY = "aura:editor:favorite-blocks";
const RECENT_KEY = "aura:editor:recent-blocks";
const MAX_RECENT = 6;

function readLocalList(key: string): BlockKind[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as BlockKind[]) : [];
  } catch {
    return [];
  }
}

function writeLocalList(key: string, value: BlockKind[]) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage unavailable (private mode, quota) — favorites/recent are
    // a convenience, not critical data, so fail silently.
  }
}

/** Records a block kind as "recently used" — called by the workspace right
 * after the user adds one to the canvas. */
export function pushRecentBlock(kind: BlockKind) {
  const current = readLocalList(RECENT_KEY).filter((k) => k !== kind);
  writeLocalList(RECENT_KEY, [kind, ...current].slice(0, MAX_RECENT));
}

const ALL_KINDS = Object.keys(BLOCK_REGISTRY) as BlockKind[];

export function BlockLibraryPanel({ onAddBlock }: { onAddBlock: (kind: BlockKind) => void }) {
  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState<BlockKind[]>([]);
  const [recent, setRecent] = useState<BlockKind[]>([]);
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    setFavorites(readLocalList(FAVORITES_KEY));
    setRecent(readLocalList(RECENT_KEY));
  }, []);

  // Re-read "recent" every time a block gets added, since pushRecentBlock
  // writes to localStorage from outside this component's own handlers.
  function refreshRecent() {
    setRecent(readLocalList(RECENT_KEY));
  }

  function toggleFavorite(kind: BlockKind, event: React.MouseEvent) {
    event.stopPropagation();
    setFavorites((prev) => {
      const next = prev.includes(kind) ? prev.filter((k) => k !== kind) : [...prev, kind];
      writeLocalList(FAVORITES_KEY, next);
      return next;
    });
  }

  function toggleCategory(key: string) {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const normalizedQuery = query.trim().toLowerCase();

  const matchingKinds = useMemo(() => {
    if (!normalizedQuery) return null;
    return ALL_KINDS.filter((kind) => {
      const def = getBlockDefinition(kind);
      if (!def) return false;
      return (
        def.label.toLowerCase().includes(normalizedQuery) ||
        def.description.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [normalizedQuery]);

  function handleAdd(kind: BlockKind) {
    onAddBlock(kind);
    pushRecentBlock(kind);
    refreshRecent();
  }

  return (
    <div className="flex h-full flex-col gap-3 overflow-hidden border-r border-border-subtle bg-surface-1/40 p-3">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar bloques…"
          className="pl-9"
          aria-label="Buscar bloques"
        />
      </div>

      <div className="flex-1 overflow-y-auto pr-1">
        {matchingKinds ? (
          <BlockGrid kinds={matchingKinds} favorites={favorites} onAdd={handleAdd} onToggleFavorite={toggleFavorite} />
        ) : (
          <div className="flex flex-col gap-1">
            {favorites.length > 0 && (
              <CategorySection
                label="Favoritos"
                icon={Star}
                kinds={favorites}
                open={openCategories.has("__favorites")}
                onToggle={() => toggleCategory("__favorites")}
                favorites={favorites}
                onAdd={handleAdd}
                onToggleFavorite={toggleFavorite}
              />
            )}
            {recent.length > 0 && (
              <CategorySection
                label="Recientes"
                icon={Clock}
                kinds={recent}
                open={openCategories.has("__recent")}
                onToggle={() => toggleCategory("__recent")}
                favorites={favorites}
                onAdd={handleAdd}
                onToggleFavorite={toggleFavorite}
              />
            )}
            {BLOCK_CATEGORIES.map((category) => (
              <CategorySection
                key={category.key}
                label={category.label}
                kinds={category.kinds}
                comingSoon={category.kinds.length === 0}
                open={openCategories.has(category.key)}
                onToggle={() => toggleCategory(category.key)}
                favorites={favorites}
                onAdd={handleAdd}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CategorySection({
  label,
  icon: Icon,
  kinds,
  comingSoon,
  open,
  onToggle,
  favorites,
  onAdd,
  onToggleFavorite,
}: {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  kinds: BlockKind[];
  comingSoon?: boolean;
  open: boolean;
  onToggle: () => void;
  favorites: BlockKind[];
  onAdd: (kind: BlockKind) => void;
  onToggleFavorite: (kind: BlockKind, event: React.MouseEvent) => void;
}) {
  return (
    <div className="border-b border-border-subtle last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-2 py-2.5 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
      >
        <span className="flex items-center gap-1.5">
          {Icon && <Icon className="size-3.5" />}
          {label}
          {comingSoon && <span className="normal-case text-muted-foreground/70">(Próximamente)</span>}
        </span>
        <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="pb-3">
          {comingSoon ? (
            <p className="rounded-lg border border-dashed border-border px-3 py-2 text-xs text-muted-foreground">
              Este tipo de bloque llegará pronto.
            </p>
          ) : (
            <BlockGrid kinds={kinds} favorites={favorites} onAdd={onAdd} onToggleFavorite={onToggleFavorite} />
          )}
        </div>
      )}
    </div>
  );
}

function BlockGrid({
  kinds,
  favorites,
  onAdd,
  onToggleFavorite,
}: {
  kinds: BlockKind[];
  favorites: BlockKind[];
  onAdd: (kind: BlockKind) => void;
  onToggleFavorite: (kind: BlockKind, event: React.MouseEvent) => void;
}) {
  if (kinds.length === 0) {
    return <p className="px-1 text-xs text-muted-foreground">Sin resultados.</p>;
  }
  return (
    <div className="grid grid-cols-2 gap-2">
      {kinds.map((kind) => {
        const def = getBlockDefinition(kind);
        if (!def) return null;
        const Icon = def.icon;
        const isFavorite = favorites.includes(kind);
        return (
          // A <div role="button"> (not a nested <button>) — the favorite
          // star below is a real <button>, and buttons can't contain
          // buttons without breaking hydration/accessibility.
          <div
            key={kind}
            role="button"
            tabIndex={0}
            onClick={() => onAdd(kind)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onAdd(kind);
              }
            }}
            title={def.description}
            aria-label={`Agregar bloque ${def.label}`}
            className="group relative flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border border-border bg-surface-2 px-2 py-3 text-center outline-none transition-colors hover:border-brand-purple/50 hover:bg-surface-4 focus-visible:ring-2 focus-visible:ring-ring/40"
          >
            <button
              type="button"
              onClick={(e) => onToggleFavorite(kind, e)}
              aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
              className="absolute top-1 right-1 rounded-md p-1 text-muted-foreground/50 outline-none transition-colors hover:text-brand-warning focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              <Star className={cn("size-3", isFavorite && "fill-brand-warning text-brand-warning")} />
            </button>
            <Icon className="size-5 text-muted-foreground group-hover:text-foreground" />
            <span className="text-xs font-medium">{def.label}</span>
          </div>
        );
      })}
    </div>
  );
}
