"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { LINK_TYPE_LABELS, type LinkItem, type LinkType } from "@/types/link";

export interface LinkFormValues {
  type: LinkType;
  title: string;
  url: string;
  icon: string;
  price: string;
  currency: string;
}

interface LinkFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  link?: LinkItem | null;
  onSubmit: (values: LinkFormValues) => Promise<void>;
}

const EMPTY_FORM: LinkFormValues = {
  type: "LINK",
  title: "",
  url: "",
  icon: "",
  price: "",
  currency: "USD",
};

const URL_HELP: Partial<Record<LinkType, string>> = {
  VIDEO: "Pega la URL de un video de YouTube o Vimeo",
  MUSIC: "Pega la URL de una canción, álbum o playlist de Spotify",
  PRODUCT: "URL de compra o más información (opcional)",
};

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
        price: link.metadata?.price ?? "",
        currency: link.metadata?.currency ?? "USD",
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

  const isForm = values.type === "FORM";
  const isProduct = values.type === "PRODUCT";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{link ? "Editar enlace" : "Nuevo enlace"}</DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <Label htmlFor="link-type">Tipo</Label>
            <NativeSelect
              id="link-type"
              value={values.type}
              onChange={(e) => setValues({ ...values, type: e.target.value as LinkType })}
            >
              {Object.entries(LINK_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </NativeSelect>
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

          {!isForm && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="link-url">URL</Label>
              <Input
                id="link-url"
                type="url"
                placeholder="https://…"
                required={!isProduct}
                value={values.url}
                onChange={(e) => setValues({ ...values, url: e.target.value })}
              />
              {URL_HELP[values.type] && (
                <p className="text-xs text-muted-foreground">{URL_HELP[values.type]}</p>
              )}
            </div>
          )}

          {isForm && (
            <p className="rounded-xl border border-border bg-surface-2 p-4 text-xs leading-relaxed text-muted-foreground">
              Este bloque muestra un formulario (nombre, email y mensaje) en tu página
              pública. Los mensajes enviados quedan guardados y los puedes ver desde la
              lista de enlaces.
            </p>
          )}

          {isProduct && (
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="link-price">Precio</Label>
                <Input
                  id="link-price"
                  inputMode="decimal"
                  placeholder="19.99"
                  value={values.price}
                  onChange={(e) => setValues({ ...values, price: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="link-currency">Moneda</Label>
                <Input
                  id="link-currency"
                  maxLength={3}
                  placeholder="USD"
                  value={values.currency}
                  onChange={(e) => setValues({ ...values, currency: e.target.value.toUpperCase() })}
                />
              </div>
            </div>
          )}

          {!isForm && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="link-icon">Ícono (opcional)</Label>
              <Input
                id="link-icon"
                placeholder="instagram, whatsapp, link…"
                value={values.icon}
                onChange={(e) => setValues({ ...values, icon: e.target.value })}
              />
            </div>
          )}

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancelar
            </DialogClose>
            <Button type="submit" loading={saving}>
              {saving ? "Guardando…" : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
