"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ColorField } from "@/components/ui/color-field";
import { FieldSelect } from "@/components/ui/field-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { BACKGROUND_TYPE_OPTIONS } from "@/themes/shared/backgrounds";
import { BUTTON_TREATMENT_OPTIONS } from "@/themes/shared/button-treatments";
import { FONT_OPTIONS } from "@/themes/shared/fonts";
import type { ThemeDefinition, ThemeOverrides } from "@/themes/types";

const RADIUS_OPTIONS = [
  { value: "none", label: "Ninguno" },
  { value: "sm", label: "Pequeño" },
  { value: "md", label: "Medio" },
  { value: "lg", label: "Grande" },
  { value: "full", label: "Completo" },
];

const WEIGHT_OPTIONS = [
  { value: "400", label: "Normal (400)" },
  { value: "500", label: "Medio (500)" },
  { value: "600", label: "Semi-negrita (600)" },
  { value: "700", label: "Negrita (700)" },
];

const LETTER_SPACING_OPTIONS = [
  { value: "tight", label: "Compacto" },
  { value: "normal", label: "Normal" },
  { value: "wide", label: "Amplio" },
];

const LINE_HEIGHT_OPTIONS = [
  { value: "tight", label: "Compacta" },
  { value: "normal", label: "Normal" },
  { value: "relaxed", label: "Relajada" },
];

const TEXT_TRANSFORM_OPTIONS = [
  { value: "none", label: "Ninguna" },
  { value: "uppercase", label: "Mayúsculas" },
  { value: "capitalize", label: "Capitalizado" },
];

const HOVER_OPTIONS = [
  { value: "lift", label: "Elevar" },
  { value: "scale", label: "Escalar" },
  { value: "glow", label: "Resplandor" },
  { value: "none", label: "Ninguno" },
];

interface ThemeCustomizePanelProps {
  definition: ThemeDefinition;
  overrides: ThemeOverrides;
  onPatch: <K extends keyof ThemeOverrides>(section: K, patch: ThemeOverrides[K]) => void;
  onSaveAsTheme: (name: string) => Promise<void>;
  onDuplicateCurrent: () => Promise<void>;
  onReset: () => void;
}

