"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldSelect } from "@/components/ui/field-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { BlockSettingsProps } from "../types";
import { PRICING_BLOCK_DEFAULT_META } from "./config";
import type { PricingBlockMeta } from "./types";

const PERIOD_OPTIONS = [
  { value: "once", label: "Pago único" },
  { value: "month", label: "Por mes" },
  { value: "year", label: "Por año" },
];

export function PricingBlockSettings({ link, meta, onPatch, onMetaChange }: BlockSettingsProps<PricingBlockMeta>) {
  const resolved = { ...PRICING_BLOCK_DEFAULT_META, ...meta };
  const features = resolved.features ?? [];

  function updateFeature(i: number, value: string) {
    const next = [...features];
    next[i] = value;
    onMetaChange({ features: next });
  }

  function removeFeature(i: number) {
    onMetaChange({ features: features.filter((_, idx) => idx !== i) });
  }

  function addFeature() {
    onMetaChange({ features: [...features, ""] });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="pricing-title">Nombre del plan</Label>
        <Input
          id="pricing-title"
          value={link.title}
          onChange={(e) => onPatch({ title: e.target.value })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="pricing-url">URL del botón</Label>
        <Input
          id="pricing-url"
          type="url"
          placeholder="https://…"
          value={link.url ?? ""}
          onChange={(e) => onPatch({ url: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="pricing-price">Precio</Label>
          <Input
            id="pricing-price"
            inputMode="decimal"
            placeholder="19.99"
            value={resolved.price ?? ""}
            onChange={(e) => onMetaChange({ price: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="pricing-currency">Moneda</Label>
          <Input
            id="pricing-currency"
            maxLength={3}
            placeholder="USD"
            value={resolved.currency ?? "USD"}
            onChange={(e) => onMetaChange({ currency: e.target.value.toUpperCase() })}
          />
        </div>
        <FieldSelect
          id="pricing-period"
          label="Periodo"
          value={resolved.period ?? "month"}
          onChange={(period) => onMetaChange({ period: period as PricingBlockMeta["period"] })}
          options={PERIOD_OPTIONS}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="pricing-button-label">Texto del botón</Label>
        <Input
          id="pricing-button-label"
          placeholder="Elegir plan"
          value={resolved.buttonLabel ?? ""}
          onChange={(e) => onMetaChange({ buttonLabel: e.target.value })}
        />
      </div>

      <div className="flex items-center justify-between rounded-xl border border-border bg-surface-2 px-3.5 py-2.5">
        <Label htmlFor="pricing-highlighted">Destacar este plan</Label>
        <Switch
          id="pricing-highlighted"
          checked={resolved.highlighted ?? false}
          onCheckedChange={(checked) => onMetaChange({ highlighted: checked })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Características</Label>
        <div className="flex flex-col gap-2">
          {features.map((feature, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                placeholder="Incluye…"
                value={feature}
                onChange={(e) => updateFeature(i, e.target.value)}
              />
              <Button
                type="button"
                variant="destructive"
                size="icon-sm"
                onClick={() => removeFeature(i)}
                aria-label="Quitar característica"
              >
                <Trash2 />
              </Button>
            </div>
          ))}
        </div>
        <Button type="button" variant="outline" size="sm" className="w-fit" onClick={addFeature}>
          <Plus />
          Agregar característica
        </Button>
      </div>
    </div>
  );
}
