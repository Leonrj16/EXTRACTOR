"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Mail, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { LINK_TYPE_LABELS, type LinkItem } from "@/types/link";

interface LinkRowProps {
  link: LinkItem;
  overlay?: boolean;
  dragHandleProps?: Record<string, unknown>;
  onToggleActive?: (link: LinkItem) => void;
  onEdit?: (link: LinkItem) => void;
  onDelete?: (link: LinkItem) => void;
  onViewMessages?: (link: LinkItem) => void;
}

export function LinkRow({
  link,
  overlay,
  dragHandleProps,
  onToggleActive,
  onEdit,
  onDelete,
  onViewMessages,
}: LinkRowProps) {
  return (
    <div
      className={`flex items-center gap-3 rounded-lg border bg-background p-3 ${
        overlay ? "shadow-lg" : ""
      }`}
    >
      <button
        {...dragHandleProps}
        className="cursor-grab touch-none text-muted-foreground active:cursor-grabbing"
        aria-label="Reordenar"
      >
        <GripVertical className="size-4" />
      </button>

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{link.title}</span>
          <Badge variant="secondary">{LINK_TYPE_LABELS[link.type]}</Badge>
        </div>
        {link.url && <p className="truncate text-xs text-muted-foreground">{link.url}</p>}
      </div>

      {onToggleActive && (
        <Switch checked={link.isActive} onCheckedChange={() => onToggleActive(link)} />
      )}

      {onViewMessages && (
        <button
          onClick={() => onViewMessages(link)}
          className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Ver mensajes"
        >
          <Mail className="size-4" />
        </button>
      )}
      {onEdit && (
        <button
          onClick={() => onEdit(link)}
          className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Editar"
        >
          <Pencil className="size-4" />
        </button>
      )}
      {onDelete && (
        <button
          onClick={() => onDelete(link)}
          className="rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          aria-label="Eliminar"
        >
          <Trash2 className="size-4" />
        </button>
      )}
    </div>
  );
}

interface SortableLinkRowProps {
  link: LinkItem;
  onToggleActive: (link: LinkItem) => void;
  onEdit: (link: LinkItem) => void;
  onDelete: (link: LinkItem) => void;
  onViewMessages?: (link: LinkItem) => void;
}

export function SortableLinkRow({
  link,
  onToggleActive,
  onEdit,
  onDelete,
  onViewMessages,
}: SortableLinkRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: link.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={isDragging ? "opacity-40" : ""}
    >
      <LinkRow
        link={link}
        dragHandleProps={{ ...attributes, ...listeners }}
        onToggleActive={onToggleActive}
        onEdit={onEdit}
        onDelete={onDelete}
        onViewMessages={onViewMessages}
      />
    </div>
  );
}
