"use client";

import { useState } from "react";
import {
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { toast } from "sonner";
import { adminFetch } from "@/lib/api-client";
import type { LinkItem } from "@/types/link";
import type { LinkFormValues } from "./link-form-dialog";

function buildPayload(values: LinkFormValues) {
  const isForm = values.type === "FORM";

  return {
    type: values.type,
    title: values.title,
    url: isForm ? undefined : values.url || undefined,
    icon: values.icon || undefined,
    imageUrl: values.imageUrl || undefined,
    metadata: Object.keys(values.metadata).length ? values.metadata : undefined,
    styleOverrides: Object.keys(values.styleOverrides).length ? values.styleOverrides : undefined,
  };
}

/**
 * Shared block (Link) CRUD + reorder logic. Used by both the standalone
 * /admin/links page and the design editor's "Bloques" tab so add/edit/
 * delete/duplicate/hide/move behave identically in both places instead of
 * being implemented twice.
 */
export function useLinksManager(initialLinks: LinkItem[]) {
  const [links, setLinks] = useState<LinkItem[]>(initialLinks);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messagesLink, setMessagesLink] = useState<LinkItem | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  function openCreateDialog() {
    setEditingLink(null);
    setDialogOpen(true);
  }

  function openEditDialog(link: LinkItem) {
    setEditingLink(link);
    setDialogOpen(true);
  }

  async function persistOrder(reordered: LinkItem[]) {
    try {
      await adminFetch("/admin/links/reorder", {
        method: "PATCH",
        body: JSON.stringify({
          items: reordered.map((link, index) => ({ id: link.id, order: (index + 1) * 10 })),
        }),
      });
    } catch {
      toast.error("No se pudo guardar el nuevo orden");
    }
  }

  async function handleSubmit(values: LinkFormValues) {
    const payload = buildPayload(values);
    try {
      if (editingLink) {
        const updated = await adminFetch<LinkItem>(`/admin/links/${editingLink.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        setLinks((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
        toast.success("Enlace actualizado");
      } else {
        const created = await adminFetch<LinkItem>("/admin/links", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setLinks((prev) => [...prev, created]);
        toast.success("Enlace creado");
      }
    } catch {
      toast.error("No se pudo guardar el enlace");
    }
  }

  async function handleToggleActive(link: LinkItem) {
    const previous = links;
    setLinks((prev) =>
      prev.map((l) => (l.id === link.id ? { ...l, isActive: !l.isActive } : l)),
    );
    try {
      await adminFetch(`/admin/links/${link.id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !link.isActive }),
      });
    } catch {
      setLinks(previous);
      toast.error("No se pudo actualizar el enlace");
    }
  }

  async function handleDelete(link: LinkItem) {
    const previous = links;
    setLinks((prev) => prev.filter((l) => l.id !== link.id));
    try {
      await adminFetch(`/admin/links/${link.id}`, { method: "DELETE" });
      toast.success("Enlace eliminado");
    } catch {
      setLinks(previous);
      toast.error("No se pudo eliminar el enlace");
    }
  }

  /**
   * Low-level PATCH used by the Visual Editor's canvas/right-panel edits
   * (and by its undo/redo history) — same endpoint `handleSubmit` uses,
   * but takes a raw partial patch instead of a full `LinkFormValues` so a
   * single field (a color, a style override, a title) can be saved
   * without going through the form dialog.
   */
  async function patchLink(id: string, patch: Record<string, unknown>) {
    const previous = links;
    setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
    try {
      const updated = await adminFetch<LinkItem>(`/admin/links/${id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
      setLinks((prev) => prev.map((l) => (l.id === id ? updated : l)));
    } catch {
      setLinks(previous);
      toast.error("No se pudo guardar el cambio");
    }
  }

  /** Applies (and persists) a full reordered block list — used by the
   * Layers panel drag-reorder and by undo/redo of a reorder. */
  async function applyOrder(order: LinkItem[]) {
    setLinks(order);
    await persistOrder(order);
  }

  /** Swaps the local block list for one the server already persisted —
   * used after restoring a saved page version (page-versions-panel.tsx),
   * whose restore endpoint replaces every block server-side in one
   * transaction and returns the new set. No PATCH here: persisting is
   * already done, this only makes the UI catch up. */
  function replaceAll(newLinks: LinkItem[]) {
    setLinks(newLinks);
  }

  /**
   * Creates a block with sane defaults and appends it, skipping the modal
   * entirely — the Visual Editor's Block Library panel calls this so
   * clicking a block type drops it straight onto the canvas, already
   * selected for editing in the right-hand panel.
   */
  async function createBlock(
    type: LinkItem["type"],
    defaults: { title: string; metadata?: Record<string, unknown> },
  ): Promise<LinkItem | null> {
    try {
      const created = await adminFetch<LinkItem>("/admin/links", {
        method: "POST",
        body: JSON.stringify({
          type,
          title: defaults.title,
          metadata: defaults.metadata && Object.keys(defaults.metadata).length ? defaults.metadata : undefined,
        }),
      });
      setLinks((prev) => [...prev, created]);
      toast.success("Bloque agregado");
      return created;
    } catch {
      toast.error("No se pudo agregar el bloque");
      return null;
    }
  }

  async function handleDuplicate(link: LinkItem) {
    try {
      const created = await adminFetch<LinkItem>("/admin/links", {
        method: "POST",
        body: JSON.stringify({
          type: link.type,
          title: `${link.title} (copia)`,
          url: link.url ?? undefined,
          icon: link.icon ?? undefined,
          imageUrl: link.imageUrl ?? undefined,
          metadata: link.metadata ?? undefined,
          styleOverrides: link.styleOverrides ?? undefined,
        }),
      });
      const originalIndex = links.findIndex((l) => l.id === link.id);
      const withDuplicate = [...links];
      withDuplicate.splice(originalIndex + 1, 0, created);
      setLinks(withDuplicate);
      await persistOrder(withDuplicate);
      toast.success("Bloque duplicado");
    } catch {
      toast.error("No se pudo duplicar el bloque");
    }
  }

  /** Deletes several blocks at once (Visual Editor multi-select). Settles
   * each request independently instead of optimistically removing all of
   * them up front and rolling back on any failure — rolling back would
   * resurrect rows the server already deleted successfully, leaving the
   * UI showing "ghost" blocks that 404 on the next action. */
  async function handleBulkDelete(targets: LinkItem[]) {
    if (targets.length === 0) return;
    const results = await Promise.allSettled(
      targets.map((link) => adminFetch(`/admin/links/${link.id}`, { method: "DELETE" }).then(() => link.id)),
    );
    const deletedIds = new Set(
      results.filter((r): r is PromiseFulfilledResult<string> => r.status === "fulfilled").map((r) => r.value),
    );
    if (deletedIds.size > 0) {
      setLinks((prev) => prev.filter((l) => !deletedIds.has(l.id)));
    }
    const failedCount = targets.length - deletedIds.size;
    if (failedCount > 0) {
      toast.error(
        deletedIds.size > 0
          ? `${deletedIds.size} eliminados, ${failedCount} fallaron`
          : "No se pudieron eliminar los bloques",
      );
    } else {
      toast.success(`${targets.length} bloques eliminados`);
    }
  }

  /** Duplicates several blocks at once — appended at the end rather than
   * interleaved after each original (unlike single `handleDuplicate`):
   * with several source blocks the "right after each original" position
   * isn't a single well-defined spot anyway, and appending keeps this
   * simple to reason about. */
  async function handleBulkDuplicate(targets: LinkItem[]): Promise<LinkItem[]> {
    if (targets.length === 0) return [];
    const results = await Promise.allSettled(
      targets.map((link) =>
        adminFetch<LinkItem>("/admin/links", {
          method: "POST",
          body: JSON.stringify({
            type: link.type,
            title: `${link.title} (copia)`,
            url: link.url ?? undefined,
            icon: link.icon ?? undefined,
            imageUrl: link.imageUrl ?? undefined,
            metadata: link.metadata ?? undefined,
            styleOverrides: link.styleOverrides ?? undefined,
          }),
        }),
      ),
    );
    const created = results
      .filter((r): r is PromiseFulfilledResult<LinkItem> => r.status === "fulfilled")
      .map((r) => r.value);
    if (created.length > 0) {
      const withDuplicates = [...links, ...created];
      setLinks(withDuplicates);
      await persistOrder(withDuplicates);
    }
    const failedCount = targets.length - created.length;
    if (failedCount > 0) {
      toast.error(
        created.length > 0
          ? `${created.length} duplicados, ${failedCount} fallaron`
          : "No se pudieron duplicar los bloques",
      );
    } else {
      toast.success(`${targets.length} bloques duplicados`);
    }
    return created;
  }

  /** Sets isActive for several blocks at once (bulk "Ocultar"/"Mostrar").
   * Optimistic like `patchLink`, but reconciles per-block on partial
   * failure instead of rolling every block back to its pre-action state. */
  async function handleBulkSetActive(targets: LinkItem[], isActive: boolean) {
    if (targets.length === 0) return;
    const previousById = new Map(targets.map((link) => [link.id, link]));
    const ids = new Set(targets.map((link) => link.id));
    setLinks((prev) => prev.map((l) => (ids.has(l.id) ? { ...l, isActive } : l)));

    const results = await Promise.allSettled(
      targets.map((link) =>
        adminFetch(`/admin/links/${link.id}`, { method: "PATCH", body: JSON.stringify({ isActive }) }),
      ),
    );
    const failedIds = new Set(targets.filter((_, i) => results[i].status === "rejected").map((l) => l.id));
    if (failedIds.size > 0) {
      setLinks((prev) => prev.map((l) => (failedIds.has(l.id) ? (previousById.get(l.id) ?? l) : l)));
      toast.error(
        failedIds.size < targets.length
          ? `${targets.length - failedIds.size} actualizados, ${failedIds.size} fallaron`
          : "No se pudo actualizar la visibilidad",
      );
    } else {
      toast.success(isActive ? `${targets.length} bloques mostrados` : `${targets.length} bloques ocultos`);
    }
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = links.findIndex((l) => l.id === active.id);
    const newIndex = links.findIndex((l) => l.id === over.id);
    const reordered = arrayMove(links, oldIndex, newIndex);
    setLinks(reordered);
    await persistOrder(reordered);
  }

  const activeLink = links.find((l) => l.id === activeId) ?? null;

  return {
    links,
    dialogOpen,
    setDialogOpen,
    editingLink,
    messagesLink,
    setMessagesLink,
    sensors,
    activeLink,
    openCreateDialog,
    openEditDialog,
    handleSubmit,
    handleToggleActive,
    handleDelete,
    handleDuplicate,
    handleBulkDelete,
    handleBulkDuplicate,
    handleBulkSetActive,
    handleDragStart,
    handleDragEnd,
    patchLink,
    applyOrder,
    replaceAll,
    createBlock,
  };
}
