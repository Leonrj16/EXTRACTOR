"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Copy, GripVertical, Mail, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { LINK_TYPE_LABELS, type LinkItem } from "@/types/link";

interface LinkRowProps {
  link: LinkItem;
  overlay?: boolean;
  dragHandleProps?: Record<string, unknown>;
  onToggleActive?: (link: LinkItem) => void;
  onEdit?: (link: LinkItem) => void;
  onDuplicate?: (link: LinkItem) => void;
  onDelete?: (link: LinkItem) => void;
  onViewMessages?: (link: LinkItem) => void;
}

const ICON_BUTTON =
  "flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground outline-none transition-colors hover:bg-surface-6 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40";

export function LinkRow({
  link,
  overlay,
  dragHandleProps,
  onToggleActive,
  onEdit,
  onDuplicate,
  onDelete,
  onViewMessages,
}: LinkRowProps) {
  const hasMenu = onEdit || onDuplicate || onDelete || onViewMessages;

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border border-border-subtle bg-surface-1 p-4 transition-colors hover:border-border-strong ${
        overlay ? "shadow-2xl" : ""
      }`}
    >
      <button
        {...dragHandleProps}
        className="flex size-9 shrink-0 cursor-grab items-center justify-center rounded-lg text-muted-foreground outline-none transition-colors hover:bg-surface-6 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40 active:cursor-grabbing"
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

      {hasMenu && (
        <DropdownMenu>
          <DropdownMenuTrigger className={ICON_BUTTON} aria-label="Más acciones">
            <MoreVertical className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              {onViewMessages && (
                <DropdownMenuItem onClick={() => onViewMessages(link)}>
                  <Mail />
                  Ver mensajes
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(link)}>
                  <Pencil />
                  Editar
                </DropdownMenuItem>
              )}
              {onDuplicate && (
                <DropdownMenuItem onClick={() => onDuplicate(link)}>
                  <Copy />
                  Duplicar
                </DropdownMenuItem>
              )}
              {onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={() => onDelete(link)}>
                    <Trash2 />
                    Eliminar
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

interface SortableLinkRowProps {
  link: LinkItem;
  onToggleActive: (link: LinkItem) => void;
  onEdit: (link: LinkItem) => void;
  onDuplicate: (link: LinkItem) => void;
  onDelete: (link: LinkItem) => void;
  onViewMessages?: (link: LinkItem) => void;
}

export function SortableLinkRow({
  link,
  onToggleActive,
  onEdit,
  onDuplicate,
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
        onDuplicate={onDuplicate}
        onDelete={onDelete}
        onViewMessages={onViewMessages}
      />
    </div>
  );
}
