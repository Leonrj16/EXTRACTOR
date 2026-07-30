"use client";

import { AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ValidationIssue } from "./publish-validation";

interface PublishDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  issues: ValidationIssue[];
  onConfirm: () => void;
  publishing: boolean;
  isPublished: boolean;
}

/**
 * Shown when "Publicar" is clicked (see design-system/architecture/
 * visual-editor.md — "Publicación"). Errors block publishing outright;
 * warnings are surfaced but don't — the user decides whether "no SEO
 * description yet" is worth fixing before going live.
 */
export function PublishDialog({ open, onOpenChange, issues, onConfirm, publishing, isPublished }: PublishDialogProps) {
  const errors = issues.filter((i) => i.severity === "error");
  const warnings = issues.filter((i) => i.severity === "warning");
  const canPublish = errors.length === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isPublished ? "Actualizar página" : "Publicar página"}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          {issues.length === 0 && (
            <p className="flex items-center gap-2 rounded-xl border border-brand-success/30 bg-brand-success/10 p-3 text-sm text-brand-success">
              <CheckCircle2 className="size-4 shrink-0" />
              Todo se ve bien. Tu página está lista.
            </p>
          )}

          {errors.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold tracking-wide text-destructive uppercase">
                Hay que corregir esto antes de publicar
              </p>
              {errors.map((issue, i) => (
                <p key={i} className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-2.5 text-sm text-destructive">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  {issue.message}
                </p>
              ))}
            </div>
          )}

          {warnings.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold tracking-wide text-brand-warning uppercase">Sugerencias</p>
              {warnings.map((issue, i) => (
                <p key={i} className="flex items-start gap-2 rounded-lg border border-brand-warning/30 bg-brand-warning/10 p-2.5 text-sm text-brand-warning">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                  {issue.message}
                </p>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <DialogClose render={<Button type="button" variant="outline" />}>Cancelar</DialogClose>
          <Button onClick={onConfirm} disabled={!canPublish} loading={publishing}>
            {issues.length > 0
              ? isPublished
                ? "Actualizar de todos modos"
                : "Publicar de todos modos"
              : isPublished
                ? "Actualizar"
                : "Publicar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
