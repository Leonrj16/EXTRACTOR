"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldSelect } from "@/components/ui/field-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminFetch } from "@/lib/api-client";
import type { BlockSettingsProps } from "../types";
import { GALLERY_BLOCK_DEFAULT_META } from "./config";
import type { GalleryBlockMeta } from "./types";

const LAYOUT_OPTIONS = [
  { value: "grid", label: "Grid" },
  { value: "carousel", label: "Carrusel" },
  { value: "masonry", label: "Masonry" },
];

export function GalleryBlockSettings({ link, meta, onPatch, onMetaChange }: BlockSettingsProps<GalleryBlockMeta>) {
  const resolved = { ...GALLERY_BLOCK_DEFAULT_META, ...meta };
  const images = resolved.images ?? [];
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingSlot = useRef<number | null>(null);

  function updateImage(i: number, url: string) {
    const next = [...images];
    next[i] = url;
    onMetaChange({ images: next });
  }

  function removeImage(i: number) {
    onMetaChange({ images: images.filter((_, idx) => idx !== i) });
  }

  function addImage() {
    onMetaChange({ images: [...images, ""] });
  }

  function triggerUpload(i: number) {
    pendingSlot.current = i;
    fileInputRef.current?.click();
  }

  async function handleFile(file: File) {
    const slot = pendingSlot.current;
    if (slot === null) return;
    setUploadingIndex(slot);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const media = await adminFetch<{ url: string }>("/admin/media/upload", {
        method: "POST",
        body: formData,
      });
      updateImage(slot, media.url);
    } catch {
      toast.error("No se pudo subir la imagen");
    } finally {
      setUploadingIndex(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="gallery-title">Título (opcional)</Label>
        <Input
          id="gallery-title"
          value={link.title}
          onChange={(e) => onPatch({ title: e.target.value })}
        />
      </div>

      <FieldSelect
        id="gallery-layout"
        label="Diseño"
        value={resolved.layout ?? "grid"}
        onChange={(layout) => onMetaChange({ layout: layout as GalleryBlockMeta["layout"] })}
        options={LAYOUT_OPTIONS}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />

      <div className="flex flex-col gap-2">
        <Label>Imágenes</Label>
        <div className="flex flex-col gap-2">
          {images.map((src, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                placeholder="https://…"
                value={src}
                onChange={(e) => updateImage(i, e.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                loading={uploadingIndex === i}
                onClick={() => triggerUpload(i)}
                aria-label="Subir imagen"
              >
                <Upload />
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="icon-sm"
                onClick={() => removeImage(i)}
                aria-label="Quitar imagen"
              >
                <Trash2 />
              </Button>
            </div>
          ))}
        </div>
        <Button type="button" variant="outline" size="sm" className="w-fit" onClick={addImage}>
          <Plus />
          Agregar imagen
        </Button>
      </div>
    </div>
  );
}
