"use client";

import { Copy, Eye, EyeOff, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SelectionToolbarProps {
  count: number;
  /** Locked blocks can't be duplicated/deleted from the single-item canvas
   * overlay either — bulk actions honor the same rule, so these can be
   * smaller than `count` when the selection includes locked blocks. */
  duplicableCount: number;
  deletableCount: number;
  onDuplicate: () => void;
  onHide: () => void;
  onShow: () => void;
  onDelete: () => void;
  onClear: () => void;
}

/**
 * Floating bar shown above the canvas whenever 2+ blocks are selected
 * (shift/ctrl+click, see workspace.tsx). A single block still uses the
 * Inspector panel for editing — this only covers the bulk actions that
 * apply to a *set* of blocks: duplicate, hide, show, delete.
 */
export function SelectionToolbar({
  count,
  duplicableCount,
  deletableCount,
  onDuplicate,
  onHide,
  onShow,
  onDelete,
  onClear,
}: SelectionToolbarProps) {
  return (
    <div className="sticky top-3 z-30 mx-auto mb-3 flex w-fit items-center gap-0.5 rounded-full border border-border bg-surface-2/95 px-2 py-1.5 shadow-lg backdrop-blur">
      <span className="px-2 text-xs font-medium whitespace-nowrap text-muted-foreground">
        {count} seleccionados
      </span>
      <div className="mx-1 h-4 w-px bg-border-subtle" />
      <Button size="xs" variant="ghost" onClick={onDuplicate} disabled={duplicableCount === 0}>
        <Copy className="size-3.5" />
        Duplicar
      </Button>
      <Button size="xs" variant="ghost" onClick={onHide}>
        <EyeOff className="size-3.5" />
        Ocultar
      </Button>
      <Button size="xs" variant="ghost" onClick={onShow}>
        <Eye className="size-3.5" />
        Mostrar
      </Button>
      <Button
        size="xs"
        variant="ghost"
        onClick={onDelete}
        disabled={deletableCount === 0}
        className="text-destructive hover:text-destructive"
      >
        <Trash2 className="size-3.5" />
        Eliminar
      </Button>
      <button
        type="button"
        onClick={onClear}
        aria-label="Cerrar selección"
        className="flex size-6 shrink-0 items-center justify-center rounded-full text-muted-foreground outline-none hover:bg-surface-5 hover:text-foreground"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}
