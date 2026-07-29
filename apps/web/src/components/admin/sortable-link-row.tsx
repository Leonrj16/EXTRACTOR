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

const ICON_BUTTON =
  "flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground outline-none transition-colors hover:bg-white/[0.07] hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40";

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
      className={`flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] p-4 transition-colors hover:border-white/[0.12] ${
        overlay ? "shadow-2xl" : ""
      }`}
    >
      <button
        {...dragHandleProps}
        className="flex size-9 shrink-0 cursor-grab items-center justify-center rounded-lg text-muted-foreground outline-none transition-colors hover:bg-white/[0.07] hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40 active:cursor-grabbing"
        aria-label="Reordenar"
      >
        <GripVertical className="size-4" />
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <span className="min-w-0 truncate text-sm font-medium">{link.title}</span>
          <Badge variant="secondary" className="hidden shrink-0 sm:inline-flex">
            {LINK_TYPE_LABELS[link.type]}
          </Badge>
        </div>
        {link.url && <p className="mt-0.5 truncate text-xs text-muted-foreground">{link.url}</p>}
      </div>

      {onToggleActive && (
        <Switch
          checked={link.isActive}
          onCheckedChange={() => onToggleActive(link)}
          aria-label={link.isActive ? "Desactivar enlace" : "Activar enlace"}
        />
      )}

      {onViewMessages && (
        <button onClick={() => onViewMessages(link)} className={ICON_BUTTON} aria-label="Ver mensajes">
          <Mail className="size-4" />
        </button>
      )}
      {onEdit && (
        <button onClick={() => onEdit(link)} className={ICON_BUTTON} aria-label="Editar enlace">
          <Pencil className="size-4" />
        </button>
      )}
      {onDelete && (
        <button
          onClick={() => onDelete(link)}
          className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground outline-none transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:ring-2 focus-visible:ring-destructive/40"
          aria-label="Eliminar enlace"
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
