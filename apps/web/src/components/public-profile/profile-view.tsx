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

// Taller block containers (form, product card, video/music fallback) can't
// use the same "pill" radius as a short link button — rounded-full on a tall
// box distorts into a lens/circle shape, so it's capped at a card-sized radius.
const CARD_RADIUS: Record<string, string> = {
  rounded: "rounded-xl",
  pill: "rounded-2xl",
  square: "rounded-none",
};

// Border/shadow are a single setting applied uniformly to every block type
// (link button, form, product card, video/music fallback) — one dial for
// the whole page instead of each block hardcoding its own border opacity.
const BORDER_WIDTH: Record<string, number> = { none: 0, subtle: 1, solid: 1.5, thick: 2.5 };
const BORDER_ALPHA: Record<string, string> = { none: "00", subtle: "33", solid: "ff", thick: "ff" };

function getBorderStyle(borderStyle: string, primaryColor: string): React.CSSProperties {
  const width = BORDER_WIDTH[borderStyle] ?? BORDER_WIDTH.subtle;
  const alpha = BORDER_ALPHA[borderStyle] ?? BORDER_ALPHA.subtle;
  return { borderWidth: `${width}px`, borderStyle: "solid", borderColor: `${primaryColor}${alpha}` };
}

function getShadow(shadowStyle: string, primaryColor: string): string | undefined {
  if (shadowStyle === "glow") return `0 0 24px ${primaryColor}66`;
  if (shadowStyle === "soft") return "0 8px 24px rgba(0,0,0,0.25)";
  return undefined;
}

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
  blockStyle,
  onContactSubmit,
}: {
  link: LinkItem;
  radius: string;
  blockStyle: React.CSSProperties;
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
      <div className={`px-4 py-6 text-center text-sm ${radius}`} style={blockStyle}>
        ¡Gracias! Tu mensaje fue enviado.
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex flex-col gap-2 p-4 text-left ${radius}`}
      style={blockStyle}
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
      <Button type="submit" size="sm" loading={sending}>
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
  const borderStyleKey = appearance.borderStyle ?? base.borderStyle ?? "subtle";
  const shadowStyleKey = appearance.shadowStyle ?? base.shadowStyle ?? "none";
  const radius = BUTTON_RADIUS[buttonStyle] ?? "rounded-xl";
  const cardRadius = CARD_RADIUS[buttonStyle] ?? "rounded-xl";
  const variants = ANIMATION_VARIANTS[animation] ?? ANIMATION_VARIANTS.fade;
  const blockShadow = getShadow(shadowStyleKey, primaryColor);
  const blockBorder = getBorderStyle(borderStyleKey, primaryColor);
  // isActive filtering is the component's own responsibility, not each
  // caller's — the public page route already queries only active links,
  // but the design editor's live preview passes every link (so hiding a
  // block updates instantly without a page refetch), so this must hold
  // here regardless of what the caller passes in.
  const visibleLinks = links.filter((link) => link.isActive);

  const isInteractiveBlock = (type: LinkItem["type"]) =>
    type === "VIDEO" || type === "MUSIC" || type === "FORM";

  function isWide(link: LinkItem) {
    return layout === "grid" && isInteractiveBlock(link.type);
  }

  function renderBlock(link: LinkItem) {
    if (link.type === "VIDEO") {
      const embedUrl = link.url ? toVideoEmbedUrl(link.url) : null;
      return (
        <div className={`overflow-hidden ${cardRadius}`}>
          <p className="mb-1 text-sm font-medium">{link.title}</p>
          {embedUrl ? (
            <iframe
              src={embedUrl}
              className={`aspect-video w-full ${cardRadius}`}
              style={{ boxShadow: blockShadow }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div
              className={`flex aspect-video items-center justify-center text-xs opacity-60 ${cardRadius}`}
              style={blockBorder}
            >
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
              style={{ boxShadow: blockShadow }}
              height="152"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            />
          ) : (
            <div
              className={`flex h-24 items-center justify-center text-xs opacity-60 ${cardRadius}`}
              style={blockBorder}
            >
              URL de Spotify no válida
            </div>
          )}
        </div>
      );
    }

    if (link.type === "FORM") {
      return (
        <FormBlock
          link={link}
          radius={cardRadius}
          blockStyle={{ ...blockBorder, boxShadow: blockShadow }}
          onContactSubmit={onContactSubmit}
        />
      );
    }

    if (link.type === "PRODUCT") {
      return (
        <a
          href={link.url ?? "#"}
          target="_blank"
          rel="noreferrer"
          onClick={() => onLinkClick?.(link)}
          className={`flex flex-col overflow-hidden outline-none transition-shadow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current ${cardRadius}`}
          style={{ ...blockBorder, boxShadow: blockShadow }}
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
        className={`block w-full px-4 py-3.5 text-center text-sm font-medium outline-none backdrop-blur-md transition-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current ${radius}`}
        style={{ ...blockBorder, backgroundColor: `${primaryColor}14`, boxShadow: blockShadow }}
      >
        {link.title}
      </a>
    );
  }

  const isAurora = Boolean(base.aurora);

  return (
    <div
      className={`relative flex min-h-full flex-col items-center gap-6 overflow-hidden px-6 py-14 text-center ${className ?? ""}`}
      style={{
        backgroundColor,
        color: primaryColor,
        fontFamily,
        backgroundImage: appearance.backgroundImage ? `url(${appearance.backgroundImage})` : undefined,
        backgroundSize: "cover",
      }}
    >
      {isAurora && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-[-20%] top-[-15%] size-[70%] animate-[aurora-drift-1_22s_ease-in-out_infinite] rounded-full bg-brand-purple/40 blur-[90px]" />
          <div className="absolute right-[-20%] top-[5%] size-[65%] animate-[aurora-drift-2_26s_ease-in-out_infinite] rounded-full bg-brand-blue/30 blur-[100px]" />
          <div className="absolute bottom-[-25%] left-[10%] size-[60%] animate-[aurora-drift-3_30s_ease-in-out_infinite] rounded-full bg-brand-cyan/20 blur-[100px]" />
        </div>
      )}

      {profile.coverUrl && (
        <div className="absolute inset-x-0 top-0 h-32 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={profile.coverUrl} alt="" className="h-full w-full object-cover opacity-70" />
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(to bottom, transparent, ${backgroundColor})` }}
          />
        </div>
      )}

      <motion.div
        initial="hidden"
        animate="visible"
        variants={variants}
        className="relative z-10 h-24 w-24 overflow-hidden rounded-full border-2"
        style={{
          borderColor: primaryColor,
          boxShadow: isAurora ? `0 0 32px ${primaryColor}66` : undefined,
          marginTop: profile.coverUrl ? "1.5rem" : undefined,
        }}
      >
        {profile.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.avatarUrl} alt={profile.displayName} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-black/10" />
        )}
      </motion.div>

      <div className="relative z-10">
        <h1 className="text-xl font-semibold">{profile.displayName}</h1>
        {profile.bio && <p className="mt-2 max-w-xs text-sm opacity-80">{profile.bio}</p>}
      </div>

      {(profile.location || profile.contactEmail || profile.whatsapp) && (
        <div className="relative z-10 flex flex-wrap items-center justify-center gap-3 text-xs opacity-70">
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
            ? "relative z-10 grid w-full max-w-sm grid-cols-2 gap-3"
            : "relative z-10 flex w-full max-w-sm flex-col gap-3"
        }
      >
        {visibleLinks.map((link, index) => (
          <motion.div
            key={link.id}
            initial="hidden"
            animate="visible"
            variants={variants}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={isInteractiveBlock(link.type) ? undefined : { scale: 1.02 }}
            whileTap={isInteractiveBlock(link.type) ? undefined : { scale: 0.98 }}
            className={isWide(link) ? "col-span-2" : undefined}
          >
            {renderBlock(link)}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
