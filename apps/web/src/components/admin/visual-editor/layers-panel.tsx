"use client";

import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Eye, EyeOff, GripVertical, Lock, Unlock } from "lucide-react";
import { getBlockDefinition } from "@/components/blocks/registry";
import type { BlockStyleOverrides } from "@/components/blocks/types";
import { LINK_TYPE_LABELS, type LinkItem } from "@/types/link";
import { cn } from "@/lib/utils";

interface LayersPanelProps {
  links: LinkItem[];
  selectedIds: string[];
  onSelect: (id: string, e: React.MouseEvent) => void;
  onToggleVisibility: (link: LinkItem) => void;
  onToggleLock: (link: LinkItem) => void;
  onReorder: (reordered: LinkItem[]) => void;
}

/**
 * Figma-style layer tree — same block list the canvas shows, in the same
 * order, reusable as a second way to select/reorder/hide/lock a block
 * without hunting for it on the canvas. Its own `DndContext` operates on
 * the same underlying array the canvas' does; the two never run at once
 * (a user drags in one place at a time), so there's no conflict running
 * both.
 */
export function LayersPanel({
  links,
  selectedIds,
  onSelect,
  onToggleVisibility,
  onToggleLock,
  onReorder,
}: LayersPanelProps) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = links.findIndex((l) => l.id === active.id);
    const newIndex = links.findIndex((l) => l.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    onReorder(arrayMove(links, oldIndex, newIndex));
  }

  if (links.length === 0) {
    return (
      <p className="p-3 text-xs text-muted-foreground">
        Todavía no hay bloques. Agrega uno desde la biblioteca.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2 overflow-y-auto p-2">
      <p className="px-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Capas</p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={links.map((l) => l.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-1">
            {links.map((link) => (
              <LayerRow
                key={link.id}
                link={link}
                selected={selectedIds.includes(link.id)}
                onSelect={(e) => onSelect(link.id, e)}
                onToggleVisibility={() => onToggleVisibility(link)}
                onToggleLock={() => onToggleLock(link)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function LayerRow({
  link,
  selected,
  onSelect,
  onToggleVisibility,
  onToggleLock,
}: {
  link: LinkItem;
  selected: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onToggleVisibility: () => void;
  onToggleLock: () => void;
}) {
  const locked = (link.styleOverrides as BlockStyleOverrides | null)?.locked ?? false;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: link.id,
    disabled: locked,
  });
  const definition = getBlockDefinition(link.type);
  const Icon = definition?.icon;

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex items-center gap-1.5 rounded-lg border px-1.5 py-1.5 text-sm transition-colors",
        selected ? "border-brand-purple/60 bg-surface-5" : "border-transparent hover:bg-surface-3",
        isDragging && "opacity-40",
      )}
    >
      <button
        {...attributes}
        {...listeners}
        disabled={locked}
        aria-label="Reordenar capa"
        className="flex size-6 shrink-0 items-center justify-center rounded text-muted-foreground/60 outline-none disabled:cursor-not-allowed disabled:opacity-30 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
      >
        <GripVertical className="size-3.5" />
      </button>

      <button
        type="button"
        onClick={onSelect}
        className="flex min-w-0 flex-1 items-center gap-2 truncate text-left outline-none"
      >
        {Icon && <Icon className="size-3.5 shrink-0 text-muted-foreground" />}
        <span className={cn("truncate", !link.isActive && "text-muted-foreground line-through")}>
          {link.title || LINK_TYPE_LABELS[link.type]}
        </span>
      </button>

      <button
        type="button"
        onClick={onToggleLock}
        aria-label={locked ? "Desbloquear bloque" : "Bloquear bloque"}
        className="flex size-6 shrink-0 items-center justify-center rounded text-muted-foreground/60 outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
      >
        {locked ? <Lock className="size-3.5" /> : <Unlock className="size-3.5 opacity-30" />}
      </button>

      <button
        type="button"
        onClick={onToggleVisibility}
        aria-label={link.isActive ? "Ocultar bloque" : "Mostrar bloque"}
        className="flex size-6 shrink-0 items-center justify-center rounded text-muted-foreground/60 outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
      >
        {link.isActive ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
      </button>
    </div>
  );
}
