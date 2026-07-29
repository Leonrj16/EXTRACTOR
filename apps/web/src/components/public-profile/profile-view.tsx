"use client";

import { useState } from "react";
import { motion, type Variants } from "framer-motion";
import { MapPin, Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toMusicEmbedUrl, toVideoEmbedUrl } from "@/lib/embed";
import type { LinkItem } from "@/types/link";
import type { AppearanceData, ProfileData } from "@/types/profile";

interface ProfileViewProps {
  profile: ProfileData;
  appearance: AppearanceData;
  links: LinkItem[];
  onLinkClick?: (link: LinkItem) => void;
  onContactSubmit?: (link: LinkItem, values: { name: string; email: string; message: string }) => Promise<void>;
  className?: string;
}

const BUTTON_RADIUS: Record<string, string> = {
  rounded: "rounded-xl",
  pill: "rounded-full",
  square: "rounded-none",
};

const ANIMATION_VARIANTS: Record<string, Variants> = {
  fade: { hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } },
  slide: { hidden: { opacity: 0, x: -24 }, visible: { opacity: 1, x: 0 } },
  bounce: {
    hidden: { opacity: 0, scale: 0.85 },
    visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 15 } },
  },
  none: { hidden: { opacity: 1 }, visible: { opacity: 1 } },
};

