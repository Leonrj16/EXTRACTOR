"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { History, RotateCcw, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { adminFetch, ApiError } from "@/lib/api-client";
import type { LinkItem } from "@/types/link";

interface PageVersionSummary {
  id: string;
  name: string;
  blockCount: number;
  createdAt: string;
}

interface PageVersionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Number of blocks the current (unsaved-as-a-version) page has —
   * shown next to "Guardar versión actual" so the name field isn't the
   * only clue about what's about to be captured. */
  currentBlockCount: number;
  onRestored: (links: LinkItem[]) => void;
}

function extractErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    try {
      const parsed = JSON.parse(error.message) as { message?: string | string[] };
      if (Array.isArray(parsed.message)) return parsed.message[0] ?? fallback;
      if (typeof parsed.message === "string") return parsed.message;
    } catch {
      // Not JSON — fall through to the generic message below.
    }
  }
  return fallback;
}

/**
 * Named, server-persisted checkpoints of the Page Builder's block set —
 * complements the in-memory undo/redo (workspace.tsx's use-editor-history),
 * which can't cover creating/deleting blocks. See
 * design-system/architecture/visual-editor.md — "Historial persistido en
 * servidor".
 */
export function PageVersionsDialog({ open, onOpenChange, currentBlockCount, onRestored }: PageVersionsDialogProps) {
  const [versions, setVersions] = useState<PageVersionSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [pendingRestoreId, setPendingRestoreId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setPendingRestoreId(null);
    setLoading(true);
    adminFetch<PageVersionSummary[]>("/admin/page-versions")
      .then(setVersions)
      .catch(() => toast.error("No se pudieron cargar las versiones guardadas"))
      .finally(() => setLoading(false));
  }, [open]);

  async function handleSave() {
    if (!name.trim()) {
      toast.error("Ponle un nombre a la versión");
      return;
    }
    setSaving(true);
    try {
      const created = await adminFetch<PageVersionSummary>("/admin/page-versions", {
        method: "POST",
        body: JSON.stringify({ name: name.trim() }),
      });
      setVersions((prev) => [created, ...prev]);
      setName("");
      toast.success("Versión guardada");
    } catch (error) {
      toast.error(extractErrorMessage(error, "No se pudo guardar la versión"));
    } finally {
      setSaving(false);
    }
  }

  async function handleRestore(version: PageVersionSummary) {
    if (pendingRestoreId !== version.id) {
      // First click just arms confirmation — restoring replaces every
      // block on the page right now, so it deserves one extra click
      // instead of firing immediately like a single-block delete does.
      setPendingRestoreId(version.id);
      return;
    }
    setBusyId(version.id);
    try {
      const links = await adminFetch<LinkItem[]>(`/admin/page-versions/${version.id}/restore`, {
        method: "POST",
      });
      onRestored(links);
      toast.success(`Restaurado "${version.name}"`);
      onOpenChange(false);
    } catch {
      toast.error("No se pudo restaurar esta versión");
    } finally {
      setBusyId(null);
      setPendingRestoreId(null);
    }
  }

  async function handleDelete(version: PageVersionSummary) {
    setBusyId(version.id);
    try {
      await adminFetch(`/admin/page-versions/${version.id}`, { method: "DELETE" });
      setVersions((prev) => prev.filter((v) => v.id !== version.id));
      toast.success("Versión eliminada");
    } catch {
      toast.error("No se pudo eliminar la versión");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="size-4" />
            Versiones guardadas
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Input
                placeholder={`Nombre (ej. "Antes del rediseño", ${currentBlockCount} bloques)`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
              />
              <Button size="sm" loading={saving} onClick={handleSave} className="shrink-0">
                <Save className="size-4" />
                Guardar
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Guarda el conjunto de bloques actual como un punto al que volver más tarde.
            </p>
          </div>

          <div className="flex max-h-80 flex-col gap-1.5 overflow-y-auto border-t border-border-subtle pt-3">
            {loading && <p className="py-4 text-center text-sm text-muted-foreground">Cargando…</p>}
            {!loading && versions.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Todavía no guardaste ninguna versión.
              </p>
            )}
            {versions.map((version) => (
              <div
                key={version.id}
                className="flex items-center justify-between gap-2 rounded-xl border border-border bg-surface-2 px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{version.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {version.blockCount} bloque{version.blockCount === 1 ? "" : "s"} ·{" "}
                    {new Date(version.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    size="xs"
                    variant={pendingRestoreId === version.id ? "destructive" : "outline"}
                    loading={busyId === version.id && pendingRestoreId !== null}
                    onClick={() => handleRestore(version)}
                  >
                    <RotateCcw className="size-3.5" />
                    {pendingRestoreId === version.id ? "¿Confirmar?" : "Restaurar"}
                  </Button>
                  <Button
                    size="icon-xs"
                    variant="ghost"
                    aria-label="Eliminar versión"
                    loading={busyId === version.id && pendingRestoreId === null}
                    onClick={() => handleDelete(version)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
