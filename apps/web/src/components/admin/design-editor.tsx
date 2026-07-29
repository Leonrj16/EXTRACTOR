"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { User, Palette, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { ProfileView } from "@/components/public-profile/profile-view";
import { adminFetch } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import type { LinkItem } from "@/types/link";
import type { AppearanceData, ProfileData, ThemeData } from "@/types/profile";

const BUTTON_STYLES = [
  { value: "rounded", label: "Redondeado" },
  { value: "pill", label: "Píldora" },
  { value: "square", label: "Cuadrado" },
];

const FONTS = ["Inter", "Poppins", "Roboto", "Playfair Display", "Space Grotesk"];

const LAYOUTS = [
  { value: "list", label: "Lista (clásico)" },
  { value: "grid", label: "Grid (bento)" },
];

const ANIMATIONS = [
  { value: "fade", label: "Aparecer" },
  { value: "slide", label: "Deslizar" },
  { value: "bounce", label: "Rebote" },
  { value: "none", label: "Sin animación" },
];

const TABS = [
  { id: "profile", label: "Perfil", icon: User },
  { id: "theme", label: "Tema", icon: Palette },
  { id: "structure", label: "Estructura", icon: LayoutGrid },
] as const;

type TabId = (typeof TABS)[number]["id"];

function FieldSelect({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <NativeSelect id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-[#12131c]">
            {option.label}
          </option>
        ))}
      </NativeSelect>
    </div>
  );
}

function ColorField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-2">
        <div
          className="size-6 shrink-0 rounded-lg border border-white/20"
          style={{ backgroundColor: value }}
        />
        <span className="text-sm text-muted-foreground uppercase">{value}</span>
        <input
          id={id}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </div>
    </div>
  );
}

interface DesignEditorProps {
  initialProfile: ProfileData;
  initialAppearance: AppearanceData;
  themes: ThemeData[];
  links: LinkItem[];
}

