"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { adminFetch } from "@/lib/api-client";
import type { BlockSettingsProps } from "../types";
import { PRODUCT_BLOCK_DEFAULT_META } from "./config";
import type { ProductBlockMeta } from "./types";

export function ProductBlockSettings({ link, meta, onPatch, onMetaChange }: BlockSettingsProps<ProductBlockMeta>) {
  const resolved = { ...PRODUCT_BLOCK_DEFAULT_META, ...meta };
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const media = await adminFetch<{ url: string }>("/admin/media/upload", {
        method: "POST",
        body: formData,
      });
      onPatch({ imageUrl: media.url });
    } catch {
      toast.error("No se pudo subir la imagen");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="product-title">Nombre</Label>
        <Input
          id="product-title"
          value={link.title}
          onChange={(e) => onPatch({ title: e.target.value })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="product-description">Descripción (opcional)</Label>
        <Textarea
          id="product-description"
          rows={2}
          value={resolved.description ?? ""}
          onChange={(e) => onMetaChange({ description: e.target.value })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="product-url">URL de compra o más información</Label>
        <Input
          id="product-url"
          type="url"
          placeholder="https://…"
          value={link.url ?? ""}
          onChange={(e) => onPatch({ url: e.target.value })}
        />
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      <div className="flex flex-col gap-2">
        <Label htmlFor="product-image">Imagen</Label>
        <div className="flex items-center gap-2">
          <Input
            id="product-image"
            placeholder="https://…"
            value={link.imageUrl ?? ""}
            onChange={(e) => onPatch({ imageUrl: e.target.value })}
          />
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            loading={uploading}
            onClick={() => fileInputRef.current?.click()}
            aria-label="Subir imagen"
          >
            <Upload />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="product-price">Precio</Label>
          <Input
            id="product-price"
            inputMode="decimal"
            placeholder="19.99"
            value={resolved.price ?? ""}
            onChange={(e) => onMetaChange({ price: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="product-discount">Precio anterior (opcional)</Label>
          <Input
            id="product-discount"
            inputMode="decimal"
            placeholder="29.99"
            value={resolved.discountPrice ?? ""}
            onChange={(e) => onMetaChange({ discountPrice: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="product-currency">Moneda</Label>
          <Input
            id="product-currency"
            maxLength={3}
            placeholder="USD"
            value={resolved.currency ?? "USD"}
            onChange={(e) => onMetaChange({ currency: e.target.value.toUpperCase() })}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="product-button-label">Texto del botón</Label>
        <Input
          id="product-button-label"
          placeholder="Comprar"
          value={resolved.buttonLabel ?? ""}
          onChange={(e) => onMetaChange({ buttonLabel: e.target.value })}
        />
      </div>
    </div>
  );
}