export function ThemeCustomizePanel({
  definition,
  overrides,
  onPatch,
  onSaveAsTheme,
  onDuplicateCurrent,
  onReset,
}: ThemeCustomizePanelProps) {
  const [saveName, setSaveName] = useState("");
  const [saving, setSaving] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);

  const colors = { ...definition.colors, ...overrides.colors };
  const typography = { ...definition.typography, ...overrides.typography };
  const buttons = { ...definition.buttons, ...overrides.buttons };
  const cards = { ...definition.cards, ...overrides.cards };
  const animations = { ...definition.animations, ...overrides.animations };
  const effects = { ...definition.effects, ...overrides.effects };

  async function handleSave() {
    if (!saveName.trim()) {
      toast.error("Ponle un nombre al tema");
      return;
    }
    setSaving(true);
    try {
      await onSaveAsTheme(saveName.trim());
      setSaveName("");
      toast.success("Tema guardado");
    } catch {
      toast.error("No se pudo guardar el tema");
    } finally {
      setSaving(false);
    }
  }

  async function handleDuplicate() {
    setDuplicating(true);
    try {
      await onDuplicateCurrent();
      toast.success("Tema duplicado");
    } catch {
      toast.error("No se pudo duplicar el tema");
    } finally {
      setDuplicating(false);
    }
  }

  function handleExport() {
    const payload = { colors, typography, buttons, cards, animations, effects };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${definition.key}-theme.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleImportFile(file: File) {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as ThemeOverrides;
      if (parsed.colors) onPatch("colors", parsed.colors);
      if (parsed.typography) onPatch("typography", parsed.typography);
      if (parsed.buttons) onPatch("buttons", parsed.buttons);
      if (parsed.cards) onPatch("cards", parsed.cards);
      if (parsed.animations) onPatch("animations", parsed.animations);
      if (parsed.effects) onPatch("effects", parsed.effects);
      toast.success("Tema importado");
    } catch {
      toast.error("El archivo no es un tema válido");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Colores</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <ColorField
            id="secondaryColor"
            label="Color secundario"
            value={colors.secondary}
            onChange={(value) => onPatch("colors", { ...overrides.colors, secondary: value })}
          />
          <ColorField
            id="accentColor"
            label="Color de acento"
            value={colors.accent}
            onChange={(value) => onPatch("colors", { ...overrides.colors, accent: value })}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Fondo</p>
        <FieldSelect
          id="backgroundType"
          label="Tipo de fondo"
          value={effects.background.type}
          onChange={(value) =>
            onPatch("effects", { ...overrides.effects, background: { ...effects.background, type: value as typeof effects.background.type } })
          }
          options={BACKGROUND_TYPE_OPTIONS}
        />
        {effects.background.type === "image" && (
          <Input
            placeholder="https://…"
            value={effects.background.value ?? ""}
            onChange={(e) =>
              onPatch("effects", { ...overrides.effects, background: { ...effects.background, value: e.target.value } })
            }
          />
        )}
        <div className="flex items-center justify-between rounded-xl border border-border bg-surface-2 px-3.5 py-2.5">
          <Label htmlFor="glow">Glow (resplandor en el avatar)</Label>
          <Switch
            id="glow"
            checked={effects.glow ?? false}
            onCheckedChange={(checked) => onPatch("effects", { ...overrides.effects, glow: checked })}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Tipografía</p>
        <FieldSelect
          id="font"
          label="Fuente"
          value={typography.font}
          onChange={(value) => onPatch("typography", { ...overrides.typography, font: value as typeof typography.font })}
          options={FONT_OPTIONS}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldSelect
            id="headingWeight"
            label="Peso de títulos"
            value={String(typography.headingWeight)}
            onChange={(value) => onPatch("typography", { ...overrides.typography, headingWeight: Number(value) as typeof typography.headingWeight })}
            options={WEIGHT_OPTIONS}
          />
          <FieldSelect
            id="bodyWeight"
            label="Peso de texto"
            value={String(typography.bodyWeight)}
            onChange={(value) => onPatch("typography", { ...overrides.typography, bodyWeight: Number(value) as typeof typography.bodyWeight })}
            options={WEIGHT_OPTIONS}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldSelect
            id="letterSpacing"
            label="Espaciado entre letras"
            value={typography.letterSpacing}
            onChange={(value) => onPatch("typography", { ...overrides.typography, letterSpacing: value as typeof typography.letterSpacing })}
            options={LETTER_SPACING_OPTIONS}
          />
          <FieldSelect
            id="lineHeight"
            label="Altura de línea"
            value={typography.lineHeight}
            onChange={(value) => onPatch("typography", { ...overrides.typography, lineHeight: value as typeof typography.lineHeight })}
            options={LINE_HEIGHT_OPTIONS}
          />
        </div>
        <FieldSelect
          id="textTransform"
          label="Transformación de texto"
          value={typography.textTransform}
          onChange={(value) => onPatch("typography", { ...overrides.typography, textTransform: value as typeof typography.textTransform })}
          options={TEXT_TRANSFORM_OPTIONS}
        />
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Botones y Cards</p>
        <FieldSelect
          id="buttonTreatment"
          label="Estilo de botón"
          value={buttons.treatment}
          onChange={(value) => onPatch("buttons", { ...overrides.buttons, treatment: value as typeof buttons.treatment })}
          options={BUTTON_TREATMENT_OPTIONS}
        />
        <FieldSelect
          id="cardRadius"
          label="Border radius de cards"
          value={cards.radius}
          onChange={(value) => onPatch("cards", { ...overrides.cards, radius: value as typeof cards.radius })}
          options={RADIUS_OPTIONS}
        />
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Animación</p>
        <FieldSelect
          id="hoverAnimation"
          label="Efecto al pasar el cursor"
          value={animations.hover}
          onChange={(value) => onPatch("animations", { ...overrides.animations, hover: value as typeof animations.hover })}
          options={HOVER_OPTIONS}
        />
      </div>

      <div className="flex flex-col gap-3 border-t border-border-subtle pt-4">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Guardar y compartir</p>
        <div className="flex gap-2">
          <Input placeholder="Nombre del nuevo tema" value={saveName} onChange={(e) => setSaveName(e.target.value)} />
          <Button size="sm" loading={saving} onClick={handleSave} className="shrink-0">
            Guardar tema
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" loading={duplicating} onClick={handleDuplicate}>
            Duplicar tema actual
          </Button>
          <Button size="sm" variant="outline" onClick={onReset}>
            Restablecer
          </Button>
          <Button size="sm" variant="outline" onClick={handleExport}>
            <Download className="size-4" />
            Exportar
          </Button>
          <input
            ref={importInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleImportFile(e.target.files[0])}
          />
          <Button size="sm" variant="outline" onClick={() => importInputRef.current?.click()}>
            <Upload className="size-4" />
            Importar
          </Button>
        </div>
      </div>
    </div>
  );
}
