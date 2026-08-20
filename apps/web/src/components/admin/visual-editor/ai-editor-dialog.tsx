"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Sparkles, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { adminFetch, ApiError } from "@/lib/api-client";
import { LINK_TYPE_LABELS, type LinkItem, type LinkType } from "@/types/link";
import type { ProfileData } from "@/types/profile";

type AiOperation =
  | { op: "create_block"; type: LinkType; title: string; url?: string; icon?: string; metadata?: Record<string, unknown>; order?: number }
  | { op: "update_block"; linkId: string; patch: Record<string, unknown> }
  | { op: "delete_block"; linkId: string }
  | { op: "reorder_blocks"; order: string[] }
  | { op: "update_profile"; patch: Record<string, unknown> };

interface AiPlan {
  summary: string;
  operations: AiOperation[];
}

interface ApplyResult {
  links: LinkItem[];
  profile: Partial<ProfileData>;
}

interface AiEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  links: LinkItem[];
  onApplied: (result: ApplyResult) => void;
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

function describeOperation(op: AiOperation, linksById: Map<string, LinkItem>): { icon: typeof Plus; text: string } {
  switch (op.op) {
    case "create_block":
      return { icon: Plus, text: `Crear bloque de ${LINK_TYPE_LABELS[op.type] ?? op.type}: "${op.title}"` };
    case "update_block": {
      const target = linksById.get(op.linkId);
      const fields = Object.keys(op.patch).join(", ");
      return { icon: Pencil, text: `Actualizar "${target?.title ?? op.linkId}" (${fields})` };
    }
    case "delete_block": {
      const target = linksById.get(op.linkId);
      return { icon: Trash2, text: `Eliminar "${target?.title ?? op.linkId}"` };
    }
    case "reorder_blocks":
      return { icon: Sparkles, text: `Reordenar ${op.order.length} bloques` };
    case "update_profile": {
      const fields = Object.keys(op.patch).join(", ");
      return { icon: User, text: `Actualizar perfil (${fields})` };
    }
  }
}

/**
 * "Editor conversacional" — el diferenciador que ningún competidor tipo
 * Linktree tiene: el usuario describe en español qué quiere cambiar y
 * ve una propuesta concreta (mismo patrón "proponer, después confirmar"
 * que Versiones guardadas) antes de que se toque nada. Ver
 * apps/api/src/modules/ai-editor — plan() nunca escribe, apply() sí.
 */
export function AiEditorDialog({ open, onOpenChange, links, onApplied }: AiEditorDialogProps) {
  const [instruction, setInstruction] = useState("");
  const [planning, setPlanning] = useState(false);
  const [applying, setApplying] = useState(false);
  const [plan, setPlan] = useState<AiPlan | null>(null);

  const linksById = new Map(links.map((link) => [link.id, link]));

  function reset() {
    setInstruction("");
    setPlan(null);
  }

  async function handlePlan() {
    if (!instruction.trim()) {
      toast.error("Escribí qué querés cambiar");
      return;
    }
    setPlanning(true);
    try {
      const result = await adminFetch<AiPlan>("/admin/ai-editor/plan", {
        method: "POST",
        body: JSON.stringify({ instruction: instruction.trim() }),
      });
      if (result.operations.length === 0) {
        toast.info("El asistente no encontró cambios concretos para proponer — probá ser más específico.");
        return;
      }
      setPlan(result);
    } catch (error) {
      toast.error(extractErrorMessage(error, "No se pudo generar una propuesta"));
    } finally {
      setPlanning(false);
    }
  }

  async function handleApply() {
    if (!plan) return;
    setApplying(true);
    try {
      const result = await adminFetch<ApplyResult>("/admin/ai-editor/apply", {
        method: "POST",
        body: JSON.stringify({ operations: plan.operations }),
      });
      onApplied(result);
      toast.success("Cambios aplicados");
      reset();
      onOpenChange(false);
    } catch (error) {
      toast.error(extractErrorMessage(error, "No se pudieron aplicar los cambios"));
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
            <Sparkles className="size-4" />
            Asistente de edición
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {!plan && (
            <div className="flex flex-col gap-2">
              <Textarea
                placeholder='Ej: "agregá una sección de testimonios abajo del hero", "hacé la bio más corta", "sacá el bloque de WhatsApp"'
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                rows={3}
                disabled={planning}
              />
              <p className="text-xs text-muted-foreground">
                Describí qué querés cambiar en tu página. Vas a ver la propuesta antes de que se aplique nada.
              </p>
              <Button onClick={handlePlan} loading={planning} className="self-end">
                <Sparkles className="size-4" />
                Generar propuesta
              </Button>
            </div>
          )}

          {plan && (
            <div className="flex flex-col gap-3">
              <p className="rounded-xl border border-border bg-surface-2 p-3 text-sm">{plan.summary}</p>

              <div className="flex flex-col gap-1.5">
                {plan.operations.map((op, i) => {
                  const { icon: Icon, text } = describeOperation(op, linksById);
                  return (
                    <div key={i} className="flex items-center gap-2 rounded-lg border border-border-subtle bg-surface-1 px-3 py-2 text-sm">
                      <Icon className="size-3.5 shrink-0 text-muted-foreground" />
                      <span className="truncate">{text}</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={reset} disabled={applying}>
                  Reformular
                </Button>
                <Button onClick={handleApply} loading={applying}>
                  Aplicar cambios
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
