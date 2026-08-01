"use client";

import { useCallback, useState } from "react";
import type { LinkItem } from "@/types/link";

type HistoryEntry =
  | { kind: "update"; linkId: string; before: Record<string, unknown>; after: Record<string, unknown> }
  | { kind: "reorder"; before: LinkItem[]; after: LinkItem[] }
  | { kind: "batch"; entries: { linkId: string; before: Record<string, unknown>; after: Record<string, unknown> }[] };

interface UseEditorHistoryOptions {
  /** Same PATCH path every other edit already goes through (see
   * `useLinksManager.patchLink`) — undo/redo never drifts from "the user
   * just edited it again by hand" would produce. */
  applyPatch: (linkId: string, patch: Record<string, unknown>) => void | Promise<void>;
  /** Same reorder path `useLinksManager.applyOrder` uses. */
  applyReorder: (order: LinkItem[]) => void | Promise<void>;
}

const MAX_HISTORY = 50;

/**
 * Client-side, in-memory undo/redo for the Visual Editor (see
 * design-system/architecture/visual-editor.md — "Historial"). Deliberately
 * covers only field edits (title/url/icon/metadata/styleOverrides/
 * visibility) and reordering — NOT creating or deleting a block. The
 * server assigns a fresh id to every created row, so "redo a delete" or
 * "undo a create" would need to resurrect a row under its old id to stay
 * consistent with any later history entry referencing it, which a
 * client-only stack can't guarantee. Delete/create stay immediate and
 * final, exactly as they behaved before this feature existed.
 */
export function useEditorHistory({ applyPatch, applyReorder }: UseEditorHistoryOptions) {
  const [past, setPast] = useState<HistoryEntry[]>([]);
  const [future, setFuture] = useState<HistoryEntry[]>([]);

  const record = useCallback((entry: HistoryEntry) => {
    setPast((prev) => [...prev.slice(-(MAX_HISTORY - 1)), entry]);
    setFuture([]);
  }, []);

  const recordUpdate = useCallback(
    (linkId: string, before: Record<string, unknown>, after: Record<string, unknown>) => {
      record({ kind: "update", linkId, before, after });
    },
    [record],
  );

  const recordReorder = useCallback(
    (before: LinkItem[], after: LinkItem[]) => {
      record({ kind: "reorder", before, after });
    },
    [record],
  );

  /** One undo/redo step for a multi-block action (e.g. bulk hide/show) —
   * applying N `recordUpdate` calls instead would need N separate
   * Ctrl+Z presses to undo a single bulk action, which doesn't match
   * what the user just did. */
  const recordBatch = useCallback(
    (entries: { linkId: string; before: Record<string, unknown>; after: Record<string, unknown> }[]) => {
      if (entries.length === 0) return;
      record({ kind: "batch", entries });
    },
    [record],
  );

  async function invert(entry: HistoryEntry, direction: "undo" | "redo") {
    if (entry.kind === "update") {
      await applyPatch(entry.linkId, direction === "undo" ? entry.before : entry.after);
    } else if (entry.kind === "reorder") {
      await applyReorder(direction === "undo" ? entry.before : entry.after);
    } else {
      await Promise.all(
        entry.entries.map((e) => applyPatch(e.linkId, direction === "undo" ? e.before : e.after)),
      );
    }
  }

  const undo = useCallback(async () => {
    if (past.length === 0) return;
    const entry = past[past.length - 1];
    setPast((prev) => prev.slice(0, -1));
    setFuture((prev) => [...prev, entry]);
    await invert(entry, "undo");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [past]);

  const redo = useCallback(async () => {
    if (future.length === 0) return;
    const entry = future[future.length - 1];
    setFuture((prev) => prev.slice(0, -1));
    setPast((prev) => [...prev, entry]);
    await invert(entry, "redo");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [future]);

  return {
    recordUpdate,
    recordReorder,
    recordBatch,
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    historySize: past.length,
  };
}
