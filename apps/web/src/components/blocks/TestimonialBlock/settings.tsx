"use client";

import { FieldSelect } from "@/components/ui/field-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { BlockSettingsProps } from "../types";
import { TESTIMONIAL_BLOCK_DEFAULT_META } from "./config";
import type { TestimonialBlockMeta } from "./types";

const RATING_OPTIONS = [1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: `${n} ${n === 1 ? "estrella" : "estrellas"}` }));

export function TestimonialBlockSettings({ link, meta, onPatch, onMetaChange }: BlockSettingsProps<TestimonialBlockMeta>) {
  const resolved = { ...TESTIMONIAL_BLOCK_DEFAULT_META, ...meta };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="testimonial-quote">Comentario</Label>
        <Textarea
          id="testimonial-quote"
          rows={3}
          value={link.title}
          onChange={(e) => onPatch({ title: e.target.value })}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="testimonial-name">Nombre</Label>
          <Input
            id="testimonial-name"
            value={resolved.authorName ?? ""}
            onChange={(e) => onMetaChange({ authorName: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="testimonial-role">Empresa / rol</Label>
          <Input
            id="testimonial-role"
            value={resolved.authorRole ?? ""}
            onChange={(e) => onMetaChange({ authorRole: e.target.value })}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="testimonial-avatar">Foto (opcional)</Label>
        <Input
          id="testimonial-avatar"
          type="url"
          placeholder="https://…"
          value={link.imageUrl ?? ""}
          onChange={(e) => onPatch({ imageUrl: e.target.value })}
        />
      </div>

      <FieldSelect
        id="testimonial-rating"
        label="Calificación"
        value={String(resolved.rating ?? 5)}
        onChange={(v) => onMetaChange({ rating: Number(v) })}
        options={RATING_OPTIONS}
      />
    </div>
  );
}
