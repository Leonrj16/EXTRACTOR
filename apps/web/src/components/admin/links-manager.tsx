"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
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
import { LinkRow, SortableLinkRow } from "./sortable-link-row";
import { SubmissionsDialog } from "./submissions-dialog";

function buildPayload(values: LinkFormValues) {
  const isForm = values.type === "FORM";
  const isProduct = values.type === "PRODUCT";

  return {
    type: values.type,
    title: values.title,
    url: isForm ? undefined : values.url || undefined,
    icon: values.icon || undefined,
    metadata: isProduct
      ? { price: values.price || undefined, currency: values.currency || undefined }
      : undefined,
  };
}

export function LinksManager({ initialLinks }: { initialLinks: LinkItem[] }) {
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

  const activeLink = links.find((l) => l.id === activeId) ?? null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button onClick={openCreateDialog}>
          <Plus className="size-4" />
          Nuevo enlace
        </Button>
      </div>

      {links.length === 0 ? (
        <p className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-muted-foreground">
          Todavía no tienes enlaces. Crea el primero.
        </p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={links.map((l) => l.id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-3">
              {links.map((link) => (
                <SortableLinkRow
                  key={link.id}
                  link={link}
                  onToggleActive={handleToggleActive}
                  onEdit={openEditDialog}
                  onDelete={handleDelete}
                  onViewMessages={link.type === "FORM" ? setMessagesLink : undefined}
                />
              ))}
            </div>
          </SortableContext>
          <DragOverlay>
            {activeLink && <LinkRow link={activeLink} overlay />}
          </DragOverlay>
        </DndContext>
      )}

      <LinkFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        link={editingLink}
        onSubmit={handleSubmit}
      />

      <SubmissionsDialog
        link={messagesLink}
        onOpenChange={(open) => !open && setMessagesLink(null)}
      />
    </div>
  );
}
