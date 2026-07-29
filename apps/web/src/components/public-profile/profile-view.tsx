"use client";

import { motion } from "framer-motion";
import { MapPin, Mail, MessageCircle } from "lucide-react";
import type { LinkItem } from "@/types/link";
import type { AppearanceData, ProfileData } from "@/types/profile";

interface ProfileViewProps {
  profile: ProfileData;
  appearance: AppearanceData;
  links: LinkItem[];
  onLinkClick?: (link: LinkItem) => void;
  className?: string;
}

const BUTTON_RADIUS: Record<string, string> = {
  rounded: "rounded-xl",
  pill: "rounded-full",
  square: "rounded-none",
};

export function ProfileView({ profile, appearance, links, onLinkClick, className }: ProfileViewProps) {
  const base = appearance.theme?.baseConfig ?? {};
  const primaryColor = appearance.primaryColor ?? base.primaryColor ?? "#111827";
  const backgroundColor = appearance.backgroundColor ?? base.backgroundColor ?? "#ffffff";
  const buttonStyle = appearance.buttonStyle ?? base.buttonStyle ?? "rounded";
  const fontFamily = appearance.fontFamily ?? base.fontFamily ?? "Inter";
  const radius = BUTTON_RADIUS[buttonStyle] ?? "rounded-xl";

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
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
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

      <div className="flex w-full max-w-sm flex-col gap-3">
        {links.map((link, index) => (
          <motion.a
            key={link.id}
            href={link.url ?? "#"}
            target="_blank"
            rel="noreferrer"
            onClick={() => onLinkClick?.(link)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`block w-full border px-4 py-3 text-sm font-medium shadow-sm ${radius}`}
            style={{ borderColor: primaryColor, backgroundColor: `${primaryColor}0d` }}
          >
            {link.title}
          </motion.a>
        ))}
      </div>
    </div>
  );
}
