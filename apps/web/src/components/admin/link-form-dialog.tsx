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
import { getBlockDefinition } from "@/components/blocks/registry";
import { BlockStylePanel } from "@/components/blocks/shared/style-panel";
import type { BlockStyleOverrides } from "@/components/blocks/types";
import { LINK_TYPE_LABELS, type LinkItem, type LinkMetadata, type LinkType } from "@/types/link";

export interface LinkFormValues {
  type: LinkType;
  title: string;
  url: string;
  icon: string;
  imageUrl: string;
  metadata: Record<string, unknown>;
  styleOverrides: BlockStyleOverrides;
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
  imageUrl: "",
  metadata: {},
  styleOverrides: {},
};

const URL_HELP: Partial<Record<LinkType, string>> = {
  VIDEO: "Pega la URL de un video de YouTube o Vimeo",
  MUSIC: "Pega la URL de una canción, álbum o playlist de Spotify",
  PRODUCT: "URL de compra o más información (opcional)",
};

function metaString(metadata: Record<string, unknown>, key: string): string {
  const v = metadata[key];
  return typeof v === "string" ? v : "";
}

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
        imageUrl: link.imageUrl ?? "",
        metadata: (link.metadata as Record<string, unknown>) ?? {},
        styleOverrides: (link.styleOverrides as BlockStyleOverrides) ?? {},
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
  const definition = getBlockDefinition(values.type);

  // The draft object the block's own Settings component edits — for a new
  // (unsaved) block this is a stand-in LinkItem, since Settings always
  // expects a full link, not a partial form.
  const draftLink: LinkItem = {
    id: link?.id ?? "draft",
    type: values.type,
    title: values.title,
    url: values.url || null,
    icon: values.icon || null,
    imageUrl: values.imageUrl || null,
    metadata: values.metadata as LinkMetadata,
    styleOverrides: values.styleOverrides as Record<string, unknown>,
    isActive: link?.isActive ?? true,
    order: link?.order ?? 0,
  };

  function handleBlockPatch(patch: Partial<Pick<LinkItem, "title" | "url" | "icon" | "imageUrl">>) {
    setValues((v) => ({
      ...v,
      ...(patch.title !== undefined ? { title: patch.title ?? "" } : {}),
      ...(patch.url !== undefined ? { url: patch.url ?? "" } : {}),
      ...(patch.icon !== undefined ? { icon: patch.icon ?? "" } : {}),
      ...(patch.imageUrl !== undefined ? { imageUrl: patch.imageUrl ?? "" } : {}),
    }));
  }

  function handleBlockMetaChange(metaPatch: Record<string, unknown>) {
    setValues((v) => ({ ...v, metadata: { ...v.metadata, ...metaPatch } }));
  }

  function handleStyleChange(patch: Partial<BlockStyleOverrides>) {
    setValues((v) => ({ ...v, styleOverrides: { ...v.styleOverrides, ...patch } }));
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
          {definition ? (
            <>
              <definition.Settings
                link={draftLink}
                meta={values.metadata}
                onPatch={handleBlockPatch}
                onMetaChange={handleBlockMetaChange}
              />
              <BlockStylePanel value={values.styleOverrides} onChange={handleStyleChange} idPrefix="link-block" />
            </>
          ) : (
            <>
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
                      value={metaString(values.metadata, "price")}
                      onChange={(e) => handleBlockMetaChange({ price: e.target.value })}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="link-currency">Moneda</Label>
                    <Input
                      id="link-currency"
                      maxLength={3}
                      placeholder="USD"
                      value={metaString(values.metadata, "currency") || "USD"}
                      onChange={(e) => handleBlockMetaChange({ currency: e.target.value.toUpperCase() })}
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
            </>
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
