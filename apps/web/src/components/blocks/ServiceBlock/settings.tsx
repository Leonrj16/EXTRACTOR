"use client";

import { FieldSelect } from "@/components/ui/field-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { BlockSettingsProps } from "../types";
import { SERVICE_BLOCK_DEFAULT_META, SERVICE_ICON_OPTIONS } from "./config";
import type { ServiceBlockMeta } from "./types";

export function ServiceBlockSettings({ link, meta, onPatch, onMetaChange }: BlockSettingsProps<ServiceBlockMeta>) {
  const resolved = { ...SERVICE_BLOCK_DEFAULT_META, ...meta };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="service-title">Nombre del servicio</Label>
        <Input
          id="service-title"
          value={link.title}
          onChange={(e) => onPatch({ title: e.target.value })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="service-description">Descripción (opcional)</Label>
        <Textarea
          id="service-description"
          rows={2}
          value={resolved.description ?? ""}
          onChange={(e) => onMetaChange({ description: e.target.value })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="service-url">URL del botón (opcional)</Label>
        <Input
          id="service-url"
          type="url"
          placeholder="https://…"
          value={link.url ?? ""}
          onChange={(e) => onPatch({ url: e.target.value })}
        />
      </div>

      <FieldSelect
        id="service-icon"
        label="Ícono"
        value={resolved.icon ?? "sparkles"}
        onChange={(icon) => onMetaChange({ icon: icon as ServiceBlockMeta["icon"] })}
        options={SERVICE_ICON_OPTIONS}
      />

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="service-price">Precio (opcional)</Label>
          <Input
            id="service-price"
            inputMode="decimal"
            placeholder="49.99"
            value={resolved.price ?? ""}
            onChange={(e) => onMetaChange({ price: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="service-currency">Moneda</Label>
          <Input
            id="service-currency"
            maxLength={3}
            placeholder="USD"
            value={resolved.currency ?? "USD"}
            onChange={(e) => onMetaChange({ currency: e.target.value.toUpperCase() })}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="service-button-label">Texto del botón</Label>
        <Input
          id="service-button-label"
          placeholder="Ver más"
          value={resolved.buttonLabel ?? ""}
          onChange={(e) => onMetaChange({ buttonLabel: e.target.value })}
        />
      </div>
    </div>
  );
}
