"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AtSign, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { adminFetch, ApiError } from "@/lib/api-client";
import { getBlockDefinition } from "@/components/blocks/registry";
import { LINK_TYPE_LABELS, type LinkType } from "@/types/link";
import type { useLinksManager } from "./use-links-manager";

export interface ClonedAppearance {
  themeId?: string;
  themeKey: string;
  themeName: string;
  primaryColor: string | null;
  backgroundColor: string | null;
  buttonStyle: string | null;
  borderStyle: string | null;
  shadowStyle: string | null;
  fontFamily: string | null;
  animation: string | null;
  layout: string | null;
  themeOverrides: Record<string, unknown> | null;
}

interface ProfileStructure {
  username: string;
  displayName: string;
  appearance: ClonedAppearance | null;
  blocks: { type: LinkType; styleOverrides: Record<string, unknown> | null }[];
}

interface CloneDesignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  linksManager: ReturnType<typeof useLinksManager>;
  onApplyAppearance: (appearance: ClonedAppearance) => Promise<void>;
}

function extractErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === 404) {
    return "No encontramos ese usuario, o su página no está publicada.";
  }
  return "No se pudo buscar ese perfil";
}

/**
 * "Usar este diseño": clona el tema y la lista de tipos de bloque (con su
 * orden y estilos) de otra página de Aura publicada — nunca su contenido.
 * El endpoint público /public/:username/structure ya excluye título/url/
 * ícono/metadata de cada bloque y bio/avatar/contacto del perfil; acá cada
 * bloque se crea con el contenido de ejemplo de su propio tipo (mismo
 * `defaultMeta` que usa la Biblioteca de bloques al arrastrar uno nuevo),
 * nunca copiando lo que escribió el otro usuario.
 */
export function CloneDesignDialog({
  open,
  onOpenChange,
  linksManager,
  onApplyAppearance,
}: CloneDesignDialogProps) {
  const [username, setUsername] = useState("");
  const [searching, setSearching] = useState(false);
  const [applying, setApplying] = useState(false);
  const [structure, setStructure] = useState<ProfileStructure | null>(null);

  function reset() {
    setUsername("");
    setStructure(null);
  }

  async function handleSearch() {
    const clean = username.trim().replace(/^@/, "");
    if (!clean) {
      toast.error("Escribí un nombre de usuario");
      return;
    }
    setSearching(true);
    try {
      const result = await adminFetch<ProfileStructure>(`/public/${clean}/structure`);
      if (result.blocks.length === 0 && !result.appearance) {
        toast.info("Esa página no tiene nada para clonar todavía.");
        return;
      }
      setStructure(result);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setSearching(false);
    }
  }

  async function handleApply() {
    if (!structure) return;
    setApplying(true);
    try {
      if (structure.appearance) {
        await onApplyAppearance(structure.appearance);
      }
      if (linksManager.links.length > 0) {
        await linksManager.handleBulkDelete(linksManager.links);
      }
      for (const block of structure.blocks) {
        const definition = getBlockDefinition(block.type);
        if (!definition) continue;
        await linksManager.createBlock(
          block.type,
          { title: definition.label, metadata: definition.defaultMeta },
          block.styleOverrides,
        );
      }
      toast.success(`Diseño de @${structure.username} aplicado`);
      reset();
      onOpenChange(false);
    } catch {
      toast.error("Algo falló aplicando el diseño — revisá tu página");
    } finally {
      setApplying(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="size-4" />
            Clonar diseño
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {!structure && (
            <div className="flex flex-col gap-2">
              <p className="text-xs text-muted-foreground">
                Copiá el tema y la estructura de bloques de otra página de Aura publicada — nunca su contenido
                (textos, links, imágenes). Cada bloque se crea con su contenido de ejemplo, listo para que lo
                edites vos.
              </p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <AtSign className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    disabled={searching}
                    className="pl-9"
                  />
                </div>
                <Button onClick={handleSearch} loading={searching} className="shrink-0">
                  Buscar
                </Button>
              </div>
            </div>
          )}

          {structure && (
            <div className="flex flex-col gap-3">
              <div className="rounded-xl border border-border bg-surface-2 p-3 text-sm">
                <p className="font-medium">
                  {structure.displayName} <span className="text-muted-foreground">@{structure.username}</span>
                </p>
                {structure.appearance && (
                  <p className="mt-1 text-xs text-muted-foreground">Tema: {structure.appearance.themeName}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {structure.blocks.length} bloque{structure.blocks.length === 1 ? "" : "s"}
                </p>
              </div>

              {structure.blocks.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  {structure.blocks.map((block, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 rounded-lg border border-border-subtle bg-surface-1 px-3 py-2 text-sm"
                    >
                      <span className="truncate">{LINK_TYPE_LABELS[block.type] ?? block.type}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="rounded-lg border border-brand-warning/40 bg-brand-warning/10 px-3 py-2 text-xs text-brand-warning">
                Esto va a reemplazar tu tema{linksManager.links.length > 0 && " y todos tus bloques actuales"} — no
                se puede deshacer.
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={reset} disabled={applying}>
                  Buscar otro
                </Button>
                <Button onClick={handleApply} loading={applying} variant="destructive">
                  Aplicar diseño
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
