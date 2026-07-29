"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { adminFetch } from "@/lib/api-client";
import type { LinkItem } from "@/types/link";
import { LinkFormDialog, type LinkFormValues } from "./link-form-dialog";
import { SortableLinkRow } from "./sortable-link-row";

export function LinksManager({ initialLinks }: { initialLinks: LinkItem[] }) {
  const [links, setLinks] = useState<LinkItem[]>(initialLinks);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  function openCreateDialog() {
    setEditingLink(null);
    setDialogOpen(true);
  }

  function openEditDialog(link: LinkItem) {
    setEditingLink(link);
    setDialogOpen(true);
  }

  async function handleSubmit(values: LinkFormValues) {
    try {
      if (editingLink) {
        const updated = await adminFetch<LinkItem>(`/admin/links/${editingLink.id}`, {
          method: "PATCH",
          body: JSON.stringify(values),
        });
        setLinks((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
        toast.success("Enlace actualizado");
      } else {
        const created = await adminFetch<LinkItem>("/admin/links", {
          method: "POST",
          body: JSON.stringify(values),
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

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = links.findIndex((l) => l.id === active.id);
    const newIndex = links.findIndex((l) => l.id === over.id);
    const reordered = arrayMove(links, oldIndex, newIndex);
    setLinks(reordered);

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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button onClick={openCreateDialog}>
          <Plus className="size-4" />
          Nuevo enlace
        </Button>
      </div>

      {links.length === 0 ? (
        <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          Todavía no tienes enlaces. Crea el primero.
        </p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={links.map((l) => l.id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-2">
              {links.map((link) => (
                <SortableLinkRow
                  key={link.id}
                  link={link}
                  onToggleActive={handleToggleActive}
                  onEdit={openEditDialog}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <LinkFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        link={editingLink}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
