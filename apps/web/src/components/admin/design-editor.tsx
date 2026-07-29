"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ProfileView } from "@/components/public-profile/profile-view";
import { adminFetch } from "@/lib/api-client";
import type { LinkItem } from "@/types/link";
import type { AppearanceData, ProfileData, ThemeData } from "@/types/profile";

const BUTTON_STYLES = [
  { value: "rounded", label: "Redondeado" },
  { value: "pill", label: "Píldora" },
  { value: "square", label: "Cuadrado" },
];

const FONTS = ["Inter", "Poppins", "Roboto", "Playfair Display", "Space Grotesk"];

interface DesignEditorProps {
  initialProfile: ProfileData;
  initialAppearance: AppearanceData;
  themes: ThemeData[];
  links: LinkItem[];
}

export function DesignEditor({ initialProfile, initialAppearance, themes, links }: DesignEditorProps) {
  const [profile, setProfile] = useState(initialProfile);
  const [appearance, setAppearance] = useState(initialAppearance);
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
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Perfil</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 overflow-hidden rounded-full bg-muted">
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Apariencia</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="theme">Plantilla</Label>
              <select
                id="theme"
                className="h-9 rounded-md border bg-background px-3 text-sm"
                value={appearance.themeId}
                onChange={(e) => setAppearance({ ...appearance, themeId: e.target.value })}
              >
                {themes.map((theme) => (
                  <option key={theme.id} value={theme.id}>
                    {theme.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="primaryColor">Color principal</Label>
                <Input
                  id="primaryColor"
                  type="color"
                  className="h-9 w-full p-1"
                  value={appearance.primaryColor ?? base.primaryColor ?? "#111827"}
                  onChange={(e) => setAppearance({ ...appearance, primaryColor: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="backgroundColor">Color de fondo</Label>
                <Input
                  id="backgroundColor"
                  type="color"
                  className="h-9 w-full p-1"
                  value={appearance.backgroundColor ?? base.backgroundColor ?? "#ffffff"}
                  onChange={(e) => setAppearance({ ...appearance, backgroundColor: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="buttonStyle">Estilo de botones</Label>
                <select
                  id="buttonStyle"
                  className="h-9 rounded-md border bg-background px-3 text-sm"
                  value={appearance.buttonStyle ?? base.buttonStyle ?? "rounded"}
                  onChange={(e) => setAppearance({ ...appearance, buttonStyle: e.target.value })}
                >
                  {BUTTON_STYLES.map((style) => (
                    <option key={style.value} value={style.value}>
                      {style.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="fontFamily">Tipografía</Label>
                <select
                  id="fontFamily"
                  className="h-9 rounded-md border bg-background px-3 text-sm"
                  value={appearance.fontFamily ?? base.fontFamily ?? "Inter"}
                  onChange={(e) => setAppearance({ ...appearance, fontFamily: e.target.value })}
                >
                  {FONTS.map((font) => (
                    <option key={font} value={font}>
                      {font}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Button onClick={handleSaveAppearance} disabled={savingAppearance} className="w-fit">
              {savingAppearance ? "Guardando…" : "Guardar apariencia"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="lg:sticky lg:top-12 lg:self-start">
        <p className="mb-2 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Vista previa
        </p>
        <div className="mx-auto w-[320px] overflow-hidden rounded-[2rem] border-8 border-foreground/10 shadow-xl">
          <div className="h-[600px] overflow-y-auto">
            <ProfileView profile={profile} appearance={appearance} links={links} />
          </div>
        </div>
      </div>
    </div>
  );
}
