"use client";

import { useEffect, useRef } from "react";
import { Mail, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getBlockDefinition } from "@/components/blocks/registry";
import { BlockStylePanel } from "@/components/blocks/shared/style-panel";
import type { BlockStyleOverrides } from "@/components/blocks/types";
import { LINK_TYPE_LABELS, type LinkItem } from "@/types/link";

const AUTOSAVE_DELAY_MS = 500;

interface InspectorPanelProps {
  link: LinkItem | null;
  onClose: () => void;
  /** Patches persisted immediately (selects, switches, colors) call this
   * directly; text-field edits go through the debounced wrapper below so
   * typing a title doesn't fire a PATCH per keystroke. Both paths end up
   * calling this — it's the one function that talks to the server and
   * records history (see workspace.tsx). */
  onPatch: (linkId: string, patch: Record<string, unknown>, before: Record<string, unknown>) => void;
  /** FORM blocks collect submissions elsewhere (SubmissionsDialog) — this
   * opens that same dialog instead of the editor trying to render
   * messages inline. */
  onViewMessages?: (link: LinkItem) => void;
  /** How many blocks are currently selected — only matters when `link` is
   * null, to tell "nothing selected" apart from "a multi-selection is
   * active" (field-by-field editing only makes sense for exactly one
   * block; bulk actions for a multi-selection live in the toolbar above
   * the canvas instead, see workspace.tsx). */
  selectionCount?: number;
}

/**
 * The Visual Editor's right-hand properties panel — the direct-
 * manipulation replacement for `LinkFormDialog` (see
 * design-system/architecture/visual-editor.md). Renders the exact same
 * `definition.Settings` + `BlockStylePanel` every block already has; the
 * only thing that changes is *when* changes save — here, live, instead of
 * on a form Submit.
 */
export function InspectorPanel({ link, onClose, onPatch, onViewMessages, selectionCount = 0 }: InspectorPanelProps) {
  const pendingRef = useRef<{ patch: Record<string, unknown>; before: Record<string, unknown> } | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function flush(linkId: string) {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    if (pendingRef.current) {
      onPatch(linkId, pendingRef.current.patch, pendingRef.current.before);
      pendingRef.current = null;
    }
  }

  // Flush any pending debounced edit before switching to a different
  // block (or unmounting) so a fast click away never drops the last
  // keystroke of an edit in progress.
  useEffect(() => {
    const currentId = link?.id;
    return () => {
      if (currentId) flush(currentId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [link?.id]);

  if (!link) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 border-l border-border-subtle p-6 text-center">
        <p className="text-sm text-muted-foreground">
          {selectionCount > 1
            ? `${selectionCount} bloques seleccionados — usa la barra de acciones en lote arriba del lienzo.`
            : "Selecciona un bloque en el lienzo o en las capas para editar sus propiedades."}
        </p>
      </div>
    );
  }

  const definition = getBlockDefinition(link.type);
  const meta = link.metadata ?? {};
  const styleOverrides = (link.styleOverrides ?? {}) as BlockStyleOverrides;

  function debouncedPatch(patch: Record<string, unknown>, before: Record<string, unknown>) {
    pendingRef.current = {
      patch: { ...pendingRef.current?.patch, ...patch },
      before: { ...before, ...pendingRef.current?.before },
    };
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => flush(link!.id), AUTOSAVE_DELAY_MS);
  }

  function handleTopLevelPatch(patch: Partial<Pick<LinkItem, "title" | "url" | "icon" | "imageUrl">>) {
    const before = Object.fromEntries(Object.keys(patch).map((k) => [k, (link as unknown as Record<string, unknown>)[k]]));
    debouncedPatch(patch as Record<string, unknown>, before);
  }

  function handleMetaChange(metaPatch: Record<string, unknown>) {
    // Merge onto whatever metadata is already pending (not just the last
    // rendered `meta` prop) — two edits fired back-to-back, before React
    // re-renders with the first one applied, would otherwise each build
    // their patch from the same stale `meta` snapshot, and the second
    // patch's `metadata` object would silently overwrite the first's when
    // debouncedPatch merges top-level keys (metadata is a single key, so
    // that merge can't combine two different nested objects on its own).
    const pendingMeta = (pendingRef.current?.patch.metadata as Record<string, unknown> | undefined) ?? meta;
    const beforeMeta = Object.fromEntries(Object.keys(metaPatch).map((k) => [k, (meta as Record<string, unknown>)[k]]));
    debouncedPatch(
      { metadata: { ...pendingMeta, ...metaPatch } },
      { metadata: { ...meta, ...beforeMeta } },
    );
  }

  function handleStyleChange(patch: Partial<BlockStyleOverrides>) {
    // Same reasoning as handleMetaChange above, for styleOverrides.
    const pendingStyle = (pendingRef.current?.patch.styleOverrides as Record<string, unknown> | undefined) ?? styleOverrides;
    const beforeStyle = Object.fromEntries(Object.keys(patch).map((k) => [k, (styleOverrides as Record<string, unknown>)[k]]));
    debouncedPatch(
      { styleOverrides: { ...pendingStyle, ...patch } },
      { styleOverrides: { ...styleOverrides, ...beforeStyle } },
    );
  }

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto border-l border-border-subtle p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{link.title || LINK_TYPE_LABELS[link.type]}</p>
          <p className="text-xs text-muted-foreground">{LINK_TYPE_LABELS[link.type]}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar panel de propiedades"
          className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground outline-none transition-colors hover:bg-surface-6 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          <X className="size-4" />
        </button>
      </div>

      {link.type === "FORM" && onViewMessages && (
        <Button variant="outline" size="sm" onClick={() => onViewMessages(link)}>
          <Mail className="size-3.5" />
          Ver mensajes recibidos
        </Button>
      )}

      {definition ? (
        <>
          <definition.Settings link={link} meta={meta} onPatch={handleTopLevelPatch} onMetaChange={handleMetaChange} />
          <BlockStylePanel value={styleOverrides} onChange={handleStyleChange} idPrefix={`inspector-${link.id}`} />
        </>
      ) : (
        <p className="rounded-xl border border-border bg-surface-2 p-4 text-xs leading-relaxed text-muted-foreground">
          Este tipo de bloque no tiene un editor disponible todavía.
        </p>
      )}
    </div>
  );
}
