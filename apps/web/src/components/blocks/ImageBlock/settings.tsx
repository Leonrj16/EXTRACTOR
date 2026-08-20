"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldSelect } from "@/components/ui/field-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminFetch } from "@/lib/api-client";
import type { BlockSettingsProps } from "../types";
import { IMAGE_BLOCK_DEFAULT_META, IMAGE_FIT_OPTIONS } from "./config";
import type { ImageBlockMeta } from "./types";

export function ImageBlockSettings({ link, meta, onPatch, onMetaChange }: BlockSettingsProps<ImageBlockMeta>) {
  const resolved = { ...IMAGE_BLOCK_DEFAULT_META, ...meta };
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
        <Label htmlFor="image-caption">Leyenda (opcional)</Label>
        <Input id="image-caption" value={link.title} onChange={(e) => onPatch({ title: e.target.value })} />
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />

      <div className="flex flex-col gap-2">
        <Label htmlFor="image-url">Imagen</Label>
        <div className="flex items-center gap-2">
          <Input
            id="image-url"
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

      <div className="flex flex-col gap-2">
        <Label htmlFor="image-link">Enlace al hacer clic (opcional)</Label>
        <Input
          id="image-link"
          type="url"
          placeholder="https://…"
          value={link.url ?? ""}
          onChange={(e) => onPatch({ url: e.target.value })}
        />
      </div>

      <FieldSelect
        id="image-fit"
        label="Ajuste"
        value={resolved.fit ?? "cover"}
        onChange={(fit) => onMetaChange({ fit: fit as ImageBlockMeta["fit"] })}
        options={IMAGE_FIT_OPTIONS}
      />
    </div>
  );
}