function FormBlock({
  link,
  radius,
  primaryColor,
  onContactSubmit,
}: {
  link: LinkItem;
  radius: string;
  primaryColor: string;
  onContactSubmit?: ProfileViewProps["onContactSubmit"];
}) {
  const [values, setValues] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!onContactSubmit) {
      setSent(true);
      return;
    }
    setSending(true);
    setError(null);
    try {
      await onContactSubmit(link, values);
      setSent(true);
      setValues({ name: "", email: "", message: "" });
    } catch {
      setError("No se pudo enviar el mensaje, intenta de nuevo.");
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className={`border px-4 py-6 text-center text-sm ${radius}`} style={{ borderColor: primaryColor }}>
        ¡Gracias! Tu mensaje fue enviado.
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex flex-col gap-2 border p-4 text-left ${radius}`}
      style={{ borderColor: primaryColor }}
    >
      <p className="text-sm font-medium">{link.title}</p>
      <Input
        required
        placeholder="Nombre"
        value={values.name}
        onChange={(e) => setValues({ ...values, name: e.target.value })}
      />
      <Input
        required
        type="email"
        placeholder="Email"
        value={values.email}
        onChange={(e) => setValues({ ...values, email: e.target.value })}
      />
      <Textarea
        required
        rows={3}
        placeholder="Mensaje"
        value={values.message}
        onChange={(e) => setValues({ ...values, message: e.target.value })}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
      <Button type="submit" size="sm" disabled={sending}>
        {sending ? "Enviando…" : "Enviar"}
      </Button>
    </form>
  );
}

export function ProfileView({
  profile,
  appearance,
  links,
  onLinkClick,
  onContactSubmit,
  className,
}: ProfileViewProps) {
  const base = appearance.theme?.baseConfig ?? {};
  const primaryColor = appearance.primaryColor ?? base.primaryColor ?? "#111827";
  const backgroundColor = appearance.backgroundColor ?? base.backgroundColor ?? "#ffffff";
  const buttonStyle = appearance.buttonStyle ?? base.buttonStyle ?? "rounded";
  const fontFamily = appearance.fontFamily ?? base.fontFamily ?? "Inter";
  const animation = appearance.animation ?? base.animation ?? "fade";
  const layout = appearance.layout ?? appearance.theme?.layout ?? "list";
  const radius = BUTTON_RADIUS[buttonStyle] ?? "rounded-xl";
  const variants = ANIMATION_VARIANTS[animation] ?? ANIMATION_VARIANTS.fade;

  function isWide(link: LinkItem) {
    return layout === "grid" && (link.type === "VIDEO" || link.type === "MUSIC" || link.type === "FORM");
  }

  function renderBlock(link: LinkItem) {
    if (link.type === "VIDEO") {
      const embedUrl = link.url ? toVideoEmbedUrl(link.url) : null;
      return (
        <div className={`overflow-hidden ${radius}`}>
          <p className="mb-1 text-sm font-medium">{link.title}</p>
          {embedUrl ? (
            <iframe
              src={embedUrl}
              className={`aspect-video w-full ${radius}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className={`flex aspect-video items-center justify-center border text-xs opacity-60 ${radius}`}>
              URL de video no válida
            </div>
          )}
        </div>
      );
    }

    if (link.type === "MUSIC") {
      const embedUrl = link.url ? toMusicEmbedUrl(link.url) : null;
      return (
        <div>
          {embedUrl ? (
            <iframe
              src={embedUrl}
              className="w-full rounded-xl"
              height="152"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            />
          ) : (
            <div className={`flex h-24 items-center justify-center border text-xs opacity-60 ${radius}`}>
              URL de Spotify no válida
            </div>
          )}
        </div>
      );
    }

    if (link.type === "FORM") {
      return (
        <FormBlock link={link} radius={radius} primaryColor={primaryColor} onContactSubmit={onContactSubmit} />
      );
    }

    if (link.type === "PRODUCT") {
      return (
        <a
          href={link.url ?? "#"}
          target="_blank"
          rel="noreferrer"
          onClick={() => onLinkClick?.(link)}
          className={`flex flex-col overflow-hidden border shadow-sm ${radius}`}
          style={{ borderColor: primaryColor }}
        >
          {link.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={link.imageUrl} alt={link.title} className="aspect-square w-full object-cover" />
          )}
          <div className="flex items-center justify-between p-3">
            <span className="text-sm font-medium">{link.title}</span>
            {link.metadata?.price && (
              <span className="text-sm font-semibold">
                {link.metadata.currency ?? ""} {link.metadata.price}
              </span>
            )}
          </div>
        </a>
      );
    }

    return (
      <a
        href={link.url ?? "#"}
        target="_blank"
        rel="noreferrer"
        onClick={() => onLinkClick?.(link)}
        className={`block w-full border px-4 py-3 text-center text-sm font-medium shadow-sm ${radius}`}
        style={{ borderColor: primaryColor, backgroundColor: `${primaryColor}0d` }}
      >
        {link.title}
      </a>
    );
  }

  return (
    <div
      className={`flex min-h-full flex-col items-center gap-6 px-6 py-14 text-center ${className ?? ""}`}
      style={{
        backgroundColor,
        color: primaryColor,
        fontFamily,
        backgroundImage: appearance.backgroundImage ? `url(${appearance.backgroundImage})` : undefined,
        backgroundSize: "cover",
      }}
    >
      <motion.div
        initial="hidden"
        animate="visible"
        variants={variants}
        className="h-24 w-24 overflow-hidden rounded-full border-2"
        style={{ borderColor: primaryColor }}
      >
        {profile.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.avatarUrl} alt={profile.displayName} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-black/10" />
        )}
      </motion.div>

      <div>
        <h1 className="text-xl font-semibold">{profile.displayName}</h1>
        {profile.bio && <p className="mt-2 max-w-xs text-sm opacity-80">{profile.bio}</p>}
      </div>

      {(profile.location || profile.contactEmail || profile.whatsapp) && (
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs opacity-70">
          {profile.location && (
            <span className="flex items-center gap-1">
              <MapPin className="size-3.5" />
              {profile.location}
            </span>
          )}
          {profile.contactEmail && (
            <span className="flex items-center gap-1">
              <Mail className="size-3.5" />
              {profile.contactEmail}
            </span>
          )}
          {profile.whatsapp && (
            <span className="flex items-center gap-1">
              <MessageCircle className="size-3.5" />
              {profile.whatsapp}
            </span>
          )}
        </div>
      )}

      <div
        className={
          layout === "grid"
            ? "grid w-full max-w-sm grid-cols-2 gap-3"
            : "flex w-full max-w-sm flex-col gap-3"
        }
      >
        {links.map((link, index) => (
          <motion.div
            key={link.id}
            initial="hidden"
            animate="visible"
            variants={variants}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={link.type === "VIDEO" || link.type === "MUSIC" || link.type === "FORM" ? undefined : { scale: 1.02 }}
            whileTap={link.type === "VIDEO" || link.type === "MUSIC" || link.type === "FORM" ? undefined : { scale: 0.98 }}
            className={isWide(link) ? "col-span-2" : undefined}
          >
            {renderBlock(link)}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