export function DesignEditor({ initialProfile, initialAppearance, themes, links }: DesignEditorProps) {
  const [profile, setProfile] = useState(initialProfile);
  const [appearance, setAppearance] = useState(initialAppearance);
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingAppearance, setSavingAppearance] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleAvatarUpload(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const media = await adminFetch<{ url: string }>("/admin/media/upload", {
        method: "POST",
        body: formData,
      });
      setProfile((prev) => ({ ...prev, avatarUrl: media.url }));
      toast.success("Imagen subida, recuerda guardar el perfil");
    } catch {
      toast.error("No se pudo subir la imagen");
    } finally {
      setUploading(false);
    }
  }

  async function handleSaveProfile() {
    setSavingProfile(true);
    try {
      const updated = await adminFetch<ProfileData>("/admin/profile", {
        method: "PATCH",
        body: JSON.stringify({
          displayName: profile.displayName,
          bio: profile.bio,
          avatarUrl: profile.avatarUrl,
          whatsapp: profile.whatsapp,
          contactEmail: profile.contactEmail,
          location: profile.location,
        }),
      });
      setProfile(updated);
      toast.success("Perfil actualizado");
    } catch {
      toast.error("No se pudo guardar el perfil");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleSaveAppearance() {
    setSavingAppearance(true);
    try {
      const updated = await adminFetch<AppearanceData>("/admin/appearance", {
        method: "PUT",
        body: JSON.stringify({
          themeId: appearance.themeId,
          primaryColor: appearance.primaryColor,
          backgroundColor: appearance.backgroundColor,
          buttonStyle: appearance.buttonStyle,
          fontFamily: appearance.fontFamily,
          animation: appearance.animation,
          layout: appearance.layout,
        }),
      });
      setAppearance(updated);
      toast.success("Apariencia actualizada");
    } catch {
      toast.error("No se pudo guardar la apariencia");
    } finally {
      setSavingAppearance(false);
    }
  }

  const base = appearance.theme?.baseConfig ?? {};

  return (
    <div className="glass grid overflow-hidden rounded-2xl lg:grid-cols-[220px_1fr_360px]">
      {/* Left rail — sections */}
      <div className="flex gap-1 border-b border-white/[0.06] p-3 lg:flex-col lg:border-b-0 lg:border-r lg:p-4">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            aria-current={activeTab === id ? "true" : undefined}
            className={cn(
              "flex flex-1 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/40 lg:flex-none",
              activeTab === id
                ? "bg-white/[0.07] text-foreground"
                : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Center — active panel */}
      <div className="flex flex-col gap-4 border-b border-white/[0.06] p-6 lg:border-b-0 lg:border-r">
        {activeTab === "profile" && (
          <>
            <div className="flex items-center gap-4">
              <div className="size-16 shrink-0 overflow-hidden rounded-full bg-white/[0.06]">
                {profile.avatarUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatarUrl} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleAvatarUpload(e.target.files[0])}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? "Subiendo…" : "Cambiar foto"}
              </Button>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="displayName">Nombre</Label>
              <Input
                id="displayName"
                value={profile.displayName}
                onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="bio">Descripción</Label>
              <Textarea
                id="bio"
                maxLength={280}
                rows={3}
                value={profile.bio ?? ""}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  value={profile.whatsapp ?? ""}
                  onChange={(e) => setProfile({ ...profile, whatsapp: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="contactEmail">Email de contacto</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={profile.contactEmail ?? ""}
                  onChange={(e) => setProfile({ ...profile, contactEmail: e.target.value })}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="location">Ubicación</Label>
              <Input
                id="location"
                value={profile.location ?? ""}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
              />
            </div>
            <Button onClick={handleSaveProfile} disabled={savingProfile} className="w-fit">
              {savingProfile ? "Guardando…" : "Guardar perfil"}
            </Button>
          </>
        )}

        {activeTab === "theme" && (
          <>
            <FieldSelect
              id="theme"
              label="Plantilla"
              value={appearance.themeId}
              onChange={(value) => setAppearance({ ...appearance, themeId: value })}
              options={themes.map((theme) => ({ value: theme.id, label: theme.name }))}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <ColorField
                id="primaryColor"
                label="Color principal"
                value={appearance.primaryColor ?? base.primaryColor ?? "#111827"}
                onChange={(value) => setAppearance({ ...appearance, primaryColor: value })}
              />
              <ColorField
                id="backgroundColor"
                label="Color de fondo"
                value={appearance.backgroundColor ?? base.backgroundColor ?? "#ffffff"}
                onChange={(value) => setAppearance({ ...appearance, backgroundColor: value })}
              />
            </div>
            <FieldSelect
              id="fontFamily"
              label="Tipografía"
              value={appearance.fontFamily ?? base.fontFamily ?? "Inter"}
              onChange={(value) => setAppearance({ ...appearance, fontFamily: value })}
              options={FONTS.map((font) => ({ value: font, label: font }))}
            />
            <Button onClick={handleSaveAppearance} disabled={savingAppearance} className="w-fit">
              {savingAppearance ? "Guardando…" : "Guardar apariencia"}
            </Button>
          </>
        )}

        {activeTab === "structure" && (
          <>
            <FieldSelect
              id="buttonStyle"
              label="Estilo de botones"
              value={appearance.buttonStyle ?? base.buttonStyle ?? "rounded"}
              onChange={(value) => setAppearance({ ...appearance, buttonStyle: value })}
              options={BUTTON_STYLES}
            />
            <FieldSelect
              id="layout"
              label="Estructura de plantilla"
              value={appearance.layout ?? appearance.theme?.layout ?? "list"}
              onChange={(value) => setAppearance({ ...appearance, layout: value })}
              options={LAYOUTS}
            />
            <FieldSelect
              id="animation"
              label="Animación de entrada"
              value={appearance.animation ?? base.animation ?? "fade"}
              onChange={(value) => setAppearance({ ...appearance, animation: value })}
              options={ANIMATIONS}
            />
            <Button onClick={handleSaveAppearance} disabled={savingAppearance} className="w-fit">
              {savingAppearance ? "Guardando…" : "Guardar apariencia"}
            </Button>
          </>
        )}
      </div>

      {/* Right — live preview */}
      <div className="flex flex-col items-center gap-3 bg-black/20 p-6">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Vista previa en vivo
        </p>
        <div className="glow-purple-sm mx-auto w-[300px] overflow-hidden rounded-[2.2rem] border-4 border-white/10">
          <div className="h-[560px] overflow-y-auto">
            <ProfileView profile={profile} appearance={appearance} links={links} />
          </div>
        </div>
      </div>
    </div>
  );
}
