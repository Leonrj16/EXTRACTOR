"use client";

import {
  DndContext,
  DragOverlay,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LinkItem } from "@/types/link";
import { LinkFormDialog } from "./link-form-dialog";
import { LinkRow, SortableLinkRow } from "./sortable-link-row";
import { SubmissionsDialog } from "./submissions-dialog";
import { useLinksManager } from "./use-links-manager";

export function LinksManager({ initialLinks }: { initialLinks: LinkItem[] }) {
  const {
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
    handleDragStart,
    handleDragEnd,
  } = useLinksManager(initialLinks);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button onClick={openCreateDialog}>
          <Plus className="size-4" />
          Nuevo enlace
        </Button>
      </div>

      {links.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
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
                  onDuplicate={handleDuplicate}
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
