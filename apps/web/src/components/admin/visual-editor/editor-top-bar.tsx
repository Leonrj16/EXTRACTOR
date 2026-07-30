"use client";

import { AlertTriangle, Check, Eye, EyeOff, History, Redo2, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CopyLinkButton } from "@/components/admin/copy-link-button";
import { QrCodeButton } from "@/components/admin/qr-code-button";
import { cn } from "@/lib/utils";
import { DEVICES, type DeviceId } from "@/components/admin/design-editor";

export type SaveState = "idle" | "saving" | "saved";

interface EditorTopBarProps {
  projectName: string;
  saveState: SaveState;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  historySize: number;
  device: DeviceId;
  onDeviceChange: (device: DeviceId) => void;
  previewMode: boolean;
  onTogglePreview: () => void;
  isPublished: boolean;
  publicPath: string;
  onPublish: () => void;
  publishing: boolean;
}

const SAVE_STATE_LABEL: Record<SaveState, string> = {
  idle: "Sin cambios",
  saving: "Guardando…",
  saved: "Todo guardado",
};

/**
 * Consolidated top bar for the Visual Editor (see design-system/
 * architecture/visual-editor.md — "Distribución general", área 4).
 */
export function EditorTopBar({
  projectName,
  saveState,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  historySize,
  device,
  onDeviceChange,
  previewMode,
  onTogglePreview,
  isPublished,
  publicPath,
  onPublish,
  publishing,
}: EditorTopBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle bg-surface-1/60 px-3 py-2">
      <div className="flex min-w-0 items-center gap-3">
        <p className="min-w-0 truncate text-sm font-semibold">{projectName}</p>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          {saveState === "saving" ? (
            <span className="size-1.5 animate-pulse rounded-full bg-brand-warning" />
          ) : (
            <Check className="size-3.5 text-brand-success" />
          )}
          {SAVE_STATE_LABEL[saveState]}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <Button variant="outline" size="sm" onClick={onUndo} disabled={!canUndo} aria-label="Deshacer">
          <Undo2 className="size-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={onRedo} disabled={!canRedo} aria-label="Rehacer">
          <Redo2 className="size-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex h-8 items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-2.5 text-xs text-muted-foreground outline-none transition-colors hover:bg-surface-4 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
          >
            <History className="size-3.5" />
            Historial
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Historial de cambios</DropdownMenuLabel>
            <DropdownMenuItem disabled>
              {historySize > 0 ? `${historySize} cambio${historySize === 1 ? "" : "s"} en esta sesión` : "Sin cambios todavía"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onUndo} disabled={!canUndo}>
              <Undo2 />
              Deshacer último cambio
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onRedo} disabled={!canRedo}>
              <Redo2 />
              Rehacer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center gap-1 rounded-lg border border-border bg-surface-2 p-0.5">
          {DEVICES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => onDeviceChange(id)}
              aria-current={device === id ? "true" : undefined}
              aria-label={label}
              title={label}
              className={cn(
                "flex size-7 items-center justify-center rounded-md outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/40",
                device === id ? "bg-gradient-aura text-white" : "text-muted-foreground hover:bg-surface-5 hover:text-foreground",
              )}
            >
              <Icon className="size-3.5" />
            </button>
          ))}
        </div>

        <Button variant={previewMode ? "default" : "outline"} size="sm" onClick={onTogglePreview}>
          {previewMode ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          Vista previa
        </Button>

        <CopyLinkButton path={publicPath} />
        <QrCodeButton path={publicPath} />

        <Button size="sm" onClick={onPublish} loading={publishing}>
          {!isPublished && <AlertTriangle className="size-3.5" />}
          {isPublished ? "Actualizar" : "Publicar"}
        </Button>

        {!isPublished && (
          <Badge variant="warning" className="hidden sm:inline-flex">
            Sin publicar
          </Badge>
        )}
      </div>
    </div>
  );
}
