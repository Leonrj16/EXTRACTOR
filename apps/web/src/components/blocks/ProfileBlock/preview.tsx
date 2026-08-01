"use client";

import { BlockFrame } from "../shared/block-frame";
import { resolveBlockStyle } from "../shared/style-resolver";
import { SOCIAL_PLATFORM_ICON } from "../shared/social-icons";
import { resolveButtonTreatment } from "@/themes/shared/button-treatments";
import type { BlockPreviewProps } from "../types";
import { PROFILE_BLOCK_DEFAULT_META } from "./config";
import { PROFILE_BLOCK_INTERACTIVE } from "./animation";
import {
  PROFILE_CARD_CLASS,
  PROFILE_PHOTO_CLASS,
  PROFILE_SOCIAL_ICON_CLASS,
  PROFILE_SOCIAL_ROW_CLASS,
} from "./styles";
import type { ProfileBlockMeta } from "./types";

export function ProfileBlockPreview({ link, meta, styleOverrides, theme, index }: BlockPreviewProps<ProfileBlockMeta>) {
  const resolved = { ...PROFILE_BLOCK_DEFAULT_META, ...meta };
  const socials = resolved.socials ?? [];
  const treatment = resolveButtonTreatment(theme.buttonTreatment ?? "filled", theme.primaryColor, theme.secondaryColor);

  const style = resolveBlockStyle(styleOverrides, {
    primaryColor: theme.primaryColor,
    pageBorder: theme.pageBorder,
    pageShadow: theme.pageShadow,
  });

  return (
    <BlockFrame styleOverrides={styleOverrides} interactive={PROFILE_BLOCK_INTERACTIVE} index={index}>
      <div className={`${PROFILE_CARD_CLASS} ${theme.cardRadius}`} style={style}>
        <div className={PROFILE_PHOTO_CLASS} style={{ borderColor: theme.primaryColor }}>
          {link.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={link.imageUrl} alt={link.title} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-black/10" />
          )}
        </div>
        <p className="text-sm font-semibold">{link.title}</p>
        {resolved.role && <p className="text-xs opacity-70">{resolved.role}</p>}
        {resolved.location && <p className="text-xs opacity-50">{resolved.location}</p>}
        {socials.length > 0 && (
          <div className={PROFILE_SOCIAL_ROW_CLASS}>
            {socials.map((social, i) => {
              const Icon = SOCIAL_PLATFORM_ICON[social.platform];
              return (
                <a
                  key={i}
                  href={social.url || "#"}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.platform}
                  className={`${PROFILE_SOCIAL_ICON_CLASS} ${treatment.className}`}
                  style={treatment.style}
                >
                  <Icon className="size-4" />
                </a>
              );
            })}
          </div>
        )}
      </div>
    </BlockFrame>
  );
}
