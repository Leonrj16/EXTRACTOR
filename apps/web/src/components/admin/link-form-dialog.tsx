"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LINK_TYPE_LABELS, type LinkItem, type LinkType } from "@/types/link";

export interface LinkFormValues {
  type: LinkType;
  title: string;
  url: string;
  icon: string;
}

interface LinkFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  link?: LinkItem | null;
  onSubmit: (values: LinkFormValues) => Promise<void>;
}

const EMPTY_FORM: LinkFormValues = { type: "LINK", title: "", url: "", icon: "" };

export function LinkFormDialog({ open, onOpenChange, link, onSubmit }: LinkFormDialogProps) {
  const [values, setValues] = useState<LinkFormValues>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (link) {
      setValues({
        type: link.type,
        title: link.title,
        url: link.url ?? "",
        icon: link.icon ?? "",
      });
    } else {
      setValues(EMPTY_FORM);
    }
  }, [link, open]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await onSubmit(values);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{link ? "Editar enlace" : "Nuevo enlace"}</DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <Label htmlFor="link-type">Tipo</Label>
            <select
              id="link-type"
              className="h-9 rounded-md border bg-background px-3 text-sm"
              value={values.type}
              onChange={(e) => setValues({ ...values, type: e.target.value as LinkType })}
            >
              {Object.entries(LINK_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="link-title">Título</Label>
            <Input
              id="link-title"
              required
              maxLength={100}
              value={values.title}
              onChange={(e) => setValues({ ...values, title: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="link-url">URL</Label>
            <Input
              id="link-url"
              type="url"
              placeholder="https://…"
              value={values.url}
              onChange={(e) => setValues({ ...values, url: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="link-icon">Ícono (opcional)</Label>
            <Input
              id="link-icon"
              placeholder="instagram, whatsapp, link…"
              value={values.icon}
              onChange={(e) => setValues({ ...values, icon: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={saving}>
              {saving ? "Guardando…" : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
